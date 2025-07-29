import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useTheme } from '../hooks/useTheme';
import { useNetwork } from '../hooks/useNetwork';
import { FiHome, FiBarChart2, FiPackage, FiSettings } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { account } = useWeb3();
  const { mode: isDarkMode, toggleMode: toggleTheme } = useTheme();
  const { currentNetwork } = useNetwork();

  const navigationItems = [
    { path: '/dashboard', icon: <FiHome size={20} />, label: 'Home' },
    { path: '/marketplace', icon: <FiPackage size={20} />, label: 'Marketplace' },
    { path: '/analytics', icon: <FiBarChart2 size={20} />, label: 'Analytics' },
    { path: '/settings', icon: <FiSettings size={20} />, label: 'Settings' }
  ];

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <nav className="sidebar">
        <div className="network-info">
          {currentNetwork && (
            <>
              <img src={currentNetwork.iconUrl} alt={currentNetwork.name} width={24} height={24} />
              <span>{currentNetwork.name}</span>
            </>
          )}
        </div>
        <div className="nav-items">
          {navigationItems.map((item) => (
            <a key={item.path} href={item.path} className="nav-item">
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <div className="theme-toggle">
          <button onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-color);
          color: var(--text-color);
        }

        .dark {
          --bg-color: #0a0a0a;
          --text-color: #ffffff;
          --sidebar-bg: #1a1a1a;
        }

        .light {
          --bg-color: #f0f0f0;
          --text-color: #000000;
          --sidebar-bg: #ffffff;
        }

        .sidebar {
          width: 240px;
          background: var(--sidebar-bg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .network-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-color);
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .theme-toggle {
          margin-top: auto;
        }

        .theme-toggle button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-toggle button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .main-content {
          flex: 1;
          padding: 24px;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
