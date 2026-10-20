import { render, screen, renderWithUserEvent } from '@/tests/test-utils'
import { getLanguage, setLanguage } from '@/i18n'
import { reloadPage } from '@/utils/navigation'
import LanguageSelector from './index'

jest.mock('@/utils/navigation', () => ({ reloadPage: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  setLanguage('zh-CN')
})

afterEach(() => {
  jest.restoreAllMocks()
  setLanguage('zh-CN')
})

describe('LanguageSelector', () => {
  it('shows the current language', () => {
    render(<LanguageSelector />)
    expect(screen.getByRole('combobox', { name: '语言' })).toHaveTextContent('中文')
  })

  it('saves the new language and reloads static menus and messages', async () => {
    const { user } = renderWithUserEvent(<LanguageSelector />)
    await user.click(screen.getByRole('combobox', { name: '语言' }))
    await user.click(await screen.findByRole('option', { name: 'English' }))
    expect(getLanguage()).toBe('en')
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })

  it('does not reload when the current language is selected', async () => {
    const { user } = renderWithUserEvent(<LanguageSelector />)
    await user.click(screen.getByRole('combobox', { name: '语言' }))
    await user.click(await screen.findByRole('option', { name: '中文' }))
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('cannot change language while disabled', () => {
    render(<LanguageSelector disabled />)
    expect(screen.getByRole('combobox', { name: '语言' })).toBeDisabled()
  })

  it('shows an error instead of reloading when storage is unavailable', async () => {
    const { user } = renderWithUserEvent(<LanguageSelector />)
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable')
    })
    await user.click(screen.getByRole('combobox', { name: '语言' }))
    await user.click(await screen.findByRole('option', { name: 'English' }))
    expect(reloadPage).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('无法保存语言设置')
  })
})
