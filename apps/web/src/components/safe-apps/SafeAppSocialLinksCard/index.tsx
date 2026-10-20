import { translateMessage } from '@/i18n'
import NextLink from 'next/link'
import { isGithubUrl } from '@safe-global/views/utils/isGithubUrl'
import { HelpCircle, Send, Twitter } from 'lucide-react'
import { SafeAppSocialPlatforms } from '@safe-global/store/gateway/types'
import type { SafeApp as SafeAppData, SafeAppSocialProfile } from '@safe-global/store/gateway/AUTO_GENERATED/safe-apps'

import { Card } from '@safe-global/views/components/ui/card'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Link } from '@safe-global/views/components/ui/link'
import DiscordIcon from '@/public/images/common/discord-icon.svg'
import css from './styles.module.css'

type SafeAppSocialLinksCardProps = {
  safeApp: SafeAppData
}

const SafeAppSocialLinksCard = ({ safeApp }: SafeAppSocialLinksCardProps) => {
  const socialProfiles = safeApp.socialProfiles.filter(
    (profile) => profile.platform !== SafeAppSocialPlatforms.GITHUB && !isGithubUrl(profile.url),
  )
  const developerWebsite =
    safeApp.developerWebsite && !isGithubUrl(safeApp.developerWebsite) ? safeApp.developerWebsite : undefined

  const hasSocialLinks = socialProfiles?.length > 0

  if (!hasSocialLinks && !developerWebsite) {
    return null
  }

  const discordSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.DISCORD)
  const twitterSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.TWITTER)
  const telegramSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.TELEGRAM)

  return (
    <Card
      // eslint-disable-next-line no-restricted-syntax -- faithful css-module port, pixel-identical; bespoke value has no variant
      className="mt-[var(--space-4)] bg-[var(--color-info-background)] p-[var(--space-3)]"
    >
      <div className="flex items-center gap-2">
        {/* Team Link section */}
        <div className={css.questionMarkIcon}>
          <HelpCircle className="size-6 text-[var(--color-info-main)]" />
        </div>
        <div>
          <Typography variant="paragraph-bold">{translateMessage('ui.somethingWrongWithTheApp_8788855e')}</Typography>
          <Typography variant="paragraph-small" className="text-[var(--color-primary-light)]">
            {translateMessage('ui.getInTouchWithTheTeam_443ff043')}
          </Typography>
        </div>
      </div>

      <div className={`${css.socialLinksSectionContainer} flex gap-8`}>
        {/* Social links section */}
        {hasSocialLinks && (
          <div>
            <Typography variant="paragraph-small" className="pl-2 text-[var(--color-border-main)]">
              {translateMessage('ui.socialMedia_39a93d4d')}
            </Typography>

            <div className="mt-0.5 flex min-h-[40px]">
              {discordSocialLink && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={translateMessage('ui.discordLink_51854112')}
                  render={<a target="_blank" rel="noopener noreferrer" href={discordSocialLink.url} />}
                >
                  <DiscordIcon />
                </Button>
              )}

              {twitterSocialLink && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={translateMessage('ui.twitterLink_ab915a2f')}
                  render={<a target="_blank" rel="noopener noreferrer" href={twitterSocialLink.url} />}
                >
                  <Twitter className="text-[var(--color-border-main)]" />
                </Button>
              )}

              {telegramSocialLink && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={translateMessage('ui.githubLink_0ce12d28')}
                  render={<a target="_blank" rel="noopener noreferrer" href={telegramSocialLink.url} />}
                >
                  <Send className="text-[var(--color-border-main)]" />
                </Button>
              )}
            </div>
          </div>
        )}

        {hasSocialLinks && developerWebsite && <Separator orientation="vertical" className="h-[40px]" />}

        {/* Developer website section */}
        {developerWebsite && (
          <div className="flex flex-col">
            <Typography variant="paragraph-small" className="text-[var(--color-border-main)]">
              {translateMessage('ui.website_297cf161')}
            </Typography>

            <Link
              className={`${css.websiteLink} mt-1 font-bold`}
              render={<NextLink href={developerWebsite} target="_blank" rel="noopener noreferrer" />}
            >
              {developerWebsite}
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

export default SafeAppSocialLinksCard

const getSocialProfile = (socialProfiles: SafeAppSocialProfile[], platform: SafeAppSocialPlatforms) => {
  const socialLink = socialProfiles.find((socialProfile) => socialProfile.platform === platform)

  return socialLink
}
