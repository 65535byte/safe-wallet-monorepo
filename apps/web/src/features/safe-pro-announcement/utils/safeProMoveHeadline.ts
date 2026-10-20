import { translateMessage } from '@/i18n'
export const safeProMoveHeadline = (isLive: boolean): string =>
  isLive ? translateMessage('ui.text_de78136d') : translateMessage('ui.text_17d06e94')
