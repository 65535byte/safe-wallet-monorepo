import { render } from '@/tests/test-utils'
import { BRAND_NAME } from '@/config/constants'
import MetaTags from '.'

describe('MetaTags branding', () => {
  it('uses the app name and Chinese description for sharing', () => {
    render(<MetaTags prefetchUrl="https://example.org" />)

    expect(document.querySelector('meta[name="og:title"]')).toHaveAttribute('content', BRAND_NAME)
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      `${BRAND_NAME} 是支持 Ethereum 及其他 EVM 网络的多签智能合约钱包。`,
    )
  })

  it('uses the supplied logo for browser and home screen icons', () => {
    render(<MetaTags prefetchUrl="https://example.org" />)

    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute('href', '/images/brand-logo.png')
    expect(document.querySelector('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/images/brand-logo.png')
  })
})
