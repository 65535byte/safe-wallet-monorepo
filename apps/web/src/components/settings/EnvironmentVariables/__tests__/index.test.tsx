import { fireEvent, waitFor, screen, within, render as rtlRender } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { Provider } from 'react-redux'
import { makeStore } from '@/store'
import type { RootState } from '@/store'
import { initialState as settingsInitialState } from '@/store/settingsSlice'
import EnvironmentVariables from '..'
import { faker } from '@faker-js/faker'
import { chainBuilder } from '@/tests/builders/chains'
import * as analytics from '@/services/analytics'
import { reloadPage } from '@/utils/navigation'
import type { useSafeProAccess } from '@/features/spaces'
import { TENDERLY_SETUP_GUIDE_URL, TENDERLY_SIMULATE_URL_PLACEHOLDER } from '../utils'

// Mock chain data
const mockChain = chainBuilder()
  .with({ chainId: '1', shortName: 'eth' })
  .with({ rpcUri: { authentication: 'NO_AUTHENTICATION', value: 'https://mainnet.infura.io/v3/' } })
  .build()

// Mock hooks
jest.mock('@/utils/navigation')

jest.mock('@/hooks/useChainId', () => ({
  __esModule: true,
  default: jest.fn(() => '1'),
}))

jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => mockChain),
}))

const mockUseSafeProAccess = jest.fn<Partial<ReturnType<typeof useSafeProAccess>>, []>(() => ({
  hasProFeatures: false,
  isLoading: false,
  spaceId: null,
}))
jest.mock('@/features/spaces', () => ({ useSafeProAccess: () => mockUseSafeProAccess() }))

// Mock analytics
jest.mock('@/services/analytics', () => ({
  trackEvent: jest.fn(),
  SETTINGS_EVENTS: {
    ENV_VARIABLES: {
      SAVE: { category: 'settings', action: 'env_variables_save' },
    },
  },
}))

// Helper function to render with store access
const renderWithStore = (ui: React.ReactElement, initialReduxState?: Partial<RootState>) => {
  const store = makeStore(initialReduxState)
  const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>
  const result = rtlRender(ui, { wrapper })
  return { ...result, store }
}

describe('EnvironmentVariables', () => {
  const mockRpcUrl = faker.internet.url()
  const mockTenderlyUrl = 'https://api.tenderly.co/api/v1/account/my-org/project/my-project/simulate'
  const mockTenderlyToken = faker.string.alphanumeric(32)

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSafeProAccess.mockReturnValue({ hasProFeatures: false, isLoading: false, spaceId: null })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('should render with empty initial values', () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: {
            rpc: {},
            tenderly: { url: '', accessToken: '' },
          },
        },
      },
    })

    // Check placeholder text is visible
    expect(screen.getByPlaceholderText(mockChain.rpcUri.value)).toBeInTheDocument()
  })

  it('should render with existing Redux values', () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: {
            rpc: { '1': mockRpcUrl },
            tenderly: { url: mockTenderlyUrl, accessToken: mockTenderlyToken },
          },
        },
      },
    })

    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement
    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址') as HTMLInputElement
    const tenderlyTokenInput = screen.getByLabelText('Tenderly 访问令牌') as HTMLInputElement

    expect(rpcInput).toHaveValue(mockRpcUrl)
    expect(tenderlyUrlInput).toHaveValue(mockTenderlyUrl)
    expect(tenderlyTokenInput).toHaveValue(mockTenderlyToken)
  })

  it('should allow user to input RPC URL', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement

    fireEvent.change(rpcInput, { target: { value: mockRpcUrl } })

    await waitFor(() => {
      expect(rpcInput).toHaveValue(mockRpcUrl)
    })
  })

  it('should mask the Tenderly access token until the user reveals it', () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: mockTenderlyUrl, accessToken: mockTenderlyToken } },
        },
      },
    })

    const tenderlyTokenInput = screen.getByLabelText('Tenderly 访问令牌') as HTMLInputElement
    // Never a password field, so password managers leave it alone; the masking is CSS only.
    expect(tenderlyTokenInput).toHaveAttribute('type', 'text')
    expect(tenderlyTokenInput).toHaveAttribute('data-1p-ignore')
    expect(tenderlyTokenInput).toHaveAttribute('data-lpignore', 'true')
    expect(tenderlyTokenInput).toHaveClass('[-webkit-text-security:disc]')

    fireEvent.click(screen.getByRole('button', { name: '显示访问令牌' }))
    expect(tenderlyTokenInput).not.toHaveClass('[-webkit-text-security:disc]')

    fireEvent.click(screen.getByRole('button', { name: '隐藏访问令牌' }))
    expect(tenderlyTokenInput).toHaveClass('[-webkit-text-security:disc]')
    expect(tenderlyTokenInput).toHaveAttribute('type', 'text')
  })

  it('should show reset button when value is entered', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement

    // Initially no reset button
    expect(screen.queryAllByLabelText('恢复默认值')).toHaveLength(0)

    // Enter value
    fireEvent.change(rpcInput, { target: { value: mockRpcUrl } })

    // Reset button should appear
    await waitFor(() => {
      expect(screen.getAllByLabelText('恢复默认值').length).toBeGreaterThan(0)
    })
  })

  it('should clear input when reset button is clicked', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: { '1': mockRpcUrl }, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement
    expect(rpcInput).toHaveValue(mockRpcUrl)

    // Click reset button
    const resetButtons = screen.getAllByLabelText('恢复默认值')
    fireEvent.click(resetButtons[0])

    await waitFor(() => {
      expect(rpcInput).toHaveValue('')
    })
  })

  it('should save settings and reload page on submit', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
      },
    })

    // Fill in values
    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement
    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址') as HTMLInputElement
    const tenderlyTokenInput = screen.getByLabelText('Tenderly 访问令牌') as HTMLInputElement

    fireEvent.change(rpcInput, { target: { value: mockRpcUrl } })
    fireEvent.change(tenderlyUrlInput, { target: { value: mockTenderlyUrl } })
    fireEvent.change(tenderlyTokenInput, { target: { value: mockTenderlyToken } })

    // Submit form
    const saveButton = screen.getByText('保存')
    fireEvent.click(saveButton)

    await waitFor(() => {
      // Check Redux state was updated
      const state = store.getState()
      expect(state.settings.env.rpc['1']).toBe(mockRpcUrl)
      expect(state.settings.env.tenderly.url).toBe(mockTenderlyUrl)
      expect(state.settings.env.tenderly.accessToken).toBe(mockTenderlyToken)

      expect(reloadPage).toHaveBeenCalled()
    })
  })

  it('should track analytics event on save', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const saveButton = screen.getByText('保存')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(analytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'settings',
          action: 'env_variables_save',
        }),
      )
    })
  })

  it('explains both simulation paths in a visible tile instead of a heading tooltip', () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const tile = screen.getByTestId('tenderly-info')
    expect(tile).toHaveTextContent('8379 包含交易模拟功能。您也可以连接自己的 Tenderly 项目。')

    const guideLink = screen.getByRole('link', { name: /查看配置指南/ })
    expect(guideLink).toHaveAttribute('href', TENDERLY_SETUP_GUIDE_URL)
    expect(guideLink).toHaveAttribute('target', '_blank')

    expect(screen.getByRole('link', { name: '查看套餐' })).toHaveAttribute('href', '/welcome/spaces')
    expect(screen.queryByText('阅读更多')).not.toBeInTheDocument()
  })

  it('hides the plans link for 8379 users', () => {
    mockUseSafeProAccess.mockReturnValue({ hasProFeatures: true, isLoading: false, spaceId: 'space-1' })
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    expect(screen.getByRole('link', { name: /查看配置指南/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '查看套餐' })).not.toBeInTheDocument()
  })

  it('shows the Simulation API endpoint format as placeholder and helper text', () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址')
    expect(tenderlyUrlInput).toHaveAttribute('placeholder', TENDERLY_SIMULATE_URL_PLACEHOLDER)
    expect(tenderlyUrlInput).toHaveAccessibleDescription('从 Tenderly 项目复制以 /simulate 结尾的模拟 API 网址。')
  })

  it('rejects a Tenderly dashboard URL and does not save', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
      },
    })

    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址')
    fireEvent.change(tenderlyUrlInput, { target: { value: 'https://dashboard.tenderly.co/my-org/my-project' } })

    expect(await screen.findByText('这不是模拟 API 网址，请从 Tenderly 项目中复制。')).toBeInTheDocument()
    expect(tenderlyUrlInput).toHaveAttribute('aria-invalid', 'true')

    fireEvent.click(screen.getByText('保存'))

    await waitFor(() => {
      expect(analytics.trackEvent).not.toHaveBeenCalled()
    })
    expect(store.getState().settings.env.tenderly.url).toBe('')
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('rejects a URL persisted before validation existed and does not save', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: {
          rpc: {},
          tenderly: { url: 'https://dashboard.tenderly.co/my-org/my-project', accessToken: mockTenderlyToken },
        },
      },
    })

    fireEvent.click(screen.getByText('保存'))

    expect(await screen.findByText('这不是模拟 API 网址，请从 Tenderly 项目中复制。')).toBeInTheDocument()
    expect(analytics.trackEvent).not.toHaveBeenCalled()
    expect(store.getState().settings.env.tenderly.url).toBe('https://dashboard.tenderly.co/my-org/my-project')
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('saves a valid Simulation API URL with its access token', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
      },
    })

    fireEvent.change(screen.getByLabelText('Tenderly API 网址'), { target: { value: mockTenderlyUrl } })
    fireEvent.change(screen.getByLabelText('Tenderly 访问令牌'), { target: { value: mockTenderlyToken } })
    fireEvent.click(screen.getByText('保存'))

    await waitFor(() => {
      expect(store.getState().settings.env.tenderly).toEqual({
        url: mockTenderlyUrl,
        accessToken: mockTenderlyToken,
      })
    })
    expect(reloadPage).toHaveBeenCalled()
  })

  it('stores a Simulation API URL without its trailing slash', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
      },
    })

    fireEvent.change(screen.getByLabelText('Tenderly API 网址'), { target: { value: `${mockTenderlyUrl}/` } })
    fireEvent.change(screen.getByLabelText('Tenderly 访问令牌'), { target: { value: mockTenderlyToken } })
    fireEvent.click(screen.getByText('保存'))

    await waitFor(() => {
      expect(store.getState().settings.env.tenderly.url).toBe(mockTenderlyUrl)
    })
  })

  it('clears the URL error when the field is reset', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址')
    fireEvent.change(tenderlyUrlInput, { target: { value: 'https://dashboard.tenderly.co/my-org/my-project' } })
    await screen.findByText('这不是模拟 API 网址，请从 Tenderly 项目中复制。')

    const urlGroup = tenderlyUrlInput.closest('[data-slot="input-group"]') as HTMLElement
    fireEvent.click(within(urlGroup).getByRole('button', { name: '恢复默认值' }))

    await waitFor(() => {
      expect(screen.queryByText('这不是模拟 API 网址，请从 Tenderly 项目中复制。')).not.toBeInTheDocument()
    })
    expect(tenderlyUrlInput).toHaveValue('')
    expect(tenderlyUrlInput).not.toHaveAttribute('aria-invalid')
  })

  it('tells the user to append /simulate when the project API URL was pasted as copied', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    fireEvent.change(screen.getByLabelText('Tenderly API 网址'), {
      target: { value: 'https://api.tenderly.co/api/v1/account/my-org/project/my-project/' },
    })

    expect(await screen.findByText('请在网址末尾添加 /simulate。')).toBeInTheDocument()
  })

  it('rejects a Simulation API URL without an access token and does not save', async () => {
    const { store } = renderWithStore(<EnvironmentVariables />, {
      settings: {
        ...settingsInitialState,
        env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
      },
    })

    fireEvent.change(screen.getByLabelText('Tenderly API 网址'), { target: { value: mockTenderlyUrl } })
    fireEvent.click(screen.getByText('保存'))

    expect(await screen.findByText('添加 Tenderly 项目的访问令牌。')).toBeInTheDocument()
    expect(screen.getByLabelText('Tenderly 访问令牌')).toHaveAttribute('aria-invalid', 'true')
    expect(analytics.trackEvent).not.toHaveBeenCalled()
    expect(store.getState().settings.env.tenderly.url).toBe('')
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('clears the access token error when the URL is reset', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: { rpc: {}, tenderly: { url: '', accessToken: '' } },
        },
      },
    })

    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址')
    fireEvent.change(tenderlyUrlInput, { target: { value: mockTenderlyUrl } })
    fireEvent.click(screen.getByText('保存'))
    await screen.findByText('添加 Tenderly 项目的访问令牌。')

    const urlGroup = tenderlyUrlInput.closest('[data-slot="input-group"]') as HTMLElement
    fireEvent.click(within(urlGroup).getByRole('button', { name: '恢复默认值' }))

    await waitFor(() => {
      expect(screen.queryByText('添加 Tenderly 项目的访问令牌。')).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText('Tenderly 访问令牌')).not.toHaveAttribute('aria-invalid')
  })

  it('should allow clearing all inputs', async () => {
    render(<EnvironmentVariables />, {
      initialReduxState: {
        settings: {
          ...settingsInitialState,
          env: {
            rpc: { '1': mockRpcUrl },
            tenderly: { url: mockTenderlyUrl, accessToken: mockTenderlyToken },
          },
        },
      },
    })

    const rpcInput = screen.getByPlaceholderText(mockChain.rpcUri.value) as HTMLInputElement
    const tenderlyUrlInput = screen.getByLabelText('Tenderly API 网址') as HTMLInputElement
    const tenderlyTokenInput = screen.getByLabelText('Tenderly 访问令牌') as HTMLInputElement

    // All inputs should have values
    expect(rpcInput).toHaveValue(mockRpcUrl)
    expect(tenderlyUrlInput).toHaveValue(mockTenderlyUrl)
    expect(tenderlyTokenInput).toHaveValue(mockTenderlyToken)

    // Click all reset buttons
    const resetButtons = screen.getAllByLabelText('恢复默认值')
    resetButtons.forEach((button) => fireEvent.click(button))

    await waitFor(() => {
      expect(rpcInput).toHaveValue('')
      expect(tenderlyUrlInput).toHaveValue('')
      expect(tenderlyTokenInput).toHaveValue('')
    })
  })
})
