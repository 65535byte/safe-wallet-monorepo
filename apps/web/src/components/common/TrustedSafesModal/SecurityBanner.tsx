import { translateMessage } from '@/i18n'
import { Alert, AlertDescription, AlertTitle, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { cn } from '@safe-global/views/utils/cn'

interface SecurityBannerProps {
  title?: string
  className?: string
}

/**
 * Security banner informing users about address poisoning attacks.
 * Used in safe selection modal and trusted safe confirmation dialog.
 */
const SecurityBanner = ({ title, className }: SecurityBannerProps) => {
  return (
    <Alert variant="warning" outlined={false} className={cn('mb-4', className)}>
      <AlertSeverityIcon variant="warning" />
      {title && <AlertTitle className="font-bold">{title}</AlertTitle>}
      <AlertDescription>
        {translateMessage('ui.someAccountsMayBeMaliciousOr_32b07ab2')}{' '}
        <ExternalLink
          href={HelpCenterArticle.ADDRESS_POISONING}
          noIcon
          className="font-bold text-inherit [&>span]:underline"
        >
          {translateMessage('ui.learnMore_0c11daba')}
        </ExternalLink>
      </AlertDescription>
    </Alert>
  )
}

export default SecurityBanner
