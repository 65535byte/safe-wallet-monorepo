import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Check } from 'lucide-react'
import { DrawerFooter } from '@/components/common/Drawer'
import { Button } from '@safe-global/views/components/ui/button'
import useCopyToClipboard from '@/hooks/useCopyToClipboard'

export type CopyTransactionLinkProps = {
  transactionLink: string
}

const CopyTransactionLink = ({ transactionLink }: CopyTransactionLinkProps): ReactElement => {
  const { copied, copy } = useCopyToClipboard()

  return (
    <DrawerFooter>
      <Button className="w-full" onClick={() => copy(transactionLink)}>
        {copied && <Check data-icon="inline-start" className="text-green-600" />}
        {copied ? 'Copied!' : translateMessage('ui.copyTransactionLink_ad3fc406')}
      </Button>
    </DrawerFooter>
  )
}

export default CopyTransactionLink
