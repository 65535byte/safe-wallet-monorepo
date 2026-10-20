import { translateMessage } from '@/i18n'
import { useMemo, useState, type ReactElement } from 'react'
import { Search, TriangleAlert } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@safe-global/views/components/ui/alert'
import { Input } from '@safe-global/views/components/ui/input'
import { SCROLL_AREA } from '@/utils/styles'
import { useFeatureFlagEditorData } from '../hooks/useFeatureFlagEditorData'
import { FeatureFlagSection } from './FeatureFlagSection'
import type { FeatureFlagRowData } from '../hooks/useFeatureFlagEditorData'

const matchesSearch = (row: FeatureFlagRowData, search: string): boolean =>
  row.feature.toLowerCase().includes(search.toLowerCase())

export const FeatureFlagEditor = (): ReactElement => {
  const { overridden, rest } = useFeatureFlagEditorData()
  const [search, setSearch] = useState('')

  const filteredOverridden = useMemo(() => overridden.filter((row) => matchesSearch(row, search)), [overridden, search])
  const filteredRest = useMemo(() => rest.filter((row) => matchesSearch(row, search)), [rest, search])
  const hasNoMatches = search !== '' && filteredOverridden.length === 0 && filteredRest.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Alert
        variant="warning"
        outlined={false}
        className="mb-4 dark:bg-[var(--color-warning-background)] dark:text-[var(--color-text-primary)]"
      >
        <TriangleAlert className="dark:text-[var(--color-warning-main)]" />
        <AlertTitle className="font-bold">{translateMessage('ui.developmentTool_7bb06549')}</AlertTitle>
        <AlertDescription className="dark:text-current">
          {translateMessage('ui.theseAreLocalFeatureFlagOverrides_9bc6272e')}
        </AlertDescription>
      </Alert>

      <div className="relative mb-3 shrink-0">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="pl-9"
          type="search"
          placeholder={translateMessage('ui.searchFeatureFlags_1e1b987d')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={translateMessage('ui.searchFlags_1cde091b')}
        />
      </div>

      <div className={SCROLL_AREA}>
        {hasNoMatches ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {translateMessage('ui.noFeatureFlagsMatchYourSearch_1b047e02')}
          </p>
        ) : (
          <>
            <FeatureFlagSection
              title={translateMessage('ui.localOverrides_2b54a0d2')}
              rows={filteredOverridden}
              valueLabel={translateMessage('ui.localValue_16c94789')}
            />
            <FeatureFlagSection
              title={translateMessage('ui.allFeatureFlags_5ebb4313')}
              rows={filteredRest}
              valueLabel={translateMessage('ui.remoteValue_76ceedb1')}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default FeatureFlagEditor
