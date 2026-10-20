import { fireEvent, render } from '@/tests/test-utils'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { InternalRecoveryProposalCard } from '../RecoveryProposalCard'

jest.mock('@/services/analytics', () => ({
  ...jest.requireActual('@/services/analytics'),
  trackEvent: jest.fn(),
}))

const mockedTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>

describe('RecoveryProposalCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('vertical', () => {
    it('should render correctly', () => {
      const mockClose = jest.fn()
      const mockSetTxFlow = jest.fn()

      const { getByTestId, queryByText } = render(
        <InternalRecoveryProposalCard orientation="vertical" onClose={mockClose} setTxFlow={mockSetTxFlow} />,
      )

      expect(getByTestId('recovery-proposal')).toHaveAttribute('data-slot', 'card')
      expect(queryByText(/Recover this account\./)).toBeTruthy()
      expect(queryByText('已连接钱包可以通过添加新签名人帮助您恢复访问权。')).toBeTruthy()
      expect(queryByText('了解更多')).toBeTruthy()

      const recoveryButton = queryByText('开始恢复')
      expect(recoveryButton).toBeTruthy()

      fireEvent.click(recoveryButton!)

      expect(mockClose).toHaveBeenCalled()
      expect(mockSetTxFlow).toHaveBeenCalled()
    })

    it('should track START_RECOVERY event', () => {
      const mockClose = jest.fn()
      const mockSetTxFlow = jest.fn()

      const { getByText } = render(
        <InternalRecoveryProposalCard orientation="vertical" onClose={mockClose} setTxFlow={mockSetTxFlow} />,
      )

      const button = getByText('开始恢复')
      fireEvent.click(button)

      expect(mockedTrackEvent).toHaveBeenCalledWith(RECOVERY_EVENTS.START_RECOVERY)
    })
  })
  describe('horizontal', () => {
    it('should render correctly', () => {
      const mockSetTxFlow = jest.fn()

      const { queryByText } = render(
        <InternalRecoveryProposalCard orientation="horizontal" setTxFlow={mockSetTxFlow} />,
      )

      expect(queryByText(/Recover this account\./)).toBeTruthy()
      expect(queryByText('已连接钱包可以通过添加新签名人帮助您恢复访问权。')).toBeTruthy()

      const recoveryButton = queryByText('开始恢复')
      expect(recoveryButton).toBeTruthy()

      fireEvent.click(recoveryButton!)

      expect(mockSetTxFlow).toHaveBeenCalled()
    })

    it('should track START_RECOVERY event', () => {
      const mockSetTxFlow = jest.fn()

      const { getByText } = render(<InternalRecoveryProposalCard orientation="horizontal" setTxFlow={mockSetTxFlow} />)

      const button = getByText('开始恢复')
      fireEvent.click(button)

      expect(mockedTrackEvent).toHaveBeenCalledWith(RECOVERY_EVENTS.START_RECOVERY)
    })
  })
})
