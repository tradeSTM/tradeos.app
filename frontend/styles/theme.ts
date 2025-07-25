import { createTheme } from '@mui/material/styles';
import { ClaimPanel } from '../components/claim/ClaimPanel';

export const neonTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9f',
      light: '#73ffcd',
      dark: '#00b975',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff',
      light: '#ff73ff',
      dark: '#b900b9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          '&.neon-glow': {
            boxShadow: '0 0 10px #00ff9f, 0 0 20px #00ff9f, 0 0 30px #00ff9f',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 0 20px #00ff9f, 0 0 40px #00ff9f, 0 0 60px #00ff9f',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          '&.neon-card': {
            border: '1px solid #00ff9f',
            boxShadow: '0 0 10px #00ff9f',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Cyberpunk", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    },
  },
});

// In your page component:
const claims = [/* your claims data */];

const handleClaim = async (tokenAddress: string) => {
  // Your claim logic here
};

<ClaimPanel claims={claims} onClaim={handleClaim} />
