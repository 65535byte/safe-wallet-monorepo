import { translateMessage } from '@/i18n'
import { X } from 'lucide-react'
import type { SafeApp as SafeAppData } from '@safe-global/store/gateway/AUTO_GENERATED/safe-apps'

import SearchField from '@/components/common/SearchField'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import { Label } from '@safe-global/views/components/ui/label'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { getUniqueTags } from '@/components/safe-apps/utils'
import BatchIcon from '@/public/images/apps/batch-icon.svg'
import css from './styles.module.css'

export type safeAppCatogoryOptionType = {
  label: string
  value: string
}

type SafeAppsFiltersProps = {
  onChangeQuery: (newQuery: string) => void
  onChangeFilterCategory: (category: string[]) => void
  onChangeOptimizedWithBatch: (optimizedWithBatch: boolean) => void
  selectedCategories: string[]
  safeAppsList: SafeAppData[]
}

const SafeAppsFilters = ({
  onChangeQuery,
  onChangeFilterCategory,
  onChangeOptimizedWithBatch,
  selectedCategories,
  safeAppsList,
}: SafeAppsFiltersProps) => {
  const categoryOptions = getCategoryOptions(safeAppsList)

  return (
    <div className={`grid grid-cols-12 items-end gap-4 ${css.filterContainer}`}>
      <div className="col-span-12 md:col-span-6">
        <Label htmlFor="search-by-name" className="mb-1.5">
          {translateMessage('ui.search_b3c8cd38')}
        </Label>
        <SearchField
          id="search-by-name"
          placeholder={translateMessage('ui.searchByNameOrCategory_dd9deee2')}
          aria-label={translateMessage('ui.searchAppByName_a164c169')}
          autoComplete="off"
          inputSize="lg"
          onChange={(e) => {
            onChangeQuery(e.target.value)
          }}
        />
      </div>

      {/* Select Category */}
      <div className="relative col-span-12 sm:col-span-6 md:col-span-3">
        <Label htmlFor="safe-app-category-selector" className="mb-1.5">
          {translateMessage('ui.category_fe9ce74e')}
        </Label>
        <Select
          multiple
          value={selectedCategories}
          onValueChange={(value) => {
            onChangeFilterCategory(value as string[])
          }}
        >
          <SelectTrigger
            id="safe-app-category-selector"
            size="lg"
            // `size="lg"` (40px) replaces the old bespoke `h-[var(--space-5)]!` and matches the
            // `inputSize="lg"` search field beside it in the grid row.
            className="w-full pr-[18px] shadow-none focus-visible:border-[var(--ring)] focus-visible:ring-1 focus-visible:ring-ring"
          >
            <SelectValue className={selectedCategories.length === 0 ? css.selectPlaceholder : undefined}>
              {selectedCategories.length === 0
                ? translateMessage('ui.selectCategory_34a4a89a')
                : translateMessage('ui.categoriesSelected_2eb7703e', { p0: selectedCategories.length })}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.length > 0 ? (
              categoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value} className="text-sm">
                  <Checkbox checked={selectedCategories.includes(category.value)} className="pointer-events-none" />
                  {category.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled className="text-sm">
                {translateMessage('ui.noCategoriesDefined_e44a7ef2')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* clear selected categories button */}
        {selectedCategories.length > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={translateMessage('ui.clearSelectedCategories_6dfcb1a8')}
                  onClick={() => {
                    onChangeFilterCategory([])
                  }}
                  className="absolute top-[28px] right-[28px]"
                />
              }
            >
              <X className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{translateMessage('ui.clearSelectedCategories_6dfcb1a8')}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Optimized with Batch Transaction */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3">
        <Tooltip>
          <TooltipTrigger render={<div className="inline-block" />}>
            <Label className={`${css.optimizedWithBatchLabel} mb-1.5`}>
              {translateMessage('ui.optimizedWith_eab36cef')}
            </Label>
            <Field orientation="horizontal">
              <Checkbox id="optimized-with-batch" onCheckedChange={(value) => onChangeOptimizedWithBatch(value)} />
              <FieldLabel htmlFor="optimized-with-batch" className="flex items-center gap-2 font-normal">
                <span>{translateMessage('ui.batchTransactions_0c3744a1')}</span> <BatchIcon />
              </FieldLabel>
            </Field>
          </TooltipTrigger>
          <TooltipContent className="text-center">
            {translateMessage('ui.mergeMultipleTransactionsIntoOneTo_45757038')}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default SafeAppsFilters

export const getCategoryOptions = (safeAppList: SafeAppData[]): safeAppCatogoryOptionType[] => {
  return getUniqueTags(safeAppList).map((category) => ({
    label: category,
    value: category,
  }))
}
