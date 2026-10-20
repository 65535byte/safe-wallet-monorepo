import { translateMessage } from '@/i18n'
import { useState } from 'react'
import type { ReactElement } from 'react'
import { Download, Info, Upload } from 'lucide-react'
import { useRouter } from 'next/router'

import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { exportAppData } from '@/components/settings/DataManagement'
import { ImportDialog } from '@/components/settings/DataManagement/ImportDialog'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import Track from '@/components/common/Track'
import { AppRoutes } from '@/config/routes'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@safe-global/views/utils/cn'

export const DataWidget = (): ReactElement => {
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [fileName, setFileName] = useState<string>()
  const [jsonData, setJsonData] = useState<string>()
  const addressBook = useAppSelector(selectAllAddressBooks)
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const router = useRouter()
  const isDarkMode = useDarkMode()
  const hasData = Object.keys(addressBook).length > 0 || Object.keys(addedSafes).length > 0
  const trackingLabel =
    router.pathname === AppRoutes.welcome.accounts ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <div className={cn('shadcn-scope flex flex-col items-center gap-2 py-6', isDarkMode && 'dark')}>
      <div className="flex items-center gap-1">
        <Typography variant="paragraph">
          {hasData
            ? translateMessage('ui.exportOrImportYourData_e493904e')
            : translateMessage('ui.importYourData_7171d6f1')}
        </Typography>

        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex cursor-default text-muted-foreground" />}>
            <Info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{translateMessage('ui.downloadOrUploadYourLocalData_8a5caf77')}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex w-full max-w-[240px] justify-center gap-4">
        {hasData && (
          <Track {...OVERVIEW_EVENTS.EXPORT_DATA} label={trackingLabel}>
            <Button variant="outline" className="flex-1" onClick={exportAppData}>
              <Download className="size-4" />
              {translateMessage('ui.export_9bb429ef')}
            </Button>
          </Track>
        )}

        <Track {...OVERVIEW_EVENTS.IMPORT_DATA} label={trackingLabel}>
          <Button
            data-testid="import-btn"
            variant="outline"
            className="flex-1"
            onClick={() => setImportModalOpen(true)}
          >
            <Upload className="size-4" />
            {translateMessage('ui.import_f0101b10')}
          </Button>
        </Track>
      </div>

      {importModalOpen && (
        <ImportDialog
          fileName={fileName}
          setFileName={setFileName}
          jsonData={jsonData}
          setJsonData={setJsonData}
          onClose={() => setImportModalOpen(false)}
        />
      )}
    </div>
  )
}
