import { render, screen, fireEvent } from '@/tests/test-utils'
import SimilarityConfirmDialog from './SimilarityConfirmDialog'
import type { SelectableSafe } from './useTrustedSafesModal.types'

const mockSafe: SelectableSafe = {
  chainId: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Test Safe',
  isPinned: false,
  isReadOnly: false,
  lastVisited: 0,
  isSelected: false,
  similarityGroup: '123456_5678',
}

describe('SimilarityConfirmDialog', () => {
  const defaultProps = {
    open: true,
    safe: mockSafe,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog when open', () => {
    render(<SimilarityConfirmDialog {...defaultProps} />)

    expect(screen.getByText('检测到相似地址')).toBeInTheDocument()
  })

  it('should show warning message', () => {
    render(<SimilarityConfirmDialog {...defaultProps} />)

    expect(screen.getByText(/similar to another safe/i)).toBeInTheDocument()
  })

  it('should display the safe address', () => {
    render(<SimilarityConfirmDialog {...defaultProps} />)

    expect(screen.getByText('已选择的 8379')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', () => {
    render(<SimilarityConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText(/我已了解，仍然继续/i))

    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<SimilarityConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('取消'))

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('should not render when closed', () => {
    render(<SimilarityConfirmDialog {...defaultProps} open={false} />)

    expect(screen.queryByText('检测到相似地址')).not.toBeInTheDocument()
  })
})
