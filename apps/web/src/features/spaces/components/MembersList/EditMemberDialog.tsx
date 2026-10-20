import { translateMessage } from '@/i18n'
import ModalDialog from '@/components/common/ModalDialog'
import DialogActions from '@/components/common/DialogActions'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'
import {
  type MemberDto,
  useMembersUpdateAliasV1Mutation,
  useMembersUpdateRoleV1Mutation,
} from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { useUsersGetWithWalletsV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/users'
import {
  useCurrentSpaceId,
  useAdminCount,
  useIsAdmin,
  isActiveAdmin,
  getMemberDisplayName,
  sanitizeMemberAlias,
  MEMBER_ALIAS_MAX_LENGTH,
} from '@/features/spaces'
import { useAppDispatch, useAppSelector } from '@/store'
import { isAuthenticated } from '@/store/authSlice'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { showNotification } from '@/store/notificationsSlice'
import MemberInfoForm from '../AddMemberModal/MemberInfoForm'
import { trackEvent } from '@/services/analytics'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import { getRtkQueryErrorMessage } from '@/utils/rtkQuery'
import { capitalize } from '@safe-global/utils/utils/formatters'
import { isElevationRequiredError } from '@/features/oidc-auth/utils/elevation'

type MemberField = {
  name: string
  role: MemberDto['role']
}

const EditMemberDialog = ({ member, handleClose }: { member: MemberDto; handleClose: () => void }) => {
  const spaceId = useCurrentSpaceId()
  const dispatch = useAppDispatch()
  const [updateAlias] = useMembersUpdateAliasV1Mutation()
  const [updateRole] = useMembersUpdateRoleV1Mutation()
  const [error, setError] = useState<string>()
  const isDarkMode = useDarkMode()

  const isUserSignedIn = useAppSelector(isAuthenticated)
  const { currentData: currentUser } = useUsersGetWithWalletsV1Query(undefined, { skip: !isUserSignedIn })
  const adminCount = useAdminCount()
  const isAdmin = useIsAdmin()

  // A member may only rename themselves; only admins may change roles,
  // and the last active admin keeps their role locked to preserve ownership.
  const canEditName = member.user.id === currentUser?.id
  const disableRole = !isAdmin || (adminCount === 1 && isActiveAdmin(member))
  const displayName = getMemberDisplayName(member)

  const methods = useForm<MemberField>({
    mode: 'onChange',
    defaultValues: {
      name: displayName,
      role: member.role,
    },
  })

  const { handleSubmit, formState, watch } = methods
  const roleValue = watch('role')
  const sanitizedName = sanitizeMemberAlias(watch('name'))
  const hasNameChanged = canEditName && sanitizedName !== displayName
  const hasRoleChanged = !disableRole && roleValue !== member.role
  const canSubmit = formState.isValid && (hasNameChanged || hasRoleChanged) && !formState.isSubmitting

  const onSubmit = handleSubmit(async () => {
    setError(undefined)

    if (!spaceId) {
      setError(translateMessage('ui.somethingWentWrongPleaseTryAgain_ee89925b'))
      return
    }

    try {
      if (hasNameChanged) {
        const { error } = await updateAlias({ spaceId, updateMemberAliasDto: { alias: sanitizedName } })

        if (error) {
          setError(getRtkQueryErrorMessage(error as FetchBaseQueryError | SerializedError))
          return
        }
      }

      if (hasRoleChanged) {
        const { error } = await updateRole({
          spaceId,
          userId: member.user.id,
          updateRoleDto: { role: roleValue },
        })

        if (isElevationRequiredError(error)) return
        if (error) {
          setError(getRtkQueryErrorMessage(error as FetchBaseQueryError | SerializedError))
          return
        }
      }
    } catch (e) {
      setError(getRtkQueryErrorMessage(e as FetchBaseQueryError | SerializedError))
      return
    }

    if (hasNameChanged) {
      trackEvent(
        { ...SPACE_EVENTS.WORKSPACE_MEMBER_NAME_CHANGED, label: spaceId },
        { workspace_id: spaceId, user_id: member.user.id },
      )
    }

    if (hasRoleChanged) {
      trackEvent(
        { ...SPACE_EVENTS.WORKSPACE_MEMBER_ROLE_CHANGED, label: spaceId },
        {
          workspace_id: spaceId,
          target_user_id: member.user.id,
          from_role: member.role.toLowerCase(),
          to_role: roleValue.toLowerCase(),
        },
      )
    }

    const roleLabel = capitalize(roleValue.toLowerCase())
    const successMessage =
      hasNameChanged && hasRoleChanged
        ? translateMessage('ui.updatedYourNameAndRoleTo_6ffdb3ad', { p0: roleLabel })
        : hasNameChanged
          ? translateMessage('ui.yourNameWasUpdated_09ac1b2b')
          : translateMessage('ui.updatedRoleOfTo_4ae3d814', { p0: displayName, p1: roleLabel })

    dispatch(
      showNotification({
        message: successMessage,
        variant: 'success',
        groupKey: 'update-member-success',
      }),
    )

    handleClose()
  })

  return (
    <ModalDialog open onClose={handleClose} dialogTitle={translateMessage('ui.editMember_f2c4fa4b')} hideChainIndicator>
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <div className="p-6">
              <Typography variant="paragraph" className="mb-4">
                {translateMessage('ui.edit_1b6b8026')}
                <b>{displayName}</b> {translateMessage('ui.inThisWorkspace_2669c5ea')}
              </Typography>

              <MemberInfoForm
                isEdit
                disableName={!canEditName}
                disableRole={disableRole}
                nameMaxLength={MEMBER_ALIAS_MAX_LENGTH}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </div>

            <DialogActions
              className="px-6 pb-6"
              onCancel={handleClose}
              cancelTestId="cancel-btn"
              confirmLabel={translateMessage('ui.update_5cb0e4fd')}
              confirmType="submit"
              confirmDestructive
              confirmDisabled={!canSubmit}
              confirmTestId="delete-btn"
            />
          </form>
        </FormProvider>
      </div>
    </ModalDialog>
  )
}

export default EditMemberDialog
