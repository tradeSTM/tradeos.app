import React from 'react';
import { getFXProfile } from '../components/services/fxService';

export default function ProfileAura({ role = 'contributor' }) {
  const fx = getFXProfile(role);
  return (
    <div style={{ border: `2px solid ${fx.glowColor}`, padding: '10px' }}>
      <h3>🌀 Aura Profile</h3>
      <p>Role: {fx.role}</p>
      <p>Tier: {fx.tier}</p>
      <p>Last Update: {new Date(fx.lastUpdate).toLocaleString()}</p>
    </div>
  );
}
