import { translateMessage } from '@safe-global/views/i18n'
import Image from 'next/image'
import { cn } from '@safe-global/views/utils/cn'

const ALT = translateMessage('ui.aWorkspaceFromWithItsAccounts_9da5bc9c')

const VARIANTS = {
  wide: 'aspect-[1141/268] rounded-t-[calc(2rem-4px)]',
  tall: 'aspect-[568/369] rounded-t-[calc(var(--radius-xl)-4px)]',
  compact: 'aspect-[632/244] rounded-t-[calc(var(--radius-xl)-4px)]',
}

const SafeProHero = ({ variant = 'wide' }: { variant?: keyof typeof VARIANTS }) => (
  <div className={cn('relative w-full overflow-hidden', VARIANTS[variant])}>
    <Image src="/images/brand-logo.png" alt={ALT} fill className="object-contain p-6" />
  </div>
)

export default SafeProHero
