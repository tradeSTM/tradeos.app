const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { networkInterfaces } = require('os')

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT, 10) || 3003
const hostname = '0.0.0.0' // Allow connections from all interfaces
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Get local IP address
const getLocalIP = () => {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

// Check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const tester = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close()
      })
      .listen(port)
  })
}

async function startServer() {
  try {
    // Check port availability
    const portAvailable = await isPortAvailable(port)
    if (!portAvailable) {
      console.error(`Port ${port} is already in use. Please try a different port.`)
      process.exit(1)
    }

    await app.prepare()
    
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('Internal server error')
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err
      console.log(`
> Development server running!
> Local:    http://localhost:${port}
> Network:  http://${localIP}:${port}
> API:      http://localhost:${port}/api
      `)
    })
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

startServer()
