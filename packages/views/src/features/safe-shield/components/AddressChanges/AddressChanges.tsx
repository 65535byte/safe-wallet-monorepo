import { translateMessage } from '@safe-global/views/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { MasterCopyChangeThreatAnalysisResult } from '@safe-global/utils/features/safe-shield/types'
import React from 'react'

interface AddressChangesProps {
  result: MasterCopyChangeThreatAnalysisResult
}

export const AddressChanges = ({ result }: AddressChangesProps) => {
  if (!result.before || !result.after) {
    return null
  }

  const items = [
    {
      label: translateMessage('ui.cURRENTMASTERCOPY_73033d76'),
      value: result.before,
    },
    {
      label: translateMessage('ui.nEWMASTERCOPY_4c1024c9'),
      value: result.after,
    },
  ]

  return items.map((item, index) => (
    <div
      key={`${item.value}-${index}`}
      className="flex flex-col gap-2 overflow-hidden rounded-[4px] bg-[var(--color-background-paper)] p-2"
    >
      <Typography variant="paragraph-mini" className="text-[var(--color-text-secondary)]">
        {item.label}
      </Typography>

      <Typography variant="paragraph-small" className="break-all whitespace-pre-wrap">
        {item.value}
      </Typography>
    </div>
  ))
}
