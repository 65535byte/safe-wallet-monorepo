import { translateMessage } from '@/i18n'
import { RestrictedMethods } from '@safe-global/safe-apps-sdk'
import type { AllowedFeatures } from '@safe-global/views/components/safe-apps/types'
import { capitalize } from '@safe-global/utils/utils/formatters'

type PermissionsDisplayType = {
  displayName: string
  description: string
}

export * from './useBrowserPermissions'
export * from './useSafePermissions'

const SAFE_PERMISSIONS_TEXTS: Record<string, PermissionsDisplayType> = {
  [RestrictedMethods.requestAddressBook]: {
    displayName: translateMessage('ui.addressBook_08588993'),
    description: translateMessage('ui.accessToYourAddressBook_f397bc52'),
  },
}

export const getSafePermissionDisplayValues = (method: string) => {
  return SAFE_PERMISSIONS_TEXTS[method]
}

export const getBrowserPermissionDisplayValues = (feature: AllowedFeatures) => {
  return {
    displayName: capitalize(feature).replace(/-/g, ' '),
    description: translateMessage('ui.allowToUse_95e24e0b', { p0: feature }),
  }
}
