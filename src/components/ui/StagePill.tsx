'use client'

import React from 'react'
import { CaseStage } from '@/types'

interface StagePillProps {
  stage: CaseStage
  className?: string
}

const StagePill = React.forwardRef<HTMLDivElement, StagePillProps>(
  ({ stage, className = '' }, ref) => {
    const stageConfig = {
      new_case: {
        label: 'New Case',
        bg: 'bg-blue-600/20',
        text: 'text-blue-400'
      },
      trt: {
        label: 'Treatment',
        bg: 'bg-blue-500/20',
        text: 'text-blue-400'
      },
      liability: {
        label: 'Liability',
        bg: 'bg-amber-500/20',
        text: 'text-amber-400'
      },
      property_damage: {
        label: 'Property Damage',
        bg: 'bg-orange-500/20',
        text: 'text-orange-400'
      },
      dem: {
        label: 'Demand',
        bg: 'bg-teal-500/20',
        text: 'text-teal-400'
      },
      srl: {
        label: 'Settlement/Litigation',
        bg: 'bg-green-500/20',
        text: 'text-green-400'
      }
    }

    const config = stageConfig[stage]

    return (
      <div
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${className}`}
      >
        {config.label}
      </div>
    )
  }
)

StagePill.displayName = 'StagePill'

export default StagePill
