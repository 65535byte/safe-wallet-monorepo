import { translateMessage } from '@/i18n'
import { CircleCheck } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import HnSignupLayout from '@safe-global/views/features/hypernative/components/HnSignupFlow/HnSignupLayout'
import css from '@safe-global/views/features/hypernative/components/HnSignupFlow/styles.module.css'
import Track from '@/components/common/Track'
import { HYPERNATIVE_EVENTS } from '@/services/analytics'
import HypernativeLogo from '@safe-global/views/features/hypernative/components/HypernativeLogo'

export type HnSignupIntroProps = {
  onGetStarted: () => void
  onClose: () => void
}

const HnSignupIntro = ({ onGetStarted, onClose }: HnSignupIntroProps) => {
  const features = [
    {
      title: translateMessage('ui.automaticBlocking_0e2dc3a4'),
      description: translateMessage('ui.automaticallyPreventsMaliciousOrNonCompliant_248e40ba'),
    },
    {
      title: translateMessage('ui.customSecurityRules_e1a8084d'),
      description: translateMessage('ui.createTailoredPoliciesUsingGranularParameters_3f29ebc7'),
    },
    {
      title: translateMessage('ui.seamlessIntegration_b4bf2b4e'),
      description: translateMessage('ui.worksNativelyWithinYourWorkflowNo_b8b308e1'),
    },
  ]

  return (
    <HnSignupLayout contentClassName={css.introColumn}>
      <div className={css.contentWrapper}>
        <div className={css.header}>
          <Typography variant="h1" className={css.title}>
            {translateMessage('ui.guardian_eedd2209')}
          </Typography>
          <div className={css.poweredBy}>
            <Typography variant="paragraph-small" className={css.poweredByText}>
              {translateMessage('ui.poweredBy_27cb45a1')}
            </Typography>
            <HypernativeLogo fill="var(--color-primary-light)" className="w-[66px]" />
          </div>
          <Typography variant="paragraph-small" className={css.subtitle}>
            {translateMessage('ui.enterpriseLevelProtectionForTeamsAnd_1beda9d6')}
          </Typography>
        </div>

        <div className={css.features}>
          {features.map((feature, index) => (
            <div key={index} className={css.feature}>
              <CircleCheck className={css.featureIcon} />
              <div>
                <Typography variant="paragraph-small-bold" className={css.featureTitle}>
                  {feature.title}
                </Typography>
                <Typography variant="paragraph-small" className={css.featureDescription}>
                  {feature.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        <div className={css.actions}>
          <Track
            // Mixpanel: The event name is automatically determined from the GA_TO_MIXPANEL_MAPPING based on the action
            {...HYPERNATIVE_EVENTS.GUARDIAN_FORM_STARTED}
          >
            <Button onClick={onGetStarted} className="w-full">
              {translateMessage('ui.getStarted_5801751d')}
            </Button>
          </Track>
          <Button variant="ghost" onClick={onClose} className="w-full">
            {translateMessage('ui.close_fbd8cee0')}
          </Button>
        </div>
      </div>
    </HnSignupLayout>
  )
}

export default HnSignupIntro
