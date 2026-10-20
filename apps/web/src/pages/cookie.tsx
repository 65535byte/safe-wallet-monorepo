import { getLanguage, translateMessage } from '@/i18n'
import type { ComponentProps } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'
import { BRAND_NAME } from '@/config/constants'
import ChineseCookiePolicy from '@/markdown/cookie/cookie.md'
import EnglishCookiePolicy from '@/markdown/cookie/cookie.en.md'
import type { MDXComponents } from 'mdx/types'
import CustomLink from '@safe-global/views/components/common/CustomLink'
import MarkdownContent from '@safe-global/views/components/common/MarkdownContent'
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@safe-global/views/components/ui/table'

const Table = (props: ComponentProps<typeof ShadcnTable>) => (
  <ShadcnTable {...props} className="border border-[black]" />
)
const Th = (props: ComponentProps<typeof TableHead>) => (
  <TableHead {...props} className="font-bold bg-[#fff] text-[black]" />
)
const Td = (props: ComponentProps<typeof TableCell>) => <TableCell {...props} />
const Tr = (props: ComponentProps<typeof TableRow>) => <TableRow {...props} />

const overrideComponents: MDXComponents = {
  a: CustomLink,
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: Tr,
  th: Th,
  td: Td,
}

const CookiePolicy: NextPage = () => {
  const isOfficialHost = useIsOfficialHost()
  const SafeCookiePolicy = getLanguage() === 'en' ? EnglishCookiePolicy : ChineseCookiePolicy

  return (
    <>
      <Head>
        <title>{translateMessage('ui.cookiePolicy_8faa608a', { p0: BRAND_NAME })}</title>
      </Head>

      <main style={{ lineHeight: '1.5' }}>
        {isOfficialHost && (
          <MarkdownContent>
            <SafeCookiePolicy components={overrideComponents} />
          </MarkdownContent>
        )}
      </main>
    </>
  )
}

export default CookiePolicy
