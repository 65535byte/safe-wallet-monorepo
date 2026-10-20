import { render, screen } from '@/tests/test-utils'
import { enUS } from 'react-day-picker/locale'
import { Calendar } from './calendar'

describe('Calendar locale', () => {
  it('uses simplified Chinese navigation labels by default', () => {
    render(<Calendar defaultMonth={new Date(2026, 9, 1)} />)

    expect(screen.getByRole('button', { name: '前往下个月' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '前往上个月' })).toBeInTheDocument()
  })

  it('honors an explicitly supplied locale', () => {
    render(<Calendar defaultMonth={new Date(2026, 9, 1)} locale={enUS} />)

    expect(screen.getByRole('button', { name: 'Go to the Next Month' })).toBeInTheDocument()
  })
})
