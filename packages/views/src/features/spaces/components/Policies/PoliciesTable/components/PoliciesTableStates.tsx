import { translateMessage } from '@safe-global/views/i18n'
import { SearchX } from 'lucide-react'
import { Typography } from '@safe-global/views/components/ui/typography'

export const PoliciesNoSearchResults = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center gap-3 py-10 text-center" data-testid="policies-no-results">
    <SearchX className="size-6 text-muted-foreground" aria-hidden />

    <div className="flex flex-col gap-1">
      <Typography variant="paragraph-bold">{translateMessage('ui.noPoliciesFound_fd7121cc')}</Typography>
      <Typography variant="paragraph-small" className="text-muted-foreground">
        {query ? (
          <>
            {translateMessage('ui.nothingMatches_805fa660')}
            {query}
            {translateMessage('ui.tryADifferentNameAddressToken_3ae2ce0e')}
          </>
        ) : (
          translateMessage('ui.nothingMatchesThisFilter_b8b9ffeb')
        )}
      </Typography>
    </div>
  </div>
)
