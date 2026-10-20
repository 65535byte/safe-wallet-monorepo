import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode } from 'react'
import { chainBuilder } from '@/tests/builders/chains'
import NetworkInput from './index'

jest.mock('@/components/common/ChainIndicator', () => ({
  __esModule: true,
  default: ({ chainId }: { chainId: string }) => <span>Chain {chainId}</span>,
}))

const chainConfigs = [
  { ...chainBuilder().with({ chainId: '1', isTestnet: false }).build(), available: true },
  { ...chainBuilder().with({ chainId: '11155111', isTestnet: true }).build(), available: true },
]

const Wrapper = ({ children, defaultValue = '' }: { children: ReactNode; defaultValue?: string }) => {
  const methods = useForm({ mode: 'onChange', defaultValues: { network: defaultValue } })
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => null)}>
        {children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

describe('NetworkInput', () => {
  it('shows an "Optional" placeholder when not required and no network is selected', () => {
    render(
      <Wrapper>
        <NetworkInput name="network" chainConfigs={chainConfigs} />
      </Wrapper>,
    )

    expect(screen.getByText('选填')).toBeInTheDocument()
  })

  it('does not show an "Optional" placeholder when required', () => {
    render(
      <Wrapper>
        <NetworkInput name="network" required chainConfigs={chainConfigs} />
      </Wrapper>,
    )

    expect(screen.queryByText('选填')).not.toBeInTheDocument()
  })

  it('renders the chain indicator for the selected network', () => {
    render(
      <Wrapper defaultValue="1">
        <NetworkInput name="network" chainConfigs={chainConfigs} />
      </Wrapper>,
    )

    expect(screen.getByLabelText('网络')).toHaveTextContent('Chain 1')
    expect(screen.queryByText('选填')).not.toBeInTheDocument()
  })

  it('marks the field as invalid when required and submitted empty', async () => {
    render(
      <Wrapper>
        <NetworkInput name="network" required chainConfigs={chainConfigs} />
      </Wrapper>,
    )

    fireEvent.click(screen.getByText('提交'))

    await waitFor(() => {
      expect(screen.getByLabelText('网络')).toHaveAttribute('aria-invalid', 'true')
    })
    expect(screen.getByText('网络')).toHaveClass('text-destructive')
  })

  it('is not marked invalid when optional and submitted empty', async () => {
    render(
      <Wrapper>
        <NetworkInput name="network" chainConfigs={chainConfigs} />
      </Wrapper>,
    )

    fireEvent.click(screen.getByText('提交'))

    await waitFor(() => {
      expect(screen.getByText('网络')).not.toHaveClass('text-destructive')
    })
    expect(screen.getByLabelText('网络')).not.toHaveAttribute('aria-invalid')
  })
})
