const fetchProof = async () => {
  if (typeof window !== "undefined" && window.ethereum?.selectedAddress) {
    const selected = (window as any).ethereum.selectedAddress;
    const res = await axios.get(`/api/merkle-proof?user=${selected}`);
    setAmount(res.data.amount);
    setProof(res.data.proof);
  } else {
    setStatus("❌ Wallet not connected");
  }
};
