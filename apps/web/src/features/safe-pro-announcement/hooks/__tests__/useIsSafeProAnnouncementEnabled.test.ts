import { renderHook } from '@/tests/test-utils'
import { useHasFeature } from '@/hooks/useChains'
import { useIsSafeProAnnouncementEnabled } from '../useIsSafeProAnnouncementEnabled'

jest.mock('@/hooks/useChains')

const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>

describe('workspace migration announcement visibility', () => {
  it.each([true, false, undefined])('stays hidden when the remote feature flag is %s', (flag) => {
    mockUseHasFeature.mockReturnValue(flag)
    const { result } = renderHook(() => useIsSafeProAnnouncementEnabled())
    expect(result.current).toBe(false)
  })
})
