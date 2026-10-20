import { translateMessage } from '@/i18n'
import { type MemberDto } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { Send } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { SPACE_EVENTS, SPACE_LABELS } from '@/services/analytics/events/spaces'
import { MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import Track from '@/components/common/Track'
import useRenewInvite from './useRenewInvite'

const RenewInviteButton = ({ member }: { member: MemberDto }) => {
  const { renewInvite: handleRenew, isLoading } = useRenewInvite(member)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span>
            <Track
              {...SPACE_EVENTS.WORKSPACE_MEMBER_INVITE_RENEWED}
              label={SPACE_LABELS.invite_list}
              mixpanelParams={{ [MixpanelEventParams.MEMBER_ROLE]: member.role }}
            >
              <Button variant="ghost" size="icon-sm" onClick={handleRenew} disabled={isLoading}>
                <Send className="size-4 translate-x-[-0.8px] translate-y-[0.5px] fill-none text-[var(--color-border-main)]" />
              </Button>
            </Track>
          </span>
        }
      />
      <TooltipContent>
        {member.user.email
          ? translateMessage('ui.renewInvitationAndResendTheEmail_68d29bfd')
          : translateMessage('ui.renewInvitation_8c0c0f9f')}
      </TooltipContent>
    </Tooltip>
  )
}

export default RenewInviteButton
