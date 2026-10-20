import { renderHook } from '@/tests/test-utils'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'

jest.mock('@/hooks/useChains')
let mockSafeProEnabled = true
jest.mock('@/config/pro', () => ({
  get SAFE_PRO_ENABLED() {
    return mockSafeProEnabled
  },
}))
beforeEach(() => {
  mockSafeProEnabled = true
})

const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>

describe('useIsSafeProEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => jest.restoreAllMocks())

  it('disables Pro even when the backend enables it', () => {
    mockSafeProEnabled = false
    mockUseHasFeature.mockReturnValue(true)
    const { result } = renderHook(() => useIsSafeProEnabled())
    expect(result.current).toBe(false)
  })

  it('reads the SAFE_PRO flag', () => {
    mockUseHasFeature.mockReturnValue(true)

    renderHook(() => useIsSafeProEnabled())

    expect(mockUseHasFeature).toHaveBeenCalledWith(FEATURES.SAFE_PRO)
  })

  it.each([
    { flag: true, expected: true },
    { flag: false, expected: false },
    { flag: undefined, expected: false },
  ])('returns $expected when the flag is $flag', ({ flag, expected }) => {
    mockUseHasFeature.mockReturnValue(flag)

    const { result } = renderHook(() => useIsSafeProEnabled())

    expect(result.current).toBe(expected)
  })
})
