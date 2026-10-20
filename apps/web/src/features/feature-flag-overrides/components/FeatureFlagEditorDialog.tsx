import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@safe-global/views/components/ui/dialog'
import { Button } from '@safe-global/views/components/ui/button'
import { useAppDispatch } from '@/store'
import { clearAllOverrides } from '@/features/feature-flag-overrides/store'
import { useFeatureFlagEditorData } from '../hooks/useFeatureFlagEditorData'
import { FeatureFlagEditor } from './FeatureFlagEditor'

export interface FeatureFlagEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FeatureFlagEditorDialog = ({ open, onOpenChange }: FeatureFlagEditorDialogProps): ReactElement => {
  const dispatch = useAppDispatch()
  const { overridden } = useFeatureFlagEditorData()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="flex max-h-[90vh] flex-col">
        <DialogHeader divided className="shrink-0">
          <DialogTitle className="font-bold">{translateMessage('ui.featureFlags_91d3122f')}</DialogTitle>
          <DialogDescription>{translateMessage('ui.overrideTheFeatureFlagsDeliveredBy_82ecdefa')}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <FeatureFlagEditor />
        </div>

        <DialogFooter divided className="shrink-0 flex-row items-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => dispatch(clearAllOverrides())}
            disabled={overridden.length === 0}
          >
            <RotateCcw />
            {translateMessage('ui.resetAllOverrides_ca274a28')}
          </Button>
          <DialogClose render={<Button size="lg" className="ml-auto" />}>
            {translateMessage('ui.done_23c91b78')}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeatureFlagEditorDialog
