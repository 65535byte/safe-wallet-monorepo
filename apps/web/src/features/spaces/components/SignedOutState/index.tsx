import { translateMessage } from '@/i18n'
import css from '../Dashboard/styles.module.css'
import SignInOptions from '../SignInOptions'
import { OidcAuthFeature } from '@/features/oidc-auth'
import { useLoadFeature } from '@/features/__core__'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'

interface SignedOutStateProps {
  afterSignIn?: () => void
  redirectLoading?: boolean
}

const SignedOutState = ({ afterSignIn, redirectLoading = false }: SignedOutStateProps) => {
  const { $isDisabled } = useLoadFeature(OidcAuthFeature)
  const isDarkMode = useDarkMode()

  return (
    <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
      <div className={css.content}>
        <div className={cn('text-center', css.contentWrapper)}>
          <div className={css.contentInner}>
            <Typography variant="paragraph-bold" className="mb-4">
              {translateMessage('ui.signInToSeeContent_5df8e3fa')}
            </Typography>

            <Typography color="muted" className="mb-4">
              {translateMessage('ui.toViewAndInteractWithWorkspaces_7fb47710')}
              {!$isDisabled && ', or sign in with email'}
              {translateMessage('ui.signInToContinue_ebd668d8')}
            </Typography>

            <SignInOptions afterSignIn={afterSignIn ?? (() => {})} redirectLoading={redirectLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignedOutState
