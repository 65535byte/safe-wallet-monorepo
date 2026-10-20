import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { safeEncodeURI } from '@/utils/url'

const getIframeContent = (url: string, height: number, borderRadius?: string, fallbackSrc?: string): string => {
  const style = borderRadius ? `border-radius: ${borderRadius};` : ''
  const fallback = fallbackSrc ? safeEncodeURI(fallbackSrc) : ''
  return translateMessage('ui.bodyStyleMarginOverflowHiddenDisplay_be8ef475', {
    p0: safeEncodeURI(url),
    p1: height,
    p2: style,
    p3: fallback,
  })
}

const IframeIcon = ({
  src,
  alt,
  width = 48,
  height = 48,
  borderRadius,
  fallbackSrc,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  borderRadius?: string
  fallbackSrc?: string
}): ReactElement => {
  return (
    <iframe
      title={alt}
      srcDoc={getIframeContent(src, height, borderRadius, fallbackSrc)}
      sandbox="allow-scripts"
      referrerPolicy="strict-origin"
      width={width}
      height={height}
      style={{ pointerEvents: 'none', border: 0, display: 'block' }}
      tabIndex={-1}
      loading="lazy"
    />
  )
}

export default IframeIcon
