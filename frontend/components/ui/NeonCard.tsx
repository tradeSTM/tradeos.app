import React from 'react';

interface NeonCardProps {
  title: string;
  glowColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const NeonCard: React.FC<NeonCardProps> = ({ 
  title, 
  glowColor = '#00ff9f',
  className = '',
  children 
}) => {
  return (
    <div className={`neon-card ${className}`}>
      <h3 className="card-title">{title}</h3>
      {children}

      <style jsx>{`
        .neon-card {
          background: rgba(26, 26, 26, 0.95);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid ${glowColor};
          box-shadow: 0 0 15px ${glowColor}33;
          backdrop-filter: blur(10px);
        }

        .card-title {
          margin: 0 0 20px;
          color: ${glowColor};
          font-size: 1.2em;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
