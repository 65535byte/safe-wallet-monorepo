import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store'
import AboutPage from '../pages/AboutPage'
import { AppRoutes } from '@/config/routes'
import { HELP_CENTER_URL } from '@safe-global/utils/config/constants'
import { APP_VERSION } from '@/config/version'
import { selectCookieBanner } from '@/store/popupSlice'
import { CookieAndTermType } from '@/store/cookiesAndTermsSlice'
import { useLoadFeature } from '@/features/__core__'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'
import { useIsSafeProAnnouncementEnabled } from '@/features/safe-pro-announcement'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'

const mockSupportChatDrawer = jest.fn()

jest.mock('@/features/__core__', () => ({
  useLoadFeature: jest.fn(),
}))

jest.mock('@/features/support-chat', () => ({
  SupportChatFeature: 'support-chat-feature',
  useSupportChat: () => ({
    config: { appId: 'test-app', chatUrl: 'https://chat.test', aliasDomain: 'test.local', allowedParents: [] },
    user: { email: 'guest@test.local', name: 'Safe{Wallet}' },
  }),
}))

jest.mock('@/hooks/useIsOfficialHost', () => ({
  useIsOfficialHost: jest.fn(),
}))

jest.mock('@/features/safe-pro-announcement', () => ({
  useIsSafeProAnnouncementEnabled: jest.fn(),
}))

jest.mock('@/hooks/useIsSafeProEnabled', () => ({
  useIsSafeProEnabled: jest.fn(),
}))

const setSupportFeature = ({ disabled, isOfficialHost }: { disabled: boolean; isOfficialHost: boolean }) => {
  mockSupportChatDrawer.mockImplementation(({ open }: { open: boolean }) =>
    open ? <div data-testid="support-chat-drawer" /> : null,
  )
  ;(useLoadFeature as jest.Mock).mockReturnValue({
    SupportChatDrawer: mockSupportChatDrawer,
    $isDisabled: disabled,
  })
  ;(useIsOfficialHost as jest.Mock).mockReturnValue(isOfficialHost)
}

const renderWithStore = () => {
  const store = makeStore()
  return {
    store,
    ...render(
      <Provider store={store}>
        <AboutPage />
      </Provider>,
    ),
  }
}

describe('AboutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setSupportFeature({ disabled: false, isOfficialHost: true })
    ;(useIsSafeProAnnouncementEnabled as jest.Mock).mockReturnValue(true)
    ;(useIsSafeProEnabled as jest.Mock).mockReturnValue(false)
  })

  describe('legal links', () => {
    it('renders Terms & Conditions with correct href', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /^条款与条件/i })
      expect(link).toHaveAttribute('href', 'https://safe.global/terms')
    })

    it('renders Privacy Policy with correct href', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /隐私政策/i })
      expect(link).toHaveAttribute('href', 'https://safe.global/privacy')
    })

    it('renders Licenses with correct href', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /许可证/i })
      expect(link).toHaveAttribute('href', AppRoutes.licenses)
    })

    it('renders Imprint with correct href', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /法律声明/i })
      expect(link).toHaveAttribute('href', AppRoutes.imprint)
    })

    it('renders Cookie Policy with correct href', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /Cookie 政策/i })
      expect(link).toHaveAttribute('href', AppRoutes.cookie)
    })

    it('opens all legal links in a new tab with noopener', () => {
      renderWithStore()
      const legalLinks = [
        screen.getByRole('link', { name: /^条款与条件/i }),
        screen.getByRole('link', { name: /隐私政策/i }),
        screen.getByRole('link', { name: /许可证/i }),
        screen.getByRole('link', { name: /法律声明/i }),
        screen.getByRole('link', { name: /Cookie 政策/i }),
      ]
      legalLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer noopener')
      })
    })

    it('leads with the 8379 terms, opening on safe.global in a new tab', () => {
      renderWithStore()
      const userTerms = screen.getByRole('link', { name: /^Pro 用户条款与条件/i })
      const proTerms = screen.getByRole('link', { name: /^Pro 条款与条件/i })

      expect(userTerms).toHaveAttribute('href', 'https://safe.global/pro-user-terms')
      expect(proTerms).toHaveAttribute('href', 'https://safe.global/pro-terms')
      for (const link of [userTerms, proTerms]) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer noopener')
        expect(link).toHaveTextContent('适用于 8379')
      }

      const legal = screen.getByText('法律与政策').parentElement as HTMLElement
      const [first, second, third] = Array.from(legal.querySelectorAll('a'))
      expect(first).toBe(userTerms)
      expect(second).toBe(proTerms)
      expect(third).toHaveTextContent(/^条款与条件/)
    })

    it('keeps the 8379 terms once 8379 is live without the announcement', () => {
      ;(useIsSafeProAnnouncementEnabled as jest.Mock).mockReturnValue(false)
      ;(useIsSafeProEnabled as jest.Mock).mockReturnValue(true)
      renderWithStore()

      expect(screen.getByRole('link', { name: /^Pro 用户条款与条件/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /^Pro 条款与条件/i })).toBeInTheDocument()
    })

    it('leaves the 8379 terms out while 8379 is neither announced nor live', () => {
      ;(useIsSafeProAnnouncementEnabled as jest.Mock).mockReturnValue(false)
      ;(useIsSafeProEnabled as jest.Mock).mockReturnValue(false)
      renderWithStore()

      expect(screen.queryByRole('link', { name: /^Pro /i })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /^条款与条件/i })).toHaveAttribute('href', 'https://safe.global/terms')
    })
  })

  describe('help links', () => {
    it('renders Help Center link pointing to HELP_CENTER_URL', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /帮助中心/i })
      expect(link).toHaveAttribute('href', HELP_CENTER_URL)
    })

    it('renders Sync Status link', () => {
      renderWithStore()
      const link = screen.getByRole('link', { name: /同步状态/i })
      expect(link).toHaveAttribute('href', 'https://status.safe.global')
    })
  })

  describe('Contact Support', () => {
    it('renders Contact Support as a button when the support chat feature is available', () => {
      renderWithStore()
      const button = screen.getByRole('button', { name: /联系支持/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-slot', 'button')
      expect(screen.queryByRole('link', { name: /联系支持/i })).not.toBeInTheDocument()
    })

    it('does not render Contact Support when the feature is disabled', () => {
      setSupportFeature({ disabled: true, isOfficialHost: true })
      renderWithStore()
      expect(screen.queryByRole('button', { name: /联系支持/i })).not.toBeInTheDocument()
    })

    it('does not render Contact Support on unofficial hosts', () => {
      setSupportFeature({ disabled: false, isOfficialHost: false })
      renderWithStore()
      expect(screen.queryByRole('button', { name: /联系支持/i })).not.toBeInTheDocument()
    })

    it('opens the support chat drawer when clicked', () => {
      renderWithStore()
      expect(screen.queryByTestId('support-chat-drawer')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /联系支持/i }))

      expect(screen.getByTestId('support-chat-drawer')).toBeInTheDocument()
    })
  })

  describe('version section', () => {
    it('renders the current version badge', () => {
      renderWithStore()
      expect(screen.getByText(`v${APP_VERSION}`)).toBeInTheDocument()
    })

    it('hides the GitHub release and repository entries', () => {
      renderWithStore()
      expect(screen.queryByRole('link', { name: /查看 v.* 的版本说明/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument()
      expect(screen.queryByText('开源')).not.toBeInTheDocument()
    })
  })

  describe('cookie preferences', () => {
    it('renders the cookie preferences button', () => {
      renderWithStore()
      expect(screen.getByTestId('cookie-preferences-button')).toHaveAttribute('data-slot', 'button')
    })

    it('dispatches openCookieBanner with NECESSARY key when clicked', () => {
      const { store } = renderWithStore()

      fireEvent.click(screen.getByTestId('cookie-preferences-button'))

      const cookieBanner = selectCookieBanner(store.getState())
      expect(cookieBanner.open).toBe(true)
      expect(cookieBanner.warningKey).toBe(CookieAndTermType.NECESSARY)
    })
  })
})
