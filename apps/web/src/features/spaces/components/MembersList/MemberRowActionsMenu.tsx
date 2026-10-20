import { translateMessage } from '@/i18n'
import { useState } from 'react'
import { type MemberDto } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@safe-global/views/components/ui/dropdown-menu'
import Track from '@/components/common/Track'
import { SPACE_EVENTS, SPACE_LABELS } from '@/services/analytics/events/spaces'
import { MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import EditMemberDialog from './EditMemberDialog'
import RemoveMemberDialog from './RemoveMemberDialog'
import useRenewInvite from './useRenewInvite'
import { getMemberDisplayName } from '../../hooks/useSpaceMembers'

type MemberRowActionsMenuProps = {
  member: MemberDto
  disabled: boolean
  // Edit stays enabled for the current user (to rename themselves) even when remove is disabled.
  editDisabled: boolean
  isInvite: boolean
  canRenew: boolean
}

/**
 * Mobile-only kebab that collapses the per-row member actions (edit / renew / remove)
 * into a single menu, replacing the desktop icon cluster on narrow viewports.
 */
const MemberRowActionsMenu = ({ member, disabled, editDisabled, isInvite, canRenew }: MemberRowActionsMenuProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const { renewInvite, isLoading } = useRenewInvite(member)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={translateMessage('ui.memberActions_04c790de')}>
              <EllipsisVertical className="text-muted-foreground size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {!isInvite && (
            <DropdownMenuItem disabled={editDisabled} onClick={() => setEditOpen(true)}>
              {translateMessage('ui.editMember_f2c4fa4b')}
            </DropdownMenuItem>
          )}
          {canRenew && (
            <Track
              {...SPACE_EVENTS.WORKSPACE_MEMBER_INVITE_RENEWED}
              label={SPACE_LABELS.invite_list}
              mixpanelParams={{ [MixpanelEventParams.MEMBER_ROLE]: member.role }}
            >
              <DropdownMenuItem disabled={isLoading} onClick={() => renewInvite()}>
                {translateMessage('ui.renewInvitation_8c0c0f9f')}
              </DropdownMenuItem>
            </Track>
          )}
          <Track
            {...SPACE_EVENTS.REMOVE_MEMBER_MODAL}
            label={isInvite ? SPACE_LABELS.invite_list : SPACE_LABELS.member_list}
          >
            <DropdownMenuItem variant="destructive" disabled={disabled} onClick={() => setRemoveOpen(true)}>
              {isInvite
                ? translateMessage('ui.removeInvitation_5b3d492b')
                : translateMessage('ui.removeMember_3f76a158')}
            </DropdownMenuItem>
          </Track>
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && <EditMemberDialog member={member} handleClose={() => setEditOpen(false)} />}
      {removeOpen && (
        <RemoveMemberDialog
          userId={member.user.id}
          memberName={getMemberDisplayName(member)}
          handleClose={() => setRemoveOpen(false)}
          isInvite={isInvite}
        />
      )}
    </>
  )
}

export default MemberRowActionsMenu
