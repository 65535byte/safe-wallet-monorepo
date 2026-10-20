import { translateMessage } from '@/i18n'
import type { ComponentType } from 'react'
import { useIsSpaceRoute } from '@/hooks/useIsSpaceRoute'
import { AccountsSection } from './sections/Accounts'
import { NavigateToSection } from './sections/NavigateTo'
import { TrustedSafesSection } from './sections/TrustedSafes'
import { useIsQualifiedSafe } from '@/features/spaces'

export interface SectionItemProps {
  query: string
  label: string
}

export interface SectionItem {
  label: string
  useActivate: () => boolean
  Component: ComponentType<SectionItemProps>
}

const useAlwaysActive = () => true

const useIsInSpace = () => {
  const isSpaceRoute = useIsSpaceRoute()
  const qualifiedSafe = useIsQualifiedSafe()

  return qualifiedSafe || isSpaceRoute
}

const useNotInSpace = () => {
  const qualifiedSafe = useIsQualifiedSafe()
  return !qualifiedSafe
}

export const sectionItems: SectionItem[] = [
  {
    label: translateMessage('ui.navigateTo_09f0ba66'),
    useActivate: useAlwaysActive,
    Component: NavigateToSection,
  },
  {
    label: translateMessage('ui.accounts_0ecf161b'),
    useActivate: useIsInSpace,
    Component: AccountsSection,
  },
  {
    label: translateMessage('ui.myAccounts_837c511d'),
    useActivate: useNotInSpace,
    Component: TrustedSafesSection,
  },
]
