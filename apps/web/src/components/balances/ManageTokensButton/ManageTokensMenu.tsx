import { translateMessage } from '@/i18n'
import { type ReactElement, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@safe-global/views/components/ui/dropdown-menu'
import { Switch } from '@safe-global/views/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setTokenList, setHideDust, TOKEN_LISTS } from '@/store/settingsSlice'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@safe-global/utils/utils/chains'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { DUST_THRESHOLD } from '@/config/constants'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import Track from '@/components/common/Track'
import { ASSETS_EVENTS } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import { cn } from '@safe-global/views/utils/cn'

interface ManageTokensMenuProps {
  onClose: () => void
  onHideTokens?: () => void
  /** Takes precedence over useHasFeature(FEATURES.DEFAULT_TOKENLIST) when provided */
  _hasDefaultTokenlist?: boolean
}

const MenuInfoTooltip = ({ title, 'data-testid': dataTestId }: { title: ReactNode; 'data-testid'?: string }) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0"
          onClick={(event) => event.stopPropagation()}
          data-testid={dataTestId}
        >
          <Info className="size-3.5" />
        </button>
      }
    />
    <TooltipContent side="top">{title}</TooltipContent>
  </Tooltip>
)

const MenuToggleRow = ({
  label,
  infoTooltip,
  checked,
  onCheckedChange,
  'data-testid': dataTestId,
  switchTestId,
  trackProps,
}: {
  label: string
  infoTooltip?: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  'data-testid'?: string
  switchTestId?: string
  trackProps?: Omit<React.ComponentProps<typeof Track>, 'children'>
}) => {
  const switchControl = (
    <Switch
      size="sm"
      checked={checked}
      onClick={(event) => event.stopPropagation()}
      onCheckedChange={onCheckedChange}
      data-testid={switchTestId}
    />
  )

  return (
    <div
      role="menuitem"
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onCheckedChange(!checked)}
      data-testid={dataTestId}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        {infoTooltip}
      </div>
      {trackProps ? <Track {...trackProps}>{switchControl}</Track> : switchControl}
    </div>
  )
}

const ManageTokensMenu = ({ onClose, onHideTokens, _hasDefaultTokenlist }: ManageTokensMenuProps): ReactElement => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const hasDefaultTokenlistFromHook = useHasFeature(FEATURES.DEFAULT_TOKENLIST)
  const hiddenTokens = useHiddenTokens()
  const { safe } = useSafeInfo()

  const hasDefaultTokenlist = _hasDefaultTokenlist ?? hasDefaultTokenlistFromHook

  const showAllTokens = settings.tokenList === TOKEN_LISTS.ALL || settings.tokenList === undefined
  const hideDust = settings.hideDust ?? true
  const hiddenTokensCount = hiddenTokens.length

  const handleToggleShowAllTokens = (checked: boolean) => {
    dispatch(setTokenList(checked ? TOKEN_LISTS.ALL : TOKEN_LISTS.TRUSTED))
  }

  const handleToggleHideDust = (checked: boolean) => {
    dispatch(setHideDust(checked))
  }

  const handleHideTokens = () => {
    onClose()
    onHideTokens?.()
  }

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className={cn(
        'w-[min(100vw-2rem,280px)] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-popover p-1.5 shadow-md ring-0',
      )}
      data-testid="manage-tokens-menu"
    >
      {hasDefaultTokenlist && (
        <MenuToggleRow
          label={translateMessage('ui.showAllTokens_5f66e553')}
          infoTooltip={
            <MenuInfoTooltip
              data-testid="show-all-tokens-info-tooltip"
              title={
                <Typography variant="paragraph-small">
                  {translateMessage('ui.learnMoreAbout_7e5d19ab')}
                  <ExternalLink href={HelpCenterArticle.SPAM_TOKENS}>
                    {translateMessage('ui.defaultTokens_684edc87')}
                  </ExternalLink>
                </Typography>
              }
            />
          }
          checked={showAllTokens}
          onCheckedChange={handleToggleShowAllTokens}
          data-testid="show-all-tokens-menu-item"
          switchTestId="show-all-tokens-switch"
          trackProps={{
            ...(showAllTokens ? ASSETS_EVENTS.SHOW_ALL_TOKENS : ASSETS_EVENTS.SHOW_DEFAULT_TOKENS),
          }}
        />
      )}

      {safe.deployed && (
        <MenuToggleRow
          label={translateMessage('ui.hideSmallBalances_3015e18a')}
          infoTooltip={
            <MenuInfoTooltip
              data-testid="hide-small-balances-info-tooltip"
              title={
                <Typography variant="paragraph-small">
                  {translateMessage('ui.hideTokensWithAValueLess_24565c2c')}
                  {DUST_THRESHOLD}
                </Typography>
              }
            />
          }
          checked={hideDust}
          onCheckedChange={handleToggleHideDust}
          data-testid="hide-small-balances-menu-item"
          switchTestId="hide-small-balances-switch"
        />
      )}

      <DropdownMenuSeparator data-testid="manage-tokens-menu-divider" />

      <DropdownMenuItem
        onClick={handleHideTokens}
        className="cursor-pointer rounded-lg font-medium focus:bg-muted"
        data-testid="hide-tokens-menu-item"
      >
        <Track {...ASSETS_EVENTS.SHOW_HIDDEN_ASSETS}>
          <span>
            {translateMessage('ui.hideTokens_0f041e72')}
            {hiddenTokensCount > 0 ? ` (${hiddenTokensCount})` : ''}
          </span>
        </Track>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export default ManageTokensMenu
