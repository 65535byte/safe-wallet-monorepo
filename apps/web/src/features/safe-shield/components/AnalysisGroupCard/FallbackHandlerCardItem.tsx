import { translateMessage } from '@/i18n'
import { type AnalysisResult } from '@safe-global/utils/features/safe-shield/types'
import { type ReactElement } from 'react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { AnalysisCardItemWithLink } from './AnalysisCardItemWithLink'

interface FallbackHandlerCardItemProps {
  result: AnalysisResult
  isPrimary?: boolean
}

export const FallbackHandlerCardItem = ({ result, isPrimary = false }: FallbackHandlerCardItemProps): ReactElement => {
  return (
    <AnalysisCardItemWithLink
      result={result}
      isPrimary={isPrimary}
      beforeLinkText={translateMessage('ui.verifyThe_1b983c61')}
      linkText={translateMessage('ui.fallbackHandler_b602cb46')}
      afterLinkText={translateMessage('ui.isTrustedAndSecureBeforeProceeding_e31e693c')}
      linkUrl={HelpCenterArticle.FALLBACK_HANDLER}
      noIcon={false}
      linkProps={{
        className: 'text-inherit [&>span]:underline',
      }}
    />
  )
}
