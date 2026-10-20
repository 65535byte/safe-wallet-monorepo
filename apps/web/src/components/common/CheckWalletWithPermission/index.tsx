import { translateMessage } from '@/i18n'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { useMemo, type ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { Permission, PermissionProps } from '@/permissions/config'
import { useHasPermission } from '@/permissions/hooks/useHasPermission'

type CheckWalletWithPermissionProps<
  P extends Permission,
  PProps = PermissionProps<P> extends undefined ? { permissionProps?: never } : { permissionProps: PermissionProps<P> },
> = {
  children: (ok: boolean) => ReactElement
  permission: P
  noTooltip?: boolean
  checkNetwork?: boolean
  allowUndeployedSafe?: boolean
} & PProps

const Message = {
  WalletNotConnected: translateMessage('ui.pleaseConnectYourWallet_16dc9354'),
  SDKNotInitialized: translateMessage('ui.stillLoadingTryAgainInA_e639dfb9'),
  NotSafeOwner: translateMessage('ui.yourConnectedWalletIsNotA_ce533277'),
  SafeNotActivated: translateMessage('ui.youNeedToActivateTheBefore_7b9ac818'),
} as const

const CheckWalletWithPermission = <P extends Permission>({
  children,
  permission,
  permissionProps,
  noTooltip,
  checkNetwork = false,
  allowUndeployedSafe = false,
}: CheckWalletWithPermissionProps<P>): ReactElement => {
  const wallet = useWallet()
  const connectWallet = useConnectWallet()
  const isWrongChain = useIsWrongChain()
  const sdk = useSafeSDK()
  const hasPermission = useHasPermission(
    permission,
    ...((permissionProps ? [permissionProps] : []) as PermissionProps<P> extends undefined
      ? []
      : [props: PermissionProps<P>]),
  )

  const { safe, safeLoaded } = useSafeInfo()

  const isUndeployedSafe = !safe.deployed

  const message = useMemo(() => {
    if (!wallet) {
      return Message.WalletNotConnected
    }

    if (!sdk && safeLoaded) {
      return Message.SDKNotInitialized
    }

    if (isUndeployedSafe && !allowUndeployedSafe) {
      return Message.SafeNotActivated
    }

    if (!hasPermission) {
      return Message.NotSafeOwner
    }
  }, [allowUndeployedSafe, hasPermission, isUndeployedSafe, sdk, wallet, safeLoaded])

  if (checkNetwork && isWrongChain) return children(false)
  if (!message) return children(true)
  if (noTooltip) return children(false)

  return (
    <Tooltip>
      <TooltipTrigger render={<span aria-label={message} onClick={wallet ? undefined : connectWallet} />}>
        {children(false)}
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  )
}

export default CheckWalletWithPermission
