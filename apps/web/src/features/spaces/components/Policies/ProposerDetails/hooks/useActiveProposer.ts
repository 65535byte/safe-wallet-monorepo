import { translateMessage } from '@/i18n'
import { getSafeDisplayInfo } from '@/components/common/AccountRow'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import { AppRoutes } from '@/config/routes'
import { useAddressBookItem } from '@/hooks/useAllAddressBooks'
import { useChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import { ProposerStatus, type ProposerDrawerContentProps } from '../../ProposerDrawer'
import { useNestedSafeGrantor } from './useNestedSafeGrantor'
import { useProposerOverview } from './useProposerOverview'
import { getRemovableGrantDelegator, REMOVE_PROPOSER_NOT_ALLOWED } from './useRemoveProposer'
import type { ProposerDetailsArgs } from '@safe-global/views/features/spaces/components/Policies/ProposerDetails/hooks/types'
import { useUrlSpaceId, withSpaceId } from '@/hooks/useUrlSpaceId'

export const REMOVE_NESTED_PROPOSER_HINT = translateMessage('ui.removeThisProposerFromTheAccount_cca5454a')

export const useActiveProposer = (args: ProposerDetailsArgs): ProposerDrawerContentProps => {
  const { chainId, address: safeAddress } = args.policy.safe
  const overview = useProposerOverview(args)
  const safeContact = useAddressBookItem(safeAddress, chainId)
  const chain = useChain(chainId)
  const nestedSafeGrantor = useNestedSafeGrantor(chainId, args.proposer)
  const grantorContact = useAddressBookItem(nestedSafeGrantor ?? '', chainId)
  const wallet = useWallet()
  const connectWallet = useConnectWallet()
  const spaceId = useUrlSpaceId()
  const safeName = getSafeDisplayInfo(safeContact?.name ?? '', safeAddress).displayName

  const hasOwnGrant = args.proposer.delegatedBy.some((grant) => sameAddress(grant.delegator, wallet?.address))
  const nestedSafeGrant =
    nestedSafeGrantor && !hasOwnGrant
      ? {
          safeName,
          parentSafeName: getSafeDisplayInfo(grantorContact?.name ?? '', nestedSafeGrantor).displayName,
          settingsHref: chain
            ? {
                pathname: AppRoutes.settings.setup,
                query: withSpaceId({ safe: `${chain.shortName}:${safeAddress}` }, spaceId),
              }
            : undefined,
        }
      : undefined

  if (!wallet) {
    return {
      status: ProposerStatus.ACTIVE,
      overview,
      nestedSafeGrant,
      actionLabel: translateMessage('ui.connectWallet_301090ba'),
      actionHint: translateMessage('ui.connectASignerWalletOfTo_71a68b3c', { p0: safeName }),
      onAction: connectWallet,
    }
  }

  if (nestedSafeGrant) {
    return {
      status: ProposerStatus.ACTIVE,
      overview,
      nestedSafeGrant,
      actionLabel: translateMessage('ui.removeProposer_c45b6a22'),
      actionVariant: 'secondary',
      actionDisabled: true,
      actionHint: REMOVE_NESTED_PROPOSER_HINT,
      onAction: args.onRemove,
    }
  }

  const canRemove = getRemovableGrantDelegator(args.proposer, wallet.address) !== undefined

  return {
    status: ProposerStatus.ACTIVE,
    overview,
    actionLabel: translateMessage('ui.removeProposer_c45b6a22'),
    actionVariant: 'secondary',
    actionDisabled: !canRemove,
    actionHint: canRemove ? undefined : REMOVE_PROPOSER_NOT_ALLOWED,
    onAction: args.onRemove,
  }
}
