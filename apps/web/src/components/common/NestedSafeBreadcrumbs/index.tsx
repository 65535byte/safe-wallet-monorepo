import { translateMessage } from '@/i18n'
import { useRouter } from 'next/router'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useParentSafe } from '@/hooks/useParentSafe'
import { BreadcrumbItem } from '@/components/common/Breadcrumbs/BreadcrumbItem'
import { formatPrefixedAddress } from '@safe-global/utils/utils/addresses'
import { useChain } from '@/hooks/useChains'

export function NestedSafeBreadcrumbs(): ReactElement | null {
  const { pathname, query } = useRouter()
  const { safeAddress } = useSafeInfo()
  const parentSafe = useParentSafe()
  const currentChain = useChain(parentSafe?.chainId || '')

  if (!parentSafe) {
    return null
  }

  const prefixedAddress = formatPrefixedAddress(parentSafe.address.value, currentChain?.shortName)

  return (
    <>
      <BreadcrumbItem
        title={translateMessage('ui.parent_0517a13e')}
        address={parentSafe.address.value}
        href={{
          pathname,
          query: { ...query, safe: prefixedAddress },
        }}
      />
      <Typography variant="paragraph-small">/</Typography>
      <BreadcrumbItem title={translateMessage('ui.nested_945d8f67')} address={safeAddress} />
    </>
  )
}
