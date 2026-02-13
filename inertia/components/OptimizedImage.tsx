interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean // true for LCP images
}

/**
 * Converts image URL to WebP equivalent
 * /uploads/wp-migration/news/photo.jpg → /uploads/wp-migration/news/photo.webp
 */
function toWebP(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, '.webp')
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  if (!src) {
    return (
      <div className={`bg-navy-dark/30 flex items-center justify-center ${className}`}>
        <span className="text-sky/50 text-sm">Sem imagem</span>
      </div>
    )
  }

  const webpSrc = toWebP(src)
  const isLocal = src.startsWith('/uploads/')

  return (
    <picture>
      {isLocal && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  )
}
