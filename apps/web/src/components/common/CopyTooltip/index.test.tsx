import { render } from '@/tests/test-utils'
import CopyTooltip from '.'

describe('CopyTooltip', () => {
  it('labels the copy trigger with the default tooltip text', () => {
    const { getByLabelText } = render(<CopyTooltip text="0x123">0x123</CopyTooltip>)

    expect(getByLabelText('复制到剪贴板')).toBeInTheDocument()
  })

  it('labels the copy trigger with a custom initial tooltip text', () => {
    const { getByLabelText } = render(
      <CopyTooltip text="0x123" initialToolTipText="Copy address">
        0x123
      </CopyTooltip>,
    )

    expect(getByLabelText('复制地址')).toBeInTheDocument()
  })
})
