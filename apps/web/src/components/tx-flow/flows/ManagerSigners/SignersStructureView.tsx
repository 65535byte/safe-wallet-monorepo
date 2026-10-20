import { translateMessage } from '@/i18n'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import { Controller, FormProvider } from 'react-hook-form'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import commonCss from '@safe-global/views/components/tx-flow/common/styles.module.css'
import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import OwnerRow from '@/components/new-safe/OwnerRow'
import { useSafeShieldForAddressPoisoning } from '@/features/safe-shield/SafeShieldContext'
import { ManageSignersFormFields } from '.'
import { TxFlowContext } from '../../TxFlowProvider'
import { SETTINGS_EVENTS, SETTINGS_LABELS, trackEvent } from '@/services/analytics'
import Track from '@/components/common/Track'
import type { TxFlowContextType } from '../../TxFlowProvider'
import type { ManageSignersForm } from '.'
import type { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'

type Props = {
  formMethods: UseFormReturn<ManageSignersForm>
  fieldArray: UseFieldArrayReturn<ManageSignersForm, 'owners'>
  newOwners: ManageSignersForm['owners']
  isSameSetup: boolean
  onRemove: (index: number) => void
  onAdd: () => void
}

export function SignersStructureView(props: Props): ReactElement {
  const { onNext } = useContext<TxFlowContextType<ManageSignersForm>>(TxFlowContext)

  // Copilot address-poisoning check for the configured signers.
  useSafeShieldForAddressPoisoning(props.newOwners.map((owner) => owner.address))

  return (
    <TxCard>
      <FormProvider {...props.formMethods}>
        <form onSubmit={props.formMethods.handleSubmit(onNext)} className={commonCss.form}>
          <Signers {...props} />

          <Separator bleed="6" />

          <Threshold {...props} />

          <Separator bleed="6" />

          <TxCardActions>
            <Button
              data-testId="submit-next"
              type="submit"
              disabled={props.isSameSetup || !props.formMethods.formState.isValid}
            >
              {translateMessage('ui.next_9cff86c8')}
            </Button>
          </TxCardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

function Signers({
  fieldArray,
  onRemove: _onRemove,
  onAdd,
}: Pick<Props, 'fieldArray' | 'onAdd' | 'onRemove'>): ReactElement {
  const onRemove = (index: number) => {
    _onRemove(index)
    trackEvent({ ...SETTINGS_EVENTS.SETUP.REMOVE_OWNER, label: SETTINGS_LABELS.manage_signers })
  }

  return (
    <>
      {fieldArray.fields.map((field, index) => (
        <OwnerRow
          key={field.id}
          index={index}
          groupName={ManageSignersFormFields.owners}
          removable={fieldArray.fields.length > 1}
          remove={onRemove}
        />
      ))}

      <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER} label={SETTINGS_LABELS.manage_signers}>
        <Button
          data-testid="add-new-signer"
          variant="ghost"
          onClick={onAdd}
          size="lg"
          className="-mt-2 mb-6 self-start"
        >
          <AddIcon className="size-4" />
          {translateMessage('ui.addNewSigner_d338b9bd')}
        </Button>
      </Track>
    </>
  )
}

function Threshold({ formMethods, newOwners }: Pick<Props, 'formMethods' | 'newOwners'>): ReactElement {
  return (
    <div className="my-6">
      <Typography variant="h4" className="inline-flex items-center gap-2 font-bold">
        {translateMessage('ui.threshold_60fbd8eb')}
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="flex text-[var(--color-border-main)]">
                <InfoIcon className="size-4" />
              </span>
            }
          />
          <TooltipContent>{translateMessage('ui.theThresholdOfAAccountSpecifies_fc4cfa69')}</TooltipContent>
        </Tooltip>
      </Typography>

      <Typography variant="paragraph-small" className="mb-4 block">
        {translateMessage('ui.anyTransactionRequiresTheConfirmationOf_d009e878')}
      </Typography>

      <div className="flex flex-row items-center gap-4 pt-2">
        <div>
          <Controller
            control={formMethods.control}
            name="threshold"
            render={({ field }) => {
              const onChange = (value: number | null) => {
                if (value == null) return
                field.onChange(value)
                trackEvent({ ...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD, label: SETTINGS_LABELS.manage_signers })
              }

              return (
                <Select value={field.value} onValueChange={onChange}>
                  <SelectTrigger data-testid="threshold-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newOwners.map((_, index) => (
                      <SelectItem key={index + 1} value={index + 1}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
        </div>
        <div>
          <Typography>
            {translateMessage('ui.outOf_9bf030fe')}
            {newOwners.length} {translateMessage('ui.signer_efab2dcb')}
          </Typography>
        </div>
      </div>
    </div>
  )
}
