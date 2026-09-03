export type PageId = 'home' | 'profile' | 'saved'
export type FeedFilterId = 'for-you' | 'saved' | 'following'
export type PaletteId = 'paper' | 'lichen' | 'night'
export type DensityId = 'airy' | 'balanced' | 'dense'
export type RadiusId = 'crisp' | 'soft' | 'round'
export type FontFamilyId = 'geist' | 'serif' | 'mono'
export type SurfaceStyleId = 'flat' | 'lined' | 'lifted'
export type GridStyleId = 'none' | 'blueprint' | 'ruled'
export type ShadowStyleId = 'none' | 'soft' | 'strong'
export type PostLayoutId = 'standard' | 'compact' | 'magazine'
export type ArtworkPositionId = 'right' | 'left'
export type HomeBlockId = 'hero' | 'quote' | 'feed'
export type CustomizationBlockId =
  | 'sidebar'
  | 'topbar'
  | 'home-topline'
  | 'home-hero'
  | 'home-quote'
  | 'home-feed'
  | 'agent-rail'
  | 'profile-topline'
  | 'profile-cover'
  | 'profile-bio'
  | 'profile-stats'
  | 'post-artwork'
  | 'post-tags'
  | 'post-actions'
  | 'reading-times'
  | 'post-excerpt'
  | 'post-author'
  | 'post-published'
  | 'reader-actions'
  | 'profile-interests'
  | 'hero-surface'
  | 'rail-status'
  | 'rail-tools'
  | 'feed-end'

export interface ColorOverrides {
  background?: string
  surface?: string
  surfaceRaised?: string
  ink?: string
  muted?: string
  border?: string
  brand?: string
  brandSoft?: string
  accent?: string
  accentSoft?: string
  success?: string
  warning?: string
  error?: string
}

export interface CopySettings {
  brandName: string
  brandKicker: string
  heroKicker: string
  heroTitle: string
  heroEmphasis: string
  heroLede: string
  quoteText: string
  quoteSource: string
  railTitle: string
  railDescription: string
}

export interface ArticleDraft {
  title: string
  excerpt: string
  body: string
  tags: string[]
}

export interface ArticleEditorState {
  mode: 'create' | 'edit'
  postId: string | null
  draft: ArticleDraft
  canPublish: boolean
}

export interface ArticlePatch {
  title?: string
  excerpt?: string
  body?: string
  tags?: string[]
  artwork?: Post['artwork']
  accent?: string
}

export interface ThemeSettings {
  palette: PaletteId
  density: DensityId
  radius: RadiusId
  typeScale: number
  contentWidth: number
  showAgentRail: boolean
  showReadingTimes: boolean
  reduceMotion: boolean
  fontFamily: FontFamilyId
  displayFont: FontFamilyId
  bodySize: number
  lineHeight: number
  letterSpacing: number
  headingWeight: number
  bodyWeight: number
  sidebarWidth: number
  railWidth: number
  pagePadding: number
  topbarPadding: number
  sidebarPadding: number
  sectionGap: number
  feedGap: number
  railGap: number
  groupGap: number
  heroPadding: number
  quotePadding: number
  readerPadding: number
  sheetPadding: number
  controlHeight: number
  buttonPadding: number
  layoutGap: number
  postColumnGap: number
  cardPadding: number
  artworkWidth: number
  controlRadius: number
  surfaceRadius: number
  borderWidth: number
  shadowStyle: ShadowStyleId
  gridStyle: GridStyleId
  gridSize: number
  gridOpacity: number
  postLayout: PostLayoutId
  artworkPosition: ArtworkPositionId
  surfaceStyle: SurfaceStyleId
  showSidebar: boolean
  showTopbar: boolean
  showHomeTopline: boolean
  showHomeHero: boolean
  showQuote: boolean
  showHomeFeed: boolean
  showSidebarFooter: boolean
  showPostArtwork: boolean
  showPostTags: boolean
  showPostActions: boolean
  showPostExcerpt: boolean
  showPostAuthor: boolean
  showPostPublished: boolean
  showReaderActions: boolean
  showProfileTopline: boolean
  showProfileCover: boolean
  showProfileBio: boolean
  showProfileStats: boolean
  showProfileInterests: boolean
  showHeroSurface: boolean
  showRailStatus: boolean
  showRailTools: boolean
  showFeedEnd: boolean
  homeOrder: HomeBlockId[]
  navOrder: PageId[]
  customColors: ColorOverrides
  copy: CopySettings
}

export interface UserProfile {
  name: string
  handle: string
  pronouns: string
  bio: string
  location: string
  website: string
  interests: string[]
  following: number
  followers: number
  posts: number
}

export interface Post {
  id: string
  author: string
  handle: string
  avatar: string
  published: string
  title: string
  excerpt: string
  body: string
  tags: string[]
  readTime: number
  accent: string
  artwork: 'grid' | 'orbit' | 'paper' | 'signal' | 'sun'
  saved: boolean
  liked: boolean
  likes: number
  comments: number
}

export interface AppSnapshot {
  page: PageId
  feedFilter: FeedFilterId
  selectedPostId: string | null
  searchQuery: string
  theme: ThemeSettings
  profile: UserProfile
  posts: Post[]
  voiceConnected: boolean
}
