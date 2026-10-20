import { translateMessage } from '@/i18n'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { ChevronUp as ExpandLessIcon, ChevronDown as ExpandMoreIcon } from 'lucide-react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useContext, useState } from 'react'
import type { ReactElement } from 'react'

import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import { useRecoveryPeriods } from './useRecoveryPeriods'
import { UpsertRecoveryFlowFields, type UpsertRecoveryFlowProps } from '.'
import AddressBookInput from '@/components/common/AddressBookInput'
import { useSafeShieldForAddressPoisoning } from '@/features/safe-shield/SafeShieldContext'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import { addressIsNotReserved } from '@safe-global/utils/utils/validation'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { RecovererWarning } from './RecovererSmartContractWarning'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { BRAND_NAME } from '@/config/constants'
import { TOOLTIP_TITLES } from '@safe-global/views/components/tx-flow/common/constants'
import Track from '@/components/common/Track'
import type { RecoveryStateItem } from '@/features/recovery'

import css from './styles.module.css'
import NumberField from '@/components/common/NumberField'
import { getDelay, isCustomDelaySelected } from './utils'
import { HelpCenterArticle, HelperCenterArticleTitles } from '@safe-global/utils/config/constants'
import { TxFlowContext, type TxFlowContextType } from '../../TxFlowProvider'
import { isSmartContractWallet } from '@/utils/wallets'
import { clickOnEnterOrSpace } from '@/utils/keyboard'
import { useLazySafesGetSafeV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import useChainId from '@/hooks/useChainId'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Card } from '@safe-global/views/components/ui/card'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import { Collapsible, CollapsibleContent } from '@safe-global/views/components/ui/collapsible'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Label } from '@safe-global/views/components/ui/label'

enum AddressType {
  EOA = 'EOA',
  Safe = 'Safe',
  Other = 'Other',
}

export function _validateRecoverer(recoverer: string, safeAddress: string): string | undefined {
  // Reserved (zero/sentinel) addresses would break the module on-chain. The
  // shared GS203 copy names a signer, which a Recoverer is not.
  const reservedError = addressIsNotReserved(translateMessage('ui.thisRecovererAddressIsNotValid_f453ea0a'))(recoverer)
  if (reservedError) {
    return reservedError
  }

  if (sameAddress(recoverer, safeAddress)) {
    return translateMessage('ui.theAccountCannotBeARecoverer_80669c00')
  }
}

export function UpsertRecoveryFlowSettings({ delayModifier }: { delayModifier?: RecoveryStateItem }): ReactElement {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const { data, onNext } = useContext<TxFlowContextType<UpsertRecoveryFlowProps>>(TxFlowContext)
  const [showAdvanced, setShowAdvanced] = useState(data?.[UpsertRecoveryFlowFields.expiry] !== '0')
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const periods = useRecoveryPeriods()
  const delayItems = Object.fromEntries(periods.delay.map(({ value, label }) => [value, label]))
  const expirationItems = Object.fromEntries(periods.expiration.map(({ value, label }) => [value, label]))
  const [triggerGetSafe] = useLazySafesGetSafeV1Query()

  const getAddressType = async (address: string, chainId: string) => {
    const isSmartContract = await isSmartContractWallet(chainId, address)
    if (!isSmartContract) return AddressType.EOA

    try {
      const result = await triggerGetSafe({ chainId, safeAddress: address }).unwrap()
      if (result) return AddressType.Safe
    } catch {
      // Not a safe
    }

    return AddressType.Other
  }

  const formMethods = useForm<UpsertRecoveryFlowProps>({
    defaultValues: data,
    mode: 'onChange',
  })

  const recoverer = formMethods.watch(UpsertRecoveryFlowFields.recoverer)

  // Copilot address-poisoning check for the recoverer
  useSafeShieldForAddressPoisoning([recoverer])
  const expiry = formMethods.watch(UpsertRecoveryFlowFields.expiry)
  const selectedDelay = formMethods.watch(UpsertRecoveryFlowFields.selectedDelay)
  const customDelay = formMethods.watch(UpsertRecoveryFlowFields.customDelay)
  const customDelayState = formMethods.getFieldState(UpsertRecoveryFlowFields.customDelay)

  const delay = getDelay(customDelay, selectedDelay)

  // RHF's dirty check is tempermental with our address input dropdown
  const isDirty = delayModifier
    ? // Updating settings
      !sameAddress(recoverer, delayModifier.recoverers[0]) ||
      delayModifier.delay !== BigInt(delay) ||
      delayModifier.expiry !== BigInt(expiry)
    : // Setting up recovery
      recoverer && delay && expiry

  const validateRecoverer = (recoverer: string) => _validateRecoverer(recoverer, safeAddress)

  const validateCustomDelay = (delay: string) => {
    if (!delay) return ''
    if (delay === '0' || !Number.isInteger(Number(delay))) {
      return translateMessage('ui.invalidNumber_3db14273')
    }
  }

  const onShowAdvanced = () => {
    setShowAdvanced((prev) => !prev)
    trackEvent(RECOVERY_EVENTS.SHOW_ADVANCED)
  }

  const isDisabled = !understandsRisk || !isDirty || !!customDelayState.error

  const isEdit = !!delayModifier

  const handleSubmit = async () => {
    const addressType = await getAddressType(recoverer, chainId)
    const creationEvent = isEdit ? RECOVERY_EVENTS.SUBMIT_RECOVERY_EDIT : RECOVERY_EVENTS.SUBMIT_RECOVERY_CREATE
    const settings = `delay_${delay},expiry_${expiry},type_${addressType}`

    trackEvent({ ...creationEvent })
    trackEvent({ ...RECOVERY_EVENTS.RECOVERY_SETTINGS, label: settings })

    onNext({ expiry, delay, customDelay, selectedDelay, recoverer, moduleAddress: data?.moduleAddress })
  }

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Alert variant="warning" outlined={false}>
            <AlertSeverityIcon variant="warning" />
            <AlertDescription>
              {translateMessage('ui.yourRecovererWillBeAbleTo_ba0629ef')}{' '}
              <Track {...RECOVERY_EVENTS.LEARN_MORE} label="recover-setup-flow">
                <ExternalLink href={HelpCenterArticle.RECOVERY} title={HelperCenterArticleTitles.RECOVERY}>
                  {translateMessage('ui.learnMore_0c11daba')}
                </ExternalLink>
              </Track>
            </AlertDescription>
          </Alert>

          <div className="my-4">
            <Typography variant="h4" className="mb-2">
              {translateMessage('ui.trustedRecoverer_bc55a11e')}
            </Typography>

            <Typography variant="paragraph-small" className="block">
              {translateMessage('ui.chooseARecovererSuchAsA_fcc2fe56')}
            </Typography>
          </div>

          <div className="mb-4 w-full">
            <AddressBookInput
              label={translateMessage('ui.recovererAddressOrENS_2c8b0cd1')}
              name={UpsertRecoveryFlowFields.recoverer}
              required
              fullWidth
              validate={validateRecoverer}
            />
            <RecovererWarning />
          </div>

          <div className="mb-4">
            <Typography variant="h4" className="mb-2">
              {translateMessage('ui.reviewWindow_d007ef5d')}
              <Tooltip>
                <TooltipTrigger render={<span />}>
                  <InfoIcon className="ml-1 inline size-4 align-middle text-[var(--color-border-main)]" />
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TITLES.REVIEW_WINDOW}</TooltipContent>
              </Tooltip>
            </Typography>

            <Typography variant="paragraph-small" className="block">
              {translateMessage('ui.theRecoveryProposalWillBeAvailable_1dd6fde4')}
            </Typography>
          </div>

          <div className="my-4">
            <Controller
              control={formMethods.control}
              name={UpsertRecoveryFlowFields.selectedDelay}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} items={delayItems}>
                  <SelectTrigger data-testid="recovery-delay-select" className="w-[55%] max-w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.delay.map(({ label, value }, index) => (
                      <SelectItem key={index} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <div className="flex max-w-[180px] min-w-[140px] flex-1 gap-4">
              {isCustomDelaySelected(selectedDelay) && (
                <>
                  <Controller
                    control={formMethods.control}
                    name={UpsertRecoveryFlowFields.customDelay}
                    rules={{ validate: validateCustomDelay }}
                    render={({ field, fieldState }) => (
                      <NumberField
                        label={fieldState.error?.message}
                        error={!!fieldState.error}
                        {...field}
                        required
                        placeholder="E.g. 100"
                      />
                    )}
                  />
                  <Typography className="my-auto">{translateMessage('ui.days_d3e1c87d')}</Typography>
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <Typography
              data-testid="advanced-btn"
              variant="paragraph-small"
              onClick={onShowAdvanced}
              onKeyDown={clickOnEnterOrSpace}
              role="button"
              tabIndex={0}
              aria-expanded={showAdvanced}
              className={css.advanced}
            >
              {translateMessage('ui.advanced_dc9cb289')}
              {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Typography>

            <Collapsible open={showAdvanced}>
              <CollapsibleContent keepMounted>
                <div>
                  <Typography variant="h4" className="mb-2">
                    {translateMessage('ui.proposalExpiry_368c328d')}
                    <Tooltip>
                      <TooltipTrigger render={<span />}>
                        <InfoIcon className="ml-1 inline size-4 align-middle text-[var(--color-border-main)]" />
                      </TooltipTrigger>
                      <TooltipContent>{TOOLTIP_TITLES.PROPOSAL_EXPIRY}</TooltipContent>
                    </Tooltip>
                  </Typography>

                  <Typography variant="paragraph-small" className="mb-4 block">
                    {translateMessage('ui.setAPeriodOfTimeAfter_ede68fa7')}
                  </Typography>
                </div>

                <Controller
                  control={formMethods.control}
                  name={UpsertRecoveryFlowFields.expiry}
                  // Don't reset value if advanced section is collapsed
                  shouldUnregister={false}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={expirationItems}>
                      <SelectTrigger data-testid="recovery-expiry-select" className="w-[55%] max-w-[240px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.expiration.map(({ label, value }, index) => (
                          <SelectItem key={index} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Separator bleed="6" />

          <Card data-testid="warning-section" size="none" surface="sunken" className="my-4">
            <Label htmlFor="recovery-understands-risk" className="cursor-pointer gap-3 px-2 py-2 font-normal">
              <Checkbox
                id="recovery-understands-risk"
                checked={understandsRisk}
                onCheckedChange={(checked) => setUnderstandsRisk(checked === true)}
                className="bg-[var(--color-background-paper)]"
              />
              <Typography variant="paragraph-small">
                {translateMessage('ui.iUnderstandThatTheRecovererWill_878a80f6', { p0: BRAND_NAME })}
              </Typography>
            </Label>
          </Card>

          <TxCardActions>
            <Button data-testid="next-btn" variant="default" type="submit" disabled={isDisabled}>
              {translateMessage('ui.next_9cff86c8')}
            </Button>
          </TxCardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}
