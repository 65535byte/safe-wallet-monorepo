import { translateMessage } from '@/i18n'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import madProps from '@/utils/mad-props'
import { type ReactElement, type SyntheticEvent, useContext } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Separator } from '@safe-global/views/components/ui/separator'

import ErrorMessage from '@/components/tx/ErrorMessage'
import TxCheckError from '@/components/tx/TxCheckError'
import { trackError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import CheckWallet from '@/components/common/CheckWallet'

import type { SafeTransaction } from '@safe-global/types-kit'
import { TxModalContext } from '@/components/tx-flow'
import { SuccessScreenFlow } from '@/components/tx-flow/flows'
import { useSafeScope } from '@safe-global/views/components/tx-flow/safe-scope'
import AdvancedParams, { useAdvancedParams } from '../../../../tx/AdvancedParams'
import { asError } from '@safe-global/utils/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'

import css from './styles.module.css'
import commonCss from '@safe-global/views/components/tx-flow/common/styles.module.css'

import { pollModuleTransactionId, useExecuteThroughRole, useGasLimit, useMetaTransactions, type Role } from './hooks'
import { decodeBytes32String } from 'ethers'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { assertOnboard, assertWallet } from '@/utils/helpers'
import { dispatchModuleTxExecution } from '@/services/tx/tx-sender'
import { Status } from 'zodiac-roles-deployments'
import { useSafeShield } from '@/features/safe-shield/SafeShieldContext'
import SplitMenuButton from '@safe-global/views/components/common/SplitMenuButton'
import { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import type { SlotComponentProps, SlotName } from '../../../slots'
import { TxFlowContext } from '../../../TxFlowProvider'
import type { SubmitCallback } from '../../../TxFlow'

const RoleChip = ({ children }: { children: string }) => {
  let humanReadableRoleKey = children
  try {
    humanReadableRoleKey = decodeBytes32String(children)
  } catch (e) {}

  return <span className={css.roleChip}>{humanReadableRoleKey}</span>
}

export const ExecuteThroughRoleForm = ({
  safeTx,
  role,
  onSubmit,
  onSubmitSuccess,
  disableSubmit = false,
  options = [],
  onChange,
  slotId,
  txSecurity,
}: SlotComponentProps<SlotName.ComboSubmit> & {
  safeTx?: SafeTransaction
  role: Role
  disableSubmit?: boolean
  onSubmitSuccess?: SubmitCallback
  txSecurity: ReturnType<typeof useSafeShield>
}): ReactElement => {
  const currentChain = useCurrentChain()
  const onboard = useOnboard()
  const wallet = useWallet()
  const { safe } = useSafeInfo()

  const chainId = currentChain?.chainId || '1'

  const { setTxFlow } = useContext(TxModalContext)
  const scope = useSafeScope()
  const { needsRiskConfirmation, isRiskConfirmed } = txSecurity
  const { isSubmitLoading, setIsSubmitLoading, setSubmitError, setIsRejectedByUser } = useContext(TxFlowContext)

  const permissionsError = role.status !== null ? PermissionsErrorMessage[role.status] : null
  const metaTransactions = useMetaTransactions(safeTx)
  const multiSendImpossible = metaTransactions.length > 1 && !role.multiSend

  // Wrap call, routing it through the Roles mod with the allowing role
  const txThroughRole = useExecuteThroughRole({
    role: role.status === Status.Ok && !multiSendImpossible ? role : undefined,
    metaTransactions,
  })

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(txThroughRole)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  // On form submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    assertWallet(wallet)
    assertOnboard(onboard)

    setIsSubmitLoading(true)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    if (!txThroughRole) {
      throw new Error(translateMessage('ui.executionThroughRoleIsNotPossible_5d514fc6'))
    }

    const txOptions = getTxOptions(advancedParams, currentChain)

    onSubmit?.()

    let txHash: string
    try {
      txHash = await dispatchModuleTxExecution(
        { ...txThroughRole, ...txOptions },
        wallet.provider,
        safe.chainId,
        safe.address.value,
      )
    } catch (_err) {
      const err = asError(_err)
      if (isWalletRejection(err)) {
        setIsRejectedByUser(true)
      } else {
        trackError(Errors._815, err)
        setSubmitError(err)
      }
      setIsSubmitLoading(false)
      return
    }

    const successScope = scope ? { chainId: scope.chainId, safeAddress: scope.safeAddress } : undefined

    // On success, forward to the success screen, initially without a txId
    setTxFlow(<SuccessScreenFlow txHash={txHash} scope={successScope} />, undefined, false)

    // Wait for module tx to be indexed
    const transactionService = currentChain?.transactionService
    if (!transactionService) {
      throw new Error(translateMessage('ui.transactionServiceNotFound_26410b9b'))
    }
    const txId = await pollModuleTransactionId(chainId, safe.address.value, txHash)
    onSubmitSuccess?.({ txId, isExecuted: true })

    // Update the success screen so it shows a link to the transaction
    setTxFlow(<SuccessScreenFlow txId={txId} scope={successScope} />, undefined, false)
  }

  const walletCanPay = useWalletCanPay({
    gasLimit,
    maxFeePerGas: advancedParams.maxFeePerGas,
  })

  const submitDisabled =
    !txThroughRole || isSubmitLoading || disableSubmit || (needsRiskConfirmation && !isRiskConfirmed)

  return (
    <>
      <form onSubmit={handleSubmit}>
        {!permissionsError && (
          <>
            <Typography className="mb-4">
              {translateMessage('ui.your_44763c70')}
              <RoleChip>{role.roleKey}</RoleChip> {translateMessage('ui.roleAllowsYouToExecuteThis_31a289ef')}
            </Typography>

            <div className={commonCss.params}>
              <AdvancedParams
                willExecute
                params={advancedParams}
                recommendedGasLimit={gasLimit}
                onFormSubmit={setAdvancedParams}
                gasLimitError={gasLimitError}
              />
            </div>
          </>
        )}

        {permissionsError && (
          <div className="mb-4">
            <Typography className="mb-4">
              {translateMessage('ui.youAreAMemberOfThe_9ecc3f78')}
              <RoleChip>{role.roleKey}</RoleChip> {translateMessage('ui.roleButItDoesNotAllow_993939fb')}
            </Typography>

            <ErrorMessage>{permissionsError}</ErrorMessage>
          </div>
        )}

        <Typography variant="paragraph-mini" className="mb-4 flex gap-[2px] text-muted-foreground">
          {translateMessage('ui.poweredBy_9a7de8cb')}
          <img src="/images/transactions/zodiac-roles.svg" width={16} height={16} alt="Zodiac Roles" />
          <span className={css.zodiac}>Zodiac</span>
        </Typography>

        {multiSendImpossible && (
          <div className="mt-2">
            <ErrorMessage>{translateMessage('ui.theCurrentConfigurationOfTheZodiac_9a30849e')}</ErrorMessage>
          </div>
        )}

        {!walletCanPay ? (
          <div className="mt-2">
            <ErrorMessage level="info">{translateMessage('ui.yourConnectedWalletDoesnTHave_496964dc')}</ErrorMessage>
          </div>
        ) : (
          gasLimitError && (
            <div className="mt-2">
              <TxCheckError error={gasLimitError} />
            </div>
          )
        )}

        <div className="pt-6">
          <Separator bleed="6" />
        </div>

        <TxCardActions>
          {/* Submit button, also available to non-owner role members */}
          <CheckWallet allowNonOwner checkNetwork={!submitDisabled}>
            {(isOk) => (
              <SplitMenuButton
                selected={slotId}
                onChange={({ id }) => onChange?.(id)}
                options={options}
                disabled={!isOk || submitDisabled}
                loading={isSubmitLoading}
              />
            )}
          </CheckWallet>
        </TxCardActions>
      </form>
    </>
  )
}

export default madProps(ExecuteThroughRoleForm, {
  txSecurity: useSafeShield,
})

const PermissionsErrorMessage: Record<Status, string | null> = {
  [Status.Ok]: null,

  [Status.DelegateCallNotAllowed]: translateMessage('ui.roleIsNotAllowedToDelegate_b3272eb4'),
  [Status.TargetAddressNotAllowed]: translateMessage('ui.roleIsNotAllowedToCall_c62ce37e'),
  [Status.FunctionNotAllowed]: translateMessage('ui.roleIsNotAllowedToCall_66d498cb'),
  [Status.SendNotAllowed]: translateMessage('ui.roleIsNotAllowedToSend_d998d0b7'),
  [Status.OrViolation]: translateMessage('ui.conditionViolationNoneOfTheOr_c419c6fa'),
  [Status.NorViolation]: translateMessage('ui.conditionViolationAtLeastOneNor_17021dea'),
  [Status.ParameterNotAllowed]: translateMessage('ui.conditionViolationParameterValueIsNot_c873db09'),
  [Status.ParameterLessThanAllowed]: translateMessage('ui.conditionViolationParameterValueIsLess_212bef26'),
  [Status.ParameterGreaterThanAllowed]: translateMessage('ui.conditionViolationParameterValueIsGreater_b4b7c8c1'),
  [Status.ParameterNotAMatch]: translateMessage('ui.conditionViolationParameterValueDoesNot_2a5c5664'),
  [Status.NotEveryArrayElementPasses]: translateMessage('ui.conditionViolationNotEveryArrayElement_a93438af'),
  [Status.NoArrayElementPasses]: translateMessage('ui.conditionViolationNoneOfTheArray_b75ffb7f'),
  [Status.ParameterNotSubsetOfAllowed]: translateMessage('ui.conditionViolationParameterValueIsNot_4de932b3'),
  [Status.BitmaskOverflow]: translateMessage('ui.conditionViolationBitmaskExceededValueLength_b02a0522'),
  [Status.BitmaskNotAllowed]: translateMessage('ui.conditionViolationBitmaskDoesNotAllow_769f6509'),
  [Status.CustomConditionViolation]: translateMessage('ui.conditionViolationCustomConditionIsNot_ad9a859f'),
  [Status.AllowanceExceeded]: translateMessage('ui.conditionViolationAllowanceIsExceeded_3864ac8d'),
  [Status.CallAllowanceExceeded]: translateMessage('ui.conditionViolationCallAllowanceIsExceeded_eb97e62c'),
  [Status.EtherAllowanceExceeded]: translateMessage('ui.conditionViolationEtherAllowanceIsExceeded_0b31bbbe'),
}
