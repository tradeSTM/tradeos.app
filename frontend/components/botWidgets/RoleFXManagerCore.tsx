// RoleFXManagerCore.tsx

import React, { useEffect } from 'react';
import { getFXProfile, getChainContext, getUserBots, getAggregatorStatus } from '../services/fxService';

const RoleFXManagerCore = ({ user }) => {
  const fxProfile = getFXProfile(user.role);
  const chainFX = getChainContext(user.chain);
  const bots = getUserBots(user.id);
  const aggregators = getAggregatorStatus();

  useEffect(() => {
    // FX Glow + Ripple
    document.body.style.setProperty('--fx-glow', fxProfile.glowColor);
    document.body.classList.add(`fx-${chainFX.ripple}`);

    // Synth Trigger
    if (user.milestones.includes('InvestorSpark')) {
      new Audio('/sounds/synthPulse.mp3').play();
    }

    // Time-decay FX
    const days = (Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24);
    const opacity = Math.max(1 - days / 30, 0.3);
    document.body.style.setProperty('--fx-opacity', `${opacity}`);
  }, 