import { translateMessage } from '@/i18n'
import { id } from 'ethers'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'

const WITHDRAW_SIGHASH = id('requestValidatorsExit(bytes)').slice(0, 10)
const CLAIM_SIGHASH = id('batchWithdrawCLFee(bytes)').slice(0, 10)

export const getStakeTitle = (txs: BaseTransaction[] | undefined) => {
  const hashToLabel = {
    [WITHDRAW_SIGHASH]: translateMessage('ui.withdrawRequest_98c96bda'),
    [CLAIM_SIGHASH]: translateMessage('ui.claim_4f900c2c'),
  }

  const stakeTitle = txs
    ?.map((tx) => hashToLabel[tx.data.slice(0, 10)])
    .filter(Boolean)
    .join(' and ')

  return stakeTitle
}
