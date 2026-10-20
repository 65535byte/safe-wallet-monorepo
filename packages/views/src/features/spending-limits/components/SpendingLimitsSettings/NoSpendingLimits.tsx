import { translateMessage } from '@safe-global/views/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'

import BeneficiaryIcon from '@safe-global/views/assets/images/settings/spending-limit/beneficiary.svg'
import AssetAmountIcon from '@safe-global/views/assets/images/settings/spending-limit/asset-amount.svg'
import TimeIcon from '@safe-global/views/assets/images/settings/spending-limit/time.svg'

export const NoSpendingLimits = () => {
  return (
    <div className="mt-4 grid grid-cols-12 gap-4">
      <div className="col-span-2">
        <BeneficiaryIcon data-testid="beneficiary-icon" />
      </div>
      <div className="col-span-10">
        <Typography>
          <b>{translateMessage('ui.selectBeneficiary_ff3052c6')}</b>
        </Typography>
        <Typography>{translateMessage('ui.chooseAnAccountThatWillBenefit_f20fffab')}</Typography>
      </div>
      <div className="col-span-2">
        <AssetAmountIcon data-testid="asset-icon" />
      </div>
      <div className="col-span-10">
        <Typography>
          <b>{translateMessage('ui.selectAssetAndAmount_073d1cfe')}</b>
        </Typography>
        <Typography>{translateMessage('ui.youCanSetAllowancesForAny_eb664ecb')}</Typography>
      </div>
      <div className="col-span-2">
        <TimeIcon data-testid="time-icon" />
      </div>
      <div className="col-span-10">
        <Typography>
          <b>{translateMessage('ui.selectTime_985e414d')}</b>
        </Typography>
        <Typography>{translateMessage('ui.youCanChooseToSetA_7b4638f3')}</Typography>
      </div>
    </div>
  )
}
