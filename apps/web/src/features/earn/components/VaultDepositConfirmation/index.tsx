import { translateMessage } from '@/i18n'
import type { VaultDepositTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Typography } from '@safe-global/views/components/ui/typography'
import TokenIcon from '@/components/common/TokenIcon'
import TokenAmount from '@/components/common/TokenAmount'
import { vaultTypeToLabel } from '../../services/utils'
import { formatPercentage } from '@safe-global/utils/utils/formatters'
import { DataTable } from '@safe-global/views/components/common/Table/DataTable'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import IframeIcon from '@/components/common/IframeIcon'
import { InfoTooltip } from '@safe-global/views/components/common/InfoTooltip'
import { BRAND_NAME } from '@/config/constants'

const AdditionalRewards = ({ txInfo }: { txInfo: VaultDepositTransactionInfo }) => {
  if (!txInfo.additionalRewards[0]) return null

  return (
    <div className="mt-2 flex flex-col rounded-md border border-[var(--color-border-light)] p-3">
      <DataTable
        header={translateMessage('ui.additionalReward_6e6d161a')}
        rows={[
          <DataRow key="Token" title={translateMessage('ui.token_72f26614')}>
            {txInfo.additionalRewards[0].tokenInfo.name}{' '}
            <span className="text-[var(--color-primary-light)]">{txInfo.additionalRewards[0].tokenInfo.symbol}</span>
          </DataRow>,

          <DataRow key="Earn" title={translateMessage('ui.earn_2e740029')}>
            {formatPercentage(txInfo.additionalRewardsNrr / 100)}
          </DataRow>,

          <DataRow key="Fee" title={translateMessage('ui.fee_26159a09')}>
            0%
          </DataRow>,

          <Typography key="Powered by" variant="paragraph-mini" color="muted" className="mt-2 flex items-center gap-1">
            {translateMessage('ui.poweredBy_b0b13a76')}
            <IframeIcon
              src={txInfo.vaultInfo.logoUri}
              alt={translateMessage('ui.morphoLogo_c81816d7')}
              width={16}
              height={16}
            />{' '}
            Morpho
          </Typography>,
        ]}
      />
    </div>
  )
}

const ConfirmationHeader = ({ txInfo }: { txInfo: VaultDepositTransactionInfo }) => {
  const totalNrr = (txInfo.baseNrr + txInfo.additionalRewardsNrr) / 100

  return (
    <div key="amount" className="mb-2 flex flex-row gap-2">
      <div className="relative flex w-1/2 flex-row flex-wrap items-center rounded bg-[var(--color-border-background)] px-6 py-4">
        {txInfo.tokenInfo && (
          <div className="mr-4 w-10">
            <TokenIcon size={40} logoUri={txInfo.tokenInfo.logoUri || ''} tokenSymbol={txInfo.tokenInfo.symbol} />
          </div>
        )}

        <div className="flex-1">
          <Typography variant="paragraph-small" className="text-[var(--color-primary-light)]">
            {vaultTypeToLabel[txInfo.type]}
          </Typography>

          <Typography variant="h4">
            {txInfo.tokenInfo ? (
              <TokenAmount
                tokenSymbol={txInfo.tokenInfo.symbol}
                value={txInfo.value}
                decimals={txInfo.tokenInfo.decimals}
              />
            ) : (
              txInfo.value
            )}
          </Typography>
        </div>
      </div>

      <div className="relative flex w-1/2 flex-row flex-wrap items-center rounded bg-[var(--color-border-background)] px-6 py-4">
        <div className="flex-1">
          <Typography variant="paragraph-small" className="text-[var(--color-primary-light)]">
            {translateMessage('ui.earnAfterFees_fb6f3996')}
          </Typography>

          <Typography variant="h4">{formatPercentage(totalNrr)}</Typography>
        </div>
      </div>
    </div>
  )
}

const VaultDepositConfirmation = ({
  txInfo,
  isTxDetails = false,
}: {
  txInfo: VaultDepositTransactionInfo
  isTxDetails?: boolean
}) => {
  if (!txInfo.vaultInfo) return null

  const annualReward = Number(txInfo.expectedAnnualReward).toFixed(0)
  const monthlyReward = Number(txInfo.expectedMonthlyReward).toFixed(0)

  return (
    <>
      <DataTable
        rows={[
          <>{!isTxDetails && <ConfirmationHeader txInfo={txInfo} />}</>,

          <DataRow key="Deposit via" title={translateMessage('ui.depositVia_4b6e0a23')}>
            <div className="flex flex-row items-center">
              <IframeIcon
                src={txInfo.vaultInfo.logoUri}
                alt={translateMessage('ui.morphoLogo_c81816d7')}
                width={24}
                height={24}
              />
              <span className="ml-2 font-bold">{txInfo.vaultInfo.name}</span>
            </div>
          </DataRow>,

          <DataRow key="Expected annual reward" title={translateMessage('ui.expAnnualReward_40b548a4')}>
            <TokenAmount
              tokenSymbol={txInfo.tokenInfo.symbol}
              value={annualReward}
              decimals={txInfo.tokenInfo.decimals}
            />
          </DataRow>,

          <DataRow key="Expected monthly reward" title={translateMessage('ui.expMonthlyReward_4017a788')}>
            <TokenAmount
              tokenSymbol={txInfo.tokenInfo.symbol}
              value={monthlyReward}
              decimals={txInfo.tokenInfo.decimals}
            />
          </DataRow>,

          <DataRow
            key="Performance fee"
            title={
              <>
                {translateMessage('ui.performanceFee_4c16e304')}
                <InfoTooltip
                  title={translateMessage('ui.thePerformanceFeeIncurredHereIs_de4ceadc', { p0: BRAND_NAME })}
                />
              </>
            }
          >
            {formatPercentage(txInfo.fee, true)}
          </DataRow>,

          <AdditionalRewards key="Additional rewards" txInfo={txInfo} />,

          <Typography key="Vault description" variant="paragraph-small" color="muted" className="mt-2 block">
            {txInfo.vaultInfo.description}
          </Typography>,
        ]}
      />
    </>
  )
}

export default VaultDepositConfirmation
