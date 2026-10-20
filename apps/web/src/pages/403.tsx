import { translateMessage } from '@/i18n'
import { BRAND_NAME } from '@/config/constants'
import type { NextPage } from 'next'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { TERMS_URL } from '@safe-global/utils/config/constants'
import SafeLogo from '@/components/common/SafeLogo'

const Custom403: NextPage = () => {
  return (
    <main className="px-6 pt-[calc(var(--header-height)+1rem)]">
      <div className="fixed top-0 left-0 z-[1300] flex items-center px-6" style={{ height: 'var(--header-height)' }}>
        <SafeLogo />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        {translateMessage('ui.accessRestricted_403e6dcd')}
      </h1>
      <p>
        {BRAND_NAME} {translateMessage('ui.safe_2a000cb1')}{' '}
        <ExternalLink href={TERMS_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
          {translateMessage('ui.terms_0af7f334')}
        </ExternalLink>{' '}
        。
      </p>
    </main>
  )
}

export default Custom403
