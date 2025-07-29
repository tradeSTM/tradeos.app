const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Mock data
const mockData = {
  contracts: [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      type: 'Token',
      name: 'Test Token',
      symbol: 'TEST'
    },
    {
      address: '0x123d35Cc6634C0532925a3b844Bc454e4438f789',
      type: 'FlashLoan',
      protocol: 'Aave'
    }
  ],
  transactions: [
    {
      hash: '0xabc...',
      type: 'TokenTransfer',
      amount: '1000000000000000000',
      status: 'success'
    }
  ],
  balances: {
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e': '10000000000000000000000'
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Add artificial delay and random failures to simulate real conditions
const simulateLatency = (req, res, next) => {
  const delay = parseInt(process.env.MOCK_DELAY) || 100;
  const failRate = parseFloat(process.env.MOCK_FAIL_RATE) || 0.1;

  if (Math.random() < failRate) {
    return res.status(500).json({ error: 'Simulated server error' });
  }

  setTimeout(next, delay);
};

app.use(simulateLatency);

// Routes
app.get('/api/mock-data', (req, res) => {
  res.json(mockData);
});

app.get('/api/contracts', (req, res) => {
  res.json(mockData.contracts);
});

app.get('/api/transactions', (req, res) => {
  res.json(mockData.transactions);
});

app.get('/api/balances/:address', (req, res) => {
  const balance = mockData.balances[req.params.address];
  if (balance) {
    res.json({ balance });
  } else {
    res.status(404).json({ error: 'Address not found' });
  }
});

// Mock contract deployment
app.post('/api/deploy', (req, res) => {
  const { type, params } = req.body;
  const newContract = {
    address: '0x' + Math.random().toString(16).slice(2, 42),
    type,
    ...params
  };
  mockData.contracts.push(newContract);
  res.json(newContract);
});

// Mock transaction execution
app.post('/api/execute', (req, res) => {
  const { type, params } = req.body;
  const tx = {
    hash: '0x' + Math.random().toString(16).slice(2, 66),
    type,
    ...params,
    status: Math.random() > 0.1 ? 'success' : 'failed'
  };
  mockData.transactions.push(tx);
  res.json(tx);
});

// Start server
app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
