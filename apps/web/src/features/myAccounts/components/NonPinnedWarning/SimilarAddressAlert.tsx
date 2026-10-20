import { translateMessage } from '@/i18n'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Typography } from '@safe-global/views/components/ui/typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import type { SimilarAddressInfo } from '../../hooks/useNonPinnedSafeWarning.types'

interface SimilarAddressAlertProps {
  similarAddresses: SimilarAddressInfo[]
}

const SimilarAddressAlert = ({ similarAddresses }: SimilarAddressAlertProps) => {
  return (
    <>
      <Alert variant="warning" outlined={false} className="mb-4">
        <AlertSeverityIcon variant="warning" />
        <AlertTitle>{translateMessage('ui.similarAddressDetected_fc23da03')}</AlertTitle>
        <AlertDescription>
          <p>{translateMessage('ui.thisAddressIsSimilarToAnother_09f85c38')}</p>
          <p>
            <ExternalLink href={HelpCenterArticle.ADDRESS_POISONING} noIcon>
              {translateMessage('ui.learnMoreAboutAddressPoisoning_f31aab18')}
            </ExternalLink>
          </p>
        </AlertDescription>
      </Alert>

      {similarAddresses.length > 0 && (
        <div className="mb-4">
          <Typography variant="paragraph-small" color="muted" className="mb-2 block">
            {translateMessage('ui.similar_abb7a473')}
          </Typography>
          {similarAddresses.map((similar) => (
            <div key={similar.address} className="bg-background border-border mb-2 rounded-md border p-4">
              <EthHashInfo address={similar.address} showCopyButton shortAddress={false} showAvatar avatarSize={32} />
              {similar.name && (
                <Typography variant="paragraph-small" className="mt-2 block">
                  {translateMessage('ui.name_edc01aef')}
                  {similar.name}
                </Typography>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default SimilarAddressAlert
