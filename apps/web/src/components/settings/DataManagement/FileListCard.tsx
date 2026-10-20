import { translateMessage } from '@/i18n'
import type { ReactElement, ReactNode } from 'react'
import FileIcon from '@safe-global/views/assets/images/settings/data/file.svg'

import useChains from '@/hooks/useChains'
import { ImportErrors } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { AddressBookState } from '@/store/addressBookSlice'
import type { SafeAppsState } from '@/store/safeAppsSlice'
import type { SettingsState } from '@/store/settingsSlice'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

import css from './styles.module.css'
import type { VisitedSafesState } from '@/store/visitedSafesSlice'
import type { UndeployedSafesState } from '@safe-global/utils/features/counterfactual/store/types'

type ItemText = {
  primary: ReactNode
  secondary?: ReactNode
}

const getItemSecondaryText = (
  chains: Chain[],
  data: AddedSafesState | AddressBookState = {},
  singular: string,
  plural: string,
): ReactElement => {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {Object.keys(data).map((chainId) => {
        const count = Object.keys(data[chainId] ?? {}).length

        if (count === 0) {
          return null
        }

        const chain = chains.find((chain) => chain.chainId === chainId)

        return (
          <li key={chainId} className="m-0.5 flex items-center p-0">
            <span className={css.networkIcon} style={{ backgroundColor: chain?.theme.backgroundColor ?? '#D9D9D9' }} />
            {chain?.chainName}: {count} {count === 1 ? singular : plural}
          </li>
        )
      })}
    </ul>
  )
}

type Data = {
  addedSafes?: AddedSafesState
  addressBook?: AddressBookState
  settings?: SettingsState
  safeApps?: SafeAppsState
  undeployedSafes?: UndeployedSafesState
  visitedSafes?: VisitedSafesState
  error?: string
}

type ListProps = Data & {
  showPreview?: boolean
}

type ItemProps = ListProps & { chains: Chain[] }

const getItems = ({
  addedSafes,
  addressBook,
  settings,
  safeApps,
  undeployedSafes,
  visitedSafes,
  error,
  chains,
  showPreview = false,
}: ItemProps): Array<ItemText> => {
  if (error) {
    return [{ primary: <>{error}</> }]
  }

  const addedSafeChainAmount = Object.keys(addedSafes || {}).length
  const addressBookChainAmount = Object.keys(addressBook || {}).length
  const undeployedSafesCount = Object.values(undeployedSafes || {}).flatMap((items) => Object.keys(items)).length

  const items: Array<ItemText> = []

  if (addedSafeChainAmount > 0) {
    const addedSafesPreview: ItemText = {
      primary: (
        <>
          <b>{translateMessage('ui.addedAccounts_b14da430')}</b> {translateMessage('ui.on_ba88d5c1')}
          {addedSafeChainAmount} {addedSafeChainAmount === 1 ? 'chain' : 'chains'}
        </>
      ),
      secondary: showPreview
        ? getItemSecondaryText(
            chains,
            addedSafes,
            translateMessage('ui.text_1252aec6'),
            translateMessage('ui.accounts_0ecf161b'),
          )
        : undefined,
    }

    items.push(addedSafesPreview)
  }

  if (addressBookChainAmount > 0) {
    const addressBookPreview: ItemText = {
      primary: (
        <>
          <b>{translateMessage('ui.addressBook_84131c25')}</b> {translateMessage('ui.for_2b768308')}
          {addressBookChainAmount} {addressBookChainAmount === 1 ? 'chain' : 'chains'}
        </>
      ),
      secondary: showPreview ? getItemSecondaryText(chains, addressBook, 'contact', 'contacts') : undefined,
    }

    items.push(addressBookPreview)
  }

  if (settings) {
    const settingsPreview: ItemText = {
      primary: (
        <>
          <b>{translateMessage('ui.settings_36b502ac')}</b>{' '}
          {translateMessage('ui.appearanceCurrencyHiddenTokensAndCustom_3eef80bf')}
        </>
      ),
    }

    items.push(settingsPreview)
  }

  if (visitedSafes) {
    const visitedSafesPreview: ItemText = {
      primary: (
        <>
          <b>{translateMessage('ui.visitedAccountsHistory_23221aa1')}</b>
        </>
      ),
    }

    items.push(visitedSafesPreview)
  }

  const hasBookmarkedSafeApps = Object.values(safeApps || {}).some((chainId) => chainId.pinned?.length > 0)
  if (hasBookmarkedSafeApps) {
    const safeAppsPreview: ItemText = {
      primary: (
        <>
          {translateMessage('ui.bookmarked_210df3bc')}
          <b>{translateMessage('ui.safeApps_234a7c1c')}</b>
        </>
      ),
    }

    items.push(safeAppsPreview)
  }

  if (undeployedSafes) {
    const undeployedSafesPreview: ItemText = {
      primary: (
        <>
          <b>{translateMessage('ui.notActivatedAccounts_3bd62443')}</b> {undeployedSafesCount}
        </>
      ),
    }

    items.push(undeployedSafesPreview)
  }

  if (items.length === 0) {
    return [{ primary: <>{ImportErrors.NO_IMPORT_DATA_FOUND}</> }]
  }

  return items
}

type CardHeaderProps = {
  avatar?: ReactNode
  title?: ReactNode
  action?: ReactNode
}

type Props = ListProps & CardHeaderProps & { className?: string }

export const FileListCard = ({
  addedSafes,
  addressBook,
  settings,
  safeApps,
  undeployedSafes,
  visitedSafes,
  error,
  showPreview = false,
  avatar,
  title,
  action,
  className,
}: Props): ReactElement => {
  const chains = useChains()
  const items = getItems({
    addedSafes,
    addressBook,
    settings,
    safeApps,
    visitedSafes,
    undeployedSafes,
    error,
    chains: chains.configs,
    showPreview,
  })

  return (
    <div className={css.card}>
      <div className={`${css.header} flex items-center p-4 ${className ?? ''}`}>
        {avatar && <div className="mr-4 flex items-center">{avatar}</div>}
        <div className="flex-1">{title}</div>
        {action && <div className="self-center">{action}</div>}
      </div>
      <div className={css.content}>
        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start p-1">
              <span className="mt-0.5 mr-6 shrink-0">
                <FileIcon className="block size-4 fill-none" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm text-foreground">{item.primary}</span>
                {item.secondary != null && <div className="text-xs text-muted-foreground">{item.secondary}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
