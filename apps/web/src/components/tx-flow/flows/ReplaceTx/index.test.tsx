import { faker } from '@faker-js/faker'
import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { mockSetTxFlow, safeScopeContextFor, TxModalWithScope, unwrapScopedFlow } from '@/tests/mocks/safeScope'
import TokenTransferFlow from '../TokenTransfer'
import RejectTx from '../RejectTx'
import ReplaceTxMenu from '.'

jest.mock('@/components/tx-flow/common/TxLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
jest.mock('@/hooks/useTxQueue', () => ({
  ...jest.requireActual('@/hooks/useTxQueue'),
  useQueuedTxByNonce: jest.fn(() => []),
}))
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  default: jest.fn(() => ({ configs: [] })),
  useChain: jest.fn(),
  useCurrentChain: jest.fn(),
  useHasFeature: jest.fn(() => false),
}))

describe('ReplaceTxMenu', () => {
  const txNonce = faker.number.int({ max: 100 })
  const target = { chainId: faker.string.numeric(5), safeAddress: faker.finance.ethereumAddress() }

  const choose = (title: string, scope?: ReturnType<typeof safeScopeContextFor>) => {
    const setTxFlow = mockSetTxFlow()
    render(
      <TxModalWithScope setTxFlow={setTxFlow} scope={scope}>
        <ReplaceTxMenu txNonce={txNonce} />
      </TxModalWithScope>,
    )
    fireEvent.click(screen.getByText(title))
    expect(setTxFlow).toHaveBeenCalledTimes(1)
    return unwrapScopedFlow(setTxFlow.mock.calls[0][0])
  }

  it.each([
    ['Reject transaction', RejectTx],
    ['Replace with another transaction', TokenTransferFlow],
  ])('opens "%s" unwrapped on a Safe-level page', (title, Flow) => {
    const { flow, target: flowTarget } = choose(title)

    expect(flow?.type).toBe(Flow)
    expect(flow?.props).toEqual({ txNonce })
    expect(flowTarget).toBeUndefined()
  })

  it.each([
    ['Reject transaction', RejectTx],
    ['Replace with another transaction', TokenTransferFlow],
  ])('opens "%s" inside the SafeScope the menu was opened in', (title, Flow) => {
    const { flow, target: flowTarget } = choose(title, safeScopeContextFor(target))

    expect(flow?.type).toBe(Flow)
    expect(flowTarget).toEqual(target)
  })
})
