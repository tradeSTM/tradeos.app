import React from 'react';
import { Frame, useFrame } from '@chainframe/react';
import { ethers } from 'ethers';

interface ChainFrameProps {
  provider: ethers.providers.Provider;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export const ChainFrameProvider: React.FC<ChainFrameProps> = ({
  provider,
  onConnect,
  onDisconnect,
  children
}) => {
  const frame = useFrame({
    projectId: process.env.NEXT_PUBLIC_FRAME_PROJECT_ID,
    provider,
    networks: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
    theme: {
      colors: {
        primary: '#00ff9f',
        secondary: '#ff00ff',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff'
      },
      borderRadius: '8px',
      fontFamily: 'Cyberpunk, sans-serif'
    }
  });

  React.useEffect(() => {
    if (frame.isConnected) {
      onConnect(frame.address);
    } else {
      onDisconnect();
    }
  }, [frame.isConnected, frame.address]);

  return (
    <Frame.Provider value={frame}>
      <div className="chain-frame-wrapper">
        {children}
      </div>
    </Frame.Provider>
  );
};

export const ChainFrameButton: React.FC = () => {
  const frame = useFrame();

  return (
    <button
      className="chain-frame-button neon-glow"
      onClick={() => frame.isConnected ? frame.disconnect() : frame.connect()}
    >
      {frame.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
    </button>
  );
};

export const ChainFrameNetwork: React.FC = () => {
  const frame = useFrame();

  return (
    <div className="chain-frame-network neon-card">
      <h3>Network</h3>
      <select
        value={frame.network}
        onChange={(e) => frame.switchNetwork(e.target.value)}
      >
        <option value="ethereum">Ethereum</option>
        <option value="polygon">Polygon</option>
        <option value="arbitrum">Arbitrum</option>
        <option value="optimism">Optimism</option>
      </select>
    </div>
  );
};

export const ChainFrameBalance: React.FC = () => {
  const frame = useFrame();
  const [balance, setBalance] = React.useState<string>('0');

  React.useEffect(() => {
    if (frame.isConnected) {
      frame.provider.getBalance(frame.address).then((balance) => {
        setBalance(ethers.utils.formatEther(balance));
      });
    }
  }, [frame.isConnected, frame.address]);

  return (
    <div className="chain-frame-balance neon-card">
      <h3>Balance</h3>
      <p>{balance} ETH</p>
    </div>
  );
};
