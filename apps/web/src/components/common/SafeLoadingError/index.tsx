import { translateMessage } from '@/i18n'
import type { ReactElement, ReactNode } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeUnavailableMessage from '@/hooks/useSafeUnavailableMessage'
import { useUrlChain } from '@/hooks/useChainId'
import PagePlaceholder from '@safe-global/views/components/common/PagePlaceholder'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'

export const GENERIC_LOADING_ERROR = translateMessage('ui.thisAccountCouldnTBeLoaded_9f56d314')
export const unsupportedNetworkError = (shortName: string) =>
  translateMessage('ui.theNetworkIsnTSupported_4066b949', { p0: shortName })

const ErrorPlaceholder = ({ text }: { text: string }): ReactElement => (
  <PagePlaceholder
    img={<img src="/images/common/error.png" alt={translateMessage('ui.aVaultWithARedIcon_6299668e')} />}
    text={text}
    testId="safe-loading-error"
  >
    <Button size="lg" className="mt-4" data-testid="safe-loading-error-cta" render={<Link href={AppRoutes.index} />}>
      {translateMessage('ui.goToTheMainPage_ff9aaaec')}
    </Button>
  </PagePlaceholder>
)

const SafeLoadingError = ({ children }: { children: ReactNode }): ReactElement => {
  const { safeError } = useSafeInfo()
  const unavailableMessage = useSafeUnavailableMessage()
  const urlChain = useUrlChain()

  if (urlChain.status === 'unknown') return <ErrorPlaceholder text={unsupportedNetworkError(urlChain.shortName)} />

  if (!safeError) return <>{children}</>

  return <ErrorPlaceholder text={unavailableMessage ?? GENERIC_LOADING_ERROR} />
}

export default SafeLoadingError
