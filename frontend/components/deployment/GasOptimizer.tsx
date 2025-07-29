import React from 'react';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from '@ethersproject/units';

interface GasOptimizationProps {
  deploymentSize: number;
  currentGasPrice: ethers.BigNumber;
  historicalGasPrices: number[];
  constructor?: string;
  initData?: string;
}

interface OptimizationSuggestion {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savingsEstimate?: string;
}

export const GasOptimizer: React.FC<GasOptimizationProps> = ({
  deploymentSize,
  currentGasPrice,
  historicalGasPrices,
  constructor,
  initData
}) => {
  const [suggestions, setSuggestions] = React.useState<OptimizationSuggestion[]>([]);
  const [bestDeploymentTime, setBestDeploymentTime] = React.useState<string>('');

  React.useEffect(() => {
    const analyzeSuggestions = () => {
      const optimizations: OptimizationSuggestion[] = [];

      // Analyze deployment size
      if (deploymentSize > 24576) { // 24KB standard contract size
        optimizations.push({
          title: 'Large Contract Size',
          description: 'Consider splitting the contract into smaller modules using proxy pattern',
          impact: 'high',
          savingsEstimate: `~${Math.round((deploymentSize - 24576) * Number(formatUnits(currentGasPrice, 'gwei')))} gwei`
        });
      }

      // Check constructor optimization
      if (constructor && constructor.includes('loop')) {
        optimizations.push({
          title: 'Constructor Optimization',
          description: 'Consider moving initialization loops to a separate function',
          impact: 'medium',
          savingsEstimate: 'Up to 30% on deployment'
        });
      }

      // Analyze initialization data
      if (initData && initData.length > 1000) {
        optimizations.push({
          title: 'Large Initialization Data',
          description: 'Consider using events for non-critical initialization data',
          impact: 'medium'
        });
      }

      // Gas price timing optimization
      const avgGasPrice = historicalGasPrices.reduce((a, b) => a + b, 0) / historicalGasPrices.length;
      const currentGasGwei = Number(formatUnits(currentGasPrice, 'gwei'));
      
      if (currentGasGwei > avgGasPrice * 1.2) {
        optimizations.push({
          title: 'High Gas Price',
          description: 'Current gas price is above average. Consider deploying during off-peak hours',
          impact: 'high',
          savingsEstimate: `~${Math.round(currentGasGwei - avgGasPrice)} gwei per operation`
        });

        // Find optimal deployment time
        const lowestGasPrice = Math.min(...historicalGasPrices);
        const bestTimeIndex = historicalGasPrices.indexOf(lowestGasPrice);
        const hoursAgo = historicalGasPrices.length - bestTimeIndex - 1;
        setBestDeploymentTime(`Best deployment time: ~${hoursAgo} hours from now based on historical data`);
      }

      setSuggestions(optimizations);
    };

    analyzeSuggestions();
  }, [deploymentSize, currentGasPrice, historicalGasPrices, constructor, initData]);

  return (
    <div className="gas-optimizer">
      <h4>Gas Optimization Suggestions</h4>
      
      {bestDeploymentTime && (
        <div className="timing-suggestion">
          <span className="icon">⏰</span>
          {bestDeploymentTime}
        </div>
      )}

      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div key={index} className={`suggestion-item ${suggestion.impact}`}>
            <div className="suggestion-header">
              <h5>{suggestion.title}</h5>
              <span className="impact-badge">{suggestion.impact}</span>
            </div>
            <p className="description">{suggestion.description}</p>
            {suggestion.savingsEstimate && (
              <p className="savings">Estimated savings: {suggestion.savingsEstimate}</p>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .gas-optimizer {
          margin: 20px 0;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        h4 {
          margin: 0 0 16px;
          color: #00ff9f;
        }

        .timing-suggestion {
          padding: 12px;
          background: rgba(0, 255, 159, 0.1);
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon {
          font-size: 1.2em;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .suggestion-item {
          padding: 12px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 6px;
          border-left: 3px solid transparent;
        }

        .suggestion-item.high {
          border-left-color: #ff4444;
        }

        .suggestion-item.medium {
          border-left-color: #ffbb00;
        }

        .suggestion-item.low {
          border-left-color: #00ff9f;
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .suggestion-header h5 {
          margin: 0;
          color: #fff;
        }

        .impact-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          text-transform: uppercase;
        }

        .high .impact-badge {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }

        .medium .impact-badge {
          background: rgba(255, 187, 0, 0.2);
          color: #ffbb00;
        }

        .low .impact-badge {
          background: rgba(0, 255, 159, 0.2);
          color: #00ff9f;
        }

        .description {
          margin: 8px 0;
          font-size: 0.9em;
          opacity: 0.8;
        }

        .savings {
          margin: 8px 0 0;
          font-size: 0.9em;
          color: #00ff9f;
        }
      `}</style>
    </div>
  );
};
