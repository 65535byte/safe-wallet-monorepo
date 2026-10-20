import { fireEvent, render, screen } from '@/tests/test-utils'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import CsvTxExportButton from '../index'
import * as csvExportQueries from '@safe-global/store/gateway/AUTO_GENERATED/csv-export'

jest.mock('@/services/analytics', () =>
  (
    jest.requireActual('@safe-global/test/mocks/analytics') as { createAnalyticsMock: () => object }
  ).createAnalyticsMock(),
)

let mockIsOwnerOrProposer = true
jest.mock('@/components/common/OnlyOwnerOrProposer', () => {
  return function MockOnlyOwnerOrProposer({ children }: { children: (isOk: boolean) => React.ReactNode }) {
    return <>{children(mockIsOwnerOrProposer)}</>
  }
})

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>

describe('CsvTxExportButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsOwnerOrProposer = true

    jest.spyOn(csvExportQueries, 'useCsvExportGetExportStatusV1Query').mockImplementation(() => ({
      data: undefined,
      refetch: jest.fn(),
    }))
  })

  it('should track CSV_EXPORT_CLICKED event when export button is clicked', () => {
    const { getByText } = render(<CsvTxExportButton hasActiveFilter={false} />)

    const exportButton = getByText('导出')
    fireEvent.click(exportButton)

    expect(mockTrackEvent).toHaveBeenCalledWith(TX_LIST_EVENTS.CSV_EXPORT_CLICKED)
  })

  it('should render export button correctly', () => {
    const { getByText } = render(<CsvTxExportButton hasActiveFilter={false} />)

    expect(getByText('导出')).toBeInTheDocument()
  })

  it('should open CSV export modal when export button is clicked', () => {
    const { getByText } = render(<CsvTxExportButton hasActiveFilter={false} />)

    const exportButton = getByText('导出')
    fireEvent.click(exportButton)

    expect(screen.getByLabelText('日期范围')).toBeInTheDocument()
    expect(screen.getByText('CSV 包含所选时间段内的交易，可用于报告。')).toBeInTheDocument()
  })

  it('should pass hasActiveFilter prop to modal correctly', () => {
    const { getByText } = render(<CsvTxExportButton hasActiveFilter={true} />)

    const exportButton = getByText('导出')
    fireEvent.click(exportButton)

    expect(screen.getByText("交易 history filters won't apply here.")).toBeInTheDocument()
  })

  it('should disable export button when user is not owner or proposer', () => {
    mockIsOwnerOrProposer = false

    const { getByText } = render(<CsvTxExportButton hasActiveFilter={false} />)

    expect(getByText('导出')).toBeDisabled()
  })
})
