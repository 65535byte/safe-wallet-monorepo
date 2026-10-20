import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { PopoverContent } from '@safe-global/views/components/ui/popover'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { LogOut } from 'lucide-react'
import InitialsAvatar from '@/components/common/InitialsAvatar'
import Identicon from '@/components/common/Identicon'
import CopyAddressIconButton from '@/components/common/CopyAddressIconButton'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import css from './styles.module.css'

export interface ProfilePopoverContentProps {
  avatarName: string
  displayName: string
  shortDisplayName?: string
  role?: string
  isMember?: boolean
  signerAddress?: string
  connectedWallet?: string
  onSignOut: () => void
}

export const ProfilePopoverContent = ({
  avatarName,
  displayName,
  shortDisplayName,
  role,
  isMember = false,
  signerAddress,
  connectedWallet,
  onSignOut,
}: ProfilePopoverContentProps): ReactElement => (
  <PopoverContent
    side="bottom"
    align="end"
    sideOffset={12}
    showBackdrop
    className={css.profilePopover}
    data-testid="sidebar-profile-popover"
  >
    <div className={css.profileSection}>
      <span className={css.profileSectionLabel}>{translateMessage('ui.yourAccount_33020868')}</span>

      <div className={css.profileIdentity}>
        {signerAddress ? (
          <Identicon address={signerAddress} size={32} />
        ) : (
          <InitialsAvatar name={avatarName} size="medium" rounded />
        )}
        {displayName && (
          <Tooltip>
            <TooltipTrigger render={<span className={css.profileName} />}>
              {shortDisplayName || displayName}
            </TooltipTrigger>
            <TooltipContent side="top">{signerAddress || displayName}</TooltipContent>
          </Tooltip>
        )}
        {signerAddress && <CopyAddressIconButton address={signerAddress} />}
      </div>

      <span className={css.profileSectionCaption}>
        {isMember
          ? translateMessage('ui.yourMembership_69b9a866')
          : translateMessage('ui.managesYourSubscription_c6bcd964')}
      </span>
      {role && <span className={css.profileRole}>{role}</span>}
    </div>

    {connectedWallet && (
      <>
        <Separator className={css.profileDivider} />

        <div className={css.profileSection} data-testid="sidebar-profile-wallet-hint">
          <span className={css.profileSectionLabel}>{translateMessage('ui.connectedWallet_eba39177')}</span>

          <div className={css.profileIdentity}>
            <Identicon address={connectedWallet} size={32} />
            <Tooltip>
              <TooltipTrigger render={<span className={css.profileName} />}>
                {shortenAddress(connectedWallet)}
              </TooltipTrigger>
              <TooltipContent side="top">{connectedWallet}</TooltipContent>
            </Tooltip>
            <CopyAddressIconButton address={connectedWallet} />
          </div>

          <span className={css.profileSectionCaption}>
            {translateMessage('ui.signsAndExecutesTransactions_e137820b')}
          </span>
        </div>
      </>
    )}

    <Separator className={css.profileDivider} />

    <button
      type="button"
      className={css.profileSignOut}
      onClick={onSignOut}
      data-testid="sidebar-profile-sign-out"
      aria-label={translateMessage('ui.signOut_7392794f')}
    >
      <LogOut className="size-4" strokeWidth={2.5} aria-hidden="true" />
      <span>{translateMessage('ui.signOut_7392794f')}</span>
    </button>
  </PopoverContent>
)
