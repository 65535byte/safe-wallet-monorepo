import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode } from 'react'
import { DISALLOWED_CHARACTER_MESSAGE, DISALLOWED_CHARACTER_SHORT_MESSAGE } from '@safe-global/utils/validation/names'
import NameInput from './index'

const Wrapper = ({ children, defaultName = '' }: { children: ReactNode; defaultName?: string }) => {
  const methods = useForm({ mode: 'onChange', defaultValues: { name: defaultName } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('NameInput', () => {
  describe('without validateCharset (legacy behavior)', () => {
    it('does not reject disallowed characters', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      // A plain disallowed charset character (not script injection, which the shadcn Input sanitizes separately).
      fireEvent.change(input, { target: { value: 'Alice~' } })

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.queryByText(DISALLOWED_CHARACTER_SHORT_MESSAGE)).not.toBeInTheDocument()
    })

    it('shows the "Maximum 50 symbols" label above 50 characters', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: 'a'.repeat(51) } })

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Maximum 50 symbols' })).toBeInTheDocument()
      })
    })

    it('trims the value on blur', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' }) as HTMLInputElement
      fireEvent.change(input, { target: { value: '  Alice  ' } })
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input.value).toBe('Alice')
      })
    })
  })

  describe('optional placeholder', () => {
    it('defaults to an "Optional" placeholder when not required and none is provided', () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" />
        </Wrapper>,
      )

      expect(screen.getByRole('textbox', { name: '名称' })).toHaveAttribute('placeholder', 'Optional')
    })

    it('keeps the provided placeholder when one is given', () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" placeholder="Luxury Sepolia Safe" />
        </Wrapper>,
      )

      expect(screen.getByRole('textbox', { name: '名称' })).toHaveAttribute('placeholder', 'Luxury Sepolia Safe')
    })

    it('does not add an "Optional" placeholder when the field is required', () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" required />
        </Wrapper>,
      )

      expect(screen.getByRole('textbox', { name: '名称' })).not.toHaveAttribute('placeholder')
    })
  })

  describe('with validateCharset', () => {
    it('rejects disallowed characters with a short label and full tooltip', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      // A plain disallowed charset character (not script injection, which the shadcn Input sanitizes separately).
      fireEvent.change(input, { target: { value: 'Alice~' } })

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(input).toHaveAccessibleName('名称')
      expect(screen.getByTitle(DISALLOWED_CHARACTER_MESSAGE)).toBeInTheDocument()
      expect(screen.getByText(DISALLOWED_CHARACTER_SHORT_MESSAGE)).toBeInTheDocument()
    })

    it('announces the validation message and flags it as an error', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: 'Alice~' } })

      await waitFor(() => {
        expect(input).toHaveAccessibleDescription(DISALLOWED_CHARACTER_SHORT_MESSAGE)
      })
      expect(screen.getByRole('alert')).toHaveTextContent(DISALLOWED_CHARACTER_SHORT_MESSAGE)
    })

    it('announces a plain helper text without flagging an error', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset helperText="Visible to your space only" />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      expect(input).toHaveAccessibleDescription('Visible to your space only')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('accepts a valid UTF-8 name', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: 'José' } })

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.queryByText(DISALLOWED_CHARACTER_SHORT_MESSAGE)).not.toBeInTheDocument()
    })

    it('enforces minLength only when provided', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset minLength={3} />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: 'Jo' } })

      await waitFor(() => {
        expect(screen.getByText('Names must be，时间 least 3 character(s) long')).toBeInTheDocument()
      })
    })

    it('enforces maxLength', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset maxLength={5} />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: 'abcdef' } })

      await waitFor(() => {
        expect(screen.getByText('Names must be，时间 most 5 characters long')).toBeInTheDocument()
      })
    })

    it('sanitizes the value on blur', async () => {
      render(
        <Wrapper>
          <NameInput name="name" label="名称" validateCharset />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' }) as HTMLInputElement
      fireEvent.change(input, { target: { value: '  O’Brien  ' } })
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input.value).toBe("O'Brien")
      })
    })

    it('shows Required when a required field is cleared', async () => {
      render(
        <Wrapper defaultName="Alice">
          <NameInput name="name" label="名称" validateCharset required />
        </Wrapper>,
      )

      const input = screen.getByRole('textbox', { name: '名称' })
      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        expect(screen.getByText('必填')).toBeInTheDocument()
      })
      expect(input).toHaveAccessibleName('名称')
    })
  })
})
