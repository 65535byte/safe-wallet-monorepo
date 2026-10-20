import { translateMessage } from '@safe-global/views/i18n'
import type { SafeSortColumn } from '@safe-global/views/features/myAccounts/components/SafeAccountsTable/types'

export type SafeAccountColumnId =
  'select' | 'name' | 'threshold' | 'networks' | 'workspaces' | 'pending' | 'balance' | 'actions'

export type SafeAccountColumn = {
  id: SafeAccountColumnId
  label: string
  sortable: boolean
  /** The group sort key backing this column (only for sortable columns). */
  sortKey?: SafeSortColumn
  align?: 'center' | 'right'
  width?: string
}

/**
 * Column set for the accounts table, in render order. Balance and Pending are intentionally
 * not sortable. Widths are fixed pixels (the table uses `table-layout: fixed`) so the Name
 * column can't stretch to fit a long name — it's sized to hold the full account address, and
 * long names truncate within it. The sum drives a horizontal scroll on narrow viewports.
 */
export const SAFE_ACCOUNT_COLUMNS: SafeAccountColumn[] = [
  { id: 'name', label: translateMessage('ui.name_84f28b85'), sortable: true, sortKey: 'name', width: '404px' },
  {
    id: 'threshold',
    label: translateMessage('ui.threshold_60fbd8eb'),
    sortable: true,
    sortKey: 'threshold',
    align: 'center',
    width: '96px',
  },
  {
    id: 'networks',
    label: translateMessage('ui.networks_e4d25fbc'),
    sortable: true,
    sortKey: 'networks',
    align: 'center',
    width: '96px',
  },
  {
    id: 'workspaces',
    label: translateMessage('ui.workspaces_2fe24fcf'),
    sortable: true,
    sortKey: 'workspaces',
    align: 'center',
    width: '96px',
  },
  { id: 'pending', label: translateMessage('ui.pending_c096ae70'), sortable: false, align: 'center', width: '100px' },
  { id: 'balance', label: translateMessage('ui.balance_413e035a'), sortable: false, align: 'right', width: '96px' },
  { id: 'actions', label: '', sortable: false, align: 'right', width: '50px' },
]

/**
 * Leading checkbox column, prepended by the table only when selection mode is active. Kept out of
 * SAFE_ACCOUNT_COLUMNS so callers passing an explicit `columns` list are never affected by it.
 */
export const SELECT_COLUMN: SafeAccountColumn = {
  id: 'select',
  label: '',
  sortable: false,
  align: 'center',
  width: '48px',
}
