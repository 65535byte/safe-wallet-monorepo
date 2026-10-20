import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { render, waitFor } from '@/tests/test-utils'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import * as syncSafeMessageSigner from '@/hooks/messages/useSyncSafeMessageSigner'

import SingleMsg from '.'
import { safeMsgBuilder } from '@/tests/builders/safeMessage'

const safeMessage = safeMsgBuilder().build()
const extendedSafeInfo = extendedSafeInfoBuilder().build()

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/transactions/msg',
      query: {
        safe: extendedSafeInfo.address.value,
        messageHash: safeMessage.messageHash,
      },
    }
  },
}))

jest.spyOn(useSafeInfo, 'default').mockImplementation(() => ({
  safeAddress: extendedSafeInfo.address.value,
  safe: {
    ...extendedSafeInfo,
    chainId: '5',
  },
  safeError: undefined,
  safeLoading: false,
  safeLoaded: true,
}))

describe('SingleMsg', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders <SingleMsg />', async () => {
    jest
      .spyOn(syncSafeMessageSigner, 'fetchSafeMessage')
      .mockImplementation(() => Promise.resolve(safeMsgBuilder().build()))
    const screen = render(<SingleMsg />)
    expect(await screen.findByText('Signature')).toBeInTheDocument()
  })

  it('shows an error when the transaction has failed to load', async () => {
    jest
      .spyOn(syncSafeMessageSigner, 'fetchSafeMessage')
      .mockImplementation(() => Promise.reject(new Error('Server error')))

    const screen = render(<SingleMsg />)

    await waitFor(() => {
      expect(screen.getByText('无法加载消息')).toBeInTheDocument()
    })

    // The raw error is never offered to the user — there is no Details toggle to open.
    expect(screen.queryByText('详情')).not.toBeInTheDocument()
    expect(screen.queryByText('Server error')).not.toBeInTheDocument()
  })
})
