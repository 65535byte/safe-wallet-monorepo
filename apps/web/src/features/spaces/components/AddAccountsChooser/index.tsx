import { translateMessage } from '@/i18n'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { buildCurrentNextUrl } from '@/utils/nextUrl'
import { CirclePlus, Plus, Settings } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { cn } from '@safe-global/views/utils/cn'
import { ChooserRow } from '@safe-global/views/components/common/ChooserRow'
import AddAccounts from '../AddAccounts'
import {
  useCurrentSpaceId,
  useCurrentSpaceSafeCount,
  useIsAdmin,
  useIsCurrentSpaceAtSafeLimit,
  useSpaceSafeLimit,
} from '@/features/spaces'
import SeatLimitBanner from '../SafeAccounts/SeatLimitBanner'
import { trackEvent } from '@/services/analytics'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'

type EntryPoint = 'dashboard' | 'safe_accounts'

interface AddAccountsChooserProps {
  buttonVariant?: 'outline' | 'default'
  buttonLabel?: string
  entryPoint: EntryPoint
}

const AddAccountsChooser = ({
  buttonVariant = 'outline',
  buttonLabel = translateMessage('ui.addAccounts_5b9c31e4'),
  entryPoint,
}: AddAccountsChooserProps) => {
  const [chooserOpen, setChooserOpen] = useState(false)
  const [showAddPicker, setShowAddPicker] = useState(false)
  const isAdmin = useIsAdmin()
  const spaceId = useCurrentSpaceId()
  const isSpaceAtSafeLimit = useIsCurrentSpaceAtSafeLimit()
  const { limit: safeLimit } = useSpaceSafeLimit()
  const safeCount = useCurrentSpaceSafeCount()
  const showsLimit = isSpaceAtSafeLimit && isAdmin

  const router = useRouter()

  const handleCreate = () => {
    setChooserOpen(false)
    router.push({
      pathname: AppRoutes.newSafe.create,
      query: { next: buildCurrentNextUrl(router.pathname, router.query), ...(spaceId && { spaceId }) },
    })
  }

  const handleAdd = () => {
    if (!isAdmin) return
    trackEvent(
      { ...SPACE_EVENTS.WORKSPACE_SAFE_LINK_STARTED, label: spaceId },
      { workspace_id: spaceId, entry_point: entryPoint },
    )
    setChooserOpen(false)
    setShowAddPicker(true)
  }

  return (
    <>
      <Button
        size="lg"
        variant={buttonVariant}
        className="font-normal"
        onClick={() => setChooserOpen(true)}
        data-testid="open-add-accounts-chooser-button"
      >
        <Plus
          className={cn('size-4', {
            'text-green-500': buttonVariant === 'default',
          })}
        />
        {buttonLabel}
      </Button>

      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent
          showCloseButton
          padding="md"
          // At the seat limit the banner needs room for its title and button on one row.
          size={showsLimit ? 'sm' : 'default'}
          // eslint-disable-next-line no-restricted-syntax -- max-w-[440px] bespoke width + dark:border accent, no tokens (grandfathered)
          className={cn('dark:border dark:border-border', !showsLimit && 'max-w-[440px]')}
        >
          <DialogHeader
            // eslint-disable-next-line no-restricted-syntax -- p-0 pb-3: bespoke header padding, no token
            className="p-0 pb-3"
          >
            <DialogTitle className="font-bold">{translateMessage('ui.addAccounts_d96ccdc1')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {showsLimit && <SeatLimitBanner variant="alert" />}
            <ChooserRow
              icon={showsLimit ? <Settings className="size-4" /> : <Plus className="size-4" />}
              title={
                showsLimit ? translateMessage('ui.createNew_718632f7') : translateMessage('ui.createNewSafe_7e13a6b2')
              }
              subtitle={
                showsLimit
                  ? translateMessage('ui.replaceOneToAddAnother_ccc8b854', {
                      p0: safeCount ?? safeLimit,
                      p1: safeLimit,
                    })
                  : undefined
              }
              onClick={handleAdd}
              disabled={!isAdmin}
              disabledTooltip={translateMessage('ui.onlyAdminsCanAddSafesTo_01e4e3e6')}
              testId="add-safe-accounts-to-workspace-button"
            />
            <ChooserRow
              icon={<CirclePlus className="size-4" />}
              title={showsLimit ? translateMessage('ui.createNew_ec872d74') : translateMessage('ui.createNew_4645391c')}
              subtitle={showsLimit ? translateMessage('ui.createdOutsideTheWorkspaceInMy_b5a70eb4') : undefined}
              onClick={handleCreate}
            />
          </div>
        </DialogContent>
      </Dialog>
      {showAddPicker && <AddAccounts externalOpen onExternalClose={() => setShowAddPicker(false)} />}
    </>
  )
}

export default AddAccountsChooser
