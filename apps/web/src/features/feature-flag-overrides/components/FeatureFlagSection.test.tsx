import { render } from '@/tests/test-utils'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { FeatureFlagSection } from './FeatureFlagSection'
import type { FeatureFlagRowData } from '../hooks/useFeatureFlagEditorData'

const row = (feature: FEATURES): FeatureFlagRowData => ({
  feature,
  chainScope: 'off',
  configValue: false,
  override: undefined,
  effective: false,
  matchesCurrentChain: false,
})

describe('FeatureFlagSection', () => {
  it('renders nothing when there are no rows', () => {
    const { container } = render(<FeatureFlagSection title="所有功能开关" rows={[]} valueLabel="Remote value" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the title, count and rows', () => {
    const { getByText } = render(
      <FeatureFlagSection title="所有功能开关" rows={[row(FEATURES.EARN)]} valueLabel="Remote value" />,
    )
    expect(getByText('所有功能开关')).toBeInTheDocument()
    expect(getByText('1')).toBeInTheDocument()
    expect(getByText(FEATURES.EARN)).toBeInTheDocument()
  })

  // The bottom section's switch column shows what the config service delivered, not a local
  // override, so each section labels that column for itself.
  it('labels the value column per section', () => {
    const { getByText, queryByText, rerender } = render(
      <FeatureFlagSection title="所有功能开关" rows={[row(FEATURES.EARN)]} valueLabel="Remote value" />,
    )
    expect(getByText('远程值')).toBeInTheDocument()
    expect(queryByText('本地值')).not.toBeInTheDocument()

    rerender(<FeatureFlagSection title="本地覆盖" rows={[row(FEATURES.EARN)]} valueLabel="Local value" />)
    expect(getByText('本地值')).toBeInTheDocument()
    expect(queryByText('远程值')).not.toBeInTheDocument()
  })
})
