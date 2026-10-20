import { translateMessage } from '@/i18n'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import ModalDialog from '@/components/common/ModalDialog'

interface CaptchaModalProps {
  open: boolean
  onWidgetContainerReady: (container: HTMLDivElement | null) => void
  error?: Error | null
  onRetry?: () => void
}

const CaptchaModal = ({ open, onWidgetContainerReady, error, onRetry }: CaptchaModalProps) => {
  return (
    <ModalDialog
      open={open}
      hideChainIndicator
      // Keep mounted so the widget container stays in DOM for Turnstile to render into
      keepMounted
    >
      <div className="p-6">
        <div className="flex flex-col items-center gap-6 pt-8 pb-6">
          <img
            src="/images/brand-logo.png"
            alt={translateMessage('ui.safeLogo_9a51e835')}
            className="size-14 rounded-lg object-contain"
          />

          <div className="text-center">
            <Typography variant="h4" align="center" className="mb-2 font-bold">
              {translateMessage('ui.letUsKnowItSYou_88966829')}
            </Typography>

            <Typography
              variant="paragraph-small"
              align="center"
              className="mx-auto max-w-[360px] text-muted-foreground"
            >
              {translateMessage('ui.aQuickCheckToConfirmYou_14119c82')}
            </Typography>
          </div>

          {error ? (
            <>
              <Typography variant="paragraph-small" className="text-destructive">
                {translateMessage('ui.verificationFailedPleaseTryAgain_cd0eb2b1')}
              </Typography>

              {onRetry && <Button onClick={onRetry}>{translateMessage('ui.retry_2cd6945d')}</Button>}
            </>
          ) : null}

          <div ref={onWidgetContainerReady} />
        </div>
      </div>
    </ModalDialog>
  )
}

export default CaptchaModal
