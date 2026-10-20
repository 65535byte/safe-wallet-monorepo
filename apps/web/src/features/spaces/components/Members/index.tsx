import { translateMessage } from '@/i18n'
import { Button as ShadcnButton } from '@safe-global/views/components/ui/button'
import { Plus } from 'lucide-react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@safe-global/views/components/ui/tabs'
import AddMemberModal from '../AddMemberModal'
import { useState } from 'react'
import MembersList from '../MembersList'
import TableCard from '@safe-global/views/components/common/TableCard'
import { useIsInvited, useSpaceMembersByStatus, useIsAdmin } from '@/features/spaces'
import PreviewInvite from '../InviteBanner/PreviewInvite'
import { SPACE_LABELS } from '@/services/analytics/events/spaces'
import Track from '@/components/common/Track'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'

const SpaceMembers = () => {
  const [openAddMembersModal, setOpenAddMembersModal] = useState(false)
  const { activeMembers, invitedMembers } = useSpaceMembersByStatus()
  const isAdmin = useIsAdmin()
  const isInvited = useIsInvited()

  return (
    <>
      {isInvited && <PreviewInvite />}

      <div>
        <div className="mb-6 flex flex-col gap-6">
          <Typography variant="h2" className="font-bold leading-[1] tracking-tight">
            {translateMessage('ui.team_00a31af8')}
          </Typography>
          {isAdmin && (
            <Track {...SPACE_EVENTS.ADD_MEMBER_MODAL} label={SPACE_LABELS.members_page}>
              <ShadcnButton
                data-testid="add-member-button"
                size="lg"
                className="px-4 py-0"
                onClick={() => setOpenAddMembersModal(true)}
              >
                <Plus className="size-4 mr-1 text-green-500" />
                {translateMessage('ui.addMember_6817361a')}
              </ShadcnButton>
            </Track>
          )}
        </div>

        <Tabs defaultValue="members">
          <TabsList variant="underline" className="flex-wrap mb-4 sm:mb-0">
            <TabsTrigger value="members" className="cursor-pointer" data-testid="members-tab">
              {translateMessage('ui.members_0a88e24e')}
              {activeMembers.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="cursor-pointer" data-testid="pending-members-tab">
              {translateMessage('ui.pending_73884d0f')}
              {invitedMembers.length})
            </TabsTrigger>
          </TabsList>

          <TableCard className="mt-6">
            <TabsContent value="members">
              <MembersList members={activeMembers} variant="active" />
            </TabsContent>

            <TabsContent value="pending">
              {invitedMembers.length === 0 ? (
                <p className="text-muted-foreground p-4 text-sm">{translateMessage('ui.noPendingMembers_c2298da0')}</p>
              ) : (
                <MembersList members={invitedMembers} variant="pending" />
              )}
            </TabsContent>
          </TableCard>
        </Tabs>

        {openAddMembersModal && <AddMemberModal onClose={() => setOpenAddMembersModal(false)} />}
      </div>
    </>
  )
}

export default SpaceMembers
