import type { CSSProperties } from 'react'
import type { ArtworkPositionId, ColorOverrides, CopySettings, DensityId, FontFamilyId, GridStyleId, PaletteId, PostLayoutId, RadiusId, ShadowStyleId, SurfaceStyleId, ThemeSettings } from './types'

export interface PaletteTokens {
  bg: string
  surface: string
  raised: string
  ink: string
  muted: string
  border: string
  brand: string
  brandSoft: string
  accent: string
  accentSoft: string
  success: string
  warning: string
  error: string
}

export const paletteTokens: Record<PaletteId, PaletteTokens> = {
  paper: {
    bg: 'oklch(0.978 0.006 90)',
    surface: 'oklch(0.998 0.002 90)',
    raised: 'oklch(0.95 0.009 90)',
    ink: 'oklch(0.21 0.014 80)',
    muted: 'oklch(0.49 0.022 80)',
    border: 'oklch(0.875 0.012 90)',
    brand: 'oklch(0.405 0.095 168)',
    brandSoft: 'oklch(0.9 0.038 165)',
    accent: 'oklch(0.625 0.18 42)',
    accentSoft: 'oklch(0.935 0.058 51)',
    success: 'oklch(0.52 0.12 150)',
    warning: 'oklch(0.73 0.14 83)',
    error: 'oklch(0.56 0.17 26)',
  },
  lichen: {
    bg: 'oklch(0.965 0.025 112)',
    surface: 'oklch(0.99 0.014 109)',
    raised: 'oklch(0.92 0.06 112)',
    ink: 'oklch(0.27 0.04 112)',
    muted: 'oklch(0.52 0.05 111)',
    border: 'oklch(0.81 0.06 111)',
    brand: 'oklch(0.42 0.105 145)',
    brandSoft: 'oklch(0.86 0.08 142)',
    accent: 'oklch(0.63 0.18 35)',
    accentSoft: 'oklch(0.9 0.09 54)',
    success: 'oklch(0.5 0.14 145)',
    warning: 'oklch(0.72 0.15 81)',
    error: 'oklch(0.56 0.17 26)',
  },
  night: {
    bg: 'oklch(0.185 0.022 76)',
    surface: 'oklch(0.235 0.025 76)',
    raised: 'oklch(0.285 0.034 78)',
    ink: 'oklch(0.93 0.018 92)',
    muted: 'oklch(0.7 0.032 82)',
    border: 'oklch(0.38 0.035 80)',
    brand: 'oklch(0.72 0.1 166)',
    brandSoft: 'oklch(0.35 0.075 164)',
    accent: 'oklch(0.73 0.14 42)',
    accentSoft: 'oklch(0.36 0.08 42)',
    success: 'oklch(0.68 0.12 150)',
    warning: 'oklch(0.78 0.12 83)',
    error: 'oklch(0.7 0.14 26)',
  },
}

export const densityPresets: Record<DensityId, { sectionGap: number; feedGap: number; railGap: number; groupGap: number }> = {
  airy: { sectionGap: 56, feedGap: 24, railGap: 18, groupGap: 12 },
  balanced: { sectionGap: 40, feedGap: 16, railGap: 14, groupGap: 10 },
  dense: { sectionGap: 28, feedGap: 10, railGap: 10, groupGap: 8 },
}

export const radiusPresets: Record<RadiusId, { controlRadius: number; surfaceRadius: number }> = {
  crisp: { controlRadius: 8, surfaceRadius: 14 },
  soft: { controlRadius: 12, surfaceRadius: 18 },
  round: { controlRadius: 18, surfaceRadius: 24 },
} as const

export const defaultTheme: ThemeSettings = {
  palette: 'paper',
  density: 'balanced',
  radius: 'crisp',
  typeScale: 1,
  contentWidth: 68,
  showAgentRail: true,
  showReadingTimes: true,
  reduceMotion: false,
  fontFamily: 'geist',
  displayFont: 'geist',
  bodySize: 1,
  lineHeight: 1.5,
  letterSpacing: 0,
  headingWeight: 500,
  bodyWeight: 400,
  sidebarWidth: 232,
  railWidth: 280,
  pagePadding: 28,
  topbarPadding: 28,
  sidebarPadding: 14,
  sectionGap: 30,
  feedGap: 12,
  railGap: 12,
  groupGap: 9,
  heroPadding: 28,
  quotePadding: 18,
  readerPadding: 32,
  sheetPadding: 28,
  controlHeight: 40,
  buttonPadding: 12,
  layoutGap: 32,
  postColumnGap: 20,
  cardPadding: 20,
  artworkWidth: 162,
  controlRadius: 6,
  surfaceRadius: 18,
  borderWidth: 1,
  shadowStyle: 'soft',
  gridStyle: 'none',
  gridSize: 32,
  gridOpacity: 0.18,
  postLayout: 'standard',
  artworkPosition: 'right',
  surfaceStyle: 'lined',
  showSidebar: true,
  showTopbar: true,
  showHomeTopline: true,
  showHomeHero: true,
  showQuote: true,
  showHomeFeed: true,
  showSidebarFooter: true,
  showPostArtwork: true,
  showPostTags: true,
  showPostActions: true,
  showPostExcerpt: true,
  showPostAuthor: true,
  showPostPublished: true,
  showReaderActions: true,
  showProfileTopline: true,
  showProfileCover: true,
  showProfileBio: true,
  showProfileStats: true,
  showProfileInterests: true,
  showHeroSurface: true,
  showRailStatus: true,
  showRailTools: true,
  showFeedEnd: true,
  homeOrder: ['hero', 'quote', 'feed'],
  navOrder: ['home', 'saved', 'profile'],
  customColors: {},
  copy: {
    brandName: 'commonplace',
    brandKicker: 'a reading and publishing desk that adapts to you',
    heroKicker: 'Good to see you, {name}.',
    heroTitle: 'Keep the good',
    heroEmphasis: 'stuff close.',
    heroLede: 'Read what you saved, write new posts, and let your browser agent tune the workspace to how you think.',
    quoteText: 'Software should adapt to your attention and state of mind, not the other way around.',
    quoteSource: 'a note from your reading list',
    railTitle: 'Agent controls in this tab',
    railDescription: 'Read the page, search notes, change the layout, or draft a post. Review each agent action here.',
  },
}

const fontStacks: Record<FontFamilyId, string> = {
  geist: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
  serif: "Iowan Old Style, Baskerville, 'Times New Roman', serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, monospace",
}

const isPalette = (value: unknown): value is PaletteId => value === 'paper' || value === 'lichen' || value === 'night'
const isDensity = (value: unknown): value is DensityId => value === 'airy' || value === 'balanced' || value === 'dense'
const isRadius = (value: unknown): value is RadiusId => value === 'crisp' || value === 'soft' || value === 'round'
const isGridStyle = (value: unknown): value is GridStyleId => value === 'none' || value === 'blueprint' || value === 'ruled'
const isShadowStyle = (value: unknown): value is ShadowStyleId => value === 'none' || value === 'soft' || value === 'strong'
const isPostLayout = (value: unknown): value is PostLayoutId => value === 'standard' || value === 'compact' || value === 'magazine'
const isArtworkPosition = (value: unknown): value is ArtworkPositionId => value === 'right' || value === 'left'
const isFontFamily = (value: unknown): value is FontFamilyId => value === 'geist' || value === 'serif' || value === 'mono'
const isSurfaceStyle = (value: unknown): value is SurfaceStyleId => value === 'flat' || value === 'lined' || value === 'lifted'
function normalizeOrder<T extends string>(value: unknown, allowed: readonly T[], fallback: T[]): T[] {
  if (!Array.isArray(value)) return [...fallback]
  const order = value.filter((item): item is T => allowed.includes(item as T))
  return order.length === allowed.length && new Set(order).size === allowed.length ? [...order] : [...fallback]
}

function normalizeColors(value: unknown): ColorOverrides {
  if (!value || typeof value !== 'object') return {}
  const candidate = value as Record<string, unknown>
  const colors: ColorOverrides = {}
  for (const key of ['background', 'surface', 'surfaceRaised', 'ink', 'muted', 'border', 'brand', 'brandSoft', 'accent', 'accentSoft', 'success', 'warning', 'error'] as const) {
    if (typeof candidate[key] === 'string' && candidate[key].trim()) colors[key] = candidate[key].trim()
  }
  return colors
}

function normalizeCopy(value: unknown): CopySettings {
  if (!value || typeof value !== 'object') return { ...defaultTheme.copy }
  const candidate = value as Record<string, unknown>
  const copy = { ...defaultTheme.copy }
  for (const key of Object.keys(copy) as Array<keyof CopySettings>) {
    if (typeof candidate[key] === 'string' && candidate[key].trim()) copy[key] = candidate[key].trim().slice(0, 220)
  }
  return copy
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

export function normalizeThemeSettings(raw: unknown): ThemeSettings {
  const candidate = raw && typeof raw === 'object' ? raw as Partial<ThemeSettings> : {}
  const density = isDensity(candidate.density) ? candidate.density : defaultTheme.density
  const radius = isRadius(candidate.radius) ? candidate.radius : defaultTheme.radius
  const densityPreset = densityPresets[density]
  const radiusPreset = radiusPresets[radius]
  return {
    ...defaultTheme,
    palette: isPalette(candidate.palette) ? candidate.palette : defaultTheme.palette,
    density,
    radius,
    typeScale: boundedNumber(candidate.typeScale, defaultTheme.typeScale, 0.88, 1.12),
    contentWidth: boundedNumber(candidate.contentWidth, defaultTheme.contentWidth, 48, 78),
    showAgentRail: typeof candidate.showAgentRail === 'boolean' ? candidate.showAgentRail : defaultTheme.showAgentRail,
    showReadingTimes: typeof candidate.showReadingTimes === 'boolean' ? candidate.showReadingTimes : defaultTheme.showReadingTimes,
    reduceMotion: typeof candidate.reduceMotion === 'boolean' ? candidate.reduceMotion : defaultTheme.reduceMotion,
    fontFamily: isFontFamily(candidate.fontFamily) ? candidate.fontFamily : defaultTheme.fontFamily,
    displayFont: isFontFamily(candidate.displayFont) ? candidate.displayFont : defaultTheme.displayFont,
    bodySize: boundedNumber(candidate.bodySize, defaultTheme.bodySize, 0.88, 1.12),
    lineHeight: boundedNumber(candidate.lineHeight, defaultTheme.lineHeight, 1.25, 1.85),
    letterSpacing: boundedNumber(candidate.letterSpacing, defaultTheme.letterSpacing, -0.03, 0.08),
    headingWeight: boundedNumber(candidate.headingWeight, defaultTheme.headingWeight, 400, 700),
    bodyWeight: boundedNumber(candidate.bodyWeight, defaultTheme.bodyWeight, 350, 600),
    sidebarWidth: boundedNumber(candidate.sidebarWidth, defaultTheme.sidebarWidth, 180, 320),
    railWidth: boundedNumber(candidate.railWidth, defaultTheme.railWidth, 180, 320),
    pagePadding: boundedNumber(candidate.pagePadding, defaultTheme.pagePadding, 16, 72),
    topbarPadding: boundedNumber(candidate.topbarPadding, defaultTheme.topbarPadding, 12, 48),
    sidebarPadding: boundedNumber(candidate.sidebarPadding, defaultTheme.sidebarPadding, 12, 40),
    sectionGap: boundedNumber(candidate.sectionGap, densityPreset.sectionGap, 16, 96),
    feedGap: boundedNumber(candidate.feedGap, densityPreset.feedGap, 0, 48),
    railGap: boundedNumber(candidate.railGap, densityPreset.railGap, 8, 32),
    groupGap: boundedNumber(candidate.groupGap, densityPreset.groupGap, 4, 24),
    heroPadding: boundedNumber(candidate.heroPadding, defaultTheme.heroPadding, 18, 72),
    quotePadding: boundedNumber(candidate.quotePadding, defaultTheme.quotePadding, 12, 48),
    readerPadding: boundedNumber(candidate.readerPadding, defaultTheme.readerPadding, 16, 64),
    sheetPadding: boundedNumber(candidate.sheetPadding, defaultTheme.sheetPadding, 16, 40),
    controlHeight: boundedNumber(candidate.controlHeight, defaultTheme.controlHeight, 32, 52),
    buttonPadding: boundedNumber(candidate.buttonPadding, defaultTheme.buttonPadding, 6, 24),
    layoutGap: boundedNumber(candidate.layoutGap, defaultTheme.layoutGap, 16, 96),
    postColumnGap: boundedNumber(candidate.postColumnGap, defaultTheme.postColumnGap, 12, 48),
    cardPadding: boundedNumber(candidate.cardPadding, defaultTheme.cardPadding, 12, 42),
    artworkWidth: boundedNumber(candidate.artworkWidth, defaultTheme.artworkWidth, 100, 260),
    controlRadius: boundedNumber(candidate.controlRadius, radiusPreset.controlRadius, 4, 24),
    surfaceRadius: boundedNumber(candidate.surfaceRadius, radiusPreset.surfaceRadius, 8, 32),
    borderWidth: boundedNumber(candidate.borderWidth, defaultTheme.borderWidth, 0, 3),
    shadowStyle: isShadowStyle(candidate.shadowStyle) ? candidate.shadowStyle : defaultTheme.shadowStyle,
    gridStyle: isGridStyle(candidate.gridStyle) ? candidate.gridStyle : defaultTheme.gridStyle,
    gridSize: boundedNumber(candidate.gridSize, defaultTheme.gridSize, 16, 64),
    gridOpacity: boundedNumber(candidate.gridOpacity, defaultTheme.gridOpacity, 0, 0.35),
    postLayout: isPostLayout(candidate.postLayout) ? candidate.postLayout : defaultTheme.postLayout,
    artworkPosition: isArtworkPosition(candidate.artworkPosition) ? candidate.artworkPosition : defaultTheme.artworkPosition,
    surfaceStyle: isSurfaceStyle(candidate.surfaceStyle) ? candidate.surfaceStyle : defaultTheme.surfaceStyle,
    showSidebar: typeof candidate.showSidebar === 'boolean' ? candidate.showSidebar : defaultTheme.showSidebar,
    showTopbar: typeof candidate.showTopbar === 'boolean' ? candidate.showTopbar : defaultTheme.showTopbar,
    showHomeTopline: typeof candidate.showHomeTopline === 'boolean' ? candidate.showHomeTopline : defaultTheme.showHomeTopline,
    showHomeHero: typeof candidate.showHomeHero === 'boolean' ? candidate.showHomeHero : defaultTheme.showHomeHero,
    showQuote: typeof candidate.showQuote === 'boolean' ? candidate.showQuote : defaultTheme.showQuote,
    showHomeFeed: typeof candidate.showHomeFeed === 'boolean' ? candidate.showHomeFeed : defaultTheme.showHomeFeed,
    showSidebarFooter: typeof candidate.showSidebarFooter === 'boolean' ? candidate.showSidebarFooter : defaultTheme.showSidebarFooter,
    showPostArtwork: typeof candidate.showPostArtwork === 'boolean' ? candidate.showPostArtwork : defaultTheme.showPostArtwork,
    showPostTags: typeof candidate.showPostTags === 'boolean' ? candidate.showPostTags : defaultTheme.showPostTags,
    showPostActions: typeof candidate.showPostActions === 'boolean' ? candidate.showPostActions : defaultTheme.showPostActions,
    showPostExcerpt: typeof candidate.showPostExcerpt === 'boolean' ? candidate.showPostExcerpt : defaultTheme.showPostExcerpt,
    showPostAuthor: typeof candidate.showPostAuthor === 'boolean' ? candidate.showPostAuthor : defaultTheme.showPostAuthor,
    showPostPublished: typeof candidate.showPostPublished === 'boolean' ? candidate.showPostPublished : defaultTheme.showPostPublished,
    showReaderActions: typeof candidate.showReaderActions === 'boolean' ? candidate.showReaderActions : defaultTheme.showReaderActions,
    showProfileTopline: typeof candidate.showProfileTopline === 'boolean' ? candidate.showProfileTopline : defaultTheme.showProfileTopline,
    showProfileCover: typeof candidate.showProfileCover === 'boolean' ? candidate.showProfileCover : defaultTheme.showProfileCover,
    showProfileBio: typeof candidate.showProfileBio === 'boolean' ? candidate.showProfileBio : defaultTheme.showProfileBio,
    showProfileStats: typeof candidate.showProfileStats === 'boolean' ? candidate.showProfileStats : defaultTheme.showProfileStats,
    showProfileInterests: typeof candidate.showProfileInterests === 'boolean' ? candidate.showProfileInterests : defaultTheme.showProfileInterests,
    showHeroSurface: typeof candidate.showHeroSurface === 'boolean' ? candidate.showHeroSurface : defaultTheme.showHeroSurface,
    showRailStatus: typeof candidate.showRailStatus === 'boolean' ? candidate.showRailStatus : defaultTheme.showRailStatus,
    showRailTools: typeof candidate.showRailTools === 'boolean' ? candidate.showRailTools : defaultTheme.showRailTools,
    showFeedEnd: typeof candidate.showFeedEnd === 'boolean' ? candidate.showFeedEnd : defaultTheme.showFeedEnd,
    homeOrder: normalizeOrder(candidate.homeOrder, ['hero', 'quote', 'feed'] as const, defaultTheme.homeOrder),
    navOrder: normalizeOrder(candidate.navOrder, ['home', 'saved', 'profile'] as const, defaultTheme.navOrder),
    customColors: normalizeColors(candidate.customColors),
    copy: normalizeCopy(candidate.copy),
  }
}

export function getThemeStyle(settings: ThemeSettings): CSSProperties {
  const palette = paletteTokens[settings.palette]
  const colors = settings.customColors ?? {}
  const background = colors.background ?? palette.bg
  const surface = colors.surface ?? palette.surface
  const surfaceRaised = colors.surfaceRaised ?? palette.raised
  const ink = colors.ink ?? palette.ink
  const muted = colors.muted ?? palette.muted
  const border = colors.border ?? palette.border
  const brand = colors.brand ?? palette.brand
  const brandSoft = colors.brandSoft ?? palette.brandSoft
  const accent = colors.accent ?? palette.accent
  const accentSoft = colors.accentSoft ?? palette.accentSoft
  const success = colors.success ?? palette.success
  const warning = colors.warning ?? palette.warning
  const error = colors.error ?? palette.error
  const gridColor = `color-mix(in oklch, ${border} ${Math.round(settings.gridOpacity * 100)}%, transparent)`
  const gridImage = settings.gridStyle === 'none'
    ? 'none'
    : settings.gridStyle === 'ruled'
      ? `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
      : `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
  const shadow = settings.shadowStyle === 'none'
    ? 'none'
    : settings.shadowStyle === 'strong'
      ? `0 12px 35px color-mix(in oklch, ${ink} 16%, transparent)`
      : `0 1px 2px color-mix(in oklch, ${ink} 8%, transparent), 0 12px 28px color-mix(in oklch, ${ink} 6%, transparent)`
  const cssVars: Record<string, string> = {
    colorScheme: settings.palette === 'night' ? 'dark' : 'light',
    '--color-bg': background,
    '--color-surface': surface,
    '--color-surface-raised': surfaceRaised,
    '--color-ink': ink,
    '--color-muted': muted,
    '--color-border': border,
    '--color-brand': brand,
    '--color-brand-soft': brandSoft,
    '--color-accent': accent,
    '--color-accent-soft': accentSoft,
    '--color-success': success,
    '--color-warning': warning,
    '--color-error': error,
    '--radius-control': `${settings.controlRadius}px`,
    '--radius-surface': `${settings.surfaceRadius}px`,
    '--border-width': `${settings.borderWidth}px`,
    '--type-scale': String(settings.typeScale),
    '--content-width': `${settings.contentWidth}ch`,
    '--section-gap': `${settings.sectionGap}px`,
    '--feed-gap': `${settings.feedGap}px`,
    '--rail-gap': `${settings.railGap}px`,
    '--group-gap': `${settings.groupGap}px`,
    '--rail-width': settings.showAgentRail ? `${settings.railWidth}px` : '0px',
    '--sidebar-width': `${settings.sidebarWidth}px`,
    '--page-padding': `${settings.pagePadding}px`,
    '--topbar-padding': `${settings.topbarPadding}px`,
    '--sidebar-padding': `${settings.sidebarPadding}px`,
    '--hero-padding': `${settings.heroPadding}px`,
    '--quote-padding': `${settings.quotePadding}px`,
    '--reader-padding': `${settings.readerPadding}px`,
    '--sheet-padding': `${settings.sheetPadding}px`,
    '--control-height': `${settings.controlHeight}px`,
    '--button-padding': `${settings.buttonPadding}px`,
    '--layout-gap': `${settings.layoutGap}px`,
    '--post-column-gap': `${settings.postColumnGap}px`,
    '--card-padding': `${settings.cardPadding}px`,
    '--artwork-width': `${settings.artworkWidth}px`,
    '--content-measure': `${settings.contentWidth}ch`,
    '--font-body': fontStacks[settings.fontFamily],
    '--font-display': fontStacks[settings.displayFont],
    '--body-size': `${settings.bodySize}rem`,
    '--body-line-height': String(settings.lineHeight),
    '--body-letter-spacing': `${settings.letterSpacing}em`,
    '--heading-weight': String(settings.headingWeight),
    '--body-weight': String(settings.bodyWeight),
    '--grid-image': gridImage,
    '--grid-size': `${settings.gridSize}px`,
    '--grid-opacity': String(settings.gridOpacity),
    '--surface-shadow': shadow,
    '--motion-fast': settings.reduceMotion ? '1ms' : '120ms',
    '--motion-normal': settings.reduceMotion ? '1ms' : '160ms',
    '--motion-sheet': settings.reduceMotion ? '1ms' : '260ms',
    '--ease-out': 'cubic-bezier(0.2, 0.75, 0.25, 1)',
    '--ease-sheet': 'cubic-bezier(0.2, 0.75, 0.25, 1)',
    '--background': background,
    '--foreground': ink,
    '--card': surface,
    '--card-foreground': ink,
    '--popover': surface,
    '--popover-foreground': ink,
    '--primary': brand,
    '--primary-foreground': surface,
    '--secondary': brandSoft,
    '--secondary-foreground': brand,
    '--muted': surfaceRaised,
    '--muted-foreground': muted,
    '--accent': accentSoft,
    '--accent-foreground': ink,
    '--destructive': error,
    '--border': border,
    '--input': border,
    '--ring': brand,
    '--radius': `${settings.controlRadius / 16}rem`,
  }

  return cssVars as CSSProperties
}

/**
 * Radix UI portals render sheets under document.body rather than inside the
 * themed app shell. Mirror the live theme tokens on the document root so
 * portaled controls use the same palette, typography, and spacing values.
 */
export function applyThemeStyleToDocument(settings: ThemeSettings) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const style = getThemeStyle(settings) as Record<string, string>
  for (const [property, value] of Object.entries(style)) {
    if (property === 'colorScheme') {
      root.style.colorScheme = value
    } else if (property.startsWith('--')) {
      root.style.setProperty(property, value)
    }
  }
}
