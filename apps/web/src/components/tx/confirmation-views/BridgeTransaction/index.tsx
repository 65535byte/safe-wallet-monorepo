import { translateMessage } from '@/i18n'
import ChainIndicator from '@/components/common/ChainIndicator'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { DataTable } from '@safe-global/views/components/common/Table/DataTable'
import TokenAmount from '@/components/common/TokenAmount'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { type Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { type BridgeAndSwapTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { formatAmount } from '@safe-global/utils/utils/formatNumber'
import { formatUnits } from 'ethers'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import css from './styles.module.css'

interface BridgeTransactionProps {
  txInfo: BridgeAndSwapTransactionInfo
  showWarnings?: boolean
}

const BridgeTxRecipientRow = ({ txInfo }: BridgeTransactionProps) => {
  return (
    <DataRow datatestid="recipient" key="recipient" title={translateMessage('ui.recipient_f737f260')}>
      <div className="flex flex-col">
        <NamedAddressInfo
          address={txInfo.recipient.value}
          showCopyButton
          hasExplorer
          showAvatar={false}
          onlyName
          showPrefix
          chainId={txInfo.toChain}
        />
      </div>
    </DataRow>
  )
}

function pendingBridgeTransactionRows(txInfo: BridgeAndSwapTransactionInfo & { status: 'PENDING' }) {
  const actualFromAmount =
    BigInt(txInfo.fromAmount) + BigInt(txInfo.fees?.integratorFee ?? 0n) + BigInt(txInfo.fees?.lifiFee ?? 0n)

  return [
    <DataRow datatestid="amount" key="amount" title={translateMessage('ui.amount_a72e74a9')}>
      <div className="flex flex-row items-center gap-2">
        {translateMessage('ui.sending_ddd4e5b4')}{' '}
        <TokenAmount
          value={actualFromAmount.toString()}
          decimals={txInfo.fromToken.decimals}
          logoUri={txInfo.fromToken.logoUri ?? ''}
          tokenSymbol={txInfo.fromToken.symbol}
        />{' '}
        {translateMessage('ui.to_474fc495')}
        <ChainIndicator chainId={txInfo.toChain} inline />
      </div>
    </DataRow>,
  ]
}

function failedBridgeTransactionRows(txInfo: BridgeAndSwapTransactionInfo & { status: 'FAILED' }) {
  const actualFromAmount =
    BigInt(txInfo.fromAmount) + BigInt(txInfo.fees?.integratorFee ?? 0n) + BigInt(txInfo.fees?.lifiFee ?? 0n)
  return [
    <DataRow datatestid="amount" key="amount" title={translateMessage('ui.amount_a72e74a9')}>
      <div className="flex flex-row items-center gap-2">
        {translateMessage('ui.failedToSend_c7db57ef')}{' '}
        <TokenAmount
          value={actualFromAmount.toString()}
          decimals={txInfo.fromToken.decimals}
          logoUri={txInfo.fromToken.logoUri ?? ''}
          tokenSymbol={txInfo.fromToken.symbol}
        />{' '}
        {translateMessage('ui.to_474fc495')}
        <ChainIndicator chainId={txInfo.toChain} inline />
      </div>
    </DataRow>,
    <DataRow datatestid="substatus" key="substatus" title={translateMessage('ui.substatus_9d0c2886')}>
      {txInfo.substatus}
    </DataRow>,
  ]
}

function successfulBridgeTransactionRows(
  txInfo: BridgeAndSwapTransactionInfo & { status: 'DONE' },
  chainId: string,
  chainConfigs: Chain[],
) {
  const actualFromAmount =
    BigInt(txInfo.fromAmount) + BigInt(txInfo.fees?.integratorFee ?? 0n) + BigInt(txInfo.fees?.lifiFee ?? 0n)
  const fromAmountDecimals = formatUnits(actualFromAmount, txInfo.fromToken.decimals)
  const toAmountDecimals =
    txInfo.toAmount && txInfo.toToken ? formatUnits(txInfo.toAmount, txInfo.toToken.decimals) : undefined
  const exchangeRate = toAmountDecimals ? Number(toAmountDecimals) / Number(fromAmountDecimals) : undefined

  const fromChainConfig = chainConfigs.find((config) => config.chainId === chainId)
  const toChainConfig = chainConfigs.find((config) => config.chainId === txInfo.toChain)

  const rows = []

  rows.push(
    <DataRow datatestid="amount" key="amount" title={translateMessage('ui.amount_a72e74a9')}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          {translateMessage('ui.sell_aa061cbb')}{' '}
          <TokenAmount
            value={actualFromAmount.toString()}
            decimals={txInfo.fromToken.decimals}
            logoUri={txInfo.fromToken.logoUri ?? ''}
            tokenSymbol={txInfo.fromToken.symbol}
            chainId={chainId}
          />{' '}
          {translateMessage('ui.on_f1bc39ef')}
          {fromChainConfig?.chainName ?? 'Unknown Chain'}
        </div>
        <div className="flex flex-row items-center gap-2">
          {txInfo.toToken && txInfo.toAmount ? (
            <>
              {translateMessage('ui.for_9837dd1e')}{' '}
              <TokenAmount
                value={txInfo.toAmount}
                decimals={txInfo.toToken.decimals}
                logoUri={txInfo.toToken.logoUri ?? ''}
                tokenSymbol={txInfo.toToken.symbol}
                chainId={txInfo.toChain}
              />{' '}
              {translateMessage('ui.on_f1bc39ef')}
              {toChainConfig?.chainName ?? 'Unknown Chain'}
            </>
          ) : (
            <>{translateMessage('ui.couldNotFindBuyTokenInformation_778c1425')}</>
          )}
        </div>
      </div>
    </DataRow>,
  )
  if (exchangeRate) {
    rows.push(
      <DataRow datatestid="exchange-rate" key="Exchange Rate" title={translateMessage('ui.exchangeRate_5c6da80c')}>
        1 {txInfo.fromToken.symbol} = {formatAmount(exchangeRate)} {txInfo.toToken!.symbol}
      </DataRow>,
    )
  }

  return rows
}

function BridgeTransaction({ txInfo }: BridgeTransactionProps) {
  const chainId = useChainId()
  const { configs } = useChains()

  const totalFee = formatUnits(
    BigInt(txInfo.fees?.integratorFee ?? 0n) + BigInt(txInfo.fees?.lifiFee ?? 0n),
    txInfo.fromToken.decimals,
  )

  let rows = []
  if (txInfo.status === 'PENDING' || txInfo.status === 'AWAITING_EXECUTION') {
    rows.push(...pendingBridgeTransactionRows(txInfo as BridgeAndSwapTransactionInfo & { status: 'PENDING' }))
  } else if (txInfo.status === 'FAILED') {
    rows.push(...failedBridgeTransactionRows(txInfo as BridgeAndSwapTransactionInfo & { status: 'FAILED' }))
  } else if (txInfo.status === 'DONE') {
    rows.push(
      ...successfulBridgeTransactionRows(txInfo as BridgeAndSwapTransactionInfo & { status: 'DONE' }, chainId, configs),
    )
  }
  rows.push(
    <BridgeTxRecipientRow key="recipient" txInfo={txInfo} />,
    <DataRow datatestid="total-fee" key="fees" title={translateMessage('ui.fees_5ef20e69')}>
      {formatAmount(totalFee)} {txInfo.fromToken.symbol}
    </DataRow>,
  )

  if (txInfo.explorerUrl) {
    rows.push(
      <DataRow
        datatestid="lifi-explorer-url"
        key="lifi-explorer-url"
        title={translateMessage('ui.lifiExplorer_f696d3f7')}
      >
        <ExternalLink className={css.externalLink} href={txInfo.explorerUrl}>
          {translateMessage('ui.viewInLiFiExplorer_1dc34b29')}
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

export default BridgeTransaction
