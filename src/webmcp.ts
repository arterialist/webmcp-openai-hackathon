import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'
import type {
  AppSnapshot,
  ArticleDraft,
  ArticleEditorState,
  ArticlePatch,
  CustomizationBlockId,
  CopySettings,
  DensityId,
  FeedFilterId,
  FontFamilyId,
  GridStyleId,
  HomeBlockId,
  PageId,
  PaletteId,
  Post,
  PostLayoutId,
  RadiusId,
  ShadowStyleId,
  SurfaceStyleId,
  ThemeSettings,
  UserProfile,
} from './types'

export interface AppActions {
  getSnapshot: () => AppSnapshot
  navigate: (page: PageId) => void
  setFeedFilter: (filter: FeedFilterId) => void
  searchFeed: (query: string) => Post[]
  setSearchQuery: (query: string) => Post[]
  clearSearch: () => void
  openPost: (postId: string) => Post | null
  toggleSavePost: (postId: string) => Post | null
  toggleLikePost: (postId: string) => Post | null
  createPost: (input: { title: string; excerpt: string; body?: string; tags?: string[] }) => Post
  updatePost: (postId: string, patch: ArticlePatch) => Post | null
  deletePost: (postId: string) => Post | null
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'location' | 'website'>>) => UserProfile
  setTheme: (patch: Partial<ThemeSettings>) => ThemeSettings
  moveHomeBlock: (block: HomeBlockId, toIndex: number) => ThemeSettings
  moveNavItem: (page: PageId, toIndex: number) => ThemeSettings
  resetTheme: () => ThemeSettings
  openStudio: () => void
  openVoicePanel: () => void
  openComposer: (postId?: string) => ArticleEditorState | null
  getArticleDraft: () => ArticleEditorState | null
  setArticleDraft: (patch: Partial<ArticleDraft>) => ArticleEditorState | null
  setArticleTitle: (title: string) => ArticleEditorState | null
  setArticleExcerpt: (excerpt: string) => ArticleEditorState | null
  setArticleBody: (body: string) => ArticleEditorState | null
  setArticleTags: (tags: string[]) => ArticleEditorState | null
  publishArticleDraft: () => Post | null
  discardArticleDraft: () => void
  openProfileEditor: () => void
  openTools: () => void
  closeOverlays: () => void
}

interface ToolSchema {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
  additionalProperties?: boolean
}

interface ToolDescriptor {
  name: string
  title: string
  description: string
  inputSchema: ToolSchema
  annotations?: {
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
  }
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown
}

interface ModelContextLike {
  registerTool: (tool: ToolDescriptor, options?: { signal?: AbortSignal }) => Promise<void>
  addEventListener?: (type: string, listener: EventListener) => void
  removeEventListener?: (type: string, listener: EventListener) => void
}

declare global {
  interface Document {
    modelContext?: ModelContextLike
  }
}

const emptySchema = (): ToolSchema => ({ type: 'object', properties: {}, additionalProperties: false })

const response = (value: unknown) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  structuredContent: value,
})

const postSchema: ToolSchema = {
  type: 'object',
  properties: { postId: { type: 'string', description: 'The exact post id from page state.' } },
  required: ['postId'],
  additionalProperties: false,
}

const articlePatchProperties: Record<string, unknown> = {
  title: { type: 'string', description: 'The article title.' },
  excerpt: { type: 'string', description: 'A short article summary.' },
  body: { type: 'string', description: 'The full article body. Use blank lines between paragraphs.' },
  tags: { type: 'array', items: { type: 'string' }, description: 'Topic tags.' },
}

const copyProperties: Record<string, unknown> = {
  brandName: { type: 'string', description: 'The name shown in the brand lockup.' },
  brandKicker: { type: 'string', description: 'The small line under the brand name.' },
  heroKicker: { type: 'string', description: 'The small welcome line above the hero heading.' },
  heroTitle: { type: 'string', description: 'The first line of the hero heading.' },
  heroEmphasis: { type: 'string', description: 'The emphasized second line of the hero heading.' },
  heroLede: { type: 'string', description: 'The hero description.' },
  quoteText: { type: 'string', description: 'The reflective quote on the home page.' },
  quoteSource: { type: 'string', description: 'The quote attribution.' },
  railTitle: { type: 'string', description: 'The agent rail heading.' },
  railDescription: { type: 'string', description: 'The agent rail description.' },
}

export const customizationProperties: Record<string, unknown> = {
  palette: { type: 'string', enum: ['paper', 'lichen', 'night'], description: 'The base color language.' },
  density: { type: 'string', enum: ['airy', 'balanced', 'dense'], description: 'The default vertical rhythm.' },
  radius: { type: 'string', enum: ['crisp', 'soft', 'round'], description: 'The corner treatment preset.' },
  typeScale: { type: 'number', minimum: 0.88, maximum: 1.12, description: 'Heading scale multiplier.' },
  contentWidth: { type: 'number', minimum: 48, maximum: 78, description: 'Reading measure in characters.' },
  showAgentRail: { type: 'boolean', description: 'Show the contextual agent rail.' },
  showReadingTimes: { type: 'boolean', description: 'Show estimated reading times.' },
  reduceMotion: { type: 'boolean', description: 'Reduce transitions and animations.' },
  fontFamily: { type: 'string', enum: ['geist', 'serif', 'mono'], description: 'Body typeface family.' },
  displayFont: { type: 'string', enum: ['geist', 'serif', 'mono'], description: 'Display and heading typeface family.' },
  bodySize: { type: 'number', minimum: 0.88, maximum: 1.12, description: 'Base body size multiplier.' },
  lineHeight: { type: 'number', minimum: 1.25, maximum: 1.85, description: 'Body line-height multiplier.' },
  letterSpacing: { type: 'number', minimum: -0.03, maximum: 0.08, description: 'Body letter-spacing in em.' },
  headingWeight: { type: 'number', minimum: 400, maximum: 700, description: 'Display font weight.' },
  bodyWeight: { type: 'number', minimum: 350, maximum: 600, description: 'Body font weight.' },
  sidebarWidth: { type: 'number', minimum: 180, maximum: 320, description: 'Sidebar width in pixels.' },
  railWidth: { type: 'number', minimum: 180, maximum: 320, description: 'Agent rail width in pixels.' },
  pagePadding: { type: 'number', minimum: 16, maximum: 72, description: 'Page edge padding in pixels.' },
  topbarPadding: { type: 'number', minimum: 12, maximum: 48, description: 'Top bar horizontal padding in pixels.' },
  sidebarPadding: { type: 'number', minimum: 12, maximum: 40, description: 'Sidebar inset padding in pixels.' },
  sectionGap: { type: 'number', minimum: 16, maximum: 96, description: 'Vertical gap between page sections.' },
  feedGap: { type: 'number', minimum: 0, maximum: 48, description: 'Gap between feed cards.' },
  railGap: { type: 'number', minimum: 8, maximum: 32, description: 'Gap between agent rail groups.' },
  groupGap: { type: 'number', minimum: 4, maximum: 24, description: 'Gap inside control groups.' },
  heroPadding: { type: 'number', minimum: 18, maximum: 72, description: 'Hero surface padding in pixels.' },
  quotePadding: { type: 'number', minimum: 12, maximum: 48, description: 'Quote surface padding in pixels.' },
  readerPadding: { type: 'number', minimum: 16, maximum: 64, description: 'Reader padding in pixels.' },
  sheetPadding: { type: 'number', minimum: 16, maximum: 40, description: 'Sheet and dialog padding in pixels.' },
  controlHeight: { type: 'number', minimum: 32, maximum: 52, description: 'Base control height in pixels.' },
  buttonPadding: { type: 'number', minimum: 6, maximum: 24, description: 'Horizontal button padding in pixels.' },
  layoutGap: { type: 'number', minimum: 16, maximum: 96, description: 'Main column gap in pixels.' },
  postColumnGap: { type: 'number', minimum: 12, maximum: 48, description: 'Post text-to-art gap in pixels.' },
  cardPadding: { type: 'number', minimum: 12, maximum: 42, description: 'Post card padding in pixels.' },
  artworkWidth: { type: 'number', minimum: 100, maximum: 260, description: 'Post artwork width in pixels.' },
  controlRadius: { type: 'number', minimum: 4, maximum: 24, description: 'Control corner radius in pixels.' },
  surfaceRadius: { type: 'number', minimum: 8, maximum: 32, description: 'Surface corner radius in pixels.' },
  borderWidth: { type: 'number', minimum: 0, maximum: 3, description: 'Surface border width in pixels.' },
  shadowStyle: { type: 'string', enum: ['none', 'soft', 'strong'], description: 'Surface shadow strength.' },
  gridStyle: { type: 'string', enum: ['none', 'blueprint', 'ruled'], description: 'Canvas grid treatment.' },
  gridSize: { type: 'number', minimum: 16, maximum: 64, description: 'Canvas grid spacing in pixels.' },
  gridOpacity: { type: 'number', minimum: 0, maximum: 0.35, description: 'Canvas grid opacity.' },
  postLayout: { type: 'string', enum: ['standard', 'compact', 'magazine'], description: 'Post card layout.' },
  artworkPosition: { type: 'string', enum: ['right', 'left'], description: 'Which side post artwork occupies.' },
  surfaceStyle: { type: 'string', enum: ['flat', 'lined', 'lifted'], description: 'Surface treatment for cards and panels.' },
  showSidebar: { type: 'boolean', description: 'Show the primary navigation sidebar.' },
  showTopbar: { type: 'boolean', description: 'Show the search and quick-action top bar.' },
  showHomeTopline: { type: 'boolean', description: 'Show the home page status topline.' },
  showHomeHero: { type: 'boolean', description: 'Show the home page hero block.' },
  showHeroSurface: { type: 'boolean', description: 'Show the hero raised surface.' },
  showQuote: { type: 'boolean', description: 'Show the home page quote block.' },
  showHomeFeed: { type: 'boolean', description: 'Show the home page feed block.' },
  showFeedEnd: { type: 'boolean', description: 'Show the caught-up marker at the end of feeds.' },
  showSidebarFooter: { type: 'boolean', description: 'Show the sidebar profile footer.' },
  showPostArtwork: { type: 'boolean', description: 'Show artwork on post cards and readers.' },
  showPostTags: { type: 'boolean', description: 'Show post topic tags.' },
  showPostActions: { type: 'boolean', description: 'Show like, save, and overflow actions.' },
  showPostExcerpt: { type: 'boolean', description: 'Show post summaries.' },
  showPostAuthor: { type: 'boolean', description: 'Show post author identity.' },
  showPostPublished: { type: 'boolean', description: 'Show post published labels.' },
  showReaderActions: { type: 'boolean', description: 'Show reader like and save controls.' },
  showProfileTopline: { type: 'boolean', description: 'Show the profile status topline.' },
  showProfileCover: { type: 'boolean', description: 'Show the profile cover artwork.' },
  showProfileBio: { type: 'boolean', description: 'Show profile bio and location details.' },
  showProfileStats: { type: 'boolean', description: 'Show profile statistics.' },
  showProfileInterests: { type: 'boolean', description: 'Show profile interest tags.' },
  showRailStatus: { type: 'boolean', description: 'Show agent bridge readiness.' },
  showRailTools: { type: 'boolean', description: 'Show agent rail action shortcuts.' },
  homeOrder: { type: 'array', items: { type: 'string', enum: ['hero', 'quote', 'feed'] }, description: 'The order of home page blocks.' },
  navOrder: { type: 'array', items: { type: 'string', enum: ['home', 'saved', 'profile'] }, description: 'The order of sidebar navigation items.' },
  customColors: {
    type: 'object',
    properties: {
      background: { type: 'string', description: 'CSS color for the page background.' },
      surface: { type: 'string', description: 'CSS color for cards and panels.' },
      surfaceRaised: { type: 'string', description: 'CSS color for raised surfaces.' },
      ink: { type: 'string', description: 'CSS color for primary text.' },
      muted: { type: 'string', description: 'CSS color for secondary text.' },
      border: { type: 'string', description: 'CSS color for rules and borders.' },
      brand: { type: 'string', description: 'CSS color for the primary brand.' },
      brandSoft: { type: 'string', description: 'CSS color for soft brand surfaces.' },
      accent: { type: 'string', description: 'CSS color for the accent.' },
      accentSoft: { type: 'string', description: 'CSS color for soft accent surfaces.' },
      success: { type: 'string', description: 'CSS color for success states.' },
      warning: { type: 'string', description: 'CSS color for warning states.' },
      error: { type: 'string', description: 'CSS color for errors.' },
    },
    additionalProperties: false,
  },
  copy: { type: 'object', properties: copyProperties, additionalProperties: false },
}

const customizationSchema: ToolSchema = { type: 'object', properties: customizationProperties, additionalProperties: false }

const visibilityBlocks: CustomizationBlockId[] = [
  'sidebar', 'topbar', 'home-topline', 'home-hero', 'home-quote', 'home-feed', 'agent-rail',
  'profile-topline', 'profile-cover', 'profile-bio', 'profile-stats', 'post-artwork', 'post-tags', 'post-actions', 'reading-times',
  'post-excerpt', 'post-author', 'post-published', 'reader-actions', 'profile-interests', 'hero-surface', 'rail-status', 'rail-tools', 'feed-end',
]

const visibilitySchema: ToolSchema = {
  type: 'object',
  properties: {
    block: { type: 'string', enum: visibilityBlocks, description: 'The named layout block or presentation element.' },
    visible: { type: 'boolean', description: 'Whether the block should be visible.' },
  },
  required: ['block', 'visible'],
  additionalProperties: false,
}

const articleCreateSchema: ToolSchema = {
  type: 'object',
  properties: { title: { type: 'string' }, body: { type: 'string' }, excerpt: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } },
  required: ['title', 'body'],
  additionalProperties: false,
}

const articleUpdateSchema: ToolSchema = {
  type: 'object',
  properties: { postId: postSchema.properties.postId, ...articlePatchProperties },
  required: ['postId'],
  additionalProperties: false,
}

const articleDraftSchema: ToolSchema = {
  type: 'object',
  properties: articlePatchProperties,
  additionalProperties: false,
}

const articleTitleSchema: ToolSchema = { type: 'object', properties: { title: articlePatchProperties.title }, required: ['title'], additionalProperties: false }
const articleExcerptSchema: ToolSchema = { type: 'object', properties: { excerpt: articlePatchProperties.excerpt }, required: ['excerpt'], additionalProperties: false }
const articleBodySchema: ToolSchema = { type: 'object', properties: { body: articlePatchProperties.body }, required: ['body'], additionalProperties: false }
const articleTagsSchema: ToolSchema = { type: 'object', properties: { tags: articlePatchProperties.tags }, required: ['tags'], additionalProperties: false }

const spacingSchema: ToolSchema = {
  type: 'object',
  properties: Object.fromEntries(['pagePadding', 'topbarPadding', 'sidebarPadding', 'sectionGap', 'feedGap', 'railGap', 'groupGap', 'heroPadding', 'quotePadding', 'readerPadding', 'sheetPadding', 'controlHeight', 'buttonPadding', 'layoutGap', 'postColumnGap', 'cardPadding', 'artworkWidth'].map((key) => [key, customizationProperties[key]])),
  additionalProperties: false,
}

const shapeSchema: ToolSchema = {
  type: 'object',
  properties: Object.fromEntries(['radius', 'controlRadius', 'surfaceRadius', 'borderWidth', 'shadowStyle', 'surfaceStyle'].map((key) => [key, customizationProperties[key]])),
  additionalProperties: false,
}

const typographySchema: ToolSchema = {
  type: 'object',
  properties: Object.fromEntries(['fontFamily', 'displayFont', 'typeScale', 'bodySize', 'lineHeight', 'letterSpacing', 'headingWeight', 'bodyWeight', 'contentWidth'].map((key) => [key, customizationProperties[key]])),
  additionalProperties: false,
}

const gridSchema: ToolSchema = {
  type: 'object',
  properties: Object.fromEntries(['gridStyle', 'gridSize', 'gridOpacity'].map((key) => [key, customizationProperties[key]])),
  additionalProperties: false,
}

const copySchema: ToolSchema = { type: 'object', properties: copyProperties, additionalProperties: false }

export const commonplaceToolSpecs: ToolDescriptor[] = [
  {
    name: 'commonplace.get_page_state', title: 'Read Commonplace state', description: 'Read the active page, current personalization settings, profile, and visible posts.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => { const snapshot = getActiveActions().getSnapshot(); return response({ ...snapshot, posts: snapshot.posts.map(summarizePost) }) },
  },
  {
    name: 'commonplace.get_reading_list', title: 'Read saved posts', description: 'Return the posts the user has saved for later reading.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => response(getActiveActions().getSnapshot().posts.filter((post) => post.saved).map(summarizePost)),
  },
  {
    name: 'commonplace.get_profile', title: 'Read profile', description: 'Return the current profile identity, bio, interests, and follower counts.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => response(getActiveActions().getSnapshot().profile),
  },
  {
    name: 'commonplace.get_customization', title: 'Read customization state', description: 'Return every live layout, type, color, spacing, visibility, and ordering preference.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => response(getActiveActions().getSnapshot().theme),
  },
  {
    name: 'commonplace.get_customization_schema', title: 'Discover customization controls', description: 'Describe all editable page fields, blocks, accepted values, and current block order for an agent.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => response({ fields: customizationProperties, visibilityBlocks, homeBlocks: ['hero', 'quote', 'feed'], pages: ['home', 'saved', 'profile'], current: getActiveActions().getSnapshot().theme }),
  },
  {
    name: 'commonplace.navigate', title: 'Navigate Commonplace', description: 'Switch the visible Commonplace surface to home, profile, or saved reading.', inputSchema: { type: 'object', properties: { page: { type: 'string', enum: ['home', 'profile', 'saved'], description: 'The surface to open.' } }, required: ['page'], additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { if (!isPage(input.page)) return response({ ok: false, error: 'A valid page is required.' }); getActiveActions().navigate(input.page); return response({ ok: true, page: input.page }) },
  },
  {
    name: 'commonplace.set_feed_filter', title: 'Change feed view', description: 'Switch the home feed between your personalized feed, saved notes, and followed authors.', inputSchema: { type: 'object', properties: { filter: { type: 'string', enum: ['for-you', 'saved', 'following'], description: 'The feed view to show.' } }, required: ['filter'], additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { if (!isFeedFilter(input.filter)) return response({ ok: false, error: 'A valid feed filter is required.' }); getActiveActions().setFeedFilter(input.filter); return response({ ok: true, filter: input.filter }) },
  },
  {
    name: 'commonplace.search_feed', title: 'Search the feed', description: 'Search post titles, excerpts, authors, and tags without changing the visible search field.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Words or tags to search for.' } }, required: ['query'], additionalProperties: false }, annotations: { readOnlyHint: true },
    execute: async (input) => response(getActiveActions().searchFeed(String(input.query ?? '')).map(summarizePost)),
  },
  {
    name: 'commonplace.set_search_query', title: 'Set visible search', description: 'Put a query into the visible search field and show its matching feed results.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { const query = String(input.query ?? ''); return response({ query, posts: getActiveActions().setSearchQuery(query).map(summarizePost) }) },
  },
  {
    name: 'commonplace.clear_search', title: 'Clear visible search', description: 'Clear the visible search field and restore the current feed.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().clearSearch(); return response({ ok: true, query: '' }) },
  },
  {
    name: 'commonplace.open_post', title: 'Open a post', description: 'Open a specific post by its exact post id and return its full reading content.', inputSchema: postSchema, annotations: { readOnlyHint: true },
    execute: async (input) => response(getActiveActions().openPost(String(input.postId)) ?? { ok: false, error: 'Post not found' }),
  },
  {
    name: 'commonplace.get_article', title: 'Read a full article', description: 'Return the complete article, including its full body, tags, and current engagement state.', inputSchema: postSchema, annotations: { readOnlyHint: true },
    execute: async (input) => { const post = getActiveActions().getSnapshot().posts.find((candidate) => candidate.id === String(input.postId)); return response(post ?? { ok: false, error: 'Article not found' }) },
  },
  {
    name: 'commonplace.get_article_draft', title: 'Read article editor', description: 'Read the open article editor mode, article id, every field value, and whether the draft can be published.', inputSchema: emptySchema(), annotations: { readOnlyHint: true },
    execute: async () => response(getActiveActions().getArticleDraft() ?? { ok: false, error: 'The article editor is not open.' }),
  },
  {
    name: 'commonplace.toggle_save_post', title: 'Save or unsave a post', description: 'Toggle a post in the user’s reading list. This is a local, reversible change.', inputSchema: postSchema, annotations: { idempotentHint: false, destructiveHint: false },
    execute: async (input) => response(getActiveActions().toggleSavePost(String(input.postId)) ?? { ok: false, error: 'Post not found' }),
  },
  {
    name: 'commonplace.toggle_like_post', title: 'Like or unlike a post', description: 'Toggle the user’s like on a post. This is a local demo action.', inputSchema: postSchema, annotations: { idempotentHint: false, destructiveHint: false },
    execute: async (input) => response(getActiveActions().toggleLikePost(String(input.postId)) ?? { ok: false, error: 'Post not found' }),
  },
  {
    name: 'commonplace.create_post', title: 'Publish a post', description: 'Create a new post in the local feed from a title, excerpt, optional full body, and topic tags.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, excerpt: { type: 'string' }, body: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } }, required: ['title', 'excerpt'], additionalProperties: false }, annotations: { destructiveHint: false },
    execute: async (input) => response(getActiveActions().createPost({ title: String(input.title ?? ''), excerpt: String(input.excerpt ?? ''), body: typeof input.body === 'string' ? input.body : undefined, tags: Array.isArray(input.tags) ? input.tags.map(String) : undefined })),
  },
  {
    name: 'commonplace.create_article', title: 'Write and publish an article', description: 'Create a complete article with a title, full body, optional summary, and topic tags.', inputSchema: articleCreateSchema, annotations: { destructiveHint: false },
    execute: async (input) => { const title = String(input.title ?? '').trim(); const body = String(input.body ?? '').trim(); if (!title || !body) return response({ ok: false, error: 'A title and full article body are required.' }); const excerpt = typeof input.excerpt === 'string' && input.excerpt.trim() ? input.excerpt.trim() : summarizeBody(body); return response(getActiveActions().createPost({ title, excerpt, body, tags: Array.isArray(input.tags) ? input.tags.map(String) : undefined })) },
  },
  {
    name: 'commonplace.update_article', title: 'Edit an article', description: 'Update any combination of an article title, summary, body, or topic tags.', inputSchema: articleUpdateSchema, annotations: { destructiveHint: false },
    execute: async (input) => { const postId = String(input.postId ?? ''); const patch = cleanArticlePatch(input); if (!postId || !Object.keys(patch).length) return response({ ok: false, error: 'An article id and at least one article field are required.' }); return response(getActiveActions().updatePost(postId, patch) ?? { ok: false, error: 'Article not found' }) },
  },
  {
    name: 'commonplace.set_article_draft', title: 'Fill article editor', description: 'Set any combination of the open article editor fields without publishing the draft.', inputSchema: articleDraftSchema, annotations: { idempotentHint: true },
    execute: async (input) => { const patch = cleanArticleDraftPatch(input); if (!Object.keys(patch).length) return response({ ok: false, error: 'Provide at least one article editor field.' }); return response(getActiveActions().setArticleDraft(patch) ?? { ok: false, error: 'Open the article composer first.' }) },
  },
  {
    name: 'commonplace.set_article_title', title: 'Set article title', description: 'Replace the title field in the open article editor.', inputSchema: articleTitleSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(typeof input.title === 'string' ? getActiveActions().setArticleTitle(input.title) ?? { ok: false, error: 'Open the article composer first.' } : { ok: false, error: 'A title string is required.' }),
  },
  {
    name: 'commonplace.set_article_excerpt', title: 'Set article summary', description: 'Replace the optional short version field in the open article editor.', inputSchema: articleExcerptSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(typeof input.excerpt === 'string' ? getActiveActions().setArticleExcerpt(input.excerpt) ?? { ok: false, error: 'Open the article composer first.' } : { ok: false, error: 'A summary string is required.' }),
  },
  {
    name: 'commonplace.set_article_body', title: 'Set article body', description: 'Replace the full article body field in the open article editor. Keep blank lines between paragraphs.', inputSchema: articleBodySchema, annotations: { idempotentHint: true },
    execute: async (input) => response(typeof input.body === 'string' ? getActiveActions().setArticleBody(input.body) ?? { ok: false, error: 'Open the article composer first.' } : { ok: false, error: 'An article body string is required.' }),
  },
  {
    name: 'commonplace.set_article_tags', title: 'Set article topics', description: 'Replace the comma-separated topics field in the open article editor with a list of tags.', inputSchema: articleTagsSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(Array.isArray(input.tags) ? getActiveActions().setArticleTags(input.tags.map(String)) ?? { ok: false, error: 'Open the article composer first.' } : { ok: false, error: 'A topics array is required.' }),
  },
  {
    name: 'commonplace.publish_article_draft', title: 'Publish article draft', description: 'Publish the complete open article draft, or save it back to the article being edited.', inputSchema: emptySchema(), annotations: { destructiveHint: false },
    execute: async () => { const editor = getActiveActions().getArticleDraft(); if (!editor) return response({ ok: false, error: 'The article editor is not open.' }); if (!editor.canPublish) return response({ ok: false, error: 'Add a title longer than 3 characters and an article body longer than 10 characters before publishing.' }); return response(getActiveActions().publishArticleDraft() ?? { ok: false, error: 'The article draft could not be published.' }) },
  },
  {
    name: 'commonplace.discard_article_draft', title: 'Discard article draft', description: 'Close the article editor and discard its unsaved field values.', inputSchema: emptySchema(), annotations: { destructiveHint: true, idempotentHint: true },
    execute: async () => { getActiveActions().discardArticleDraft(); return response({ ok: true, discarded: true }) },
  },
  {
    name: 'commonplace.delete_article', title: 'Delete an article', description: 'Permanently remove an article from this local Commonplace feed.', inputSchema: postSchema, annotations: { destructiveHint: true, idempotentHint: true },
    execute: async (input) => response(getActiveActions().deletePost(String(input.postId)) ?? { ok: false, error: 'Article not found' }),
  },
  {
    name: 'commonplace.update_profile', title: 'Update profile', description: 'Change the local profile name, bio, location, or website. Only supplied fields are changed.', inputSchema: { type: 'object', properties: { name: { type: 'string' }, bio: { type: 'string' }, location: { type: 'string' }, website: { type: 'string' } }, additionalProperties: false }, annotations: { destructiveHint: false },
    execute: async (input) => response(getActiveActions().updateProfile({ ...(typeof input.name === 'string' ? { name: input.name } : {}), ...(typeof input.bio === 'string' ? { bio: input.bio } : {}), ...(typeof input.location === 'string' ? { location: input.location } : {}), ...(typeof input.website === 'string' ? { website: input.website } : {}) })),
  },
  {
    name: 'commonplace.set_theme', title: 'Tune the page theme', description: 'Edit any supported Commonplace preference. This compatibility tool accepts the full customization model.', inputSchema: customizationSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_customization', title: 'Customize the entire page', description: 'Set any combination of layout, visibility, order, typography, spacing, surface, palette, copy, and custom color controls.', inputSchema: customizationSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_spacing', title: 'Tune spacing', description: 'Change page padding, section rhythm, card padding, control sizing, and every exposed spacing token.', inputSchema: spacingSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_shape', title: 'Tune shapes and depth', description: 'Change corner radii, border weight, shadow strength, and surface treatment.', inputSchema: shapeSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_typography', title: 'Tune typography', description: 'Change body and display fonts, scale, weight, measure, line height, and letter spacing.', inputSchema: typographySchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_visual_grid', title: 'Tune the canvas grid', description: 'Change the canvas grid style, scale, and opacity.', inputSchema: gridSchema, annotations: { idempotentHint: true },
    execute: async (input) => response(getActiveActions().setTheme(cleanThemePatch(input))),
  },
  {
    name: 'commonplace.set_copy', title: 'Rewrite the surface copy', description: 'Change the brand, hero, quote, and agent rail words that people and the voice guide see.', inputSchema: copySchema, annotations: { idempotentHint: true },
    execute: async (input) => { const copy = cleanCopy(input); if (!copy || !Object.keys(copy).length) return response({ ok: false, error: 'At least one copy field is required.' }); const current = getActiveActions().getSnapshot().theme.copy; return response(getActiveActions().setTheme({ copy: { ...current, ...copy } })) },
  },
  {
    name: 'commonplace.set_block_visibility', title: 'Show or hide a page block', description: 'Change visibility for any named navigation, home, profile, post, reader, reading-time, or agent block.', inputSchema: visibilitySchema, annotations: { idempotentHint: true },
    execute: async (input) => { const block = input.block as CustomizationBlockId; if (!(block in visibilityProperty) || typeof input.visible !== 'boolean') return response({ ok: false, error: 'A valid block and boolean visibility value are required.' }); return response(getActiveActions().setTheme({ [visibilityProperty[block]]: input.visible } as Partial<ThemeSettings>)) },
  },
  {
    name: 'commonplace.move_home_block', title: 'Reorder a home block', description: 'Move the hero, quote, or feed block to a new zero-based position on the home page.', inputSchema: { type: 'object', properties: { block: { type: 'string', enum: ['hero', 'quote', 'feed'] }, toIndex: { type: 'number', minimum: 0, maximum: 2 } }, required: ['block', 'toIndex'], additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { if (!isHomeBlock(input.block) || typeof input.toIndex !== 'number' || !Number.isFinite(input.toIndex)) return response({ ok: false, error: 'A valid home block and position are required.' }); return response(getActiveActions().moveHomeBlock(input.block, clamp(input.toIndex, 0, 2))) },
  },
  {
    name: 'commonplace.move_navigation_item', title: 'Reorder navigation', description: 'Move home, saved, or profile to a new zero-based position in the primary navigation.', inputSchema: { type: 'object', properties: { page: { type: 'string', enum: ['home', 'saved', 'profile'] }, toIndex: { type: 'number', minimum: 0, maximum: 2 } }, required: ['page', 'toIndex'], additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { if (!isPage(input.page) || typeof input.toIndex !== 'number' || !Number.isFinite(input.toIndex)) return response({ ok: false, error: 'A valid page and position are required.' }); return response(getActiveActions().moveNavItem(input.page, clamp(input.toIndex, 0, 2))) },
  },
  {
    name: 'commonplace.reset_customization', title: 'Reset customization', description: 'Restore the complete default Commonplace layout and preference model.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => response(getActiveActions().resetTheme()),
  },
  {
    name: 'commonplace.open_studio', title: 'Open personalization studio', description: 'Open the visible shadcn control sheet for editing Commonplace layout and preference tokens.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().openStudio(); return response({ ok: true, opened: 'studio' }) },
  },
  {
    name: 'commonplace.open_composer', title: 'Open article composer', description: 'Open the full article editor for a new article or an existing article id.', inputSchema: { type: 'object', properties: { postId: { type: 'string', description: 'Optional article id to edit.' } }, additionalProperties: false }, annotations: { idempotentHint: true },
    execute: async (input) => { const editor = getActiveActions().openComposer(typeof input.postId === 'string' ? input.postId : undefined); return response(editor ?? { ok: false, error: input.postId ? 'Article not found.' : 'The article composer could not be opened.' }) },
  },
  {
    name: 'commonplace.open_profile_editor', title: 'Open profile editor', description: 'Open the profile identity editor.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().openProfileEditor(); return response({ ok: true, opened: 'profile-editor' }) },
  },
  {
    name: 'commonplace.open_tool_inspector', title: 'Open tool inspector', description: 'Open the in-page inspector that lists and previews the live WebMCP tools.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().openTools(); return response({ ok: true, opened: 'tool-inspector' }) },
  },
  {
    name: 'commonplace.start_voice_agent', title: 'Open voice agent', description: 'Open the built-in voice agent panel so the user can connect their microphone.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().openVoicePanel(); return response({ ok: true, opened: 'voice-agent' }) },
  },
  {
    name: 'commonplace.close_overlays', title: 'Close open panels', description: 'Close the reader, editor, studio, tool inspector, and voice panels.', inputSchema: emptySchema(), annotations: { idempotentHint: true },
    execute: async () => { getActiveActions().closeOverlays(); return response({ ok: true, closed: 'overlays' }) },
  },
]

const visibilityProperty: Record<CustomizationBlockId, keyof ThemeSettings> = {
  sidebar: 'showSidebar', topbar: 'showTopbar', 'home-topline': 'showHomeTopline', 'home-hero': 'showHomeHero', 'hero-surface': 'showHeroSurface', 'home-quote': 'showQuote', 'home-feed': 'showHomeFeed', 'feed-end': 'showFeedEnd', 'agent-rail': 'showAgentRail', 'rail-status': 'showRailStatus', 'rail-tools': 'showRailTools',
  'profile-topline': 'showProfileTopline', 'profile-cover': 'showProfileCover', 'profile-bio': 'showProfileBio', 'profile-stats': 'showProfileStats', 'profile-interests': 'showProfileInterests', 'post-artwork': 'showPostArtwork', 'post-tags': 'showPostTags', 'post-actions': 'showPostActions', 'post-excerpt': 'showPostExcerpt', 'post-author': 'showPostAuthor', 'post-published': 'showPostPublished', 'reader-actions': 'showReaderActions', 'reading-times': 'showReadingTimes',
}

const isHomeBlock = (value: unknown): value is HomeBlockId => value === 'hero' || value === 'quote' || value === 'feed'
const isPage = (value: unknown): value is PageId => value === 'home' || value === 'saved' || value === 'profile'
const isFeedFilter = (value: unknown): value is FeedFilterId => value === 'for-you' || value === 'saved' || value === 'following'

function summarizeBody(body: string) {
  const clean = body.replace(/\s+/g, ' ').trim()
  return clean.length > 156 ? `${clean.slice(0, 153).trimEnd()}…` : clean
}

function summarizePost(post: Post) {
  return { id: post.id, author: post.author, handle: post.handle, published: post.published, title: post.title, excerpt: post.excerpt, tags: post.tags, readTime: post.readTime, saved: post.saved, liked: post.liked, likes: post.likes, comments: post.comments }
}

const isColorValue = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 96) return false
  return /^(#[0-9a-f]{3,8}|(?:oklch|oklab|rgb|rgba|hsl|hsla|hwb|lab|lch|color)\([^{};]+\)|[a-z]+)$/i.test(value.trim())
}

function cleanColors(value: unknown) {
  if (!value || typeof value !== 'object') return undefined
  const input = value as Record<string, unknown>
  const colors: ThemeSettings['customColors'] = {}
  for (const key of ['background', 'surface', 'surfaceRaised', 'ink', 'muted', 'border', 'brand', 'brandSoft', 'accent', 'accentSoft', 'success', 'warning', 'error'] as const) if (isColorValue(input[key])) colors[key] = input[key].trim()
  return colors
}

function cleanCopy(value: unknown): Partial<CopySettings> | undefined {
  if (!value || typeof value !== 'object') return undefined
  const input = value as Record<string, unknown>
  const copy: Partial<CopySettings> = {}
  for (const key of Object.keys(copyProperties) as Array<keyof CopySettings>) if (typeof input[key] === 'string' && input[key].trim()) copy[key] = input[key].trim().slice(0, 220)
  return copy
}

function cleanArticlePatch(input: Record<string, unknown>): ArticlePatch {
  const patch: ArticlePatch = {}
  if (typeof input.title === 'string' && input.title.trim()) patch.title = input.title.trim()
  if (typeof input.excerpt === 'string') patch.excerpt = input.excerpt.trim()
  if (typeof input.body === 'string' && input.body.trim()) patch.body = input.body.trim()
  if (Array.isArray(input.tags)) patch.tags = input.tags.map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 12)
  return patch
}

function cleanArticleDraftPatch(input: Record<string, unknown>): Partial<ArticleDraft> {
  const patch: Partial<ArticleDraft> = {}
  if (typeof input.title === 'string') patch.title = input.title
  if (typeof input.excerpt === 'string') patch.excerpt = input.excerpt
  if (typeof input.body === 'string') patch.body = input.body
  if (Array.isArray(input.tags)) patch.tags = input.tags.map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 12)
  return patch
}

function cleanOrder<T extends string>(value: unknown, allowed: readonly T[]) {
  if (!Array.isArray(value)) return undefined
  const order = value.filter((item): item is T => allowed.includes(item as T))
  return order.length === allowed.length && new Set(order).size === allowed.length ? order : undefined
}

export function cleanThemePatch(input: Record<string, unknown>): Partial<ThemeSettings> {
  const patch: Partial<ThemeSettings> = {}
  if (input.palette === 'paper' || input.palette === 'lichen' || input.palette === 'night') patch.palette = input.palette as PaletteId
  if (input.density === 'airy' || input.density === 'balanced' || input.density === 'dense') patch.density = input.density as DensityId
  if (input.radius === 'crisp' || input.radius === 'soft' || input.radius === 'round') patch.radius = input.radius as RadiusId
  if (input.fontFamily === 'geist' || input.fontFamily === 'serif' || input.fontFamily === 'mono') patch.fontFamily = input.fontFamily as FontFamilyId
  if (input.displayFont === 'geist' || input.displayFont === 'serif' || input.displayFont === 'mono') patch.displayFont = input.displayFont as FontFamilyId
  if (input.surfaceStyle === 'flat' || input.surfaceStyle === 'lined' || input.surfaceStyle === 'lifted') patch.surfaceStyle = input.surfaceStyle as SurfaceStyleId
  if (input.shadowStyle === 'none' || input.shadowStyle === 'soft' || input.shadowStyle === 'strong') patch.shadowStyle = input.shadowStyle as ShadowStyleId
  if (input.gridStyle === 'none' || input.gridStyle === 'blueprint' || input.gridStyle === 'ruled') patch.gridStyle = input.gridStyle as GridStyleId
  if (input.postLayout === 'standard' || input.postLayout === 'compact' || input.postLayout === 'magazine') patch.postLayout = input.postLayout as PostLayoutId
  if (input.artworkPosition === 'right' || input.artworkPosition === 'left') patch.artworkPosition = input.artworkPosition
  const ranges: Array<[keyof ThemeSettings, number, number]> = [
    ['typeScale', 0.88, 1.12], ['contentWidth', 48, 78], ['bodySize', 0.88, 1.12], ['lineHeight', 1.25, 1.85], ['letterSpacing', -0.03, 0.08], ['headingWeight', 400, 700], ['bodyWeight', 350, 600], ['sidebarWidth', 180, 320], ['railWidth', 180, 320], ['pagePadding', 16, 72], ['topbarPadding', 12, 48], ['sidebarPadding', 12, 40], ['sectionGap', 16, 96], ['feedGap', 0, 48], ['railGap', 8, 32], ['groupGap', 4, 24], ['heroPadding', 18, 72], ['quotePadding', 12, 48], ['readerPadding', 16, 64], ['sheetPadding', 16, 40], ['controlHeight', 32, 52], ['buttonPadding', 6, 24], ['layoutGap', 16, 96], ['postColumnGap', 12, 48], ['cardPadding', 12, 42], ['artworkWidth', 100, 260], ['controlRadius', 4, 24], ['surfaceRadius', 8, 32], ['borderWidth', 0, 3], ['gridSize', 16, 64], ['gridOpacity', 0, 0.35],
  ]
  for (const [key, min, max] of ranges) if (typeof input[key] === 'number' && Number.isFinite(input[key])) (patch as Record<string, unknown>)[key] = clamp(input[key] as number, min, max)
  for (const key of ['showAgentRail', 'showReadingTimes', 'reduceMotion', 'showSidebar', 'showTopbar', 'showHomeTopline', 'showHomeHero', 'showHeroSurface', 'showQuote', 'showHomeFeed', 'showFeedEnd', 'showSidebarFooter', 'showPostArtwork', 'showPostTags', 'showPostActions', 'showPostExcerpt', 'showPostAuthor', 'showPostPublished', 'showReaderActions', 'showProfileTopline', 'showProfileCover', 'showProfileBio', 'showProfileStats', 'showProfileInterests', 'showRailStatus', 'showRailTools'] as const) if (typeof input[key] === 'boolean') (patch as Record<string, unknown>)[key] = input[key]
  const homeOrder = cleanOrder(input.homeOrder, ['hero', 'quote', 'feed'] as const); if (homeOrder) patch.homeOrder = homeOrder as HomeBlockId[]
  const navOrder = cleanOrder(input.navOrder, ['home', 'saved', 'profile'] as const); if (navOrder) patch.navOrder = navOrder as PageId[]
  const customColors = cleanColors(input.customColors); if (customColors) patch.customColors = customColors
  const copy = cleanCopy(input.copy); if (copy) (patch as Record<string, unknown>).copy = copy
  return patch
}

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }

let getActiveActions: () => AppActions = () => { throw new Error('Commonplace tools are not ready yet.') }

export function getRealtimeToolName(webMcpName: string) { return webMcpName.replaceAll('.', '_') }
export function getWebMcpToolNameFromRealtimeName(realtimeName: string) { return commonplaceToolSpecs.find((tool) => getRealtimeToolName(tool.name) === realtimeName)?.name ?? realtimeName }
export function getRealtimeToolDefinitions() { return commonplaceToolSpecs.map(({ name, description, inputSchema }) => ({ type: 'function' as const, name: getRealtimeToolName(name), description, parameters: inputSchema })) }

export async function registerCommonplaceTools(getActions: () => AppActions) {
  getActiveActions = getActions
  if (typeof document === 'undefined') return { registered: false, count: 0, names: [], cleanup: () => undefined }
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    if ((navigator as unknown as { modelContext?: ModelContextLike }).modelContext && !document.modelContext) {
      document.modelContext = (navigator as unknown as { modelContext: ModelContextLike }).modelContext
    }
  }
  if (!document.modelContext) {
    try { initializeWebMCPPolyfill({ installTestingShim: true }) } catch { return { registered: false, count: 0, names: [], cleanup: () => undefined } }
  }
  const context = document.modelContext
  if (!context) return { registered: false, count: 0, names: [], cleanup: () => undefined }

  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    if (!(navigator as unknown as { modelContext?: ModelContextLike }).modelContext) {
      (navigator as unknown as { modelContext: ModelContextLike }).modelContext = context
    }
    if (!(window as unknown as { modelContext?: ModelContextLike }).modelContext) {
      (window as unknown as { modelContext: ModelContextLike }).modelContext = context
    }
    ;(window as unknown as { __commonplace?: unknown }).__commonplace = {
      getActions,
      getSnapshot: () => getActions().getSnapshot(),
      executeTool: (name: string, input: Record<string, unknown> = {}) => executeRegisteredTool(name, input),
      tools: commonplaceToolSpecs,
    }
  }

  const controller = new AbortController()
  let count = 0
  const names: string[] = []
  for (const tool of commonplaceToolSpecs) {
    try { await context.registerTool(tool, { signal: controller.signal }); count += 1; names.push(tool.name) } catch (error) { console.warn(`[Commonplace] Could not register ${tool.name}`, error) }
  }
  return { registered: count > 0, count, names, cleanup: () => controller.abort() }
}

interface TestingModelContextLike { executeTool: (name: string, input: string) => Promise<string | null> }
function parseToolResult(value: unknown) { if (typeof value !== 'string') return value; try { return JSON.parse(value) as unknown } catch { return value } }
export async function executeRegisteredTool(name: string, input: Record<string, unknown> = {}) {
  if (typeof navigator !== 'undefined') { const testing = (navigator as Navigator & { modelContextTesting?: TestingModelContextLike }).modelContextTesting; if (testing?.executeTool) return parseToolResult(await testing.executeTool(name, JSON.stringify(input))) }
  const localTool = commonplaceToolSpecs.find((tool) => tool.name === name)
  return localTool ? localTool.execute(input) : { ok: false, error: 'Tool not found.' }
}

