import { render, screen } from '@/tests/test-utils'
import NotificationsPage from '@/pages/settings/notifications'

const mockUseHasFeature = jest.fn()
jest.mock('@/hooks/useChains', () => ({
  useHasFeature: () => mockUseHasFeature(),
}))

jest.mock('@/components/settings/PushNotifications', () => ({
  PushNotifications: () => <div data-testid="push-notifications" />,
}))

jest.mock('@/components/settings/SettingsHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-header" />,
}))

describe('NotificationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the notifications content when the feature is enabled', () => {
    mockUseHasFeature.mockReturnValue(true)

    render(<NotificationsPage />)

    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    expect(screen.getByTestId('push-notifications')).toBeInTheDocument()
    expect(screen.queryByText('此网络暂不支持通知。')).not.toBeInTheDocument()
  })

  it('keeps the settings header while the chains config is still loading (feature === undefined)', () => {
    mockUseHasFeature.mockReturnValue(undefined)

    render(<NotificationsPage />)

    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    expect(screen.queryByTestId('push-notifications')).not.toBeInTheDocument()
    expect(screen.queryByText('此网络暂不支持通知。')).not.toBeInTheDocument()
  })

  it('keeps the settings header and shows the not-available message when the feature is disabled (feature === false)', () => {
    mockUseHasFeature.mockReturnValue(false)

    render(<NotificationsPage />)

    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    expect(screen.queryByTestId('push-notifications')).not.toBeInTheDocument()
    expect(screen.getByText('此网络暂不支持通知。')).toBeInTheDocument()
  })
})
