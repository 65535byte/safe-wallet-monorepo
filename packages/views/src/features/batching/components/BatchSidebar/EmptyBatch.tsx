import { translateMessage } from '@safe-global/views/i18n'
import { type ReactNode } from 'react'
import EmptyBatchIcon from '@safe-global/views/assets/images/common/empty-batch.svg'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import AssetsIcon from '@safe-global/views/assets/images/sidebar/assets.svg'
import AppsIcon from '@safe-global/views/assets/images/apps/apps-icon.svg'
import SettingsIcon from '@safe-global/views/assets/images/sidebar/settings.svg'
import { Typography } from '@safe-global/views/components/ui/typography'

const EmptyBatch = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full max-w-full flex-col items-center px-2 py-6 text-center sm:px-4">
    {/* fill-current restores what MUI's SvgIcon used to supply. Three of this illustration's six
        paths carry no fill of their own, and the file's root is `fill="none"` — under SvgIcon they
        inherited its `fill: currentColor`, but rendered bare they came out invisible, so the parcel,
        ring and sparkle around the arrow simply vanished. A class beats the attribute, and the three
        paths that do set `illustration-*-fill` keep their own colours. */}
    <EmptyBatchIcon className="size-[110px] fill-current text-[var(--color-border-main)]" />

    <Typography variant="h4" className="mt-4 font-bold">
      {translateMessage('ui.addAnInitialTransactionToThe_7fcb5a49')}
    </Typography>

    <Typography variant="paragraph-small" className="block mt-4 mb-8 max-w-md px-2 [text-wrap:balance] sm:px-4">
      {translateMessage('ui.saveGasAndSignaturesByAdding_0a692833')}
    </Typography>

    {children}

    <Typography variant="paragraph-small" className="block mt-12 w-full text-[var(--color-border-main)]">
      <span className="mb-2 block">
        <InfoIcon className="mx-auto size-6" />
      </span>

      <b>{translateMessage('ui.whatTypeOfTransactionsCanYou_b13c93df')}</b>

      <span className="mt-6 flex flex-wrap justify-center gap-6 sm:gap-12">
        <span className="min-w-[120px]">
          <AssetsIcon className="mx-auto size-6" />
          <span className="mt-1 block">{translateMessage('ui.tokenAndNFTTransfers_6c02b5b2')}</span>
        </span>

        <span className="min-w-[120px]">
          <AppsIcon className="mx-auto size-6" />
          <span className="mt-1 block">{translateMessage('ui.appTransactions_cc8987ca')}</span>
        </span>

        <span className="min-w-[120px]">
          <SettingsIcon className="mx-auto size-6" />
          <span className="mt-1 block">{translateMessage('ui.accountSettings_32b79ce7')}</span>
        </span>
      </span>
    </Typography>
  </div>
)

export default EmptyBatch
