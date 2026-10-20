import { translateMessage } from '@/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectBlindSigning, setBlindSigning } from '@/store/settingsSlice'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import { Typography } from '@safe-global/views/components/ui/typography'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

const SecuritySettings = () => {
  const isBlindSigningEnabled = useAppSelector(selectBlindSigning)
  const dispatch = useAppDispatch()

  return (
    <SettingsCard title={translateMessage('ui.security_a4dd2249')} titleClassName="mb-2">
      <Typography className="mb-4">{translateMessage('ui.enablingThisSettingAllowsTheSigning_75fe711c')}</Typography>
      <Field orientation="horizontal" className="w-fit">
        <Checkbox
          id="blind-signing"
          checked={isBlindSigningEnabled}
          onCheckedChange={() => dispatch(setBlindSigning(!isBlindSigningEnabled))}
        />
        <FieldLabel htmlFor="blind-signing">{translateMessage('ui.enableBlindSigning_f6d30eb9')}</FieldLabel>
      </Field>
    </SettingsCard>
  )
}

export default SecuritySettings
