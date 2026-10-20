import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Label } from '@safe-global/views/components/ui/label'
import { Typography } from '@safe-global/views/components/ui/typography'
import { CookieAndTermType } from '@/store/cookiesAndTermsSlice'

type CookieFormData = {
  [CookieAndTermType.TERMS]: boolean
  [CookieAndTermType.NECESSARY]: boolean
  [CookieAndTermType.UPDATES]: boolean
  [CookieAndTermType.ANALYTICS]: boolean
}

const CookieCheckbox = ({
  id,
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) => (
  <Label htmlFor={id} className="text-base">
    <Checkbox id={id} aria-label={label} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    {label}
  </Label>
)

const CookieOptionsList = ({ control }: { control: Control<CookieFormData> }): ReactElement => {
  return (
    <div className="flex-1">
      <div className="mb-4">
        <CookieCheckbox id="necessary" disabled label={translateMessage('ui.necessary_8c3b92ff')} checked />
        <Typography variant="paragraph-small">
          {translateMessage('ui.locallyStoredDataForCoreFunctionality_f822c041')}
        </Typography>
      </div>

      <div className="mb-4">
        <Controller
          name={CookieAndTermType.UPDATES}
          control={control}
          render={({ field }) => (
            <CookieCheckbox id="beamer" label="Beamer" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Typography variant="paragraph-small">
          {translateMessage('ui.newFeaturesAndProductAnnouncements_0eac60e9')}
        </Typography>
      </div>

      <div>
        <Controller
          name={CookieAndTermType.ANALYTICS}
          control={control}
          render={({ field }) => (
            <CookieCheckbox
              id="ga"
              label={translateMessage('ui.analytics_4fcbb88b')}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Typography variant="paragraph-small">
          {translateMessage('ui.analyticsToolsToUnderstandUsagePatterns_b464d6ca')}
        </Typography>
      </div>
    </div>
  )
}

export default CookieOptionsList
