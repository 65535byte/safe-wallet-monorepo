import { translateMessage } from '@safe-global/views/i18n'
import { Pencil } from 'lucide-react'
import RowIconAction from './RowIconAction'

const RenameButton = ({ onRename, className }: { onRename: () => void; className?: string }) => (
  <RowIconAction
    label={translateMessage('ui.renameSafe_1167b1dc')}
    tooltip={translateMessage('ui.rename_f5101245')}
    testId="safe-item-rename-btn"
    className={className}
    onActivate={onRename}
  >
    <Pencil className="size-3 text-muted-foreground" />
  </RowIconAction>
)

export default RenameButton
