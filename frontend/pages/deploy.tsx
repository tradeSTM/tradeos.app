import React from 'react';
import { DeploymentDashboard } from '../components/deployment/DeploymentDashboard';
import { Web3Provider } from '../components/web3/Web3Provider';

const DeploymentPage = () => {
  return (
    <Web3Provider>
      <div className="deployment-page">
        <DeploymentDashboard />
        <style jsx>{`
          .deployment-page {
            min-height: 100vh;
            padding: 40px 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          }
        `}</style>
      </div>
    </Web3Provider>
  );
};

export default DeploymentPage;
