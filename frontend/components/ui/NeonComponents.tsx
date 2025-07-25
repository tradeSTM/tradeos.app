import React from 'react';
import { motion } from 'framer-motion';

export const NeonCard: React.FC<{
  title: string;
  glowColor?: string;
  className?: string;
}> = ({ title, glowColor = '#00ff9f', className, children }) => (
  <motion.div
    className={`neon-card ${className}`}
    style={{ '--glow-color': glowColor } as any}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <h3 className="neon-card-title">{title}</h3>
    <div className="neon-card-content">{children}</div>
  </motion.div>
);

export const NeonButton: React.FC<{
  onClick?: () => void;
  glowColor?: string;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, glowColor = '#00ff9f', disabled, className }) => (
  <motion.button
    className={`neon-button ${className}`}
    style={{ '--glow-color': glowColor } as any}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

export const NeonInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  glowColor?: string;
  className?: string;
}> = ({ value, onChange, placeholder, glowColor = '#00ff9f', className }) => (
  <input
    className={`neon-input ${className}`}
    style={{ '--glow-color': glowColor } as any}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

export const NeonLoader: React.FC<{
  size?: number;
  glowColor?: string;
  className?: string;
}> = ({ size = 40, glowColor = '#00ff9f', className }) => (
  <motion.div
    className={`neon-loader ${className}`}
    style={{
      '--glow-color': glowColor,
      width: size,
      height: size
    } as any}
    animate={{
      rotate: 360
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }}
  />
);

export const NeonAlert: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}> = ({ type, message, className }) => {
  const colors = {
    success: '#00ff9f',
    error: '#ff0066',
    warning: '#ffcc00',
    info: '#00ccff'
  };

  return (
    <motion.div
      className={`neon-alert ${type} ${className}`}
      style={{ '--glow-color': colors[type] } as any}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {message}
    </motion.div>
  );
};
