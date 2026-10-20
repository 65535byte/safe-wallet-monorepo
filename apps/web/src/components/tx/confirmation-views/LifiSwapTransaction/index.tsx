import { translateMessage } from '@/i18n'
import { DataTable } from '@safe-global/views/components/common/Table/DataTable'
import { type SwapTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { formatUnits } from 'ethers'
import { SwapFeature } from '@/features/swap'
import { useLoadFeature } from '@/features/__core__'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { formatAmount } from '@safe-global/utils/utils/formatNumber'
import TokenAmount from '@/components/common/TokenAmount'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import css from './styles.module.css'

const PreviewSwapAmount = ({ txInfo }: { txInfo: SwapTransactionInfo }) => {
  const { SwapTokens } = useLoadFeature(SwapFeature)

  return (
    <div key="amount">
      <SwapTokens
        first={{
          value: txInfo.fromAmount,
          label: translateMessage('ui.sell_aa061cbb'),
          tokenInfo: txInfo.fromToken,
        }}
        second={{
          value: txInfo.toAmount,
          label: translateMessage('ui.forAtLeast_3747e14a'),
          tokenInfo: txInfo.toToken,
        }}
      />
    </div>
  )
}

const ListSwapAmount = ({ txInfo }: { txInfo: SwapTransactionInfo }) => (
  <DataRow datatestid="amount" key="amount" title={translateMessage('ui.amount_a72e74a9')}>
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center gap-2">
        {translateMessage('ui.sell_aa061cbb')}{' '}
        <TokenAmount
          value={txInfo.fromAmount}
          decimals={txInfo.fromToken.decimals}
          logoUri={txInfo.fromToken.logoUri ?? ''}
          tokenSymbol={txInfo.fromToken.symbol}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        {translateMessage('ui.for_9837dd1e')}{' '}
        <TokenAmount
          value={txInfo.toAmount}
          decimals={txInfo.toToken.decimals}
          logoUri={txInfo.toToken.logoUri ?? ''}
          tokenSymbol={txInfo.toToken.symbol}
        />
      </div>
    </div>
  </DataRow>
)

export const LifiSwapTransaction = ({ txInfo, isPreview }: { txInfo: SwapTransactionInfo; isPreview: boolean }) => {
  const totalFee = formatUnits(
    BigInt(txInfo.fees?.integratorFee ?? 0n) + BigInt(txInfo.fees?.lifiFee ?? 0n),
    txInfo.fromToken.decimals,
  )

  const fromAmountDecimals = formatUnits(txInfo.fromAmount, txInfo.fromToken.decimals)
  const toAmountDecimals = formatUnits(txInfo.toAmount, txInfo.toToken.decimals)
  const exchangeRate = Number(toAmountDecimals) / Number(fromAmountDecimals)

  const rows = [
    isPreview ? <PreviewSwapAmount key="amount" txInfo={txInfo} /> : <ListSwapAmount key="amount" txInfo={txInfo} />,
    <DataRow datatestid="price" key="price" title={translateMessage('ui.price_ef94daec')}>
      1 {txInfo.fromToken.symbol} = {formatAmount(exchangeRate)} {txInfo.toToken!.symbol}
    </DataRow>,
    <DataRow datatestid="receiver" key="Receiver" title={translateMessage('ui.receiver_d42a1fbc')}>
      <NamedAddressInfo
        address={txInfo.recipient.value}
        name={txInfo.recipient.name}
        hasExplorer
        showAvatar={false}
        onlyName
        showCopyButton
      />
    </DataRow>,
    <DataRow datatestid="total-fee" key="fees" title={translateMessage('ui.fees_5ef20e69')}>
      {formatAmount(totalFee)} {txInfo.fromToken.symbol}
    </DataRow>,
  ]

  if (txInfo.lifiExplorerUrl) {
    rows.push(
      <DataRow
        datatestid="lifi-explorer-url"
        key="lifi-explorer-url"
        title={translateMessage('ui.lifiExplorer_f696d3f7')}
      >
        <ExternalLink className={css.externalLink} href={txInfo.lifiExplorerUrl}>
          {translateMessage('ui.viewInLiFiExplorer_bf104f7b')}
        </ExternalLink>
      </DataRow>,
    )
  }

  return (
    <div className="flex flex-col">
      <DataTable rows={rows} />
    </div>
  )
}
