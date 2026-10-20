import { fireEvent } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { FEATURES } from '@safe-global/utils/utils/chains'
import * as editorData from '../hooks/useFeatureFlagEditorData'
import type { FeatureFlagRowData } from '../hooks/useFeatureFlagEditorData'
import { FeatureFlagEditor } from './FeatureFlagEditor'

const row = (feature: FEATURES, override?: boolean): FeatureFlagRowData => ({
  feature,
  chainScope: 'off',
  configValue: false,
  override,
  effective: override ?? false,
  matchesCurrentChain: false,
})

const mockData = (overridden: FeatureFlagRowData[], rest: FeatureFlagRowData[]) =>
  jest.spyOn(editorData, 'useFeatureFlagEditorData').mockReturnValue({ overridden, rest })

describe('FeatureFlagEditor', () => {
  afterEach(() => jest.restoreAllMocks())

  it('filters rows by the search query', () => {
    mockData([], [row(FEATURES.EARN), row(FEATURES.BRIDGE)])
    const { getByLabelText, getByText, queryByText } = render(<FeatureFlagEditor />)

    expect(getByText(FEATURES.EARN)).toBeInTheDocument()
    expect(getByText(FEATURES.BRIDGE)).toBeInTheDocument()

    fireEvent.change(getByLabelText('搜索开关'), { target: { value: 'earn' } })

    expect(getByText(FEATURES.EARN)).toBeInTheDocument()
    expect(queryByText(FEATURES.BRIDGE)).not.toBeInTheDocument()
  })

  it('explains that a search matched nothing', () => {
    mockData([], [row(FEATURES.EARN)])
    const { getByLabelText, getByText, queryByText } = render(<FeatureFlagEditor />)

    expect(queryByText('没有匹配的功能开关。')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('搜索开关'), { target: { value: 'nothing-matches-this' } })

    expect(getByText('没有匹配的功能开关。')).toBeInTheDocument()
    expect(queryByText('所有功能开关')).not.toBeInTheDocument()
  })

  it('does not show the empty search message when there are simply no flags', () => {
    mockData([], [])
    const { queryByText } = render(<FeatureFlagEditor />)

    expect(queryByText('没有匹配的功能开关。')).not.toBeInTheDocument()
  })

  it('keeps showing matches in one section when the other has none', () => {
    mockData([row(FEATURES.EARN, true)], [row(FEATURES.BRIDGE)])
    const { getByLabelText, getByText, queryByText } = render(<FeatureFlagEditor />)

    fireEvent.change(getByLabelText('搜索开关'), { target: { value: 'earn' } })

    expect(getByText('本地覆盖')).toBeInTheDocument()
    expect(queryByText('所有功能开关')).not.toBeInTheDocument()
    expect(queryByText('没有匹配的功能开关。')).not.toBeInTheDocument()
  })

  it('omits the local overrides section when there are none', () => {
    mockData([], [row(FEATURES.EARN)])
    const { queryByText } = render(<FeatureFlagEditor />)
    expect(queryByText('本地覆盖')).not.toBeInTheDocument()
    expect(queryByText('所有功能开关')).toBeInTheDocument()
  })

  it('renders no page chrome — the dialog shell owns the heading and reset action', () => {
    mockData([row(FEATURES.EARN, true)], [row(FEATURES.BRIDGE)])
    const { queryByRole } = render(<FeatureFlagEditor />)

    expect(queryByRole('heading')).not.toBeInTheDocument()
    expect(queryByRole('button', { name: '重置所有覆盖' })).not.toBeInTheDocument()
  })
})
