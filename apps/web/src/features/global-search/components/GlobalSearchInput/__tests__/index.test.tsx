import { render, screen } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import GlobalSearchInput from '../index'
import { makeStore } from '@/store'
import { Provider } from 'react-redux'
import { render as rtlRender } from '@testing-library/react'

describe('GlobalSearchInput', () => {
  it('renders the search button with placeholder text', () => {
    render(<GlobalSearchInput />)

    const button = screen.getByRole('button', { name: '搜索所有内容' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('搜索所有内容')
  })

  it('applies custom className', () => {
    render(<GlobalSearchInput className="max-w-md" />)

    const button = screen.getByRole('button', { name: '搜索所有内容' })
    expect(button).toHaveClass('max-w-md')
  })

  it('sets globalSearch.open to true on click', async () => {
    const store = makeStore()
    const user = userEvent.setup()

    rtlRender(
      <Provider store={store}>
        <GlobalSearchInput />
      </Provider>,
    )

    expect(store.getState().globalSearch.open).toBe(false)

    await user.click(screen.getByRole('button', { name: '搜索所有内容' }))

    expect(store.getState().globalSearch.open).toBe(true)
  })
})
