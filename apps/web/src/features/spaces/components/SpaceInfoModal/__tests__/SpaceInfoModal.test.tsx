import { render, screen, fireEvent } from '@testing-library/react'
import SpaceInfoModal from '../index'

describe('SpaceInfoModal', () => {
  it('renders the workspaces headline and benefits', () => {
    render(<SpaceInfoModal onClose={jest.fn()} />)

    expect(screen.getByText('团队共享一个工作空间。')).toBeInTheDocument()
    expect(screen.getByText('集中查看所有 8379')).toBeInTheDocument()
    expect(screen.getByText('按角色分配访问权限')).toBeInTheDocument()
    expect(screen.getByText('集中查看安全与审计信息')).toBeInTheDocument()
  })

  it('links to the workspaces help article', () => {
    render(<SpaceInfoModal onClose={jest.fn()} />)

    expect(screen.getByRole('link', { name: /了解更多/i })).toHaveAttribute(
      'href',
      expect.stringContaining('help.safe.global'),
    )
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn()
    render(<SpaceInfoModal onClose={onClose} />)

    fireEvent.click(screen.getAllByRole('button', { name: /关闭/i })[0])

    expect(onClose).toHaveBeenCalled()
  })
})
