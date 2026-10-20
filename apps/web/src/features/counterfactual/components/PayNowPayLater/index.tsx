import { translateMessage } from '@/i18n'
import type { Dispatch, SetStateAction } from 'react'
import classnames from 'classnames'
import { useCurrentChain } from '@/hooks/useChains'
import { useNativeTokenDisplay } from '@/hooks/useNativeTokenDisplay'
import { Check } from 'lucide-react'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import { RadioGroup, RadioGroupItem } from '@safe-global/views/components/ui/radio-group'
import { Label } from '@safe-global/views/components/ui/label'
import { Typography } from '@safe-global/views/components/ui/typography'

import css from './styles.module.css'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { PayMethod } from '@safe-global/utils/features/counterfactual/types'
import { useSiwe } from '@/services/siwe/useSiwe'
import { useAppDispatch } from '@/store'
import { setAuthenticated, SESSION_LIFETIME_MS } from '@/store/authSlice'

const PayNowPayLater = ({
  totalFee,
  canRelay,
  isMultiChain,
  payMethod,
  setPayMethod,
  isUserAuthenticated = true,
}: {
  totalFee: string
  canRelay: boolean
  isMultiChain: boolean
  payMethod: PayMethod
  setPayMethod: Dispatch<SetStateAction<PayMethod>>
  isUserAuthenticated?: boolean
}) => {
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()
  const { showGasFeeEstimation, showStablecoinFeeInfo } = useNativeTokenDisplay()
  const { signIn, loading: signingIn } = useSiwe()

  const signInAndSelectPayLater = async () => {
    if (signingIn) return
    const result = await signIn()
    if (result && !result.error) {
      dispatch(setAuthenticated(Date.now() + SESSION_LIFETIME_MS))
      setPayMethod(PayMethod.PayLater)
    }
  }

  const onChoosePayMethod = async (newPayMethod: unknown) => {
    if (newPayMethod === PayMethod.PayLater && !isUserAuthenticated) {
      await signInAndSelectPayLater()
      return
    }
    setPayMethod(newPayMethod as PayMethod)
  }

  return (
    <>
      <Typography variant="h4" className="font-bold">
        {translateMessage('ui.beforeWeContinue_f5d8ea75')}
      </Typography>
      {isMultiChain && (
        <ErrorMessage level="info">
          {translateMessage('ui.youWillNeedTo_990066fb')}
          <b>{translateMessage('ui.activateYourAccount_fb7d880f')}</b>{' '}
          {translateMessage('ui.separatelyOnEachNetworkMakeSure_3a5fb683')}
        </ErrorMessage>
      )}
      {showStablecoinFeeInfo && (
        <div className="mt-4">
          <ErrorMessage level="info">{translateMessage('ui.thisNetworkUsesUSDStablecoinsFor_33fd6fee')}</ErrorMessage>
        </div>
      )}
      <div className="flex flex-col py-2">
        {isMultiChain && (
          <div className="flex items-center py-2">
            <div className={classnames(css.listItem, 'flex items-center')}>
              <Check className="size-5" />
            </div>
            <Typography variant="paragraph-small">
              {translateMessage('ui.startExploringTheAccountsNowAnd_c2209dfa')}
            </Typography>
          </div>
        )}
        <div className="flex items-center py-2">
          <div className={classnames(css.listItem, 'flex items-center')}>
            <Check className="size-5" />
          </div>
          <Typography variant="paragraph-small">{translateMessage('ui.thereWillBeAOneTime_d992c553')}</Typography>
        </div>
        {!isMultiChain && (
          <div className="flex items-center py-2">
            <div className={classnames(css.listItem, 'flex items-center')}>
              <Check className="size-5" />
            </div>
            <Typography variant="paragraph-small">{translateMessage('ui.ifYouChooseToPayLater_1a0a27a0')}</Typography>
          </div>
        )}
        <div className="flex items-center py-2">
          <div className={classnames(css.listItem, 'flex items-center')}>
            <Check className="size-5" />
          </div>
          <Typography variant="paragraph-small">{translateMessage('ui.doesnTProfitFromTheFees_561e0175')}</Typography>
        </div>
      </div>
      <div className="w-full">
        <RadioGroup
          value={payMethod}
          onValueChange={onChoosePayMethod}
          className={classnames(css.radioGroup, 'flex flex-row')}
        >
          <Label
            htmlFor="pay-now-execution-method"
            data-testid="pay-now-execution-method"
            className={classnames(css.radioContainer, 'flex-1 items-center', {
              [css.active]: payMethod === PayMethod.PayNow,
              'cursor-pointer': !isMultiChain,
              'cursor-not-allowed opacity-60': isMultiChain,
            })}
          >
            <RadioGroupItem
              id="pay-now-execution-method"
              value={PayMethod.PayNow}
              aria-label={translateMessage('ui.payNow_9d59950f')}
              disabled={isMultiChain}
            />
            {/* flex-col: the subtitle belongs on its own line under the label. `paragraph-small`
                renders an inline <span>, so without this it can run on after the title. */}
            <span className="flex flex-col items-start">
              <Typography className={css.radioTitle}>{translateMessage('ui.payNow_9d59950f')}</Typography>
              {isMultiChain ? (
                <Typography className={css.radioSubtitle} variant="paragraph-small" color="muted">
                  {translateMessage('ui.notAvailableForMultipleNetworks_496f5185')}
                </Typography>
              ) : (
                showGasFeeEstimation && (
                  <Typography className={css.radioSubtitle} variant="paragraph-small" color="muted">
                    {canRelay ? (
                      translateMessage('ui.sponsoredFreeTransaction_18518b84')
                    ) : (
                      <>
                        &asymp; {totalFee} {chain?.nativeCurrency.symbol}
                      </>
                    )}
                  </Typography>
                )
              )}
            </span>
          </Label>

          <Label
            htmlFor="connected-wallet-execution-method"
            data-testid="connected-wallet-execution-method"
            className={classnames(css.radioContainer, 'flex-1 cursor-pointer items-center', {
              [css.active]: payMethod === PayMethod.PayLater,
            })}
          >
            <RadioGroupItem
              id="connected-wallet-execution-method"
              value={PayMethod.PayLater}
              disabled={signingIn}
              aria-label={translateMessage('ui.payLater_e09d8c21')}
            />
            <span className="flex flex-col items-start">
              <Typography className={classnames(css.radioTitle, 'flex items-center')}>
                {translateMessage('ui.payLater_70e7a558')}
                {signingIn && <Spinner className="ml-1 size-3.5" />}
              </Typography>
              <Typography className={css.radioSubtitle} variant="paragraph-small" color="muted">
                {isUserAuthenticated
                  ? translateMessage('ui.withTheFirstTransaction_e89db42e')
                  : translateMessage('ui.signInToEnable_9688565d')}
              </Typography>
            </span>
          </Label>
        </RadioGroup>
        {!isUserAuthenticated && (
          <div className="mt-2">
            <ErrorMessage level="info">
              <Typography
                data-testid="sign-in-to-workspace-btn"
                variant="paragraph-small"
                onClick={signInAndSelectPayLater}
                className={classnames('font-bold text-[var(--color-primary-main)] underline', {
                  'cursor-default opacity-60': signingIn,
                  'cursor-pointer': !signingIn,
                })}
              >
                {translateMessage('ui.signIn_789309bd')}
              </Typography>{' '}
              {translateMessage('ui.toCreateAWithoutImmediateDeployment_7adeeb98')}
            </ErrorMessage>
          </div>
        )}
      </div>
    </>
  )
}

export default PayNowPayLater
