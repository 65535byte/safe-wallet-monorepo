import type { ReactElement } from 'react'
import { cn } from '@safe-global/views/utils/cn'
import css from './SafeLogoHalo.module.css'

/** The Safe logo on its brand-green halo, as the full-page load and error states show it. */
const SafeLogoHalo = (): ReactElement => (
  <span className="relative flex items-center justify-center">
    <span aria-hidden className={cn('absolute size-40 rounded-full', css.halo)} />
    <img src="/images/brand-logo.png" alt="" className="size-[72px] rounded-xl object-contain" />
  </span>
)

export default SafeLogoHalo
