import { translateMessage } from '@/i18n'
import css from '../Dashboard/styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'

const UnauthorizedState = () => {
  const isDarkMode = useDarkMode()

  return (
    <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
      <div className={css.content}>
        <div className={cn('text-center', css.contentWrapper)}>
          <div className={css.contentInner}>
            <Typography variant="paragraph-bold" className="mb-4">
              {translateMessage('ui.youDonTHavePermissionsTo_5f961b99')}
            </Typography>

            <Typography color="muted" className="mb-4">
              {translateMessage('ui.sorryYouDonTHavePermissions_7488dfd3')}
            </Typography>

            <Button variant="outline" render={<Link href={AppRoutes.welcome.spaces} />}>
              {translateMessage('ui.backToHomepage_a8782b83')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedState
