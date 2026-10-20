import { translateMessage } from '@/i18n'
import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import { APP_VERSION } from '@/config/version'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { Link } from '@safe-global/views/components/ui/link'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'
import { HELP_CENTER_URL, PRIVACY_URL } from '@safe-global/utils/config/constants'
import { LEGAL_URL } from '@/config/constants'
import type { FooterProps } from '@safe-global/views/components/common/Footer/footer.type'

const footerPages = [
  AppRoutes.settings.index,
  AppRoutes.imprint,
  AppRoutes.cookie,
  AppRoutes.licenses,
  AppRoutes.welcome.accounts,
  AppRoutes.welcome.spaces,
]

const FooterLink = ({ children, href }: { children: ReactNode; href: string }): ReactElement => {
  return href ? <Link render={<NextLink href={href} />}>{children}</Link> : <Link>{children}</Link>
}

const Footer: React.FC<FooterProps> = ({
  forceShow,
  preferences = true,
  helpCenter = true,
  className = css.container,
}): ReactElement | null => {
  const router = useRouter()
  const isOfficialHost = useIsOfficialHost()
  const initialYear = 2025
  const currentYear = new Date().getFullYear()
  const copyrightYear = initialYear === currentYear ? initialYear : `${initialYear}–${currentYear}`

  if (!footerPages.some((path) => router.pathname.startsWith(path)) && !forceShow) {
    return null
  }

  const getHref = (path: string): string => {
    return router.pathname === path ? '' : path
  }

  return (
    <footer className={className}>
      <ul>
        {isOfficialHost ? (
          <>
            <li>
              <Typography variant="paragraph-mini">&copy;{copyrightYear} Safe Labs GmbH</Typography>
            </li>
            <li>
              <ExternalLink href={LEGAL_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
                {translateMessage('ui.legal_d3dfabd4')}
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={PRIVACY_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
                {translateMessage('ui.privacy_1014469e')}
              </ExternalLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.licenses)}>{translateMessage('ui.licenses_9bd58638')}</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.imprint)}>{translateMessage('ui.imprint_944f9bd5')}</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.cookie)}>{translateMessage('ui.cookiePolicy_41bd3779')}</FooterLink>
            </li>
            {preferences && (
              <li>
                <FooterLink href={getHref(AppRoutes.settings.index)}>
                  {translateMessage('ui.preferences_5f1e8b64')}
                </FooterLink>
              </li>
            )}
            {helpCenter && (
              <li>
                <ExternalLink
                  href={HELP_CENTER_URL}
                  noIcon
                  className="[&_span]:underline [&_span]:decoration-primary/40"
                >
                  {translateMessage('ui.help_506fc9ad')}
                </ExternalLink>
              </li>
            )}
          </>
        ) : (
          <li>{translateMessage('ui.thisIsAnUnofficialDistributionOf_13934d21')}</li>
        )}

        <li>
          <Typography variant="paragraph-mini">v{APP_VERSION}</Typography>
        </li>
      </ul>
    </footer>
  )
}

export default Footer
