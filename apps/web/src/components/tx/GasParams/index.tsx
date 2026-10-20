import { translateMessage } from '@/i18n'
import type { ReactElement, SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@safe-global/views/components/ui/accordion'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { Link } from '@safe-global/views/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import WarningIcon from '@safe-global/views/assets/images/notifications/warning.svg'
import { useCurrentChain } from '@/hooks/useChains'
import { getNativeTokenDisplay, NATIVE_TOKEN_DISPLAY_DEFAULT } from '@safe-global/utils/utils/chains'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { type AdvancedParameters } from '@safe-global/views/components/tx/AdvancedParams/types'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import classnames from 'classnames'
import css from './styles.module.css'
import accordionCss from '@/styles/accordion.module.css'
import madProps from '@/utils/mad-props'
import { getTotalFee } from '@safe-global/utils/hooks/useDefaultGasPrice'

const GasDetail = ({ name, value, isLoading }: { name: string; value: string; isLoading: boolean }): ReactElement => {
  const valueSkeleton = <Skeleton className="inline-block h-4 min-w-[5em]" />
  return (
    <div className="flex">
      <div className="flex-1">{name}</div>
      <div>{value || (isLoading ? valueSkeleton : '-')}</div>
    </div>
  )
}

type GasParamsProps = {
  params: AdvancedParameters
  isExecution: boolean
  isEIP1559?: boolean
  onEdit?: () => void
  gasLimitError?: Error
  willRelay?: boolean
  noFeeCampaign?: {
    isEligible: boolean
    remaining: number
    limit: number
  }
}

export const _GasParams = ({
  params,
  isExecution,
  isEIP1559,
  onEdit,
  gasLimitError,
  willRelay,
  noFeeCampaign,
  chain,
}: GasParamsProps & { chain?: Chain }): ReactElement => {
  const { nonce, userNonce, safeTxGas, gasLimit, maxFeePerGas, maxPriorityFeePerGas } = params
  const { showGasFeeEstimation } = chain?.features ? getNativeTokenDisplay(chain) : NATIVE_TOKEN_DISPLAY_DEFAULT

  if (!showGasFeeEstimation) {
    return <></>
  }

  const onChangeExpand = (value: unknown[]) => {
    trackEvent({ ...MODALS_EVENTS.ESTIMATION, label: value.length > 0 ? 'Open' : 'Close' })
  }

  const isLoading = !gasLimit || !maxFeePerGas
  const isError = gasLimitError && !gasLimit

  // Total gas cost
  const totalFee = !isLoading
    ? formatVisualAmount(getTotalFee(maxFeePerGas, gasLimit), chain?.nativeCurrency.decimals)
    : '> 0.001'

  // Individual gas params
  const gasLimitString = gasLimit?.toString() || ''
  const maxFeePerGasGwei = maxFeePerGas ? formatVisualAmount(maxFeePerGas) : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? formatVisualAmount(maxPriorityFeePerGas) : ''

  const onEditClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onEdit?.()
  }

  const EditComponent = (
    <>
      {gasLimitError || !isExecution || (isExecution && !isLoading) ? (
        <Link render={<button type="button" />} onClick={onEditClick} className="mt-4 text-base font-bold">
          {translateMessage('ui.edit_ed035142')}
        </Link>
      ) : (
        <Skeleton className="mt-4 inline-block h-4 min-w-[2em]" />
      )}
    </>
  )

  return (
    <div className={classnames(css.container, { [css.error]: gasLimitError })}>
      <Accordion onValueChange={onChangeExpand}>
        <AccordionItem value="gas-params" className="border-b-0">
          <AccordionTrigger className={classnames(accordionCss.accordion, 'items-center px-4')}>
            {isExecution ? (
              <span className="flex w-full items-center">
                <span className="flex-1">{translateMessage('ui.estimatedFee_fb33dd3c')}</span>
                {gasLimitError ? (
                  <>
                    <WarningIcon className="mr-[var(--space-1)] size-4 text-[var(--color-error-main)]" />
                    <span className="font-normal">{translateMessage('ui.cannotEstimate_8024d910')}</span>
                  </>
                ) : isLoading ? (
                  <Skeleton className="inline-block h-4 min-w-[7em]" />
                ) : (
                  <div className={css.feeContainer}>
                    {noFeeCampaign?.isEligible ? (
                      <>
                        <span className={css.feeAmount}>{translateMessage('ui.free_b34fd7a2')}</span>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span className={css.noFeeCampaignTag}>
                                {translateMessage('ui.freeJanuarySponsored_11276188')}
                              </span>
                            }
                          />
                          <TooltipContent>{translateMessage('ui.asAUSDeHolderYouAre_1b09b1f4')}</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <span>
                        {willRelay
                          ? translateMessage('ui.free_b34fd7a2')
                          : `${totalFee} ${chain?.nativeCurrency.symbol}`}
                      </span>
                    )}
                  </div>
                )}
              </span>
            ) : (
              <span>
                {translateMessage('ui.signingTheTransactionWithNonce_d2014873')}
                {nonce !== undefined ? nonce : <Skeleton className="inline-block h-4 min-w-[2em]" />}
              </span>
            )}
          </AccordionTrigger>

          <AccordionContent className="px-4 pt-4">
            {nonce !== undefined && (
              <GasDetail
                isLoading={false}
                name={translateMessage('ui.accountTransactionNonce_109d7ebd')}
                value={nonce.toString()}
              />
            )}

            {safeTxGas !== undefined && <GasDetail isLoading={false} name="safeTxGas" value={safeTxGas.toString()} />}

            {isExecution && (
              <>
                {userNonce !== undefined && (
                  <GasDetail
                    isLoading={false}
                    name={translateMessage('ui.walletNonce_4409d032')}
                    value={userNonce.toString()}
                  />
                )}

                <GasDetail
                  isLoading={isLoading}
                  name={translateMessage('ui.gasLimit_24018a1a')}
                  value={isError ? translateMessage('ui.cannotEstimate_8024d910') : gasLimitString}
                />

                {isEIP1559 ? (
                  <>
                    <GasDetail
                      isLoading={isLoading}
                      name={translateMessage('ui.maxPriorityFeeGwei_75ffb753')}
                      value={maxPrioGasGwei}
                    />
                    <GasDetail
                      isLoading={isLoading}
                      name={translateMessage('ui.maxFeeGwei_bac57a85')}
                      value={maxFeePerGasGwei}
                    />
                  </>
                ) : (
                  <GasDetail
                    isLoading={isLoading}
                    name={translateMessage('ui.gasPriceGwei_5d9c2dae')}
                    value={maxFeePerGasGwei}
                  />
                )}
              </>
            )}

            {onEdit && EditComponent}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const GasParams = madProps(_GasParams, {
  chain: useCurrentChain,
})

export default GasParams
