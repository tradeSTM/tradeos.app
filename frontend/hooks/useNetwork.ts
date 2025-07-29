import { useWeb3React } from '@web3-react/core';
import { SUPPORTED_NETWORKS } from '../config/networks';

export function useNetwork() {
  const { chainId } = useWeb3React();
  const currentNetwork = chainId ? SUPPORTED_NETWORKS[chainId] : null;

  return {
    currentNetwork,
    isSupported: !!currentNetwork,
    networks: SUPPORTED_NETWORKS
  };
}
