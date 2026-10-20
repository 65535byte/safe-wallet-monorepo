import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'

import Disclaimer from '@safe-global/views/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import madProps from '@/utils/mad-props'

// TODO: Use with swaps/staking
export function _DisclaimerWrapper({
  children,
  localStorageKey,
  widgetName,
  getLocalStorage,
}: {
  children: ReactElement
  localStorageKey: string
  widgetName: string
  getLocalStorage: typeof useLocalStorage
}): ReactElement | null {
  const [hasConsented = false, setHasConsented] = getLocalStorage<boolean>(localStorageKey)

  const onAccept = () => {
    setHasConsented(true)
  }

  if (!hasConsented) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Disclaimer
          title={translateMessage('ui.note_b1eff7f0')}
          content={<WidgetDisclaimer widgetName={widgetName} />}
          onAccept={onAccept}
          buttonText={translateMessage('ui.continue_a4bd8255')}
        />
      </div>
    )
  }

  return children
}

export const DisclaimerWrapper = madProps(_DisclaimerWrapper, {
  getLocalStorage: () => useLocalStorage,
})
