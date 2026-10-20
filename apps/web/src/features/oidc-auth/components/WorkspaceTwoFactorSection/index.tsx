import { translateMessage } from '@/i18n'
import { Info } from 'lucide-react'
import NextLink from 'next/link'
import type { MemberDto } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { AppRoutes } from '@/config/routes'
import { Badge, BadgeDot } from '@safe-global/views/components/ui/badge'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useHasFeature } from '@/hooks/useChains'
import { getTwoFactorCoverage } from '../../utils/twoFactor'

/**
 * Two-factor authentication card on the workspace settings page. States the
 * always-on 2FA policy and how much of the workspace it covers, and points at
 * the Team page — to manage the members it doesn't cover, or just to see them
 * when the viewer isn't an admin.
 *
 * Gated behind the SWITCH_AUTHENTICATOR feature, like the account-level 2FA cards.
 */
const WorkspaceTwoFactorSection = ({
  members,
  spaceId,
  isAdmin,
}: {
  members: MemberDto[]
  spaceId?: string
  isAdmin?: boolean
}) => {
  const isSwitchAuthenticatorEnabled = useHasFeature(FEATURES.SWITCH_AUTHENTICATOR)

  if (!isSwitchAuthenticatorEnabled) {
    return null
  }

  const { enabled, total, walletOnly } = getTwoFactorCoverage(members)

  return (
    <section className="bg-card rounded-2xl p-6 mb-3" data-testid="settings-workspace-2fa">
      <div className="flex items-center gap-3 mb-2">
        <Typography variant="paragraph-bold" className="block tracking-tight">
          {translateMessage('ui.twoFactorAuthentication_9f727397')}
        </Typography>
        <Badge variant="success" size="status" shape="status">
          <BadgeDot />
          {translateMessage('ui.requiredForEveryone_b3d47501')}
        </Badge>
      </div>

      <Typography variant="paragraph-small" color="muted" className="block max-w-[560px]">
        {translateMessage('ui.everyoneWhoSignsInWithEmail_123c4a70')}
      </Typography>

      <div className="border-border mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Typography variant="paragraph-small-bold" data-testid="workspace-2fa-count">
            {enabled}/{total} {translateMessage('ui.usersHaveFAEnabled_51a95862')}
          </Typography>

          {walletOnly > 0 && (
            <Tooltip>
              <TooltipTrigger
                aria-label={translateMessage('ui.whyCanTEnableFA_89804b32', {
                  p0: walletOnly,
                  p1:
                    walletOnly === 1 ? translateMessage('ui.signer_c3e9cabd') : translateMessage('ui.signers_a7dacaaf'),
                })}
                data-testid="workspace-2fa-coverage-info"
                className="text-muted-foreground flex items-center"
              >
                <Info className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {walletOnly}{' '}
                {walletOnly === 1 ? translateMessage('ui.signer_c3e9cabd') : translateMessage('ui.signers_a7dacaaf')}{' '}
                {translateMessage('ui.canTEnableFABecauseWallet_bc780ec9')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          data-testid="workspace-2fa-manage-members"
          nativeButton={false}
          render={<NextLink href={{ pathname: AppRoutes.spaces.members, query: spaceId ? { spaceId } : undefined }} />}
        >
          {isAdmin ? translateMessage('ui.manageMembers_46f33e35') : translateMessage('ui.seeMembers_33edc02c')}
        </Button>
      </div>
    </section>
  )
}

export default WorkspaceTwoFactorSection
