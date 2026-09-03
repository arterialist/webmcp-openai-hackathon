import {
  ArrowUpRight,
  AudioWaveform,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Heart,
  Home,
  LayoutDashboard,
  Link,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Type,
  User,
  Waves,
  Wrench,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

export type IconName =
  | 'arrow-up-right'
  | 'bookmark'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'close'
  | 'comment'
  | 'compass'
  | 'edit'
  | 'heart'
  | 'home'
  | 'layout'
  | 'link'
  | 'menu'
  | 'mic'
  | 'more'
  | 'moon'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'settings'
  | 'share'
  | 'spark'
  | 'sun'
  | 'tool'
  | 'type'
  | 'trash'
  | 'user'
  | 'waveform'

const iconMap: Record<IconName, LucideIcon> = {
  'arrow-up-right': ArrowUpRight,
  bookmark: Bookmark,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  close: X,
  comment: MessageCircle,
  compass: Compass,
  edit: Pencil,
  heart: Heart,
  home: Home,
  layout: LayoutDashboard,
  link: Link,
  menu: Menu,
  mic: Mic,
  more: MoreHorizontal,
  moon: Moon,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  share: Share2,
  spark: Sparkles,
  sun: Sun,
  tool: Wrench,
  type: Type,
  trash: Trash2,
  user: User,
  waveform: AudioWaveform,
}

export interface IconProps extends Omit<LucideProps, 'size'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: IconProps) {
  const Component = iconMap[name]
  return <Component {...props} aria-hidden="true" size={size} strokeWidth={strokeWidth} />
}

export function WaveIcon({ size = 18, ...props }: Omit<LucideProps, 'size'> & { size?: number }) {
  return <Waves {...props} aria-hidden="true" size={size} strokeWidth={1.8} />
}
