iimport React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

export default function WalletProvider({ children, onWallet }) {
  const [provider, setProvider] = useState();
  const [address, setAddress] = useState();

  useEffect(() => {
    if (!window.ethereum) return;
    const web3Modal = new Web3Modal({ cacheProvider: true });
    if (web3Modal.cachedProvider) connect();
    async function connect() {
      try {
        const instance = await web3Modal.connect();
        const prov = new ethers.BrowserProvider(instance);
        setProvider(prov);
        const signer = await prov.getSigner();
        const addr = await signer.getAddress();
        setAddress(addr);
        onWallet && onWallet({ provider: prov, address: addr });
      } catch {}
    }
    window.connectWallet = connect;
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-end mb-2">
        {address ? (
          <span className="badge bg-success">Connected: {address.slice(0,6)}...{address.slice(-4)}</span>
        ) : (
          <button className="btn btn-main" onClick={() => window.connectWallet()}>
            Connect Wallet
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
