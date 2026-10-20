import { render, screen } from '@testing-library/react'
import SettingsCard from '.'

describe('SettingsCard', () => {
  it('renders a shadcn Card shell with a Typography title and content area', () => {
    render(
      <SettingsCard title="签名方式" className="mt-4">
        Panel content
      </SettingsCard>,
    )

    const title = screen.getByText('签名方式')
    const card = title.closest('[data-slot="card"]')

    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('mt-4')
    expect(title).toHaveAttribute('data-slot', 'typography')
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('applies content classes to the shared two-column wrapper', () => {
    render(
      <SettingsCard title="环境变量" contentClassName="mb-4">
        Panel content
      </SettingsCard>,
    )

    expect(screen.getByText('Panel content').closest('[data-slot="settings-card-content"]')).toHaveClass('mb-4')
  })
})
