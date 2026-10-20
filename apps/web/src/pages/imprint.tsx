import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { Link } from '@safe-global/views/components/ui/link'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'
import { BRAND_NAME } from '@/config/constants'

const SafeImprint = () => (
  <div>
    <Typography variant="h1" className="mb-4">
      {translateMessage('ui.imprintDisclaimer_05a95ab6')}
    </Typography>
    <Typography variant="h3" className="mb-4">
      {translateMessage('ui.informationInAccordanceWithSectionOf_05a4acc6')}
    </Typography>
    <Typography className="mb-4">
      Safe Labs GmbH
      <br />
      Unter den Linden 10
      <br />
      {translateMessage('ui.berlinGermany_89d7f256')}
      <br />
    </Typography>
    <Typography className="mb-8">
      {translateMessage('ui.managingDirectorRahulRumalla_fea6ca71')}
      <br />
      {translateMessage('ui.responsibleForContentRahulRumalla_1aeff98d')}
      <br />
      {translateMessage('ui.contact_bb7902f1')}
      <Link render={<NextLink href="mailto:info@safe.global" />}>
        {translateMessage('ui.emailAddressInfoSafeGlobal_2a5805d4')}
      </Link>
      <br />
      {translateMessage('ui.commercialRegisterMaintainedByAmtsgerichtCharlottenburg_a5b6b919')}
      <br />
      {translateMessage('ui.registerNumberHRB_c92e1b91')}
    </Typography>
    <Typography variant="h3" className="mb-4">
      {translateMessage('ui.disclaimer_7271ee86')}
    </Typography>
    <Typography className="mb-2">
      <strong>{translateMessage('ui.accountabilityForContent_c243d1f2')}</strong>
    </Typography>
    <Typography className="mb-4">{translateMessage('ui.theContentsOfOurPagesHave_21f19199')}</Typography>
    <Typography className="mb-2">
      <strong>{translateMessage('ui.accountabilityForLinks_41909d6f')}</strong>
    </Typography>
    <Typography className="mb-4">{translateMessage('ui.responsibilityForTheContentOfExternal_4ecf1a6d')}</Typography>
    <Typography className="mb-2">
      <strong>{translateMessage('ui.copyright_4a243b8c')}</strong>
    </Typography>
    <Typography>{translateMessage('ui.thisWebsiteAndTheirContentsAre_78e63b05')}</Typography>
  </div>
)

const Imprint: NextPage = () => {
  const isOfficialHost = useIsOfficialHost()

  return (
    <>
      <Head>
        <title>{translateMessage('ui.imprint_a2ead25b', { p0: BRAND_NAME })}</title>
      </Head>

      <main>{isOfficialHost && <SafeImprint />}</main>
    </>
  )
}

export default Imprint
