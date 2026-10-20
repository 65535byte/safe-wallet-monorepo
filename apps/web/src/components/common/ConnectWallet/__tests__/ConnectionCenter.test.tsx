import ConnectionCenter from '@/components/common/ConnectWallet/ConnectionCenter'
import { render } from '@/tests/test-utils'

describe('ConnectionCenter', () => {
  it('displays the ConnectWalletButton', () => {
    const { getByText, queryByText } = render(<ConnectionCenter />)

    expect(queryByText('连接钱包')).not.toBeInTheDocument()
    expect(getByText('连接')).toBeInTheDocument()
  })
})
