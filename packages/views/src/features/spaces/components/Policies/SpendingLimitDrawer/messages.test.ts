import { PENDING_BANNER_TITLE, connectHelper, executeLine, signAndExecuteLine, signedAndWaitingLine } from './messages'

describe('pending banner copy', () => {
  it('tells a creating user the limit is not active yet', () => {
    expect(PENDING_BANNER_TITLE.create).toBe('交易尚未执行，支出限额尚未生效。')
  })

  // A queued removal leaves the policy enforced; the creation copy would say spending is blocked when it is not.
  it('tells a removing user the limit is still active', () => {
    expect(PENDING_BANNER_TITLE.remove).toBe('移除交易执行前，此支出限额仍然有效。')
  })

  it('tells an updating user the current limits still apply', () => {
    expect(PENDING_BANNER_TITLE.update).toBe('变更执行前仍适用当前限额。')
  })
})

describe('action lines', () => {
  it.each([
    ['create', '签名并执行交易 to activate。'],
    ['remove', '签名并执行交易 to remove it。'],
    ['update', '签名并执行交易 to apply the change。'],
  ] as const)('completes the sign-and-execute line for %s', (operation, expected) => {
    expect(signAndExecuteLine(operation)).toBe(expected)
  })

  it.each([
    ['create', '执行交易 to activate。'],
    ['remove', '执行交易 to remove it。'],
    ['update', '执行交易 to apply the change。'],
  ] as const)('completes the execute line for %s', (operation, expected) => {
    expect(executeLine(operation)).toBe(expected)
  })
})

describe('connectHelper', () => {
  it('names the Safe whose signer wallet is wanted', () => {
    expect(connectHelper('Treasury')).toBe('请连接 Treasury 的签名人钱包以签名。')
  })
})

describe('signedAndWaitingLine', () => {
  // formatAwaitingSignatures returns an unterminated clause; the full stop belongs to this sentence only.
  it('punctuates the sentence once, and stays singular for the last signature', () => {
    expect(signedAndWaitingLine(1)).toBe('您已签名。Waiting for 1 more signature。')
  })

  it('pluralises beyond one', () => {
    expect(signedAndWaitingLine(2)).toBe('您已签名。Waiting for 2 more signatures。')
  })
})
