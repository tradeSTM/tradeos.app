import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import UserDashboard from "./components/UserDashboard";
import TokenDeployer from "./components/TokenDeployer";
import BotPanel from "./components/BotPanel";
import WalletProvider from "./components/WalletProvider";

function App() {
  const [page, setPage] = useState("dashboard");
  const [wallet, setWallet] = useState(null);

  return (
    <WalletProvider onWallet={setWallet}>
      <div className="d-flex">
        <Sidebar page={page} setPage={setPage} />
        <div className="flex-grow-1 p-3" style={{minHeight: "100vh"}}>
          {page === "dashboard" && <UserDashboard wallet={wallet} />}
          {page === "token" && <TokenDeployer wallet={wallet} />}
          {page === "bots" && <BotPanel wallet={wallet} />}
        </div>
      </div>
    </WalletProvider>
  );
}
export default App;