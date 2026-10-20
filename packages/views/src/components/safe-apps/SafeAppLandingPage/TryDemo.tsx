import { translateMessage } from '@safe-global/views/i18n'
import { CTA_HEIGHT, CTA_BUTTON_WIDTH } from '@safe-global/views/components/safe-apps/SafeAppLandingPage/constants'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import DemoAppSVG from '@safe-global/views/assets/images/apps/apps-demo.svg'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'

type Props = {
  demoUrl: LinkProps['href']
  onClick(): void
}

const TryDemo = ({ demoUrl, onClick }: Props) => (
  <div className="flex flex-col items-center justify-between" style={{ height: CTA_HEIGHT }}>
    <Typography variant="paragraph-bold">{translateMessage('ui.tryTheAppBeforeUsingIt_df78e2d9')}</Typography>
    <DemoAppSVG alt={translateMessage('ui.anIconOfAInternetBrowser_4e69312a')} />
    <Button variant="outline" style={{ width: CTA_BUTTON_WIDTH }} onClick={onClick} render={<Link href={demoUrl} />}>
      {translateMessage('ui.tryDemo_5e7ceac0')}
    </Button>
  </div>
)

export { TryDemo }
