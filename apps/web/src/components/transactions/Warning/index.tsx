import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Info } from 'lucide-react'
import { Badge, type badgeVariants } from '@safe-global/views/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import type { VariantProps } from 'class-variance-authority'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { UntrustedFallbackHandlerTxText } from '@/components/tx/confirmation-views/SettingsChange/UntrustedFallbackHandlerTxAlert'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import type { TransactionDetails } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Operation } from '@safe-global/store/gateway/types'

type WarningSeverity = 'info' | 'success' | 'warning' | 'error'

const severityBadgeVariant: Record<WarningSeverity, NonNullable<VariantProps<typeof badgeVariants>['variant']>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
}

const Warning = ({
  datatestid,
  title,
  text,
  severity,
}: {
  datatestid?: string
  title: string | ReactElement
  text: string
  severity: WarningSeverity
}): ReactElement => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            data-testid={datatestid}
            variant={severityBadgeVariant[severity]}
            size="lg"
            className="mb-2 gap-1.5 cursor-default"
          >
            <Info className="size-3.5 shrink-0" />
            {text}
          </Badge>
        }
      />
      <TooltipContent side="top" align="start">
        {title}
      </TooltipContent>
    </Tooltip>
  )
}

export const DelegateCallWarning = ({
  txData,
  showWarning,
}: {
  txData: TransactionDetails['txData']
  showWarning: boolean
}): ReactElement => {
  const isDelegateCall = txData?.operation === Operation.DELEGATE
  const trustedDelegateCall = isDelegateCall && !!txData?.trustedDelegateCallTarget

  if (!isDelegateCall || (!trustedDelegateCall && !showWarning)) return <></>

  return (
    <Warning
      datatestid="delegate-call-warning"
      title={
        <>
          {translateMessage('ui.thisTransactionCallsASmartContract_74112b74')}
          {!trustedDelegateCall && (
            <>
              <br />
              <ExternalLink href={HelpCenterArticle.UNEXPECTED_DELEGATE_CALL}>
                {translateMessage('ui.learnMore_0c11daba')}
              </ExternalLink>
            </>
          )}
        </>
      }
      severity={trustedDelegateCall ? 'success' : 'warning'}
      text={
        trustedDelegateCall
          ? translateMessage('ui.delegateCall_501100d1')
          : translateMessage('ui.unexpectedDelegateCall_6af6492b')
      }
    />
  )
}

export const UntrustedFallbackHandlerWarning = ({
  isTxExecuted = false,
}: {
  isTxExecuted?: boolean
}): ReactElement | null => (
  <Warning
    datatestid="untrusted-fallback-handler-warning"
    title={<UntrustedFallbackHandlerTxText isTxExecuted={isTxExecuted} />}
    severity="warning"
    text={translateMessage('ui.unofficialFallbackHandler_980859ac')}
  />
)

export const ThresholdWarning = (): ReactElement => (
  <Warning
    datatestid="threshold-warning"
    title={translateMessage('ui.thisTransactionPotentiallyAltersTheNumber_61ffc6d0')}
    severity="warning"
    text={translateMessage('ui.confirmationPolicyChange_ab001bca')}
  />
)

export const UnsignedWarning = (): ReactElement => (
  <Warning
    title={translateMessage('ui.thisTransactionIsUnsignedAndCould_b39dd702')}
    severity="error"
    text={translateMessage('ui.untrustedTransaction_0e910362')}
  />
)
