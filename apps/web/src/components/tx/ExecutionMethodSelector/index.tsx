import { translateMessage } from '@/i18n'
import { RadioGroup, RadioGroupItem } from '@safe-global/views/components/ui/radio-group'
import { Label } from '@safe-global/views/components/ui/label'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Chip } from '@safe-global/views/components/ui/chip'
import { Link } from '@safe-global/views/components/ui/link'
import type { Dispatch, SetStateAction, ReactElement } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import WalletIcon from '@safe-global/views/components/common/WalletIcon'
import SponsoredBy from '../SponsoredBy'

import RemainingRelays from '../RemainingRelays'
import SponsoredTxsCounter from '../SponsoredTxsCounter'
import { Info } from 'lucide-react'
import { NoFeeCampaignFeature } from '@/features/no-fee-campaign'
import { useLoadFeature } from '@/features/__core__'

import css from './styles.module.css'
import BalanceInfo from '@/components/tx/BalanceInfo'
import madProps from '@/utils/mad-props'
import { useCurrentChain } from '@/hooks/useChains'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { SponsoredOffer } from '@/utils/gasPayment'

export const enum ExecutionMethod {
  RELAY = 'RELAY',
  WALLET = 'WALLET',
}

// Wrapper component to load GasTooHighBanner (follows React naming conventions)
const GasTooHighBannerLoader = () => {
  const { GasTooHighBanner } = useLoadFeature(NoFeeCampaignFeature)
  return <GasTooHighBanner />
}

const CampaignLabel = ({ offer }: { offer: Extract<SponsoredOffer, { option: 'NO_FEE_CAMPAIGN' }> }) => {
  if (offer.disabledReason) {
    return (
      <div className={css.noFeeCampaignLabel}>
        <Chip size="sm" shape="tag">
          {offer.disabledReason === 'LIMIT_REACHED'
            ? translateMessage('ui.available_a4daf655', { p0: offer.remaining, p1: offer.limit })
            : translateMessage('ui.notAvailable_6505d8d6')}
        </Chip>
        <Typography className={css.notAvailableTitle}>{translateMessage('ui.sponsoredGas_dfc0d96f')}</Typography>
        <div className={css.descriptionWrapper}>
          <Typography className={css.descriptionText}>
            {translateMessage('ui.partOfTheFreeJanuaryFoundation_981c7e12')}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className={css.noFeeCampaignLabel}>
      <Typography className={css.mainLabel}>{translateMessage('ui.sponsoredGas_dfc0d96f')}</Typography>
      <div className={css.subLabel}>
        <Typography variant="paragraph-small" className="text-muted-foreground">
          {translateMessage('ui.partOfTheFreeJanuaryFoundation_981c7e12')}{' '}
          <Tooltip>
            <TooltipTrigger render={<Info className={css.infoIconInline} />} />
            <TooltipContent>
              <span>
                {translateMessage('ui.uSDeHoldersEnjoyGaslessTransactionsOn_76fd8a95')}{' '}
                <Link
                  href="https://help.safe.global/articles/9605526657-no-fee-january-campaign"
                  className="font-bold underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="inherit"
                >
                  {translateMessage('ui.learnMore_0c11daba')}
                </Link>
              </span>
            </TooltipContent>
          </Tooltip>
        </Typography>
      </div>
    </div>
  )
}

const SponsoredRadioLabel = ({ offer, chainId }: { offer: SponsoredOffer; chainId: string }) =>
  offer.option === 'NO_FEE_CAMPAIGN' ? (
    <CampaignLabel offer={offer} />
  ) : (
    <Typography className={`${css.radioLabel} whitespace-nowrap`}>
      {translateMessage('ui.sponsoredBy_f390cdd7')}
      <SponsoredBy option={offer.option} chainId={chainId} />
    </Typography>
  )

const SponsoredRadio = ({ offer, chainId }: { offer: SponsoredOffer; chainId: string }) => {
  if (!offer.disabledReason) {
    return (
      <Label data-testid="relay-execution-method" className="flex flex-1 cursor-pointer items-center gap-2">
        <RadioGroupItem value={ExecutionMethod.RELAY} />
        <SponsoredRadioLabel offer={offer} chainId={chainId} />
      </Label>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Label
            data-testid="relay-execution-method"
            className="flex flex-1 cursor-not-allowed items-center gap-[10px]"
          >
            <RadioGroupItem value={ExecutionMethod.RELAY} disabled />
            <SponsoredRadioLabel offer={offer} chainId={chainId} />
          </Label>
        }
      />
      <TooltipContent>
        {offer.disabledReason === 'GAS_TOO_HIGH'
          ? translateMessage('ui.gasPricesAreTooHighRight_98393df1')
          : translateMessage('ui.youReachedTheLimitOfSponsored_a55ea135')}
      </TooltipContent>
    </Tooltip>
  )
}

const SponsoredStrip = ({
  offer,
  isRelay,
  isSafeProEnabled,
  hasWallet,
  tooltip,
}: {
  offer: SponsoredOffer
  isRelay: boolean
  isSafeProEnabled: boolean
  hasWallet: boolean
  tooltip?: string
}): ReactElement | null => {
  const balance = hasWallet ? <BalanceInfo /> : null

  switch (offer.option) {
    case 'NO_FEE_CAMPAIGN':
      return isRelay ? (
        <Typography variant="paragraph-small" className={css.transactionCounter}>
          <span className={css.counterNumber}>{offer.remaining}</span>{' '}
          {translateMessage('ui.freeTransactionsLeft_e086888f')}
        </Typography>
      ) : (
        balance
      )
    case 'FREE_DAILY_LIMIT':
      if (!offer.relays) return balance
      if (isSafeProEnabled) {
        return (
          <SponsoredTxsCounter
            left={offer.relays.remaining}
            quota={offer.relays.limit}
            resetsAt={null}
            isSubscription={false}
            isPro={offer.isPro}
          />
        )
      }
      return isRelay ? <RemainingRelays relays={offer.relays} tooltip={tooltip} /> : balance
    case 'SUBSCRIPTION':
      return (
        <SponsoredTxsCounter
          left={offer.left}
          quota={offer.meter?.quota ?? null}
          resetsAt={offer.meter?.resetsAt ?? null}
          isSubscription
          isPro
        />
      )
  }
}

export const _ExecutionMethodSelector = ({
  wallet,
  chain,
  isSafeProEnabled,
  executionMethod,
  setExecutionMethod,
  offer,
  showsProUpsell,
  noLabel,
  tooltip,
}: {
  wallet: ConnectedWallet | null
  chain?: Chain
  isSafeProEnabled: boolean
  executionMethod: ExecutionMethod
  setExecutionMethod: Dispatch<SetStateAction<ExecutionMethod>>
  offer: SponsoredOffer | null
  /** No sponsored option is left, but a Safe Pro plan would sponsor this Safe: only the upgrade nudge renders. */
  showsProUpsell?: boolean
  noLabel?: boolean
  tooltip?: string
}): ReactElement | null => {
  const selectedMethod = offer && !offer.disabledReason ? executionMethod : ExecutionMethod.WALLET

  const onChooseExecutionMethod = (newExecutionMethod: unknown) => {
    setExecutionMethod(newExecutionMethod as ExecutionMethod)
  }

  if (!offer) {
    if (!showsProUpsell) return null
    return (
      <div className={`${css.container} overflow-hidden rounded-[var(--radius)]`}>
        <SponsoredTxsCounter left={0} quota={null} resetsAt={null} isSubscription={false} isPro={false} />
      </div>
    )
  }

  return (
    /* overflow-hidden clips the relay counter's 6px bottom corners to this radius */
    <div className={`${css.container} overflow-hidden rounded-[var(--radius)]`}>
      <div className={css.method}>
        <div className="flex flex-col">
          {!noLabel ? (
            <Typography variant="paragraph-small" className={css.label}>
              {translateMessage('ui.whoWillPayGasFees_ac5397ff')}
            </Typography>
          ) : null}

          <RadioGroup
            value={selectedMethod}
            onValueChange={onChooseExecutionMethod}
            className={`${css.radioGroup} flex flex-row`}
          >
            <SponsoredRadio offer={offer} chainId={chain?.chainId ?? ''} />

            <Label
              data-testid="connected-wallet-execution-method"
              className="flex flex-1 cursor-pointer items-center gap-2"
            >
              <RadioGroupItem value={ExecutionMethod.WALLET} />
              <Typography className={css.radioLabel}>
                <WalletIcon provider={wallet?.label || ''} width={20} height={20} icon={wallet?.icon} />{' '}
                {translateMessage('ui.connectedWallet_5054cd1e')}
              </Typography>
            </Label>
          </RadioGroup>
        </div>

        {offer.option === 'NO_FEE_CAMPAIGN' && offer.disabledReason === 'GAS_TOO_HIGH' && (
          <div className={css.gasBannerWrapper}>
            <GasTooHighBannerLoader />
          </div>
        )}
      </div>

      <SponsoredStrip
        offer={offer}
        isRelay={selectedMethod === ExecutionMethod.RELAY}
        isSafeProEnabled={isSafeProEnabled}
        hasWallet={!!wallet}
        tooltip={tooltip}
      />
    </div>
  )
}

export const ExecutionMethodSelector = madProps(_ExecutionMethodSelector, {
  wallet: useWallet,
  chain: useCurrentChain,
  isSafeProEnabled: useIsSafeProEnabled,
})
