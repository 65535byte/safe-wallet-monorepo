import { translateMessage } from '@/i18n'
import { undeployedSafesSlice } from '@/features/counterfactual/store'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import type { ReactElement, Dispatch, SetStateAction } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'
import { trackEvent, SETTINGS_EVENTS, OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'
import { safeAppsSlice } from '@/store/safeAppsSlice'
import { settingsSlice } from '@/store/settingsSlice'
import { FileListCard } from '@/components/settings/DataManagement/FileListCard'
import { useGlobalImportJsonParser } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import FileIcon from '@safe-global/views/assets/images/settings/data/file.svg'
import { ImportFileUpload } from '@/components/settings/DataManagement/ImportFileUpload'
import { showNotification } from '@/store/notificationsSlice'
import { visitedSafesSlice } from '@/store/visitedSafesSlice'

import css from './styles.module.css'

export const ImportDialog = ({
  onClose,
  fileName = '',
  setFileName,
  jsonData = '',
  setJsonData,
}: {
  onClose?: () => void
  fileName: string | undefined
  setFileName: Dispatch<SetStateAction<string | undefined>>
  jsonData: string | undefined
  setJsonData: Dispatch<SetStateAction<string | undefined>>
}): ReactElement => {
  const dispatch = useAppDispatch()
  const { addedSafes, addressBook, addressBookEntriesCount, settings, safeApps, undeployedSafes, visitedSafes, error } =
    useGlobalImportJsonParser(jsonData)

  const isDisabled =
    (!addedSafes && !addressBook && !settings && !safeApps && !undeployedSafes && !visitedSafes) || !!error

  const handleClose = () => {
    setFileName(undefined)
    setJsonData(undefined)
    onClose?.()
  }

  const handleImport = () => {
    if (addressBook) {
      dispatch(addressBookSlice.actions.setAddressBook(addressBook))
      trackEvent({
        ...SETTINGS_EVENTS.DATA.IMPORT_ADDRESS_BOOK,
        label: addressBookEntriesCount,
      })
    }
    if (addedSafes) {
      dispatch(addedSafesSlice.actions.setAddedSafes(addedSafes))
      trackEvent({
        ...OVERVIEW_EVENTS.IMPORT_DATA,
        label: OVERVIEW_LABELS.settings,
      })
    }

    if (settings) {
      dispatch(settingsSlice.actions.setSettings(settings))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_SETTINGS)
    }

    if (safeApps) {
      dispatch(safeAppsSlice.actions.setSafeApps(safeApps))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_SAFE_APPS)
    }

    if (undeployedSafes) {
      dispatch(undeployedSafesSlice.actions.addUndeployedSafes(undeployedSafes))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_UNDEPLOYED_SAFES)
    }

    if (visitedSafes) {
      dispatch(visitedSafesSlice.actions.setVisitedSafes(visitedSafes))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_VISITED_SAFES)
    }

    dispatch(
      showNotification({
        variant: 'success',
        groupKey: 'global-import-success',
        message: translateMessage('ui.successfullyImportedData_c5092241'),
      }),
    )

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle={translateMessage('ui.dataImport_ab54d6d8')} hideChainIndicator>
      <div className="p-6">
        {!jsonData || !fileName ? (
          <div className="mt-4">
            <ImportFileUpload setFileName={setFileName} setJsonData={setJsonData} />
          </div>
        ) : (
          <>
            <FileListCard
              avatar={
                <div className="rounded">
                  <FileIcon className="block size-4 fill-none" />
                </div>
              }
              title={<b>{fileName}</b>}
              className={css.header}
              addedSafes={addedSafes}
              addressBook={addressBook}
              settings={settings}
              safeApps={safeApps}
              visitedSafes={visitedSafes}
              undeployedSafes={undeployedSafes}
              error={error}
              showPreview
            />
            {!isDisabled && (
              <Alert variant="warning" outlined={false}>
                <AlertSeverityIcon variant="warning" />
                <AlertTitle className="font-bold">
                  {translateMessage('ui.overwriteYourCurrentData_94e5207a')}
                </AlertTitle>
                <AlertDescription>
                  {translateMessage('ui.thisActionWillOverwriteYourCurrently_e2958acc')}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between gap-2 p-6 pt-0">
        <Button data-testid="dialog-cancel-btn" variant="outline" onClick={handleClose}>
          {translateMessage('ui.cancel_d94a8eaf')}
        </Button>
        <Button data-testid="dialog-import-btn" onClick={handleImport} disabled={isDisabled}>
          {translateMessage('ui.import_f0101b10')}
        </Button>
      </div>
    </ModalDialog>
  )
}
