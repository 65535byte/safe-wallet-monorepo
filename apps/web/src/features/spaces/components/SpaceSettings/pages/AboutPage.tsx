import { translateMessage } from '@/i18n'
import {
  ActivityIcon,
  ArrowUpRight,
  BookOpen,
  Building2,
  Cookie,
  FileText,
  LifeBuoy,
  Scale,
  Settings2,
  Shield,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { useAppDispatch } from '@/store'
import { openCookieBanner } from '@/store/popupSlice'
import { CookieAndTermType } from '@/store/cookiesAndTermsSlice'
import { APP_VERSION } from '@/config/version'
import { BRAND_NAME, SAFE_PRO_TERMS_URL, SAFE_PRO_USER_TERMS_URL } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { HELP_CENTER_URL, PRIVACY_URL, TERMS_URL } from '@safe-global/utils/config/constants'
import { Button } from '@safe-global/views/components/ui/button'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useLoadFeature } from '@/features/__core__'
import { SupportChatFeature, useSupportChat } from '@/features/support-chat'
import { useIsSafeProAnnouncementEnabled } from '@/features/safe-pro-announcement'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'
import SpaceSettingsSection, {
  SpaceSettingsSectionTitle,
} from '@safe-global/views/features/spaces/components/SpaceSettings/SpaceSettingsSection'

const STATUS_PAGE_URL = 'https://status.safe.global'
const ROW_BUTTON_CLASSNAME =
  'group flex h-auto w-full justify-start gap-3 whitespace-normal rounded-md px-3 py-3 text-left font-normal text-foreground hover:bg-muted/60'

type LegalLink = {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

const proChip = (
  <span className="block h-4 w-6">
    <img src="/images/brand-logo.png" alt="" className="size-full object-contain" />
  </span>
)

const SAFE_PRO_LEGAL_LINKS: LegalLink[] = [
  {
    title: translateMessage('ui.proUserTermsConditions_05ca858f'),
    description: translateMessage('ui.forUsing_57a186cc'),
    href: SAFE_PRO_USER_TERMS_URL,
    icon: proChip,
    external: true,
  },
  {
    title: translateMessage('ui.proTermsConditions_fb932715'),
    description: translateMessage('ui.forUsing_57a186cc'),
    href: SAFE_PRO_TERMS_URL,
    icon: proChip,
    external: true,
  },
]

const LEGAL_LINKS: LegalLink[] = [
  {
    title: translateMessage('ui.termsConditions_9ac850da'),
    description: translateMessage('ui.forUsing_508ce391', { p0: BRAND_NAME }),
    href: TERMS_URL,
    icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    external: true,
  },
  {
    title: translateMessage('ui.privacyPolicy_0d01cf2f'),
    description: translateMessage('ui.whatWeCollectAndWhy_7b2a3683'),
    href: PRIVACY_URL,
    icon: <Shield className="h-4 w-4 text-muted-foreground" />,
    external: true,
  },
  {
    title: translateMessage('ui.licenses_9bd58638'),
    description: translateMessage('ui.openSourceAttribution_dd4c7ffa'),
    href: AppRoutes.licenses,
    icon: <Scale className="h-4 w-4 text-muted-foreground" />,
    external: true,
  },
  {
    title: translateMessage('ui.imprint_944f9bd5'),
    description: 'Safe Labs GmbH',
    href: AppRoutes.imprint,
    icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
    external: true,
  },
  {
    title: translateMessage('ui.cookiePolicy_b1b5e2b2'),
    description: translateMessage('ui.howCookiesAreUsed_529f745b'),
    href: AppRoutes.cookie,
    icon: <Cookie className="h-4 w-4 text-muted-foreground" />,
    external: true,
  },
]

const LinkRow = ({
  href,
  icon,
  title,
  description,
  external = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  external?: boolean
}) => (
  <a
    href={href || undefined}
    target={external ? '_blank' : undefined}
    rel={external ? 'noreferrer noopener' : undefined}
    className="group flex items-center gap-3 px-3 py-3 rounded-md text-foreground no-underline transition-colors hover:bg-muted/60"
  >
    <span className="shrink-0 transition-colors [&_svg]:transition-colors [&_svg]:group-hover:text-accent-success">
      {icon}
    </span>
    <span className="flex-1 min-w-0">
      <Typography variant="paragraph-small-bold" className="block transition-colors group-hover:text-accent-success">
        {title}
      </Typography>
      <Typography variant="paragraph-mini" color="muted" className="block mt-0.5">
        {description}
      </Typography>
    </span>
    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-colors group-hover:text-accent-success" />
  </a>
)

const AboutPage = () => {
  const dispatch = useAppDispatch()
  const [isSupportOpen, setSupportOpen] = useState(false)
  const { SupportChatDrawer, $isDisabled } = useLoadFeature(SupportChatFeature)
  const { config, user } = useSupportChat()
  const isOfficialHost = useIsOfficialHost()
  const showSupport = !$isDisabled && isOfficialHost
  const isAnnounced = useIsSafeProAnnouncementEnabled()
  const isSafePro = useIsSafeProEnabled()
  const showSafeProLinks = isAnnounced || isSafePro
  const legalLinks = showSafeProLinks ? [...SAFE_PRO_LEGAL_LINKS, ...LEGAL_LINKS] : LEGAL_LINKS

  const handleContactSupportClick = useCallback(() => {
    setSupportOpen(true)
  }, [])

  const handleSupportClose = useCallback(() => {
    setSupportOpen(false)
  }, [])

  const handleCookiePrefs = () => {
    dispatch(openCookieBanner({ warningKey: CookieAndTermType.NECESSARY }))
  }

  return (
    <div data-testid="settings-about-page">
      {/* Help */}
      <SpaceSettingsSection>
        <SpaceSettingsSectionTitle>{translateMessage('ui.help_506fc9ad')}</SpaceSettingsSectionTitle>

        <div className="flex flex-col -mx-2">
          <LinkRow
            href={HELP_CENTER_URL}
            external
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            title={translateMessage('ui.helpCenter_a9643f1f')}
            description={translateMessage('ui.guidesFAQsAndTroubleshooting_25e590ce')}
          />
          <LinkRow
            href={STATUS_PAGE_URL}
            external
            icon={<ActivityIcon className="h-4 w-4 text-muted-foreground" />}
            title={translateMessage('ui.syncStatus_63b957ca')}
            description={translateMessage('ui.blockchainSyncStatusAcrossNetworks_24307a1c')}
          />
          {showSupport && (
            <Button type="button" variant="ghost" onClick={handleContactSupportClick} className={ROW_BUTTON_CLASSNAME}>
              <span className="shrink-0">
                <LifeBuoy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent-success" />
              </span>
              <span className="flex-1 min-w-0">
                <Typography
                  variant="paragraph-small-bold"
                  className="block transition-colors group-hover:text-accent-success"
                >
                  {translateMessage('ui.contactSupport_e0a4096a')}
                </Typography>
                <Typography variant="paragraph-mini" color="muted" className="block mt-0.5">
                  {translateMessage('ui.getHelpFromOurTeam_d3fc3c90')}
                </Typography>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-colors group-hover:text-accent-success" />
            </Button>
          )}
        </div>
      </SpaceSettingsSection>

      <SpaceSettingsSection>
        <SpaceSettingsSectionTitle>{translateMessage('ui.legalPolicies_dadecb46')}</SpaceSettingsSectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 -mx-2">
          {legalLinks.map((link) => (
            <LinkRow key={link.title} {...link} />
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={handleCookiePrefs}
            data-testid="cookie-preferences-button"
            className={ROW_BUTTON_CLASSNAME}
          >
            <Settings2 className="h-4 w-4 text-muted-foreground shrink-0 transition-colors group-hover:text-accent-success" />
            <span className="flex-1 min-w-0">
              <Typography
                variant="paragraph-small-bold"
                className="block transition-colors group-hover:text-accent-success"
              >
                {translateMessage('ui.cookiePreferences_5e8ab3b0')}
              </Typography>
              <Typography variant="paragraph-mini" color="muted" className="block mt-0.5">
                {translateMessage('ui.manageWhatSEnabled_dacd388e')}
              </Typography>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-colors group-hover:text-accent-success" />
          </Button>
        </div>
      </SpaceSettingsSection>

      {/* Version */}
      <SpaceSettingsSection>
        <SpaceSettingsSectionTitle>{translateMessage('ui.version_6145b7bb')}</SpaceSettingsSectionTitle>

        <Badge variant="secondary" size="lg" className="font-mono">
          v{APP_VERSION}
        </Badge>
      </SpaceSettingsSection>

      {showSupport && (
        <SupportChatDrawer open={isSupportOpen} onClose={handleSupportClose} config={config} user={user} />
      )}
    </div>
  )
}

export default AboutPage
