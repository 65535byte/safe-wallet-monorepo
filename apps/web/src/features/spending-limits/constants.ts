import { translateMessage } from '@/i18n'
import chains from '@safe-global/utils/config/chains'

export type ResetTimeOption = { label: string; value: string }

/** Production reset periods, in minutes. `'0'` is a one-time allowance that never refills. */
const RESET_TIME_OPTIONS: ResetTimeOption[] = [
  { label: translateMessage('ui.oneTime_1de683cb'), value: '0' },
  { label: translateMessage('ui.day_a7439ac7'), value: '1440' },
  { label: translateMessage('ui.week_0c07ea1d'), value: '10080' },
  { label: translateMessage('ui.month_7ec86edc'), value: '43200' },
]

/**
 * Short periods that make reset behaviour observable within one QA session. Offered on test chains in
 * addition to the production periods; the divergence is written up in docs/README.md → Reset Periods.
 */
const TEST_RESET_TIME_OPTIONS: ResetTimeOption[] = [
  { label: translateMessage('ui.minutes_05a438cb'), value: '5' },
  { label: translateMessage('ui.minutes_0c775585'), value: '30' },
  { label: translateMessage('ui.hour_659c1c2d'), value: '60' },
]

const TEST_CHAIN_IDS: ReadonlySet<string> = new Set([chains.gor, chains.sep])

const byMinutes = (a: ResetTimeOption, b: ResetTimeOption): number => Number(a.value) - Number(b.value)

export const getResetTimeOptions = (chainId = ''): ResetTimeOption[] =>
  TEST_CHAIN_IDS.has(chainId) ? [...RESET_TIME_OPTIONS, ...TEST_RESET_TIME_OPTIONS].sort(byMinutes) : RESET_TIME_OPTIONS
