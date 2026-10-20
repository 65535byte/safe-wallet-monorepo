import { fireEvent, waitFor, screen, render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/store'
import { CookieAndTermBanner } from '../index'
import { CookieAndTermType } from '@/store/cookiesAndTermsSlice'
import * as metadata from '@/markdown/terms/version'

// Mock next/router
const mockPush = jest.fn()
const mockPathname = '/home'

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: mockPathname,
    push: mockPush,
    query: {},
  }),
}))

// Helper to render with Redux store
const renderWithStore = (ui: React.ReactElement, preloadedState?: any) => {
  const store = makeStore(preloadedState)
  const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>
  const result = rtlRender(ui, { wrapper })
  return { ...result, store }
}

// The visible control is a `span[role=checkbox]` named by `aria-label`, because Base UI moves the
// given `id` onto its hidden native input (which is what the wrapping `<label htmlFor>` targets).
const getCheckboxByLabel = (label: string): HTMLElement => screen.getByRole('checkbox', { name: label })

describe('CookieAndTermBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render all cookie options', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(screen.getByText('必要 Cookie')).toBeInTheDocument()
      expect(screen.getByText('Beamer')).toBeInTheDocument()
      expect(screen.getByText('数据分析')).toBeInTheDocument()
    })

    it('should display intro text with terms link', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(screen.getByText(/浏览此页面即表示您接受我们的/)).toBeInTheDocument()
      expect(screen.getByText('条款与条件')).toBeInTheDocument()
      expect(screen.getByText(/最后更新/)).toBeInTheDocument()
      expect(screen.getByText('Cookie 政策')).toBeInTheDocument()
    })

    it('should display both action buttons', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(screen.getByText('保存设置')).toBeInTheDocument()
      expect(screen.getByText('全部接受')).toBeInTheDocument()
    })

    it('should display warning message when warningKey is provided', () => {
      renderWithStore(<CookieAndTermBanner warningKey={CookieAndTermType.UPDATES} />)

      expect(
        screen.getByText(
          /You attempted to open the "What's new" section but need to accept the "Beamer" cookies first/,
        ),
      ).toBeInTheDocument()
    })

    it('should not display warning message when warningKey is not provided', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(screen.queryByText(/You attempted to open the "What's new" section/)).not.toBeInTheDocument()
    })

    it('should render the banner container', () => {
      const { container } = renderWithStore(<CookieAndTermBanner />)

      expect(container.querySelector('[data-testid="cookies-popup"]')).toBeInTheDocument()
    })
  })

  describe('Cookie options state', () => {
    it('should have necessary cookie checkbox disabled and checked', () => {
      renderWithStore(<CookieAndTermBanner />)

      const necessaryCheckbox = getCheckboxByLabel('必要 Cookie')
      expect(necessaryCheckbox).toHaveAttribute('aria-disabled', 'true')
      expect(necessaryCheckbox).toBeChecked()
    })

    it('should load saved cookie preferences from store', () => {
      const preloadedState = {
        cookies_terms: {
          [CookieAndTermType.TERMS]: true,
          [CookieAndTermType.NECESSARY]: true,
          [CookieAndTermType.UPDATES]: true,
          [CookieAndTermType.ANALYTICS]: false,
          termsVersion: metadata.version,
        },
      }

      renderWithStore(<CookieAndTermBanner />, preloadedState)

      const beamerCheckbox = getCheckboxByLabel('Beamer')
      const analyticsCheckbox = getCheckboxByLabel('数据分析')

      expect(beamerCheckbox).toBeChecked()
      expect(analyticsCheckbox).not.toBeChecked()
    })

    it('should allow toggling Beamer checkbox', async () => {
      renderWithStore(<CookieAndTermBanner />)

      const beamerCheckbox = getCheckboxByLabel('Beamer')
      expect(beamerCheckbox).not.toBeChecked()

      await userEvent.click(beamerCheckbox)
      expect(beamerCheckbox).toBeChecked()

      await userEvent.click(beamerCheckbox)
      expect(beamerCheckbox).not.toBeChecked()
    })

    it('should allow toggling Analytics checkbox', async () => {
      renderWithStore(<CookieAndTermBanner />)

      const analyticsCheckbox = getCheckboxByLabel('数据分析')
      expect(analyticsCheckbox).not.toBeChecked()

      await userEvent.click(analyticsCheckbox)
      expect(analyticsCheckbox).toBeChecked()

      await userEvent.click(analyticsCheckbox)
      expect(analyticsCheckbox).not.toBeChecked()
    })

    it('should check warning cookie when warningKey is provided', () => {
      renderWithStore(<CookieAndTermBanner warningKey={CookieAndTermType.UPDATES} />)

      const beamerCheckbox = getCheckboxByLabel('Beamer')
      expect(beamerCheckbox).toBeChecked()
    })
  })

  describe('User interactions', () => {
    it('should save selected cookie preferences on "Save settings" click', async () => {
      const { store } = renderWithStore(<CookieAndTermBanner />)

      const beamerCheckbox = getCheckboxByLabel('Beamer')
      const saveButton = screen.getByText('保存设置')

      // Select only Beamer
      await userEvent.click(beamerCheckbox)

      fireEvent.click(saveButton)

      await waitFor(() => {
        const state = store.getState()
        expect(state.cookies_terms[CookieAndTermType.UPDATES]).toBe(true)
        expect(state.cookies_terms[CookieAndTermType.ANALYTICS]).toBe(false)
      })
    })

    it('should accept all cookies on "Accept all" click', async () => {
      const { store } = renderWithStore(<CookieAndTermBanner />)

      const acceptAllButton = screen.getByText('全部接受')

      fireEvent.click(acceptAllButton)

      await waitFor(() => {
        const state = store.getState()
        expect(state.cookies_terms[CookieAndTermType.UPDATES]).toBe(true)
        expect(state.cookies_terms[CookieAndTermType.ANALYTICS]).toBe(true)
      })
    })

    it('should close banner after saving settings', async () => {
      const { store } = renderWithStore(<CookieAndTermBanner />)

      const saveButton = screen.getByText('保存设置')

      fireEvent.click(saveButton)

      await waitFor(() => {
        const state = store.getState()
        expect(state.popups.cookies.open).toBe(false)
      })
    })

    it('should close banner after accepting all', async () => {
      const { store } = renderWithStore(<CookieAndTermBanner />)

      const acceptAllButton = screen.getByText('全部接受')

      fireEvent.click(acceptAllButton)

      await waitFor(() => {
        const state = store.getState()
        expect(state.popups.cookies.open).toBe(false)
      })
    })

    it('should save terms version when accepting settings', async () => {
      const { store } = renderWithStore(<CookieAndTermBanner />)

      const saveButton = screen.getByText('保存设置')

      fireEvent.click(saveButton)

      await waitFor(() => {
        const state = store.getState()
        expect(state.cookies_terms.termsVersion).toBe(metadata.version)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all checkboxes', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(getCheckboxByLabel('必要 Cookie')).toBeInTheDocument()
      expect(getCheckboxByLabel('Beamer')).toBeInTheDocument()
      expect(getCheckboxByLabel('数据分析')).toBeInTheDocument()
    })

    it('should have descriptions for each cookie type', () => {
      renderWithStore(<CookieAndTermBanner />)

      expect(screen.getByText('在本地保存核心功能所需的数据')).toBeInTheDocument()
      expect(screen.getByText('新功能与产品公告')).toBeInTheDocument()
      expect(screen.getByText('用于了解使用情况的分析工具。')).toBeInTheDocument()
    })
  })
})
