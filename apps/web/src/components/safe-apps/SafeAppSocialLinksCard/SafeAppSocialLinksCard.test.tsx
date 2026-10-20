import { SafeAppFeatures } from '@safe-global/store/gateway/types'
import { SafeAppSocialPlatforms, SafeAppAccessPolicyTypes } from '@safe-global/store/gateway/types'
import { type SafeApp as SafeAppData } from '@safe-global/store/gateway/AUTO_GENERATED/safe-apps'

import SafeAppSocialLinksCard from '@/components/safe-apps/SafeAppSocialLinksCard'
import { render, screen, waitFor } from '@/tests/test-utils'

const transactionBuilderSafeAppMock: SafeAppData = {
  id: 24,
  url: 'https://cloudflare-ipfs.com/ipfs/QmdVaZxDov4bVARScTLErQSRQoxgqtBad8anWuw3YPQHCs',
  name: '交易构建器',
  iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmdVaZxDov4bVARScTLErQSRQoxgqtBad8anWuw3YPQHCs/tx-builder.png',
  description: 'A Safe app to compose custom 笔交易',
  chainIds: ['1', '4', '56', '100', '137', '246', '73799'],
  provider: undefined,
  accessControl: {
    type: SafeAppAccessPolicyTypes.DomainAllowlist,
    value: ['https://gnosis-safe.io'],
  },
  tags: ['transaction-builder'],
  features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
  socialProfiles: [],
  developerWebsite: '',
  featured: false,
}

const developerWebsiteMock = 'http://transaction-builder-website'

const discordSocialProfileMock = {
  platform: SafeAppSocialPlatforms.DISCORD,
  url: 'http://tx-builder-discord',
}

const twitterSocialProfileMock = {
  platform: SafeAppSocialPlatforms.TWITTER,
  url: 'http://tx-builder-twitter',
}

const githubSocialProfileMock = {
  platform: SafeAppSocialPlatforms.GITHUB,
  url: 'http://tx-builder-github',
}

const telegramSocialProfileMock = {
  platform: SafeAppSocialPlatforms.TELEGRAM,
  url: 'http://tx-builder-telegram',
}

const socialProfilesMock = [
  discordSocialProfileMock,
  twitterSocialProfileMock,
  githubSocialProfileMock,
  telegramSocialProfileMock,
]

describe('SafeAppSocialLinksCard', () => {
  it('renders nothing if no social link is present in the safe app data', async () => {
    render(<SafeAppSocialLinksCard safeApp={transactionBuilderSafeAppMock} />)

    await waitFor(() => {
      expect(screen.queryByText('8379 应用 出现问题？')).not.toBeInTheDocument()
    })
  })

  it('renders the SafeAppSocialLinksCard component if a social link is present in the safe app data', async () => {
    const safeAppData = {
      ...transactionBuilderSafeAppMock,
      developerWebsite: developerWebsiteMock,
    }
    render(<SafeAppSocialLinksCard safeApp={safeAppData} />)

    await waitFor(() => {
      expect(screen.queryByText('8379 应用 出现问题？')).toBeInTheDocument()
      expect(screen.queryByText(developerWebsiteMock)).toBeInTheDocument()
    })
  })

  it('shows social links if they are present in the safe app data', async () => {
    const safeAppData = {
      ...transactionBuilderSafeAppMock,
      socialProfiles: socialProfilesMock,
    }
    render(<SafeAppSocialLinksCard safeApp={safeAppData} />)

    await waitFor(() => {
      expect(screen.queryByText('8379 应用 出现问题？')).toBeInTheDocument()
      expect(screen.getByLabelText('Discord 链接')).toBeInTheDocument()
      expect(screen.getByLabelText('Twitter 链接')).toBeInTheDocument()
      expect(screen.queryByLabelText('GitHub 链接')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Telegram 链接')).toBeInTheDocument()
    })
  })

  it('shows both social links & developer website if they are present in the safe app data', async () => {
    const safeAppData = {
      ...transactionBuilderSafeAppMock,
      socialProfiles: socialProfilesMock,
      developerWebsite: developerWebsiteMock,
    }
    render(<SafeAppSocialLinksCard safeApp={safeAppData} />)

    await waitFor(() => {
      expect(screen.queryByText('8379 应用 出现问题？')).toBeInTheDocument()
      expect(screen.queryByText(developerWebsiteMock)).toBeInTheDocument()
      expect(screen.getByLabelText('Discord 链接')).toBeInTheDocument()
      expect(screen.getByLabelText('Twitter 链接')).toBeInTheDocument()
      expect(screen.queryByLabelText('GitHub 链接')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Telegram 链接')).toBeInTheDocument()
    })
  })

  it('only renders the defined social links', async () => {
    const safeAppData = {
      ...transactionBuilderSafeAppMock,
      // only discord social link is present
      socialProfiles: [discordSocialProfileMock],
    }
    render(<SafeAppSocialLinksCard safeApp={safeAppData} />)

    await waitFor(() => {
      expect(screen.queryByText('8379 应用 出现问题？')).toBeInTheDocument()
      expect(screen.queryByLabelText('Discord 链接')).toBeInTheDocument()
      expect(screen.queryByLabelText('Twitter 链接')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('GitHub 链接')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Telegram 链接')).not.toBeInTheDocument()
    })
  })
  it('renders nothing when GitHub is the only available contact', () => {
    const { container } = render(
      <SafeAppSocialLinksCard
        safeApp={{
          ...transactionBuilderSafeAppMock,
          socialProfiles: [githubSocialProfileMock],
          developerWebsite: 'https://github.com/example',
        }}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
