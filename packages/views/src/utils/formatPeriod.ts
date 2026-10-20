import { getCountdown } from '@safe-global/utils/utils/date'
import { translateMessage } from '@safe-global/views/i18n'

export const getPeriod = (seconds: number): string | undefined => {
  const { days, hours, minutes } = getCountdown(seconds)

  if (days > 0) return translateMessage('time.days', { count: days })
  if (hours > 0) return translateMessage('time.hours', { count: hours })
  if (minutes > 0) return translateMessage('time.minutes', { count: minutes })
}

export const getDetailedPeriod = (seconds: number): string => {
  const { days, hours, minutes } = getCountdown(seconds)
  const units: Array<[number, string]> = [
    [days, 'time.days'],
    [hours, 'time.hours'],
    [minutes, 'time.minutes'],
    [seconds % 60, 'time.seconds'],
  ]

  return units
    .filter(([amount]) => amount > 0)
    .map(([amount, key]) => translateMessage(key, { count: amount }))
    .join(' ')
}
