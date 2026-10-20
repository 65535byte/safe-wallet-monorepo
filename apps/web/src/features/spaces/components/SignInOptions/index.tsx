import { translateMessage } from '@/i18n'
import SignInButton from '../SignInButton'
import { OidcAuthFeature } from '@/features/oidc-auth'
import { useLoadFeature } from '@/features/__core__'

interface SignInOptionsProps {
  afterSignIn: () => void
  redirectLoading?: boolean
}

const SignInOptions = ({ afterSignIn, redirectLoading = false }: SignInOptionsProps) => {
  const { EmailSignInButton, GoogleSignInButton, $isDisabled, $isReady } = useLoadFeature(OidcAuthFeature)
  const showOidc = !$isDisabled && $isReady

  return (
    <div className="flex w-full flex-col gap-2.5">
      <SignInButton
        afterSignIn={afterSignIn}
        redirectLoading={redirectLoading}
        buttonStyle="walletBtnSecondary"
        buttonText={{
          connected: translateMessage('ui.continueWith_0d1f7624'),
          disconnected: translateMessage('ui.connectWallet_301090ba'),
        }}
      />

      {showOidc && (
        <>
          <div className="flex items-center gap-3 py-0.5">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[13px] font-medium tracking-[0.5px] text-muted-foreground">
              {translateMessage('ui.oR_13988f04')}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton />
          <EmailSignInButton />
        </>
      )}
    </div>
  )
}

export default SignInOptions
