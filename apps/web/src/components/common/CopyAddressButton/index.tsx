import { translateMessage } from '@/i18n'
import { checksumAddress } from '@safe-global/utils/utils/addresses'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { ReactNode, ReactElement } from 'react'
import CopyButton from '../CopyButton'
import EthHashInfo from '../EthHashInfo'

const CopyAddressButton = ({
  address,
  children,
  trusted = true,
  initialToolTipText,
}: {
  address: string
  children?: ReactNode
  trusted?: boolean
  initialToolTipText?: string
}): ReactElement => {
  const checksummedAddress = checksumAddress(address)

  const dialogContent = trusted ? undefined : (
    <div className="flex flex-col gap-4">
      <EthHashInfo
        address={checksummedAddress}
        shortAddress={false}
        copyAddress={false}
        showCopyButton={false}
        hasExplorer
      />
      <Typography>{translateMessage('ui.theCopiedAddressIsLinkedTo_7ab80465')}</Typography>
    </div>
  )

  return (
    <CopyButton text={address} dialogContent={dialogContent} initialToolTipText={initialToolTipText}>
      {children}
    </CopyButton>
  )
}

export default CopyAddressButton
