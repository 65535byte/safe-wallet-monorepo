import { render, screen } from '@testing-library/react'
import AddLocalContact from '../AddLocalContact'
import { upsertAddressBookEntries } from '@/store/addressBookSlice'

const mockDispatch = jest.fn()

jest.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}))

type CapturedProps = {
  triggerLabel: string
  dialogTitle: string
  intro?: React.ReactNode
  successMessage: string
  successGroupKey: string
  submit: (item: unknown, sid: string) => Promise<{ error?: unknown }>
}

let lastProps: CapturedProps | undefined

jest.mock('../AddContactDialog', () => ({
  __esModule: true,
  default: (props: CapturedProps) => {
    lastProps = props
    return <div data-testid="dialog-stub">{props.triggerLabel}</div>
  },
}))

describe('AddLocalContact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    lastProps = undefined
  })

  it('passes the local-contact trigger label, title, intro, and success copy', () => {
    render(<AddLocalContact />)

    expect(lastProps?.triggerLabel).toBe('添加联系人')
    expect(lastProps?.dialogTitle).toBe('添加联系人')
    expect(lastProps?.intro).toBe('联系人保存在当前浏览器本地，之后可申请添加到工作空间共享通讯录。')
    expect(lastProps?.successMessage).toBe('联系人已添加')
    expect(lastProps?.successGroupKey).toBe('add-local-contact-success')
    expect(screen.getByTestId('dialog-stub')).toHaveTextContent('添加联系人')
  })

  it('submit writes the contact to the local address book and never calls the server', async () => {
    render(<AddLocalContact />)

    const result = await lastProps!.submit({ name: 'Bob', address: '0xdef', chainIds: ['1', '137'] }, 'unused')

    expect(result).toEqual({})
    expect(mockDispatch).toHaveBeenCalledWith(
      upsertAddressBookEntries({ chainIds: ['1', '137'], address: '0xdef', name: 'Bob' }),
    )
  })
})
