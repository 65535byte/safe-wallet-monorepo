import { translateMessage } from '@/i18n'
import { type ReactElement } from 'react'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setTransactionExecution } from '@/store/settingsSlice'
import { RadioGroup, RadioGroupItem } from '@safe-global/views/components/ui/radio-group'
import { Label } from '@safe-global/views/components/ui/label'
import { Typography } from '@safe-global/views/components/ui/typography'

import css from './styles.module.css'

const ExecuteCheckbox = ({ onChange }: { onChange: (checked: boolean) => void }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()

  const handleChange = (value: unknown) => {
    const checked = value === 'true'
    trackEvent({ ...MODALS_EVENTS.TOGGLE_EXECUTE_TX, label: checked })
    dispatch(setTransactionExecution(checked))
    onChange(checked)
  }

  return (
    <>
      <Typography>{translateMessage('ui.wouldYouLikeToExecuteThe_22266491')}</Typography>

      <RadioGroup
        value={String(settings.transactionExecution)}
        onValueChange={handleChange}
        className="grid grid-cols-2 gap-4"
      >
        <Label className={css.radio} data-testid="execute-checkbox">
          <RadioGroupItem value="true" />
          <span>
            {translateMessage('ui.yes_c02b4c3c')}
            <b>{translateMessage('ui.execute_ecb1914a')}</b>
          </span>
        </Label>
        <Label className={css.radio} data-testid="sign-checkbox">
          <RadioGroupItem value="false" />
          <span>{translateMessage('ui.noLater_9407fec2')}</span>
        </Label>
      </RadioGroup>
    </>
  )
}

export default ExecuteCheckbox
