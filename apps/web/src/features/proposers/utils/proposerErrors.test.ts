import { getProposerErrorText } from './proposerErrors'

const FALLBACK = '添加提案人失败'

describe('getProposerErrorText', () => {
  it('maps a signature conflict from the gateway to the owner-already-confirmed copy', () => {
    const error = new Error('签名 for owner 0x4c3c38a459F0bAABB763290111B66ed01b5fEfA2 already exists')

    expect(getProposerErrorText(error, FALLBACK)).toBe(
      '所有者 0x4c3c...EfA2 已确认此请求，请使用其他所有者签名以继续。',
    )
  })

  it('maps a signature conflict regardless of the gateway wording casing', () => {
    const error = new Error('signature for owner 0x4c3c38a459F0bAABB763290111B66ed01b5fEfA2 already exists.')

    expect(getProposerErrorText(error, FALLBACK)).toContain('already confirmed this request')
  })

  it('maps an ethers wallet rejection to the rejected-signature copy', () => {
    const error = Object.assign(new Error('ethers-user-denied'), { code: 'ACTION_REJECTED' })

    expect(getProposerErrorText(error, FALLBACK)).toBe('签名请求已拒绝，请重试以继续。')
  })

  it('maps a WalletConnect rejection to the rejected-signature copy', () => {
    const error = new Error('User rejected the request')

    expect(getProposerErrorText(error, FALLBACK)).toBe('签名请求已拒绝，请重试以继续。')
  })

  it('returns the fallback for an unmapped error', () => {
    expect(getProposerErrorText(new Error('HTTP Error 500'), FALLBACK)).toBe(FALLBACK)
  })

  it('returns the fallback when the conflict message carries no owner address', () => {
    expect(getProposerErrorText(new Error('签名 already exists'), FALLBACK)).toBe(FALLBACK)
  })
})
