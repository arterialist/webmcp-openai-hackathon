import type { CSSProperties } from 'react'

interface ArtworkProps {
  variant: 'grid' | 'orbit' | 'paper' | 'signal' | 'sun'
  accent: string
  small?: boolean
}

export function Artwork({ variant, accent, small = false }: ArtworkProps) {
  return (
    <div className={`post-art art-${variant}${small ? ' post-art-small' : ''}`} style={{ '--art-accent': accent } as CSSProperties} aria-hidden="true">
      <span className="art-mark art-mark-one" />
      <span className="art-mark art-mark-two" />
      <span className="art-mark art-mark-three" />
      <span className="art-caption">commonplace / field note</span>
    </div>
  )
}
