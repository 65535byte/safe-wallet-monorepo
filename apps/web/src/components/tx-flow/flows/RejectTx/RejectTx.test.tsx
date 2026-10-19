import { faker } from '@faker-js/faker'
import type Safe from '@safe-global/protocol-kit'
import { render } from '@/tests/test-utils'
import { createRejectTx } from '@/services/tx/tx-sender'
import { SafeTxContext, type SafeTxContextParams } from '@/components/tx-flow/SafeTxProvider'
import { TxFlowContext, initialContext } from '@/components/tx-flow/TxFlowProvider'
import { SafeScopeContext } from '@safe-global/views/components/tx-flow/safe-scope/context'
import type { SafeScopeContextValue } from '@safe-global/views/components/tx-flow/safe-scope/types'
import { safeScopeContextFor } from '@/tests/mocks/safeScope'
import RejectTx from './RejectTx'

jest.mock('@/services/tx/tx-sender', () => ({
  createRejectTx: jest.fn(() => Promise.resolve({})),
}))

jest.mock('@/components/tx/ReviewTransactionV2', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <div data-testid="review-tx">{children}</div>,
}))

const mockCreateRejectTx = createRejectTx as jest.MockedFunction<typeof createRejectTx>

const TX_NONCE = faker.number.int({ min: 1, max: 100000 })

const renderRejectTx = (scope?: SafeScopeContextValue) => {
  const safeTxValue = {
    setSafeTx: jest.fn(),
    setSafeTxError: jest.fn(),
    setNonce: jest.fn(),
  } as unknown as SafeTxContextParams

  render(
    <SafeScopeContext.Provider value={scope}>
      <TxFlowContext.Provider value={{ ...initialContext, txNonce: TX_NONCE }}>
        <SafeTxContext.Provider value={safeTxValue}>
          <RejectTx onSubmit={jest.fn()} />
        </SafeTxContext.Provider>
      </TxFlowContext.Provider>
    </SafeScopeContext.Provider>,
  )

  return { safeTxValue }
}

const scopeTarget = () => ({ chainId: faker.string.numeric(3), safeAddress: faker.finance.ethereumAddress() })

describe('RejectTx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates the rejection for the nonce with the URL Safe outside a scope', () => {
    const { safeTxValue } = renderRejectTx()

    expect(safeTxValue.setNonce).toHaveBeenCalledWith(TX_NONCE)
    expect(mockCreateRejectTx).toHaveBeenCalledWith(TX_NONCE, undefined)
  })

  it('creates the rejection with the SDK of the Safe scope it is opened in', () => {
    const context = safeScopeContextFor(scopeTarget())
    const scope = { ...context, scope: context.scope && { ...context.scope, sdk: {} as Safe } }

    renderRejectTx(scope)

    expect(mockCreateRejectTx).toHaveBeenCalledWith(TX_NONCE, scope.scope)
  })

  it('waits for the scoped Safe SDK before creating the rejection', () => {
    renderRejectTx(safeScopeContextFor(scopeTarget()))

    expect(mockCreateRejectTx).not.toHaveBeenCalled()
  })
})
