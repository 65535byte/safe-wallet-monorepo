import { translateMessage } from '@safe-global/views/i18n'
import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import Domain from './Domain'

type UnknownAppWarningProps = {
  url?: string
  onHideWarning?: (hideWarning: boolean) => void
}

const UnknownAppWarning = ({ url, onHideWarning }: UnknownAppWarningProps): React.ReactElement => {
  const [toggleHideWarning, setToggleHideWarning] = useState(false)

  const handleToggleWarningPreference = (): void => {
    onHideWarning?.(!toggleHideWarning)
    setToggleHideWarning(!toggleHideWarning)
  }

  return (
    <div className="flex h-full flex-col items-center">
      <div className="mt-12 flex flex-col items-center">
        <TriangleAlert className="size-9 text-[var(--color-warning-main)]" />
        <Typography variant="h3" className="mt-4 text-[var(--color-warning-main)]">
          {translateMessage('ui.warning_e4bf8e0a')}
        </Typography>
      </div>
      <Typography variant="paragraph-bold" className="my-4 text-[var(--color-warning-main)]">
        {translateMessage('ui.theApplicationYouAreTryingTo_13f630a3')}
      </Typography>

      <Typography className="my-4 text-center">{translateMessage('ui.checkTheLinkYouAreUsing_187fdd4f')}</Typography>

      {url && <Domain url={url} showInOneLine />}

      {onHideWarning && (
        <div className="mt-4">
          <Field orientation="horizontal">
            <Checkbox
              id="hide-warning"
              name="Warning message preference"
              checked={toggleHideWarning}
              onCheckedChange={handleToggleWarningPreference}
            />
            <FieldLabel htmlFor="hide-warning" className="font-normal">
              {translateMessage('ui.donTShowThisWarningAgain_a5b45332')}
            </FieldLabel>
          </Field>
        </div>
      )}
    </div>
  )
}

export default UnknownAppWarning
