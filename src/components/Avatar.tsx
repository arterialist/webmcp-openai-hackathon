import { Avatar as AvatarPrimitive, AvatarFallback } from '@/components/ui/avatar'

interface AvatarProps {
  initials: string
  size?: 'small' | 'medium' | 'large'
  tone?: 'brand' | 'coral' | 'sand' | 'moss'
}

export function Avatar({ initials, size = 'medium', tone = 'brand' }: AvatarProps) {
  const avatarSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'default'
  return (
    <AvatarPrimitive size={avatarSize} className={`avatar avatar-${size} avatar-${tone}`}>
      <AvatarFallback>{initials}</AvatarFallback>
    </AvatarPrimitive>
  )
}
