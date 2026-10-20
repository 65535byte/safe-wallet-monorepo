import { translateMessage } from '@/i18n'
import { useMemo, type ReactElement } from 'react'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import { useIsWalletProposer } from '@/hooks/useProposers'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import { Tooltip, TooltipTrigger, TooltipContent } from '@safe-global/views/components/ui/tooltip'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

type OnlyOwnerOrProposerProps = {
  children: (ok: boolean) => ReactElement
  placement?: TooltipSide
}

const Message = {
  WalletNotConnected: translateMessage('ui.pleaseConnectYourWallet_16dc9354'),
  NotSafeOwnerOrProposer: translateMessage('ui.yourConnectedWalletIsNotA_b3548707'),
} as const

const OnlyOwnerOrProposer = ({ children, placement = 'bottom' }: OnlyOwnerOrProposerProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isProposer = useIsWalletProposer()
  const connectWallet = useConnectWallet()

  const message = useMemo(() => {
    if (!wallet) {
      return Message.WalletNotConnected
    }

    if (!isSafeOwner && !isProposer) {
      return Message.NotSafeOwnerOrProposer
    }
  }, [isSafeOwner, isProposer, wallet])

  if (!message) return children(true)

  return (
    <Tooltip>
      <TooltipTrigger render={<span onClick={wallet ? undefined : connectWallet}>{children(false)}</span>} />
      <TooltipContent side={placement}>{message}</TooltipContent>
    </Tooltip>
  )
}

export default OnlyOwnerOrProposer
