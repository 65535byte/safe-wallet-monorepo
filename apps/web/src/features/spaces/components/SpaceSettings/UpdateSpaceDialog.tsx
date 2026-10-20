import { translateMessage } from '@/i18n'
import ModalDialog from '@/components/common/ModalDialog'
import UpdateSpaceForm from './UpdateSpaceForm'
import type { GetSpaceResponse } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { Typography } from '@safe-global/views/components/ui/typography'
import { PRIVACY_URL } from '@safe-global/utils/config/constants'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'

const UpdateSpaceDialog = ({ space, onClose }: { space: GetSpaceResponse; onClose: () => void }) => {
  const isDarkMode = useDarkMode()

  return (
    <ModalDialog
      dialogTitle={translateMessage('ui.updateWorkspace_6899dc48')}
      hideChainIndicator
      open
      onClose={onClose}
    >
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <div className="mt-4 px-6 pb-6">
          <Typography className="mb-4">
            {translateMessage('ui.theWorkspaceNameIsVisibleIn_4470559d')}{' '}
            <ExternalLink href={PRIVACY_URL}>{translateMessage('ui.howIsThisDataStored_482913eb')}</ExternalLink>
          </Typography>
          <UpdateSpaceForm space={space} onClose={onClose} />
        </div>
      </div>
    </ModalDialog>
  )
}

export default UpdateSpaceDialog
