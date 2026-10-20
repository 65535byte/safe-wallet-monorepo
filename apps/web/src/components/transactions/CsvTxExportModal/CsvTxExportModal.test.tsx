import { act } from 'react'
import { renderWithUserEvent, screen, fireEvent, waitFor } from '@/tests/test-utils'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import CsvTxExportModal from './index'
import * as csvExportQueries from '@safe-global/store/gateway/AUTO_GENERATED/csv-export'

jest.mock('@/services/analytics', () => ({
  ...(
    jest.requireActual('@safe-global/test/mocks/analytics') as { createAnalyticsMock: () => object }
  ).createAnalyticsMock(),
  MixpanelEventParams: {
    DATE_RANGE: 'Date Range',
  },
}))

jest.mock('@/hooks/useDarkMode', () => ({ useDarkMode: () => false }))

const mockLaunchFunction = jest.fn().mockImplementation(() => ({
  unwrap: jest.fn().mockResolvedValue({ id: 'test-job-id', status: 'SUBMITTED' }),
}))
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>
const onClose = jest.fn()
const onExport = jest.fn()

describe('CsvTxExportModal', () => {
  const renderComponent = (hasActiveFilter: boolean = false) =>
    renderWithUserEvent(<CsvTxExportModal onClose={onClose} onExport={onExport} hasActiveFilter={hasActiveFilter} />)

  const selectRange = async (user: ReturnType<typeof renderComponent>['user'], optionName: string) => {
    await user.click(screen.getByLabelText('日期范围'))
    await user.click(await screen.findByRole('option', { name: optionName }))
  }

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(csvExportQueries, 'useCsvExportLaunchExportV1Mutation').mockReturnValue([
      mockLaunchFunction,
      {
        isLoading: false,
        reset: jest.fn(),
      },
    ])
  })

  it('renders modal with message and disabled export button', () => {
    renderComponent()

    expect(screen.getByText('CSV 包含所选时间段内的交易，可用于报告。')).toBeTruthy()
    expect(screen.queryByText("交易 history filters won't apply here.")).not.toBeTruthy()
    expect(screen.getByLabelText('日期范围')).toBeTruthy()

    const exportBtn = screen.getByRole('button', { name: '导出' })
    expect(exportBtn).toBeDisabled()
  })

  it('enables export after selecting a preset range', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Last 30 days')

    expect(screen.getByRole('button', { name: '导出' })).toBeEnabled()
  })

  it('shows the range label on the closed trigger, not the raw value', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Last 30 days')

    expect(screen.getByLabelText('日期范围')).toHaveTextContent('Last 30 days')
  })

  it('requires both custom dates before enabling export', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Custom')

    const exportBtn = screen.getByRole('button', { name: '导出' })
    expect(exportBtn).toBeDisabled()

    await act(async () => fireEvent.change(screen.getByLabelText('从'), { target: { value: '01/02/2023' } }))
    expect(exportBtn).toBeDisabled()

    await act(async () => fireEvent.change(screen.getByLabelText('至'), { target: { value: '02/02/2023' } }))
    expect(exportBtn).toBeEnabled()

    expect(screen.getByText('最多可选择 12 个月。')).toBeInTheDocument()
  })

  it('validates from/to date order', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Custom')

    await act(async () => {
      fireEvent.change(screen.getByLabelText('从'), { target: { value: '02/02/2023' } })
      fireEvent.change(screen.getByLabelText('至'), { target: { value: '01/02/2023' } })
    })

    await waitFor(() => {
      expect(screen.getByText('必须早于结束日期')).toBeInTheDocument()
      expect(screen.getByText('必须晚于开始日期')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '导出' })).toBeDisabled()
    })
  })

  it('limits custom date range to 12 months', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Custom')

    expect(screen.getByText('最多可选择 12 个月。')).toBeInTheDocument()

    await act(async () => {
      fireEvent.change(screen.getByLabelText('从'), { target: { value: '01/02/2022' } })
      fireEvent.change(screen.getByLabelText('至'), { target: { value: '02/03/2023' } })
    })

    await waitFor(() => {
      expect(screen.getByText('日期范围不能超过 12 个月。')).toBeInTheDocument()
      expect(screen.queryByText('最多可选择 12 个月。')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '导出' })).toBeDisabled()
    })
  })

  it('shows warning when filters are active', () => {
    renderComponent(true)

    expect(screen.getByText("交易 history filters won't apply here.")).toBeInTheDocument()
  })

  it('should track CSV_EXPORT_SUBMITTED event with DATE_RANGE parameter when form is submitted', async () => {
    const { user } = renderComponent()

    await selectRange(user, 'Last 30 days')

    const exportBtn = screen.getByRole('button', { name: '导出' })
    await act(async () => fireEvent.click(exportBtn))

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(TX_LIST_EVENTS.CSV_EXPORT_SUBMITTED, {
        [MixpanelEventParams.DATE_RANGE]: 'Last 30 days',
      })
    })
  })
})
