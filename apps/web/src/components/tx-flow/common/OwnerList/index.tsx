import { translateMessage } from '@/i18n'
import type { AddressInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ReactElement } from 'react'

import PlusIcon from '@/public/images/common/plus.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import { cn } from '@safe-global/views/utils/cn'

import css from './styles.module.css'

export function OwnerList({
  title,
  icon,
  owners,
  className,
  sx,
}: {
  owners: Array<AddressInfo>
  icon?: React.ElementType
  title?: string
  className?: string
  /** @deprecated MUI `sx` is ignored after the shadcn migration; use `className` instead. */
  sx?: object
}): ReactElement {
  void sx
  const Icon = icon ?? PlusIcon
  return (
    <div className={cn(css.container, className)}>
      <p className="flex items-center text-[length:inherit] text-muted-foreground">
        <Icon className="mr-2 size-4" />
        {title ?? translateMessage('ui.addOwner_8b434f8d', { count: owners.length })}
      </p>
      {owners.map((newOwner) => (
        <EthHashInfo
          key={newOwner.value}
          address={newOwner.value}
          name={newOwner.name}
          shortAddress={false}
          showCopyButton
          hasExplorer
          avatarSize={32}
        />
      ))}
    </div>
  )
}
