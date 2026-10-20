import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingLayout from '../OnboardingLayout'
import { AppRoutes } from '@/config/routes'

jest.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => false,
}))

describe('OnboardingLayout logo', () => {
  it('renders the logo as a link to the workspace list by default', () => {
    render(<OnboardingLayout main={<div />} sidePanel={<div />} />)

    const logo = screen.getByRole('link', { name: '返回工作空间' })
    expect(logo).toHaveAttribute('href', AppRoutes.welcome.spaces)
  })

  it('renders the logo as a button that invokes onLogoClick when provided', async () => {
    const onLogoClick = jest.fn()
    render(<OnboardingLayout main={<div />} sidePanel={<div />} onLogoClick={onLogoClick} />)

    expect(screen.queryByRole('link', { name: '返回工作空间' })).not.toBeInTheDocument()
    const logo = screen.getByRole('button', { name: '返回工作空间' })

    await userEvent.click(logo)
    expect(onLogoClick).toHaveBeenCalledTimes(1)
  })
})
