// File: frontend/components/botWidgets/RoleFXManagerCore.tsx

import React, { useEffect } from 'react'
import {
  getFXProfile,
  getChainContext,
  getUserBots,
  getAggregatorStatus
} from '../services/fxService'

// Optional: define FX metadata types if used elsewhere
interface RoleFXManagerCoreProps {
  user: {
    id: string
    role: string
    chain: string
    milestones: string[]
    lastActive: string
  }
}

const RoleFXManagerCore: React.FC<RoleFXManagerCoreProps> = ({ user }) => {
  const fxProfile = getFXProfile(user.role)
  const chainFX = getChainContext()
  const bots = getUserBots(user.id)
  const aggregators = getAggregatorStatus()

  useEffect(() => {
    document.body.style.setProperty('--fx-glow', fxProfile.glowColor)

    // Ripple class fallback logic (using chain name as fallback)
    const rippleClass = chainFX.chain || 'default-ripple'
    document.body.classList.add(`fx-${rippleClass}`)

    if (user.milestones.includes('InvestorSpark')) {
      const synth = new Audio('/sounds/synthPulse.mp3')
      synth.play().catch(() => {})
    }

    const daysInactive =
      (Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24)
    const fade = Math.max(1 - daysInactive / 30, 0.3)
    document.body.style.setProperty('--fx-opacity', `${fade}`)
  }, [
    fxProfile.glowColor,
    chainFX.chain,
    user.milestones.join(','),
    user.lastActive
  ])

  return null // Or render JSX with bots/aggregator status
}

export default RoleFXManagerCore
