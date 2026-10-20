import { translateMessage } from '@/i18n'
import { useDropzone } from 'react-dropzone'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import FileUpload, { FileTypes } from '@safe-global/views/components/common/FileUpload'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { BRAND_NAME } from '@/config/constants'

const AcceptedMimeTypes = {
  'application/json': ['.json'],
}

export const ImportFileUpload = ({
  setFileName,
  setJsonData,
}: {
  setFileName: Dispatch<SetStateAction<string | undefined>>
  setJsonData: Dispatch<SetStateAction<string | undefined>>
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return
      }
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (!event.target) {
          return
        }
        if (typeof event.target.result !== 'string') {
          return
        }
        setFileName(file.name)
        setJsonData(event.target.result)
      }
      reader.readAsText(file)
    },
    [setFileName, setJsonData],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: AcceptedMimeTypes,
  })

  const onRemove = () => {
    setFileName(undefined)
    setJsonData(undefined)
  }

  return (
    <>
      <Typography>
        {translateMessage('ui.import_b58dbb7c')}
        {BRAND_NAME} {translateMessage('ui.dataByUploadingAFileIn_be787420')}
      </Typography>

      <FileUpload
        fileType={FileTypes.JSON}
        getRootProps={getRootProps}
        className="h-[228px]"
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        isDragReject={isDragReject}
        onRemove={onRemove}
      />

      <Typography>
        <InfoIcon className="mr-1 inline size-4 align-middle text-muted-foreground" />
        {translateMessage('ui.onlyJSONFilesExportedFromThe_497735fc')}
        {BRAND_NAME} {translateMessage('ui.canBeImported_756b46b6')}
      </Typography>
    </>
  )
}
