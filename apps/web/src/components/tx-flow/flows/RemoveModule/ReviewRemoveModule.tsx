import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useCallback, useContext, useEffect, type PropsWithChildren } from 'react'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveModuleTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { type RemoveModuleFlowProps } from '.'
import EthHashInfo from '@/components/common/EthHashInfo'
import ReviewTransaction from '@/components/tx/ReviewTransactionV2'

export const ReviewRemoveModule = ({
  params,
  onSubmit,
  children,
}: PropsWithChildren<{ params: RemoveModuleFlowProps; onSubmit: () => void }>) => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createRemoveModuleTx(params.address).then(setSafeTx).catch(setSafeTxError)
  }, [params.address, setSafeTx, setSafeTxError])

  const onFormSubmit = useCallback(() => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_MODULE)
    onSubmit()
  }, [onSubmit])

  return (
    <ReviewTransaction onSubmit={onFormSubmit}>
      <Typography className="text-[var(--color-primary-light)]">{translateMessage('ui.module_46c34f61')}</Typography>

      <EthHashInfo address={params.address} showCopyButton hasExplorer shortAddress={false} />

      <Typography className="my-4">{translateMessage('ui.afterRemovingThisModuleAnyFeature_f6bfc718')}</Typography>

      {children}
    </ReviewTransaction>
  )
}
