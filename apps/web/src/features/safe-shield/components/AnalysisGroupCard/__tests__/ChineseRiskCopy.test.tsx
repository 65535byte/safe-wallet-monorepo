import { render, screen } from '@/tests/test-utils'
import { ContractStatus, Severity, type AnalysisResult } from '@safe-global/utils/features/safe-shield/types'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { DelegateCallCardItem } from '../DelegateCallCardItem'
import { FallbackHandlerCardItem } from '../FallbackHandlerCardItem'

const result: AnalysisResult = {
  severity: Severity.WARN,
  type: ContractStatus.UNEXPECTED_DELEGATECALL,
  title: 'Unexpected delegate call',
  description: 'Transaction warning',
}

describe('Chinese transaction risk warnings', () => {
  it('explains delegate-call account changes and keeps the help destination', () => {
    render(<DelegateCallCardItem result={result} />)

    expect(screen.getByText('此交易会调用能够修改您 8379 账户的智能合约。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '了解更多' })).toHaveAttribute(
      'href',
      HelpCenterArticle.UNEXPECTED_DELEGATE_CALL,
    )
  })

  it('asks users to verify the fallback handler before proceeding', () => {
    const { container } = render(<FallbackHandlerCardItem result={result} />)

    expect(container).toHaveTextContent('继续前，请核实回退处理器安全可信。')
    expect(screen.getByRole('link', { name: '回退处理器' })).toHaveAttribute('href', HelpCenterArticle.FALLBACK_HANDLER)
  })
})
