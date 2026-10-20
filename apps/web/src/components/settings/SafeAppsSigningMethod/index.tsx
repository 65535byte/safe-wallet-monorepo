import { translateMessage } from '@/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectOnChainSigning, setOnChainSigning } from '@/store/settingsSlice'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import { Typography } from '@safe-global/views/components/ui/typography'
import { BRAND_NAME } from '@/config/constants'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

export const SafeAppsSigningMethod = () => {
  const onChainSigning = useAppSelector(selectOnChainSigning)

  const dispatch = useAppDispatch()

  const onChange = () => {
    trackEvent(SETTINGS_EVENTS.SAFE_APPS.CHANGE_SIGNING_METHOD)
    dispatch(setOnChainSigning(!onChainSigning))
  }

  return (
    <SettingsCard title={translateMessage('ui.signingMethod_41a10d72')} titleClassName="mb-2" className="mt-4">
      <Typography className="mb-4">
        {translateMessage('ui.thisSettingDeterminesHowThe_72f0cc84')}
        {BRAND_NAME} {translateMessage('ui.willSignMessageRequestsFromSafe_d49f6d54')}{' '}
        <ExternalLink className="font-bold hover:text-muted-foreground" href={HelpCenterArticle.SIGNED_MESSAGES}>
          {translateMessage('ui.here_134b2f0e')}
        </ExternalLink>
        .
      </Typography>
      <Field orientation="horizontal" className="w-fit">
        <Checkbox
          id="use-on-chain-signing"
          name="use-on-chain-signing"
          checked={onChainSigning}
          onCheckedChange={onChange}
        />
        <FieldLabel htmlFor="use-on-chain-signing">
          {translateMessage('ui.alwaysUseOnChainSignatures_13c873e5')}
        </FieldLabel>
      </Field>
    </SettingsCard>
  )
}
