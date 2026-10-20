import { translateMessage } from '@/i18n'
import { useLoadFeature } from '@/features/__core__'
import { MyAccountsFeature } from '@/features/myAccounts'
import { SafeProFeature, useIsSafeProAnnouncementEnabled } from '@/features/safe-pro-announcement'
import SpaceRow from './SpaceRow'
import SignInOptions from '../SignInOptions'
import Image from 'next/image'
import WorkspacesEmptyIllustration from '@/public/images/spaces/workspaces_empty.png'
import WorkspacesEmptyIllustrationDark from '@/public/images/spaces/workspaces_empty_dark.webp'
import { useAppSelector } from '@/store'
import { isAuthenticated, selectIsStoreHydrated } from '@/store/authSlice'
import { ArrowRight, Check, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Card } from '@safe-global/views/components/ui/card'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import { Link } from '@safe-global/views/components/ui/link'
import { Typography } from '@safe-global/views/components/ui/typography'
import { type GetSpaceResponse, useSpacesGetV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { useUsersGetWithWalletsV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/users'
import SpaceListInvite from '../InviteBanner'
import { useCallback, useState } from 'react'
import css from './styles.module.css'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@safe-global/views/utils/cn'
import { MemberStatus } from '@/features/spaces'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'
import { trackEvent } from '@/services/analytics'
import { WorkspaceCreateEntryPoint } from '@/services/analytics/mixpanel-events'
import SpaceInfoModal from '../SpaceInfoModal'
import { filterSpacesByStatus, getInvitedByName } from '@/features/spaces/utils'
import { AppRoutes } from '@/config/routes'
import { SAFE_PRO_USER_TERMS_URL } from '@/config/constants'
import { PRIVACY_URL, TERMS_URL } from '@safe-global/utils/config/constants'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'
import NextLink from 'next/link'
import { useSignInRedirect } from '@/components/welcome/WelcomeLogin/hooks/useSignInRedirect'
import AddIcon from '@/public/images/common/add.svg'
import { SPACES_LIMIT } from '@/features/spaces/constants'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import WelcomeContentCard from '@/components/common/WelcomeContentCard'
import { useUrlSpaceId } from '@/hooks/useUrlSpaceId'

const AddSpaceButton = ({
  onClick,
  disabled,
  size = 'lg',
  variant = 'default',
  label = translateMessage('ui.createWorkspace_34bf60be'),
  icon = 'add',
  link = true,
}: {
  onClick?: () => void
  disabled?: boolean
  size?: 'lg' | 'default'
  variant?: 'default' | 'outline'
  label?: string
  icon?: 'add' | 'arrow'
  /** Off when the click opens a dialog instead of navigating to the onboarding. */
  link?: boolean
}) => {
  const iconSize = size === 'lg' ? 'size-5' : 'size-4'

  const button = (
    <Button
      data-testid="create-space-button"
      variant={variant}
      size={size}
      accentIcon={icon === 'arrow' && variant === 'default'}
      className={cn(
        // eslint-disable-next-line no-restricted-syntax -- bespoke full-height create-workspace CTA sizing from dev's #8271 redesign
        size === 'lg' && 'h-full rounded-lg px-6 py-3 text-base',
        variant === 'outline' && 'hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-50 grayscale',
      )}
      render={disabled ? <span /> : link ? <NextLink href={AppRoutes.welcome.createSpace} /> : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {icon === 'add' && (
        <AddIcon className={cn(variant === 'default' ? 'fill-primary-foreground' : 'fill-foreground', iconSize)} />
      )}
      {label}
      {icon === 'arrow' && <ArrowRight className={iconSize} />}
    </Button>
  )

  if (!disabled) return button

  return (
    <Tooltip>
      <TooltipTrigger render={<div className="inline-flex" />}>{button}</TooltipTrigger>
      <TooltipContent>
        {translateMessage('ui.limitOf_6bb0cfcf')}
        {SPACES_LIMIT} {translateMessage('ui.workspacesReached_4ea37bd5')}
      </TooltipContent>
    </Tooltip>
  )
}

const termsLinkClassName = 'underline underline-offset-2'

const SignedOutState = ({ afterSignIn, redirectLoading }: { afterSignIn: () => void; redirectLoading: boolean }) => {
  const isDarkMode = useDarkMode()
  const isSafeProAnnouncementEnabled = useIsSafeProAnnouncementEnabled()
  // The Safe Pro terms only apply once Safe Pro is live.
  const isSafePro = useIsSafeProEnabled()
  const { SafeProBanner } = useLoadFeature(SafeProFeature)

  return (
    <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
      {/* The page keeps its Topbar + Accounts/Workspaces tabs, so the sign-in
          card renders inline rather than as a full-screen takeover. */}
      <div
        className={cn(
          'relative flex items-center justify-center pb-10',
          isSafeProAnnouncementEnabled ? 'pt-0' : 'pt-10',
        )}
      >
        <div className={cn('flex w-full flex-col items-center', isSafePro ? 'max-w-116' : 'max-w-110')}>
          {isSafeProAnnouncementEnabled && <SafeProBanner className="mb-4" />}

          <div className="relative w-full">
            <div className="relative w-full rounded-lg bg-card p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="mx-auto mb-6 flex h-10 items-center justify-center text-foreground">
                {/* The Pro brand stays once Safe Pro exists, banner or not. */}
                <img
                  src="/images/brand-logo.png"
                  alt={translateMessage('ui.safeLogo_9a51e835')}
                  className="size-10 rounded-lg object-contain"
                />
              </div>

              <Typography variant="h3" className={cn('text-center', isSafePro ? 'mb-4' : 'mb-6')}>
                {translateMessage('ui.signInToYourWorkspace_f96cee32')}
              </Typography>

              {isSafePro && (
                <p className="mb-6 text-center text-xs leading-[18px] text-muted-foreground">
                  {translateMessage('ui.byContinuingYouAcceptThe_dd11de9b')}{' '}
                  <Link
                    variant="muted"
                    href={SAFE_PRO_USER_TERMS_URL || undefined}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={termsLinkClassName}
                  >
                    {translateMessage('ui.userTerms_3b6585e5')}
                  </Link>{' '}
                  {translateMessage('ui.and_ee3cc19b')}{' '}
                  <Link
                    variant="muted"
                    href={PRIVACY_URL || undefined}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cn(termsLinkClassName, 'whitespace-nowrap')}
                  >
                    {translateMessage('ui.privacyPolicy_fa189aa0')}
                    <ExternalLinkIcon className="ml-0.5 inline size-4 align-text-bottom" />
                  </Link>
                </p>
              )}

              <SignInOptions afterSignIn={afterSignIn} redirectLoading={redirectLoading} />
            </div>
          </div>

          {!isSafePro && (
            <p className="mt-4 text-center text-xs leading-[18px] text-muted-foreground">
              {translateMessage('ui.byContinuingYouAgreeToThe_b84f6cac')}{' '}
              <Link
                variant="muted"
                href={TERMS_URL || undefined}
                target="_blank"
                rel="noreferrer noopener"
                className={termsLinkClassName}
              >
                {translateMessage('ui.terms_3c2528e1')}
              </Link>{' '}
              {translateMessage('ui.and_ee3cc19b')}{' '}
              <Link
                variant="muted"
                href={PRIVACY_URL || undefined}
                target="_blank"
                rel="noreferrer noopener"
                className={termsLinkClassName}
              >
                {translateMessage('ui.privacyPolicy_0d01cf2f')}
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const WORKSPACE_BENEFITS = [
  translateMessage('ui.organizeMultipleAccountsInOnePlace_67266e29'),
  translateMessage('ui.inviteMembersAndManageTheirRoles_b3074cfe'),
  translateMessage('ui.shareAnAddressBookAcrossYour_8a39a6c7'),
]

const NoSpacesState = ({ isAtLimit }: { isAtLimit: boolean }) => {
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false)
  const isDarkMode = useDarkMode()
  const isSafePro = useIsSafeProEnabled()

  return (
    <>
      <Card
        size="none"
        // eslint-disable-next-line no-restricted-syntax -- Figma's 32px corner has no Card `radius` option
        className="w-full rounded-4xl p-1 text-center"
      >
        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-t-[calc(2rem-4px)] bg-muted p-8 text-left before:absolute before:top-[72%] before:-left-16 before:size-96 before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-static-text-brand)] before:opacity-45 before:blur-3xl md:flex-row md:items-end md:gap-16">
          <div className="relative flex shrink-0 flex-col gap-4 md:self-center">
            {WORKSPACE_BENEFITS.map((benefit) => (
              <div key={benefit} className="flex flex-row items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-background-light-hover)]">
                  <Check className="size-4 text-badge-dot-success" strokeWidth={1.5} />
                </div>
                <Typography variant="paragraph-large" className="font-medium whitespace-nowrap">
                  {benefit}
                </Typography>
              </div>
            ))}
          </div>

          <Image
            src={isDarkMode ? WorkspacesEmptyIllustrationDark : WorkspacesEmptyIllustration}
            alt={translateMessage('ui.workspaceDashboardShowingAccountsGroupedBy_fccda1ef')}
            className="relative -my-8 h-auto w-full min-w-0 md:-mr-8 md:w-[60%]"
          />
        </div>

        <div className="flex flex-col items-center gap-6 p-8">
          <Typography variant="h3">{translateMessage('ui.collaborateOnYourAccountsWithYour_5a0a8caf')}</Typography>

          <div className="flex flex-col items-center gap-4">
            <div className="h-12">
              <AddSpaceButton
                label={
                  isSafePro
                    ? translateMessage('ui.get_f386bf84')
                    : translateMessage('ui.createYourFirstWorkspace_d6bdc22d')
                }
                icon="arrow"
                disabled={isAtLimit}
                link
                onClick={() =>
                  trackEvent(SPACE_EVENTS.WORKSPACE_CREATE_STARTED, {
                    entry_point: WorkspaceCreateEntryPoint.EMPTY_STATE,
                  })
                }
              />
            </div>

            <Link variant="muted" className="text-sm underline" onClick={() => setIsInfoOpen(true)} href="#">
              {translateMessage('ui.whatAreWorkspaces_92ed18b7')}
            </Link>
          </div>
        </div>
      </Card>
      {isInfoOpen && <SpaceInfoModal onClose={() => setIsInfoOpen(false)} />}
    </>
  )
}

const SpacesList = () => {
  const { AccountsNavigation } = useLoadFeature(MyAccountsFeature)
  const { SafeProWorkspacesBanner } = useLoadFeature(SafeProFeature)
  const isSafeProAnnouncementEnabled = useIsSafeProAnnouncementEnabled()
  // The pre-launch heads-up only makes sense to a user without a Workspace while Safe Pro is not live yet.
  const isUserSignedIn = useAppSelector(isAuthenticated)
  const isStoreHydrated = useAppSelector(selectIsStoreHydrated)
  const { currentData: currentUser } = useUsersGetWithWalletsV1Query(undefined, { skip: !isUserSignedIn })
  const {
    currentData: spaces,
    isFetching,
    isUninitialized,
    error,
    refetch,
  } = useSpacesGetV1Query(undefined, { skip: !isUserSignedIn })
  const pendingInvites = filterSpacesByStatus(currentUser, spaces || [], MemberStatus.INVITED)
  const activeSpaces = filterSpacesByStatus(currentUser, spaces || [], MemberStatus.ACTIVE)
  const isAtSpacesLimit = activeSpaces.length >= SPACES_LIMIT

  const singleSpaceId = activeSpaces.length === 1 ? activeSpaces[0].uuid : null
  const urlSpaceId = useUrlSpaceId()
  const requestedSpaceId = activeSpaces.some((space) => space.uuid === urlSpaceId) ? urlSpaceId : null

  // Treat any indefinite state as loading. On the skip→unskip flip (re-login
  // after logout) RTK Query lags one render — isFetching/isUninitialized are
  // both false while spaces is still undefined. The `spaces === undefined &&
  // !error` clause covers that gap so an existing user isn't bounced into
  // /welcome/create-space on a stale spacesAmount=0.
  const isSpacesLoading = isFetching || isUninitialized || (spaces === undefined && !error)

  const { setHasSignedIn, redirectLoading } = useSignInRedirect({
    spacesAmount: spaces?.length || 0,
    inviteAmount: pendingInvites.length,
    isSpacesLoading,
    error: error || undefined,
    singleSpaceId,
    requestedSpaceId,
  })

  const afterSignIn = useCallback(() => {
    setHasSignedIn(true)
  }, [setHasSignedIn])

  const onAddSpaceBtnClick = () =>
    trackEvent(SPACE_EVENTS.WORKSPACE_CREATE_STARTED, { entry_point: WorkspaceCreateEntryPoint.WELCOME })

  const pendingInviteBanners =
    isUserSignedIn && pendingInvites.length > 0
      ? pendingInvites.map((invitingSpace: GetSpaceResponse) => (
          <SpaceListInvite
            key={invitingSpace.uuid}
            space={invitingSpace}
            invitedByName={getInvitedByName(invitingSpace, currentUser?.id)}
          />
        ))
      : null

  return (
    <div className={css.container}>
      <div className={css.mySpaces}>
        <div className={css.spacesHeader}>
          <AccountsNavigation />
        </div>

        {!isStoreHydrated || (isUserSignedIn && isSpacesLoading) ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : !isUserSignedIn ? (
          <SignedOutState afterSignIn={afterSignIn} redirectLoading={redirectLoading} />
        ) : error && !spaces?.length ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Typography color="muted">{translateMessage('ui.couldnTLoadYourWorkspacesTry_a45adde5')}</Typography>
            <Button variant="outline" onClick={() => refetch()}>
              {translateMessage('ui.tryAgain_27537f8f')}
            </Button>
          </div>
        ) : activeSpaces.length > 0 ? (
          <>
            {isSafeProAnnouncementEnabled && <SafeProWorkspacesBanner className="mb-4" />}
            <WelcomeContentCard className="flex flex-col gap-4">
              <div className="flex justify-end">
                <AddSpaceButton
                  size="default"
                  variant="outline"
                  label={translateMessage('ui.create_2e386efa')}
                  disabled={isAtSpacesLimit}
                  onClick={onAddSpaceBtnClick}
                />
              </div>

              {pendingInviteBanners}

              <div className="rounded-lg border border-border bg-card px-4 py-1" data-testid="org-list">
                {activeSpaces.map((space, index) => (
                  <SpaceRow
                    key={space.uuid}
                    space={space}
                    currentUserId={currentUser?.id}
                    showDivider={index < activeSpaces.length - 1}
                  />
                ))}
              </div>
            </WelcomeContentCard>
          </>
        ) : (
          <>
            {isSafeProAnnouncementEnabled && <SafeProWorkspacesBanner className="mb-4" />}
            {pendingInviteBanners}
            <NoSpacesState isAtLimit={isAtSpacesLimit} />
          </>
        )}
      </div>
    </div>
  )
}

export default SpacesList
