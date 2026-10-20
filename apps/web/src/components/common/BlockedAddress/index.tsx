import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { useIsBelowSm } from '@/hooks/useMediaQuery'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import { useRouter } from 'next/router'
import Disclaimer from '@safe-global/views/components/common/Disclaimer'
import { AppRoutes } from '@/config/routes'

const BlockedAddress = ({
  address,
  featureTitle,
  onClose,
}: {
  address: string
  featureTitle: string
  onClose?: () => void
}): ReactElement => {
  const isMobile = useIsBelowSm()
  const displayAddress = address && isMobile ? shortenAddress(address) : address
  const router = useRouter()

  const handleAccept = () => {
    router.push({ pathname: AppRoutes.home, query: router.query })
  }

  return (
    <Disclaimer
      title={translateMessage('ui.blockedAddress_da783021')}
      subtitle={displayAddress}
      content={translateMessage('ui.theAboveAddressIsPartOf_d3215785', { p0: featureTitle })}
      onAccept={onClose ?? handleAccept}
    />
  )
}

export default BlockedAddress
