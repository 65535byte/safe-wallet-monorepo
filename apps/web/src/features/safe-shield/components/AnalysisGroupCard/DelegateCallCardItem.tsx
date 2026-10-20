import { translateMessage } from '@/i18n'
import { type AnalysisResult } from '@safe-global/utils/features/safe-shield/types'
import { type ReactElement } from 'react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { AnalysisCardItemWithLink } from './AnalysisCardItemWithLink'

interface DelegateCallCardItemProps {
  result: AnalysisResult
  isPrimary?: boolean
}

export const DelegateCallCardItem = ({ result, isPrimary = false }: DelegateCallCardItemProps): ReactElement => {
  return (
    <AnalysisCardItemWithLink
      result={result}
      isPrimary={isPrimary}
      beforeLinkText={translateMessage('ui.thisTransactionCallsASmartContract_82539c0c')}
      linkText={translateMessage('ui.learnMore_0c11daba')}
      linkUrl={HelpCenterArticle.UNEXPECTED_DELEGATE_CALL}
    />
  )
}
