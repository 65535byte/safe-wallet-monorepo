import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { X, Check, Plus } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { DialogClose, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { AppRoutes } from '@/config/routes'
import { useSafeQueryParam } from '@/hooks/useSafeAddressFromUrl'

const BENEFITS = [
  translateMessage('ui.keepAllRelatedAccountsInOne_3f1025a4'),
  translateMessage('ui.giveTeamsSharedContextAroundTransactions_492d882e'),
  translateMessage('ui.streamlineCoordinationAcrossInitiatorsApproversAnd_bf8356bf'),
]

export const AddToSpacePopupModal = (): ReactElement => {
  const router = useRouter()
  const safe = useSafeQueryParam()
  // eslint-disable-next-line no-restricted-syntax -- The Workspace to create does not exist yet
  const createSpaceHref = { pathname: AppRoutes.spaces.createSpace, query: { safe } }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between px-5 py-5">
        <DialogTitle>
          <Typography variant="h4">{translateMessage('ui.addToWorkspace_2661fd2b')}</Typography>
        </DialogTitle>
        <DialogClose
          aria-label={translateMessage('ui.close_fbd8cee0')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </DialogClose>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 px-6 pb-6 pt-2.5">
        <Typography variant="paragraph" color="muted">
          {translateMessage('ui.bringRelatedAccountsIntoAShared_da62b41c')}
        </Typography>

        <div className="relative h-[140px] sm:h-[200px] w-full rounded-3xl bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          <Image
            src="/images/spaces/empty_dashboard.png"
            alt={translateMessage('ui.addToWorkspaceIllustration_9b28d4da')}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-5 sm:gap-8">
          {BENEFITS.map((text) => (
            <div key={text} className="flex gap-4 items-start">
              <div className="flex items-center justify-center size-6 rounded-full bg-sidebar-accent shrink-0">
                <Check className="size-4 primary" />
              </div>
              <Typography variant="paragraph-small" color="muted" className="leading-5">
                {text}
              </Typography>
            </div>
          ))}
        </div>

        <DialogClose render={<Button className="w-full gap-2" />} onClick={() => void router.push(createSpaceHref)}>
          <Plus className="size-5" />
          {translateMessage('ui.createAWorkspace_47b40542')}
        </DialogClose>
      </div>
    </div>
  )
}
