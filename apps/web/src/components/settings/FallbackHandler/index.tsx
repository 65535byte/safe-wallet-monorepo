import { translateMessage } from '@/i18n'
import NextLink from 'next/link'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Link } from '@safe-global/views/components/ui/link'
import semverSatisfies from 'semver/functions/satisfies'
import type { ReactElement } from 'react'
import classnames from 'classnames'

import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { BRAND_NAME } from '@/config/constants'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { useFallbackHandlerName } from '@/hooks/useFallbackHandlerName'
import { useHasUntrustedFallbackHandler } from '@/hooks/useHasUntrustedFallbackHandler'
import css from '../TransactionGuards/styles.module.css'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { useIsTWAPFallbackHandler } from '@/features/swap'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

const FALLBACK_HANDLER_VERSION = '>=1.1.1'

export const FallbackHandlerWarning = ({
  message,
  txBuilderLinkPrefix = translateMessage('ui.itCanBeAlteredViaThe_a9f91b3b'),
}: {
  message: ReactElement | string
  txBuilderLinkPrefix?: string
}) => {
  const txBuilder = useTxBuilderApp()
  return (
    <>
      {message}
      {!!txBuilder && !!txBuilderLinkPrefix && (
        <>
          {` ${txBuilderLinkPrefix} `}
          <Link render={<NextLink href={txBuilder.link} />}>{translateMessage('ui.transactionBuilder_04499512')}</Link>.
        </>
      )}
    </>
  )
}

export const FallbackHandler = (): ReactElement | null => {
  const { safe } = useSafeInfo()
  const fallbackHandlerName = useFallbackHandlerName()
  const isTWAPFallbackHandler = useIsTWAPFallbackHandler()
  const isUntrusted = useHasUntrustedFallbackHandler()

  const supportsFallbackHandler = !!safe.version && semverSatisfies(safe.version, FALLBACK_HANDLER_VERSION)

  if (!supportsFallbackHandler) {
    return null
  }

  const hasFallbackHandler = !!safe.fallbackHandler

  const warning = !hasFallbackHandler ? (
    <FallbackHandlerWarning
      message={translateMessage('ui.theMayNotWorkCorrectlyAs_56bb35f3', { p0: BRAND_NAME })}
      txBuilderLinkPrefix={translateMessage('ui.itCanBeSetViaThe_98b44a7b')}
    />
  ) : isTWAPFallbackHandler ? (
    <>{translateMessage('ui.thisIsCoWSFallbackHandler_8130bcb9')}</>
  ) : isUntrusted ? (
    <FallbackHandlerWarning
      message={
        <>
          {translateMessage('ui.an_9d30959d')}
          <b>{translateMessage('ui.unofficial_35ccf315')}</b>{' '}
          {translateMessage('ui.fallbackHandlerIsCurrentlySet_1cfbda81')}
        </>
      }
    />
  ) : undefined

  return (
    <SettingsCard title={translateMessage('ui.fallbackHandler_f0282998')}>
      <div>
        <Typography>
          {translateMessage('ui.theFallbackHandlerAddsFallbackLogic_620eedbd')}{' '}
          <ExternalLink className="font-bold hover:text-muted-foreground" href={HelpCenterArticle.FALLBACK_HANDLER}>
            {translateMessage('ui.here_134b2f0e')}
          </ExternalLink>
        </Typography>

        <div
          className={classnames(css.guardDisplay, '!block', {
            [css.warning]: !hasFallbackHandler,
            [css.info]: hasFallbackHandler && isUntrusted,
          })}
        >
          {warning && (
            <Typography
              variant="paragraph-small"
              className={classnames('block w-full', { 'mb-2': hasFallbackHandler })}
            >
              {warning}
            </Typography>
          )}

          {safe.fallbackHandler && (
            <EthHashInfo
              shortAddress={false}
              name={safe.fallbackHandler.name || fallbackHandlerName}
              address={safe.fallbackHandler.value}
              customAvatar={safe.fallbackHandler.logoUri || undefined}
              showCopyButton
              hasExplorer
            />
          )}
        </div>
      </div>
    </SettingsCard>
  )
}
