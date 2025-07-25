import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { SUPPORTED_NETWORKS } from '../config/networks';
import Image from 'next/image';

interface NetworkSwitcherProps {
  className?: string;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ className }) => {
  const { chainId, library, account } = useWeb3React();
  const [isChanging, setIsChanging] = React.useState(false);

  const switchNetwork = async (targetChainId: number) => {
    if (!library?.provider?.request) {
      console.error('No provider available');
      return;
    }

    const network = SUPPORTED_NETWORKS[targetChainId];
    if (!network) {
      console.error('Network not supported');
      return;
    }

    setIsChanging(true);
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
        }
      }
    } finally {
      setIsChanging(false);
    }
  };

  if (!account) {
    return null;
  }

  const currentNetwork = chainId ? SUPPORTED_NETWORKS[chainId] : null;

  return (
    <div className={`network-switcher ${className || ''}`}>
      <div className="current-network neon-card">
        {currentNetwork ? (
          <>
            <Image 
              src={currentNetwork.iconUrl} 
              alt={currentNetwork.name} 
              width={24} 
              height={24} 
            />
            <span>{currentNetwork.name}</span>
          </>
        ) : (
          <span>Unsupported Network</span>
        )}
      </div>
      <div className="network-list">
        {Object.values(SUPPORTED_NETWORKS).map((network) => (
          <button
            key={network.chainId}
            className={`network-item neon-glow ${network.chainId === chainId ? 'active' : ''}`}
            onClick={() => switchNetwork(network.chainId)}
            disabled={isChanging || network.chainId === chainId}
          >
            <Image 
              src={network.iconUrl} 
              alt={network.name} 
              width={20} 
              height={20} 
            />
            <span>{network.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Styles
const styles = `
.network-switcher {
  position: relative;
  display: inline-block;
}

.current-network {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.network-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 12px;
  padding: 8px;
  margin-top: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.network-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.network-item.active {
  background: rgba(0, 255, 159, 0.1);
  border: 1px solid #00ff9f;
}

.network-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
