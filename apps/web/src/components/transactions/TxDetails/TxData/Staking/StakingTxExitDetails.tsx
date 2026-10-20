import { translateMessage } from '@/i18n'
import type { NativeStakingValidatorsExitTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { NativeStakingStatus } from '@safe-global/store/gateway/types'
import { Link } from '@safe-global/views/components/ui/link'
import FieldsGrid from '@safe-global/views/components/tx/FieldsGrid'
import StakingStatus from './StakingStatus'
import { formatDurationFromMilliseconds } from '@safe-global/utils/utils/formatters'
import { getBeaconChainLink } from '@safe-global/utils/features/stake/utils/beaconChain'
import useChainId from '@/hooks/useChainId'

const StakingTxExitDetails = ({ info }: { info: NativeStakingValidatorsExitTransactionInfo }) => {
  const withdrawIn = formatDurationFromMilliseconds(info.estimatedExitTime + info.estimatedWithdrawalTime, [
    'days',
    'hours',
  ])

  return (
    <div className="flex flex-col gap-2 pr-10">
      <FieldsGrid title={translateMessage('ui.exit_8ca0834c')}>
        {info.validators.map((validator: string, index: number) => {
          return (
            <>
              <BeaconChainLink
                name={translateMessage('ui.validator_6d6ec166', { p0: index + 1 })}
                validator={validator}
                key={index}
              />
              {index < info.validators.length - 1 && ' | '}
            </>
          )
        })}
      </FieldsGrid>
      {info.status !== NativeStakingStatus.EXITED && (
        <FieldsGrid title={translateMessage('ui.estExitTime_fb885e86')}>
          {translateMessage('ui.upTo_638e131c')}
          {withdrawIn}
        </FieldsGrid>
      )}

      <FieldsGrid title={translateMessage('ui.validatorStatus_0717076f')}>
        <StakingStatus status={info.status} />
      </FieldsGrid>
    </div>
  )
}

export const BeaconChainLink = ({ validator, name }: { validator: string; name: string }) => {
  const chainId = useChainId()
  return (
    <Link target="_blank" rel="noreferrer noopener" href={getBeaconChainLink(chainId, validator)}>
      {name}
    </Link>
  )
}

export default StakingTxExitDetails
