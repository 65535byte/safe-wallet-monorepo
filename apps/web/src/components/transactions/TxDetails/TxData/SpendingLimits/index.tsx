import { translateMessage } from '@/i18n'
import type { TransactionData } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ReactElement } from 'react'
import React, { useMemo } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import SpendingLimitLabel from '@safe-global/views/components/common/SpendingLimitLabel'
import { useCurrentChain } from '@/hooks/useChains'
import useBalances from '@/hooks/useBalances'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import type { SpendingLimitMethods } from '@/utils/transaction-guards'
import { isSetAllowance } from '@/utils/transaction-guards'
import { getResetTimeOptions } from '@/features/spending-limits'
import TxDetailsRow from '@/components/tx/ConfirmTxDetails/TxDetailsRow'
import { ZERO_ADDRESS } from '@safe-global/utils/utils/constants'

type SpendingLimitsProps = {
  txData?: TransactionData | null
  type: SpendingLimitMethods
  resetsSpent?: boolean
}

export const SpendingLimits = ({ txData, type, resetsSpent = false }: SpendingLimitsProps): ReactElement | null => {
  const chain = useCurrentChain()
  const { balances } = useBalances()
  const tokens = useMemo(() => balances.items.map(({ tokenInfo }) => tokenInfo), [balances.items])
  const isSetAllowanceMethod = useMemo(() => isSetAllowance(type), [type])

  const [beneficiary, tokenAddress, amount, resetTimeMin] =
    txData?.dataDecoded?.parameters?.map(({ value }) => value) || []

  const resetTimeLabel = useMemo(
    () => getResetTimeOptions(chain?.chainId).find(({ value }) => +value === +resetTimeMin)?.label,
    [chain?.chainId, resetTimeMin],
  )
  const tokenInfo = useMemo(
    () =>
      tokens.find(({ address }) => sameAddress(address, tokenAddress as string)) ??
      Object.values(txData?.tokenInfoIndex ?? {}).find(({ address }) => sameAddress(address, tokenAddress as string)),
    [tokenAddress, tokens, txData?.tokenInfoIndex],
  )

  if (!txData) return null

  return (
    <div className="flex flex-col gap-2">
      <Typography>
        <b>
          {translateMessage('ui.spendingLimit_1a0d7a91', {
            p0: isSetAllowanceMethod ? 'Modify' : translateMessage('ui.delete_6cba6a2c'),
          })}
        </b>
      </Typography>

      <TxDetailsRow label={translateMessage('ui.beneficiary_cb21d4c7')} grid>
        <EthHashInfo
          address={(beneficiary as string) || ZERO_ADDRESS}
          shortAddress={false}
          showCopyButton
          hasExplorer
        />
      </TxDetailsRow>

      <TxDetailsRow
        label={
          isSetAllowanceMethod
            ? tokenInfo
              ? translateMessage('ui.amount_a72e74a9')
              : translateMessage('ui.rawAmountInDecimals_07abd51d')
            : translateMessage('ui.token_72f26614')
        }
        grid
      >
        {tokenInfo && (
          <>
            <TokenIcon logoUri={tokenInfo.logoUri} size={32} tokenSymbol={tokenInfo.symbol} />
            <Typography>{tokenInfo.symbol}</Typography>
          </>
        )}

        {isSetAllowanceMethod && (
          <>
            {tokenInfo ? (
              <Typography>
                {formatVisualAmount(amount as string, tokenInfo.decimals)} {tokenInfo.symbol}
              </Typography>
            ) : (
              <Typography>{amount}</Typography>
            )}
          </>
        )}
      </TxDetailsRow>

      {isSetAllowanceMethod && (
        <TxDetailsRow label={translateMessage('ui.resetTime_84996791')} grid>
          <SpendingLimitLabel
            label={resetTimeLabel || translateMessage('ui.oneTimeSpendingLimit_e55c119a')}
            isOneTime={!resetTimeLabel}
          />
        </TxDetailsRow>
      )}

      {isSetAllowanceMethod && resetsSpent && (
        <TxDetailsRow label={translateMessage('ui.spentAmount_79197bda')} grid>
          <Typography>{translateMessage('ui.resetTo_333712c0')}</Typography>
        </TxDetailsRow>
      )}
    </div>
  )
}
