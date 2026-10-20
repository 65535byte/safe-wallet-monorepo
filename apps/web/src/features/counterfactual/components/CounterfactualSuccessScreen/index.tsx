import { translateMessage } from '@/i18n'
import EthHashInfo from '@/components/common/EthHashInfo'
import { safeCreationPendingStatuses } from '../../hooks/safeCreationPendingStatuses'
import { SafeCreationEvent, safeCreationSubscribe } from '../../services/safeCreationEvents'
import { useChain, useCurrentChain } from '@/hooks/useChains'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@safe-global/views/components/ui/dialog'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Check } from 'lucide-react'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { NetworkLogosList } from '@/features/multichain'
import useAllAddressBooks from '@/hooks/useAllAddressBooks'

const CounterfactualSuccessScreen = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [chainId, setChainId] = useState<string>()
  const [event, setEvent] = useState<SafeCreationEvent>()
  const currentChain = useCurrentChain()
  const chain = useChain(chainId || currentChain?.chainId || '')
  const [networks, setNetworks] = useState<Chain[]>([])
  const addressBooks = useAllAddressBooks()
  const safeName = safeAddress && chain ? addressBooks?.[chain.chainId]?.[safeAddress] : ''
  const isCFCreation = event === SafeCreationEvent.AWAITING_EXECUTION
  const isMultiChain = networks.length > 1
  const chainName = isMultiChain ? '' : isCFCreation ? networks[0].chainName : chain?.chainName

  useEffect(() => {
    const unsubFns = Object.entries(safeCreationPendingStatuses).map(([event]) =>
      safeCreationSubscribe(event as SafeCreationEvent, async (detail) => {
        setEvent(event as SafeCreationEvent)

        if (event === SafeCreationEvent.INDEXED) {
          if ('chainId' in detail) {
            setChainId(detail.chainId)
            setNetworks((prev) => prev.filter((network) => network.chainId === detail.chainId))
          }

          setSafeAddress(detail.safeAddress)
          setOpen(true)
        }
        if (event === SafeCreationEvent.AWAITING_EXECUTION) {
          if ('networks' in detail) setNetworks(detail.networks)
          setSafeAddress(detail.safeAddress)
          setOpen(true)
        }
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  const onClose = () => {
    setChainId(undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        // eslint-disable-next-line no-restricted-syntax -- bespoke centered success screen (px-12 py-20 gap-6), no token fit
        className="flex flex-col items-center justify-center gap-6 px-12 py-20"
      >
        <div className="inline-flex rounded-full bg-[var(--color-success-background)] p-6">
          <Check className="size-[50px] text-[var(--color-success-main)]" />
        </div>

        <div data-testid="safe-activation-message" className="text-center">
          <Typography data-testid="account-success-message" variant="h3" className="mb-2 font-bold">
            {isCFCreation
              ? translateMessage('ui.yourAccountIsAlmostSet_efcca6e6')
              : translateMessage('ui.yourAccountIsAllSet_ed1e1b6e')}
          </Typography>
          <Typography variant="paragraph-small" as="p">
            {isCFCreation
              ? translateMessage('ui.activateTheAccountToUnlockAll_120b3e91', {
                  p0: isMultiChain ? translateMessage('ui.perNetwork_0e5f570c') : '',
                })
              : translateMessage('ui.startYourJourneyToTheSmart_3d5e8b1e')}
          </Typography>
          <Typography variant="paragraph-small" as="p">
            {isCFCreation && isMultiChain
              ? translateMessage('ui.youCanUseTheAddressBelow_79fab6a2', { p0: isMultiChain ? 'networks' : 'network' })
              : translateMessage('ui.useYourAddressToReceiveFunds_31712c4a', {
                  p0: chainName ? translateMessage('ui.on_5c5ee09a', { p0: chainName }) : '',
                })}
          </Typography>
        </div>

        {safeAddress && (
          <div data-testid="safe-info" className="rounded bg-[var(--color-background-main)] p-4 text-sm">
            <NetworkLogosList networks={networks.length > 0 ? networks : chain ? [chain] : []} />
            <Typography variant="h4" className="mt-4">
              {safeName}
            </Typography>
            <EthHashInfo
              address={safeAddress}
              showCopyButton
              shortAddress={false}
              showAvatar={false}
              showName={false}
              showPrefix={false}
            />
          </div>
        )}

        <Button onClick={onClose} data-testid="cf-creation-lets-go-btn">
          {translateMessage('ui.letSGo_aa4b5f78')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default CounterfactualSuccessScreen
