import type { Meta, StoryObj } from '@storybook/react'
import LanguageSelector from './index'

const meta = {
  title: 'Components/LanguageSelector',
  component: LanguageSelector,
} satisfies Meta<typeof LanguageSelector>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
