import { useWeb3React } from '@web3-react/core';

export function useWeb3() {
  const context = useWeb3React();
  
  return {
    account: context.account,
    library: context.library,
    chainId: context.chainId,
    active: context.active
  };
}
