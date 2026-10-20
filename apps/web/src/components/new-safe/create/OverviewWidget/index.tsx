import { translateMessage } from '@/i18n'
import WalletOverview from '@/components/common/WalletOverview'
import useWallet from '@/hooks/wallets/useWallet'
import { Card } from '@safe-global/views/components/ui/card'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { ReactElement } from 'react'

import css from '@/components/new-safe/create/OverviewWidget/styles.module.css'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { NetworkLogosList } from '@/features/multichain'

const OverviewWidget = ({ safeName, networks }: { safeName: string; networks: Chain[] }): ReactElement | null => {
  const wallet = useWallet()
  const rows = [
    ...(wallet
      ? [{ title: translateMessage('ui.wallet_de75a284'), component: <WalletOverview wallet={wallet} /> }]
      : []),
    ...(safeName !== ''
      ? [{ title: translateMessage('ui.name_84f28b85'), component: <Typography>{safeName}</Typography> }]
      : []),
    ...(networks.length
      ? [
          {
            title: translateMessage('ui.networkS_3cb3ae11'),
            component: <NetworkLogosList networks={networks} />,
          },
        ]
      : []),
  ]

  return (
    <div className="col-span-12">
      <Card className="w-full">
        <div className={css.header}>
          <img
            src="/images/brand-logo.png"
            alt={translateMessage('ui.safeLogo_9a51e835')}
            className="size-6 rounded-sm object-contain"
          />
          <Typography variant="h4">{translateMessage('ui.yourAccountPreview_2f81a2dd')}</Typography>
        </div>
        {wallet ? (
          <div className={css.rows}>
            {rows.map((row) => (
              <div key={row.title} className={css.row}>
                <Typography variant="paragraph-small">{row.title}</Typography>
                {row.component}
              </div>
            ))}
          </div>
        ) : (
          <div className={css.rows}>
            <Typography
              variant="paragraph-small"
              align="center"
              className="mb-2 block w-full text-[var(--color-border-main)]"
            >
              {translateMessage('ui.connectYourWalletToContinue_29718850')}
            </Typography>
            <ConnectWalletButton fullWidth />
          </div>
        )}
      </Card>
    </div>
  )
}

export default OverviewWidget
