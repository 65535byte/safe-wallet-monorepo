import { translateMessage } from '@/i18n'
import chains from '@safe-global/utils/config/chains'
import { useCurrentChain } from '@/hooks/useChains'

export const DAY_IN_SECONDS = 60 * 60 * 24

type Periods = Array<{ label: string; value: string | number }>

const ExpirationPeriods: Periods = [
  {
    label: translateMessage('ui.days_0a14084f'),
    value: `${DAY_IN_SECONDS * 2}`,
  },
  {
    label: translateMessage('ui.days_1145812e'),
    value: `${DAY_IN_SECONDS * 7}`,
  },
  {
    label: translateMessage('ui.days_2a762434'),
    value: `${DAY_IN_SECONDS * 14}`,
  },
  {
    label: translateMessage('ui.days_c951e63a'),
    value: `${DAY_IN_SECONDS * 28}`,
  },
  {
    label: translateMessage('ui.days_eb47ed14'),
    value: `${DAY_IN_SECONDS * 56}`,
  },
]

const TestPeriods: Periods = [
  {
    label: translateMessage('ui.minute_d2a768f3'),
    value: '60',
  },
  {
    label: translateMessage('ui.minutes_05a438cb'),
    value: `${60 * 5}`,
  },
  {
    label: translateMessage('ui.hour_659c1c2d'),
    value: `${60 * 60}`,
  },
]

const DefaultRecoveryDelayPeriods: Periods = [
  {
    label: translateMessage('ui.customPeriod_9fa06344'),
    value: '0',
  },
  ...ExpirationPeriods,
]

const DefaultRecoveryExpirationPeriods: Periods = [
  {
    label: translateMessage('ui.never_3de5fa57'),
    value: '0',
  },
  ...ExpirationPeriods,
]

const TestRecoveryDelayPeriods: Periods = [
  {
    label: translateMessage('ui.customPeriod_9fa06344'),
    value: '0',
  },
  ...TestPeriods,
  ...ExpirationPeriods,
]

const TestRecoveryExpirationPeriods: Periods = [
  {
    label: translateMessage('ui.never_3de5fa57'),
    value: '0',
  },
  ...TestPeriods,
  ...ExpirationPeriods,
]

export function useRecoveryPeriods(): { delay: Periods; expiration: Periods } {
  const chain = useCurrentChain()
  const isTestChain = chain && [chains.gor, chains.sep].includes(chain.chainId)

  // TODO: Remove constant before release

  if (isTestChain) {
    return {
      delay: TestRecoveryDelayPeriods,
      expiration: TestRecoveryExpirationPeriods,
    }
  }

  return {
    delay: DefaultRecoveryDelayPeriods,
    expiration: DefaultRecoveryExpirationPeriods,
  }
}
