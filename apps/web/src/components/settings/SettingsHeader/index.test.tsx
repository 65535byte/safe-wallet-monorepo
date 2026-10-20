import { SettingsHeader } from '@/components/settings/SettingsHeader/index'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'
import * as safeAddress from '@/hooks/useSafeAddress'

import { render } from '@/tests/test-utils'
import { faker } from '@faker-js/faker'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { FEATURES } from '@safe-global/utils/utils/chains'

describe('SettingsHeader', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('A safe is open', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.spyOn(safeAddress, 'default').mockReturnValue(faker.finance.ethereumAddress())
    })

    it('displays safe specific preferences if on a safe', () => {
      const result = render(<SettingsHeader safeAddress="0x1234" chain={CONFIG_SERVICE_CHAINS[0]} />)

      expect(result.getByText('账户配置')).toBeInTheDocument()
    })

    it('displays Notifications if feature is enabled', () => {
      const result = render(
        <SettingsHeader
          safeAddress="0x1234"
          chain={{
            ...CONFIG_SERVICE_CHAINS[0],
            features: [FEATURES.PUSH_NOTIFICATIONS] as unknown as Chain['features'],
          }}
        />,
      )

      expect(result.getByText('通知')).toBeInTheDocument()
    })
  })

  describe('No safe is open', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.spyOn(safeAddress, 'default').mockReturnValue('')
    })

    it('displays general preferences if no safe is open', () => {
      const result = render(<SettingsHeader safeAddress="" chain={CONFIG_SERVICE_CHAINS[0]} />)

      expect(result.getByText('Cookie')).toBeInTheDocument()
      expect(result.getByText('外观')).toBeInTheDocument()
      expect(result.getByText('数据')).toBeInTheDocument()
      expect(result.getByText('环境变量')).toBeInTheDocument()
    })

    it('displays Notifications if feature is enabled', () => {
      const result = render(
        <SettingsHeader
          safeAddress=""
          chain={{
            ...CONFIG_SERVICE_CHAINS[0],
            features: [FEATURES.PUSH_NOTIFICATIONS] as unknown as Chain['features'],
          }}
        />,
      )

      expect(result.getByText('通知')).toBeInTheDocument()
    })
  })
})
