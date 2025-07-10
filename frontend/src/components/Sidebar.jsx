iimport React from "react";

const navs = [
  { id: "dashboard", label: "Dashboard", icon: "bi bi-speedometer2" },
  { id: "token", label: "Token Deploy", icon: "bi bi-currency-bitcoin" },
  { id: "bots", label: "Bot Panel", icon: "bi bi-robot" }
];

export default function Sidebar({ page, setPage }) {
  return (
    <nav className="sidebar d-flex flex-column p-3" style={{minWidth:180, minHeight:"100vh"}}>
      <h4 className="mb-4 text-main">Trade OS</h4>
      {navs.map(n => (
        <button
          key={n.id}
          className={`btn text-start mb-2 ${page===n.id ? "btn-main" : "btn-outline-light"}`}
          onClick={() => setPage(n.id)}
        >
          <i className={`${n.icon} me-2`}></i>
          {n.label}
        </button>
      ))}
    </nav>
  );
}