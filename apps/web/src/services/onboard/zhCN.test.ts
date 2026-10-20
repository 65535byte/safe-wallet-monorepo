import { onboardZhCN } from './zhCN'

describe('Chinese wallet connection copy', () => {
  it('keeps interpolation tokens required by the wallet connector', () => {
    expect(onboardZhCN.connect.connectingWallet.header).toBe(
      '{connectionRejected, select, false {正在连接 {wallet}…} other {连接已拒绝}}',
    )
    expect(onboardZhCN.modals.switchChain.paragraph1).toContain('{nextNetworkName}')
    expect(onboardZhCN.connect.connectedWallet.sidebar.paragraph).toContain('{app}')
  })
})
