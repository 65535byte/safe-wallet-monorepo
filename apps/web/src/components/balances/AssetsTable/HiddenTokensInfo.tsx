import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useHiddenTokenCounts } from '@/hooks/useHiddenTokenCounts'

interface HiddenTokensInfoProps {
  onOpenManageTokens?: () => void
}

export const HiddenTokensInfo = ({ onOpenManageTokens }: HiddenTokensInfoProps) => {
  const { hiddenByTokenList, hiddenByDustFilter } = useHiddenTokenCounts()

  const parts: string[] = []

  if (hiddenByDustFilter > 0) {
    parts.push(translateMessage('ui.smallBalance_d67f4bb2', { p0: hiddenByDustFilter }))
  }

  if (hiddenByTokenList > 0) {
    parts.push(translateMessage('ui.tokenHidden_728d88c2', { p0: hiddenByTokenList }))
  }

  if (parts.length === 0) {
    return null
  }

  return (
    <Typography variant="paragraph-mini" className="text-[14px] text-[var(--color-text-secondary)]">
      {parts.join(' and ')}.{' '}
      <Typography
        variant="paragraph-mini"
        onClick={onOpenManageTokens}
        className="cursor-pointer text-[14px] text-[var(--color-primary-light)] underline"
      >
        {translateMessage('ui.manageTokens_099ad4f7')}
      </Typography>
    </Typography>
  )
}
