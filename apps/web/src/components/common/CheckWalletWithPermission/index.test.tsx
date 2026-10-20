import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { render } from '@/tests/test-utils'
import CheckWalletWithPermission from './index'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { chainBuilder } from '@/tests/builders/chains'
import { faker } from '@faker-js/faker'
import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import useSafeInfo from '@/hooks/useSafeInfo'
import type Safe from '@safe-global/protocol-kit'
import * as useHasPermission from '@/permissions/hooks/useHasPermission'
import { Permission } from '@/permissions/config'

const mockWalletAddress = faker.finance.ethereumAddress()
// mock useWallet
jest.mock('@/hooks/wallets/useWallet', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    address: mockWalletAddress,
  })),
}))

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  useCurrentChain: jest.fn(() => chainBuilder().build()),
}))

// mock useIsWrongChain
jest.mock('@/hooks/useIsWrongChain', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}))

jest.mock('@/hooks/useSafeInfo', () => ({
  __esModule: true,
  default: jest.fn(() => {
    const safeAddress = faker.finance.ethereumAddress()
    return {
      safeAddress,
      safe: extendedSafeInfoBuilder()
        .with({ address: { value: safeAddress } })
        .with({ deployed: true })
        .build(),
    }
  }),
}))

jest.mock('@/hooks/coreSDK/safeCoreSDK')
const mockUseSafeSdk = useSafeSDK as jest.MockedFunction<typeof useSafeSDK>

const renderButton = () =>
  render(
    <CheckWalletWithPermission permission={Permission.SignTransaction} checkNetwork={false}>
      {(isOk) => <button disabled={!isOk}>继续</button>}
    </CheckWalletWithPermission>,
  )

describe('CheckWalletWithPermission', () => {
  const useHasPermissionSpy = jest.spyOn(useHasPermission, 'useHasPermission')

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSafeSdk.mockReturnValue({} as unknown as Safe)
    useHasPermissionSpy.mockReturnValue(true)
  })

  it('renders correctly when the wallet is connected to the right chain and is an owner', () => {
    const { getByText } = renderButton()

    // Check that the button is enabled
    expect(getByText('继续')).not.toBeDisabled()
  })

  it('should disable the button when the wallet is not connected', () => {
    ;(useWallet as jest.MockedFunction<typeof useWallet>).mockReturnValueOnce(null)

    const { getByText, getByLabelText } = renderButton()

    // Check that the button is disabled
    expect(getByText('继续')).toBeDisabled()

    // Check the tooltip text
    expect(getByLabelText('请连接钱包')).toBeInTheDocument()
  })

  it('should disable the button when the current user does not have the specified permission', () => {
    useHasPermissionSpy.mockReturnValue(false)

    const { getByText, getByLabelText } = renderButton()

    expect(getByText('继续')).toBeDisabled()
    expect(getByLabelText('已连接钱包不是此 8379 账户的签名人')).toBeInTheDocument()

    expect(useHasPermissionSpy).toHaveBeenCalledTimes(1)
    expect(useHasPermissionSpy).toHaveBeenCalledWith(Permission.SignTransaction)
  })

  it('should be disabled when connected to the wrong network', () => {
    ;(useIsWrongChain as jest.MockedFunction<typeof useIsWrongChain>).mockReturnValue(true)

    const renderButtonWithNetworkCheck = () =>
      render(
        <CheckWalletWithPermission permission={Permission.SignTransaction} checkNetwork={true}>
          {(isOk) => <button disabled={!isOk}>继续</button>}
        </CheckWalletWithPermission>,
      )

    const { getByText } = renderButtonWithNetworkCheck()

    expect(getByText('继续')).toBeDisabled()
  })

  it('should disable the button for counterfactual Safes', () => {
    const safeAddress = faker.finance.ethereumAddress()
    const mockSafeInfo = {
      safeAddress,
      safe: extendedSafeInfoBuilder()
        .with({ address: { value: safeAddress } })
        .with({ deployed: false })
        .build(),
    }

    ;(useSafeInfo as jest.MockedFunction<typeof useSafeInfo>).mockReturnValueOnce(
      mockSafeInfo as unknown as ReturnType<typeof useSafeInfo>,
    )

    const { getByText, getByLabelText } = renderButton()

    expect(getByText('继续')).toBeDisabled()
    expect(getByLabelText('交易前需要先激活 8379')).toBeInTheDocument()
  })

  it('should enable the button for counterfactual Safes if allowed', () => {
    const safeAddress = faker.finance.ethereumAddress()
    const mockSafeInfo = {
      safeAddress,
      safe: extendedSafeInfoBuilder()
        .with({ address: { value: safeAddress } })
        .with({ deployed: false })
        .build(),
    }

    ;(useSafeInfo as jest.MockedFunction<typeof useSafeInfo>).mockReturnValueOnce(
      mockSafeInfo as unknown as ReturnType<typeof useSafeInfo>,
    )

    const { getByText } = render(
      <CheckWalletWithPermission permission={Permission.SignTransaction} allowUndeployedSafe>
        {(isOk) => <button disabled={!isOk}>继续</button>}
      </CheckWalletWithPermission>,
    )

    expect(getByText('继续')).toBeEnabled()
  })

  it('should disable the button if SDK is not initialized and safe is loaded', () => {
    mockUseSafeSdk.mockReturnValue(undefined)

    const mockSafeInfo = {
      safeLoaded: true,
      safe: extendedSafeInfoBuilder(),
    }

    ;(useSafeInfo as jest.MockedFunction<typeof useSafeInfo>).mockReturnValueOnce(
      mockSafeInfo as unknown as ReturnType<typeof useSafeInfo>,
    )

    const { getByText, getByLabelText } = render(
      <CheckWalletWithPermission permission={Permission.SignTransaction}>
        {(isOk) => <button disabled={!isOk}>继续</button>}
      </CheckWalletWithPermission>,
    )

    expect(getByText('继续')).toBeDisabled()
    expect(getByLabelText('仍在加载，请稍后重试。'))
  })

  it('should not disable the button if SDK is not initialized and safe is not loaded', () => {
    mockUseSafeSdk.mockReturnValue(undefined)

    const safeAddress = faker.finance.ethereumAddress()
    const mockSafeInfo = {
      safeAddress,
      safe: extendedSafeInfoBuilder()
        .with({ address: { value: safeAddress } })
        .with({ deployed: true })
        .build(),
      safeLoaded: false,
    }

    ;(useSafeInfo as jest.MockedFunction<typeof useSafeInfo>).mockReturnValueOnce(
      mockSafeInfo as unknown as ReturnType<typeof useSafeInfo>,
    )

    const { queryByText } = render(
      <CheckWalletWithPermission permission={Permission.SignTransaction}>
        {(isOk) => <button disabled={!isOk}>继续</button>}
      </CheckWalletWithPermission>,
    )

    expect(queryByText('继续')).not.toBeDisabled()
  })
})
