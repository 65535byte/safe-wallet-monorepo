import { translateMessage } from '@/i18n'
import { sectionItems, type SectionItem } from './sectionItems'
import {
  SectionVisibilityProvider,
  useSectionVisibility,
} from '@safe-global/views/features/global-search/components/SearchSection/SectionVisibilityContext'

interface SearchSectionProps {
  query: string
}

const NoResults = () => (
  <div className="flex h-full min-h-[350px] items-center justify-center px-4">
    <p className="text-base text-muted-foreground">{translateMessage('ui.noResultsFound_5d7b917c')}</p>
  </div>
)

const SectionEntry = ({ item, query }: { item: SectionItem; query: string }) => {
  const isActive = item.useActivate()

  if (!isActive) return null

  return <item.Component query={query} label={item.label} />
}

const SearchSectionContent = ({ query }: SearchSectionProps) => {
  const { hasVisibleSections } = useSectionVisibility()
  const hasQuery = query.trim().length > 0

  return (
    <>
      {sectionItems.map((item) => (
        <SectionEntry key={item.label} item={item} query={query} />
      ))}
      {hasQuery && !hasVisibleSections && <NoResults />}
    </>
  )
}

const SearchSection = ({ query }: SearchSectionProps) => {
  return (
    <SectionVisibilityProvider>
      <SearchSectionContent query={query} />
    </SectionVisibilityProvider>
  )
}

export default SearchSection
