import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AgentRail } from './components/AgentRail'
import { Artwork } from './components/Artwork'
import { Avatar } from './components/Avatar'
import { ComposeDialog } from './components/ComposeDialog'
import { PostCard } from './components/PostCard'
import { ProfileEditor } from './components/ProfileEditor'
import { activePresentation, presentationClassName } from './presentation'
import { Sidebar } from './components/Sidebar'
import { StudioPanel } from './components/StudioPanel'
import { ToolInspector } from './components/ToolInspector'
import { Topbar } from './components/Topbar'
import { VoiceAgentPanel } from './components/VoiceAgentPanel'
import { additionalSamplePosts, initialPosts, initialProfile } from './data'
import { Icon } from './icons'
import { applyThemeStyleToDocument, defaultTheme, getThemeStyle, normalizeThemeSettings, radiusPresets } from './theme'
import type { AppSnapshot, ArticleDraft, ArticleEditorState, ArticlePatch, FeedFilterId, HomeBlockId, PageId, Post, ThemeSettings, UserProfile } from './types'
import { useRealtimeAgent } from './useRealtimeAgent'
import { commonplaceToolSpecs, executeRegisteredTool, registerCommonplaceTools, setToolExecutionListener, type AppActions } from './webmcp'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

function getInitials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatToplineDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('weekday')} · ${value('day')} ${value('month')} ${value('year')}`
}

function summarizeArticleBody(body: string) {
  const clean = body.replace(/\s+/g, ' ').trim()
  return clean.length > 156 ? `${clean.slice(0, 153).trimEnd()}…` : clean
}

function articleReadTime(body: string) {
  return Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 35))
}

function emptyArticleDraft(): ArticleDraft {
  return { title: '', excerpt: '', body: '', tags: [] }
}

function draftFromPost(post: Post): ArticleDraft {
  return { title: post.title, excerpt: post.excerpt, body: post.body, tags: [...post.tags] }
}

function canPublishArticle(draft: ArticleDraft) {
  return draft.title.trim().length > 3 && draft.body.trim().length > 10
}

function articleEditorState(draft: ArticleDraft, postId: string | null): ArticleEditorState {
  return { mode: postId ? 'edit' : 'create', postId, draft, canPublish: canPublishArticle(draft) }
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function isLegacyDemoProfile(profile: Partial<UserProfile>) {
  return profile.handle === 'mayachen' || profile.name === 'Maya Chen' || profile.name === 'Maya Visual' || profile.handle === 'andrew' || profile.name === 'Andrew'
}

function readProfileForDemo() {
  const stored = readLocal<UserProfile>('commonplace-profile', initialProfile)
  return isLegacyDemoProfile(stored) ? { ...initialProfile } : stored
}

function readThemeForDemo() {
  const stored = readLocal<ThemeSettings>('commonplace-theme', defaultTheme)
  const copy = stored.copy ?? defaultTheme.copy
  return normalizeThemeSettings({
    ...stored,
    copy: {
      ...copy,
      brandKicker: ['a web that knows your hands', 'a reading desk you can change'].includes(copy.brandKicker) ? defaultTheme.copy.brandKicker : copy.brandKicker,
      heroKicker: copy.heroKicker === 'A little room for your attention, {name}.' ? defaultTheme.copy.heroKicker : copy.heroKicker,
      heroTitle: copy.heroTitle === 'Make room for' ? defaultTheme.copy.heroTitle : copy.heroTitle,
      heroEmphasis: copy.heroEmphasis === 'what stays.' ? defaultTheme.copy.heroEmphasis : copy.heroEmphasis,
      heroLede: ['Commonplace remembers your pace, keeps the signal close, and lets you change the rules whenever you want.', 'Read what you saved, change the page when it gets in the way, and ask the agent to handle the clicks.'].includes(copy.heroLede) ? defaultTheme.copy.heroLede : copy.heroLede,
      quoteText: ['Personalization is not a glitter layer. It is the moment a tool stops asking you to repeat what it already knows.', 'A useful interface remembers the small choices you made yesterday, then gives you a way to change them.'].includes(copy.quoteText) ? defaultTheme.copy.quoteText : copy.quoteText,
      quoteSource: copy.quoteSource === 'from your reading list' ? defaultTheme.copy.quoteSource : copy.quoteSource,
      railTitle: ['Your page has tools.', 'Your page has a toolbox.', 'Agent controls, in this tab.'].includes(copy.railTitle) ? defaultTheme.copy.railTitle : copy.railTitle,
      railDescription: ['People and agents can use the same controls. Pick one and watch the page respond.', 'People and agents use the same actions. You can see the seam.', 'Read the page, search notes, tune the surface, or draft an article. Review each change here.'].includes(copy.railDescription) ? defaultTheme.copy.railDescription : copy.railDescription,
    },
  })
}

function readPostsForDemo() {
  const stored = readLocal<Post[]>('commonplace-posts', initialPosts)
  const storedProfile = readLocal<UserProfile>('commonplace-profile', initialProfile)
  const seedPosts = new Map(initialPosts.map((post) => [post.id, post]))
  const posts = isLegacyDemoProfile(storedProfile)
    ? stored.map((post) => {
      const seed = seedPosts.get(post.id)
      const migrated = seed ? { ...seed, saved: post.saved, liked: post.liked, likes: post.likes, comments: post.comments } : post
      return migrated.handle === 'mayachen' || migrated.author === 'Maya Chen' || migrated.author === 'Maya Visual' || migrated.handle === 'andrew' || migrated.author === 'Andrew'
        ? { ...migrated, author: initialProfile.name, handle: initialProfile.handle, avatar: getInitials(initialProfile.name) }
        : migrated
    })
    : stored.map((post) => {
      const seed = seedPosts.get(post.id)
      return seed ? { ...seed, saved: post.saved, liked: post.liked, likes: post.likes, comments: post.comments } : post
    })
  const knownIds = new Set(posts.map((post) => post.id))
  return [...posts, ...additionalSamplePosts.filter((post) => !knownIds.has(post.id))]
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [feedFilter, setFeedFilterState] = useState<FeedFilterId>('for-you')
  const [query, setQuery] = useState('')
  const [theme, setThemeState] = useState<ThemeSettings>(() => readThemeForDemo())
  const [profile, setProfile] = useState<UserProfile>(() => readProfileForDemo())
  const [posts, setPosts] = useState<Post[]>(() => readPostsForDemo())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [studioOpen, setStudioOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [articleDraft, setArticleDraftState] = useState<ArticleDraft | null>(null)
  const articleDraftRef = useRef<ArticleDraft | null>(null)
  const composerOpenRef = useRef(false)
  const editingPostRef = useRef<Post | null>(null)
  const [profileEditorOpen, setProfileEditorOpen] = useState(false)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [registeredNames, setRegisteredNames] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [lastAgentAction, setLastAgentAction] = useState<{ name: string; timestamp: string; paramsSummary?: string } | null>(null)
  const actionsRef = useRef<AppActions | null>(null)
  const overlayTriggerRef = useRef<HTMLElement | null>(null)
  const overlayTriggerMetaRef = useRef<{ marker?: string; ariaLabel?: string; text?: string; postId?: string } | null>(null)
  const snapshotRef = useRef<AppSnapshot>({
    page: 'home',
    feedFilter: 'for-you',
    selectedPostId: null,
    searchQuery: '',
    theme: defaultTheme,
    profile: initialProfile,
    posts: initialPosts,
    voiceConnected: false,
  })

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast((current) => current === message ? '' : current), 2600)
  }, [])

  const rememberOverlayTrigger = useCallback((trigger?: HTMLElement) => {
    const capture = (element: HTMLElement) => {
      overlayTriggerRef.current = element
      const markers = ['nav-item-studio', 'topbar-tool', 'topbar-inspector', 'compose-button', 'write-link', 'voice-rail-button', 'profile-edit-button', 'post-title-button', 'post-art-button', 'rail-link', 'mobile-menu-button']
      overlayTriggerMetaRef.current = {
        marker: markers.find((marker) => element.classList.contains(marker)),
        ariaLabel: element.getAttribute('aria-label') ?? undefined,
        text: element.textContent?.replace(/\s+/g, ' ').trim() || undefined,
        postId: element.closest<HTMLElement>('[data-post-id]')?.dataset.postId,
      }
    }
    if (trigger) {
      capture(trigger)
      return
    }
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && activeElement !== document.body) capture(activeElement)
  }, [])

  const restoreOverlayTrigger = useCallback(() => {
    const trigger = overlayTriggerRef.current
    const meta = overlayTriggerMetaRef.current
    overlayTriggerRef.current = null
    overlayTriggerMetaRef.current = null
    if (!trigger) return
    window.setTimeout(() => {
      const target = trigger.isConnected ? trigger : [...document.querySelectorAll<HTMLElement>('button, [role="button"]')].find((candidate) => {
        if (meta?.marker && !candidate.classList.contains(meta.marker)) return false
        if (meta?.ariaLabel && candidate.getAttribute('aria-label') !== meta.ariaLabel) return false
        if (meta?.postId && candidate.closest<HTMLElement>('[data-post-id]')?.dataset.postId !== meta.postId) return false
        return !meta?.text || candidate.textContent?.replace(/\s+/g, ' ').trim() === meta.text
      })
      target?.focus()
    }, 50)
  }, [])

  const navigate = useCallback((page: PageId) => {
    setActivePage(page)
    setSelectedPost(null)
    if (page !== 'home') setFeedFilterState('for-you')
  }, [])

  const setFeedFilter = useCallback((filter: FeedFilterId) => {
    setFeedFilterState(filter)
    setActivePage('home')
  }, [])

  const setSearchQuery = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    setActivePage('home')
    const normalized = searchQuery.trim().toLowerCase()
    const visiblePosts = feedFilter === 'saved' ? posts.filter((post) => post.saved) : feedFilter === 'following' ? posts.filter((post) => post.handle !== profile.handle) : posts
    return visiblePosts.filter((post) => !normalized || [post.title, post.excerpt, post.body, post.author, post.handle, ...post.tags].join(' ').toLowerCase().includes(normalized))
  }, [feedFilter, posts, profile.handle])

  const searchFeed = useCallback((searchQuery: string) => {
    const matches = setSearchQuery(searchQuery)
    notify(searchQuery.trim() ? `${matches.length} ${matches.length === 1 ? 'note' : 'notes'} found for “${searchQuery}”` : 'Showing your full feed')
    return matches
  }, [notify, setSearchQuery])

  const clearSearch = useCallback(() => {
    setQuery('')
    notify('Showing your full feed')
  }, [notify])

  const openPost = useCallback((postId: string, trigger?: HTMLElement) => {
    const post = posts.find((candidate) => candidate.id === postId) ?? null
    if (post) {
      rememberOverlayTrigger(trigger)
      setSelectedPost(post)
      setActivePage('home')
    }
    return post
  }, [posts, rememberOverlayTrigger])

  const toggleSavePost = useCallback((postId: string) => {
    const current = posts.find((post) => post.id === postId)
    if (!current) return null
    const updated = { ...current, saved: !current.saved }
    setPosts((items) => items.map((post) => post.id === postId ? updated : post))
    setSelectedPost((post) => post?.id === postId ? updated : post)
    notify(updated.saved ? 'Added to your reading list' : 'Removed from your reading list')
    return updated
  }, [notify, posts])

  const toggleLikePost = useCallback((postId: string) => {
    const current = posts.find((post) => post.id === postId)
    if (!current) return null
    const updated = { ...current, liked: !current.liked, likes: current.likes + (current.liked ? -1 : 1) }
    setPosts((items) => items.map((post) => post.id === postId ? updated : post))
    setSelectedPost((post) => post?.id === postId ? updated : post)
    return updated
  }, [posts])

  const createPost = useCallback((input: { title: string; excerpt: string; body?: string; tags?: string[] }) => {
    const body = input.body?.trim() || input.excerpt.trim()
    const excerpt = input.excerpt.trim() || summarizeArticleBody(body)
    const artwork = (['sun', 'grid', 'orbit', 'signal', 'paper'] as const)[posts.length % 5]
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: profile.name,
      handle: profile.handle,
      avatar: getInitials(profile.name),
      published: 'Just now',
      title: input.title.trim(),
      excerpt,
      body,
      tags: input.tags?.length ? input.tags : ['field note'],
      readTime: articleReadTime(body),
      accent: ['#d7dba7', '#c9e4d7', '#f0d5a9', '#edc6bc'][posts.length % 4],
      artwork,
      saved: false,
      liked: false,
      likes: 0,
      comments: 0,
    }
    setPosts((items) => [newPost, ...items])
    setProfile((current) => ({ ...current, posts: current.posts + 1 }))
    setActivePage('home')
    setComposeOpen(false)
    setEditingPost(null)
    setArticleDraftState(null)
    composerOpenRef.current = false
    editingPostRef.current = null
    articleDraftRef.current = null
    notify('Your article is live in the feed')
    return newPost
  }, [notify, posts.length, profile])

  const updatePost = useCallback((postId: string, patch: ArticlePatch) => {
    const current = posts.find((post) => post.id === postId)
    if (!current) return null
    const body = typeof patch.body === 'string' && patch.body.trim() ? patch.body.trim() : current.body
    const updated: Post = {
      ...current,
      ...(typeof patch.title === 'string' && patch.title.trim() ? { title: patch.title.trim() } : {}),
      ...(typeof patch.excerpt === 'string' ? { excerpt: patch.excerpt.trim() || summarizeArticleBody(body) } : {}),
      body,
      ...(patch.tags ? { tags: patch.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 12) } : {}),
      ...(patch.artwork ? { artwork: patch.artwork } : {}),
      ...(patch.accent ? { accent: patch.accent } : {}),
      readTime: articleReadTime(body),
    }
    setPosts((items) => items.map((post) => post.id === postId ? updated : post))
    setSelectedPost((post) => post?.id === postId ? updated : post)
    setComposeOpen(false)
    setEditingPost(null)
    setArticleDraftState(null)
    composerOpenRef.current = false
    editingPostRef.current = null
    articleDraftRef.current = null
    notify('Article updated')
    return updated
  }, [notify, posts])

  const deletePost = useCallback((postId: string) => {
    const current = posts.find((post) => post.id === postId)
    if (!current) return null
    setPosts((items) => items.filter((post) => post.id !== postId))
    if (current.handle === profile.handle) setProfile((item) => ({ ...item, posts: Math.max(0, item.posts - 1) }))
    setSelectedPost((post) => post?.id === postId ? null : post)
    setComposeOpen(false)
    setEditingPost(null)
    setArticleDraftState(null)
    composerOpenRef.current = false
    editingPostRef.current = null
    articleDraftRef.current = null
    notify('Article deleted')
    return current
  }, [notify, posts, profile.handle])

  const updateProfile = useCallback((patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'location' | 'website'>>) => {
    const updated = { ...profile, ...patch }
    setProfile(updated)
    setPosts((items) => items.map((post) => post.handle === profile.handle ? { ...post, author: updated.name, avatar: getInitials(updated.name) } : post))
    notify('Profile identity updated')
    return updated
  }, [notify, profile])

  const setTheme = useCallback((patch: Partial<ThemeSettings>) => {
    const radiusPatch = patch.radius && patch.controlRadius === undefined && patch.surfaceRadius === undefined ? radiusPresets[patch.radius] : {}
    const updated = normalizeThemeSettings({ ...theme, ...patch, ...radiusPatch, copy: patch.copy ? { ...theme.copy, ...patch.copy } : theme.copy })
    setThemeState(updated)
    notify('Page controls updated')
    return updated
  }, [notify, theme])

  const moveHomeBlock = useCallback((block: HomeBlockId, toIndex: number) => {
    const order = theme.homeOrder.filter((item) => item !== block)
    const boundedIndex = Math.min(order.length, Math.max(0, Math.round(toIndex)))
    order.splice(boundedIndex, 0, block)
    return setTheme({ homeOrder: order })
  }, [setTheme, theme.homeOrder])

  const moveNavItem = useCallback((page: PageId, toIndex: number) => {
    const order = theme.navOrder.filter((item) => item !== page)
    const boundedIndex = Math.min(order.length, Math.max(0, Math.round(toIndex)))
    order.splice(boundedIndex, 0, page)
    return setTheme({ navOrder: order })
  }, [setTheme, theme.navOrder])

  const resetTheme = useCallback(() => {
    const updated = normalizeThemeSettings(defaultTheme)
    setThemeState(updated)
    notify('Customization reset to defaults')
    return updated
  }, [notify])

  const openStudio = useCallback((trigger?: HTMLElement) => {
    rememberOverlayTrigger(trigger)
    setStudioOpen(true)
  }, [rememberOverlayTrigger])
  const openVoicePanel = useCallback((trigger?: HTMLElement) => {
    rememberOverlayTrigger(trigger)
    setVoiceOpen(true)
  }, [rememberOverlayTrigger])
  const openComposer = useCallback((postId?: string, trigger?: HTMLElement) => {
    const post = postId ? posts.find((candidate) => candidate.id === postId) ?? null : null
    if (postId && !post) return null
    rememberOverlayTrigger(trigger)
    setSelectedPost(null)
    setEditingPost(post)
    const draft = post ? draftFromPost(post) : emptyArticleDraft()
    editingPostRef.current = post
    articleDraftRef.current = draft
    composerOpenRef.current = true
    setArticleDraftState(draft)
    setComposeOpen(true)
    return articleEditorState(draft, post?.id ?? null)
  }, [posts, rememberOverlayTrigger])
  const getArticleDraft = useCallback(() => {
    const currentDraft = articleDraftRef.current
    if (!composerOpenRef.current || !currentDraft) return null
    return articleEditorState(currentDraft, editingPostRef.current?.id ?? null)
  }, [])
  const setArticleDraft = useCallback((patch: Partial<ArticleDraft>) => {
    const currentDraft = articleDraftRef.current
    if (!composerOpenRef.current || !currentDraft) return null
    const next: ArticleDraft = {
      title: typeof patch.title === 'string' ? patch.title : currentDraft.title,
      excerpt: typeof patch.excerpt === 'string' ? patch.excerpt : currentDraft.excerpt,
      body: typeof patch.body === 'string' ? patch.body : currentDraft.body,
      tags: patch.tags !== undefined ? patch.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 12) : currentDraft.tags,
    }
    articleDraftRef.current = next
    setArticleDraftState(next)
    return articleEditorState(next, editingPostRef.current?.id ?? null)
  }, [])
  const setArticleTitle = useCallback((title: string) => setArticleDraft({ title }), [setArticleDraft])
  const setArticleExcerpt = useCallback((excerpt: string) => setArticleDraft({ excerpt }), [setArticleDraft])
  const setArticleBody = useCallback((body: string) => setArticleDraft({ body }), [setArticleDraft])
  const setArticleTags = useCallback((tags: string[]) => setArticleDraft({ tags }), [setArticleDraft])
  const publishArticleDraft = useCallback(() => {
    const currentDraft = articleDraftRef.current
    const currentEditingPost = editingPostRef.current
    if (!composerOpenRef.current || !currentDraft || !canPublishArticle(currentDraft)) return null
    if (currentEditingPost) return updatePost(currentEditingPost.id, currentDraft)
    return createPost(currentDraft)
  }, [createPost, updatePost])
  const discardArticleDraft = useCallback(() => {
    composerOpenRef.current = false
    editingPostRef.current = null
    articleDraftRef.current = null
    setComposeOpen(false)
    setEditingPost(null)
    setArticleDraftState(null)
  }, [])
  const openProfileEditor = useCallback((trigger?: HTMLElement) => {
    rememberOverlayTrigger(trigger)
    setActivePage('profile')
    setProfileEditorOpen(true)
  }, [rememberOverlayTrigger])
  const openTools = useCallback((trigger?: HTMLElement) => {
    rememberOverlayTrigger(trigger)
    setToolsOpen(true)
  }, [rememberOverlayTrigger])
  const closeOverlays = useCallback(() => {
    setSelectedPost(null)
    setStudioOpen(false)
    setToolsOpen(false)
    setVoiceOpen(false)
    setComposeOpen(false)
    setEditingPost(null)
    setArticleDraftState(null)
    composerOpenRef.current = false
    editingPostRef.current = null
    articleDraftRef.current = null
    setProfileEditorOpen(false)
    restoreOverlayTrigger()
  }, [restoreOverlayTrigger])
  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const onVoiceToolCall = useCallback(async (name: string, input: Record<string, unknown>) => {
    const tool = commonplaceToolSpecs.find((candidate) => candidate.name === name)
    if (!tool) return { ok: false, error: `Tool ${name} is not available.` }
    try {
      return await tool.execute(input)
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Tool failed.' }
    }
  }, [])

  const voiceAgent = useRealtimeAgent({ getSnapshot, onToolCall: onVoiceToolCall })
  const actions: AppActions = { getSnapshot, navigate, setFeedFilter, searchFeed, setSearchQuery, clearSearch, openPost, toggleSavePost, toggleLikePost, createPost, updatePost, deletePost, updateProfile, setTheme, moveHomeBlock, moveNavItem, resetTheme, openStudio, openVoicePanel, openComposer, getArticleDraft, setArticleDraft, setArticleTitle, setArticleExcerpt, setArticleBody, setArticleTags, publishArticleDraft, discardArticleDraft, openProfileEditor, openTools, closeOverlays }

  useLayoutEffect(() => {
    applyThemeStyleToDocument(theme)
    const presentationClass = presentationClassName(activePresentation)
    document.documentElement.classList.add(presentationClass)
    return () => document.documentElement.classList.remove(presentationClass)
  }, [theme])

  useEffect(() => {
    actionsRef.current = actions
    snapshotRef.current = { page: activePage, feedFilter, selectedPostId: selectedPost?.id ?? null, searchQuery: query, theme, profile, posts, voiceConnected: voiceAgent.isConnected }
  })

  useEffect(() => { window.localStorage.setItem('commonplace-theme', JSON.stringify(theme)) }, [theme])
  useEffect(() => { window.localStorage.setItem('commonplace-profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { window.localStorage.setItem('commonplace-posts', JSON.stringify(posts)) }, [posts])

  useEffect(() => {
    let mounted = true
    void registerCommonplaceTools(() => actionsRef.current as AppActions).then((result) => {
      if (!mounted) return
      setRegisteredCount(result.count)
      setRegisteredNames(result.names)
    })
    return () => { mounted = false }
  }, [])


  useEffect(() => {
    setToolExecutionListener((name, input) => {
      const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(new Date())
      const keys = Object.keys(input)
      const paramsSummary = keys.length ? keys.slice(0, 3).map((k) => `${k}: ${JSON.stringify(input[k])}`).join(', ') : undefined
      setLastAgentAction({ name, timestamp: time, paramsSummary })
      setToast(`⚡ WebMCP: ${name}`)
      window.setTimeout(() => setToast((curr) => curr === `⚡ WebMCP: ${name}` ? '' : curr), 2800)
    })
    return () => setToolExecutionListener(null)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault()
          document.querySelector<HTMLElement>('.search-field')?.focus()
      }
      if (event.key === 'Escape') {
        setSelectedPost(null)
        setStudioOpen(false)
        setToolsOpen(false)
        setVoiceOpen(false)
        setComposeOpen(false)
        setEditingPost(null)
        setArticleDraftState(null)
        composerOpenRef.current = false
        editingPostRef.current = null
        articleDraftRef.current = null
        setProfileEditorOpen(false)
        restoreOverlayTrigger()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [restoreOverlayTrigger])

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let items = activePage === 'saved' ? posts.filter((post) => post.saved) : activePage === 'profile' ? posts.filter((post) => post.handle === profile.handle) : posts
    if (activePage === 'home' && feedFilter === 'saved') items = items.filter((post) => post.saved)
    if (activePage === 'home' && feedFilter === 'following') items = items.filter((post) => post.handle !== profile.handle)
    if (!normalized) return items
    return items.filter((post) => [post.title, post.excerpt, post.author, post.handle, ...post.tags].join(' ').toLowerCase().includes(normalized))
  }, [activePage, feedFilter, posts, profile.handle, query])
  const savedCount = posts.filter((post) => post.saved).length

  const previewTool = useCallback(async (name: string) => {
    return executeRegisteredTool(name)
  }, [])

  const deleteArticleFromUi = useCallback((postId: string) => {
    const post = posts.find((candidate) => candidate.id === postId)
    if (post && window.confirm(`Delete “${post.title}”? This cannot be undone.`)) deletePost(postId)
  }, [deletePost, posts])

  const pageContent = activePage === 'profile' ? (
    <ProfilePage settings={theme} profile={profile} posts={filteredPosts} editorOpen={profileEditorOpen} onEdit={openProfileEditor} onCloseEditor={() => { setProfileEditorOpen(false); restoreOverlayTrigger() }} onSaveProfile={updateProfile} onOpenPost={openPost} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onEditPost={openComposer} onDeletePost={deleteArticleFromUi} />
  ) : activePage === 'saved' ? (
    <ReadingListPage settings={theme} posts={filteredPosts} onNavigateHome={() => navigate('home')} onOpenPost={openPost} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onEditPost={openComposer} onDeletePost={deleteArticleFromUi} />
  ) : (
    <HomePage settings={theme} profile={profile} posts={filteredPosts} query={query} filter={feedFilter} savedCount={savedCount} registeredCount={registeredCount} voiceConnected={voiceAgent.isConnected} onFilterChange={setFeedFilter} onClearSearch={clearSearch} onOpenVoice={openVoicePanel} onOpenStudio={openStudio} onCompose={(trigger) => openComposer(undefined, trigger)} onOpenPost={openPost} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onEditPost={openComposer} onDeletePost={deleteArticleFromUi} onApplyTheme={setTheme} />
  )

  return (
    <div className={`app-shell ${presentationClassName(activePresentation)} palette-${theme.palette} surface-${theme.surfaceStyle} ${theme.reduceMotion ? 'reduce-motion' : ''}`} data-ui-variant={activePresentation} style={getThemeStyle(theme)} onPointerDownCapture={(event) => {
      const target = event.target
      if (target instanceof HTMLElement) {
        const trigger = target.closest<HTMLElement>('button, [role="button"]')
        if (trigger) overlayTriggerRef.current = trigger
      }
    }} onClickCapture={(event) => {
      const target = event.target
      if (target instanceof HTMLElement) {
        const trigger = target.closest<HTMLElement>('button, [role="button"]')
        if (trigger) overlayTriggerRef.current = trigger
      }
    }}>
      {theme.showSidebar && <Sidebar activePage={activePage} profile={profile} savedCount={savedCount} navOrder={theme.navOrder} showFooter={theme.showSidebarFooter} brandName={theme.copy.brandName} brandKicker={theme.copy.brandKicker} onNavigate={navigate} onOpenStudio={openStudio} />}
      <div className="app-workspace">
        {theme.showTopbar && <Topbar activePage={activePage} savedCount={savedCount} query={query} onQueryChange={setSearchQuery} onOpenVoice={openVoicePanel} onOpenTools={openTools} onOpenStudio={openStudio} onNavigate={navigate} onCompose={(trigger) => openComposer(undefined, trigger)} voiceConnected={voiceAgent.isConnected} registeredCount={registeredCount} brandName={theme.copy.brandName} />}
        <div className={`content-grid${theme.showAgentRail ? '' : ' no-rail'}`}>
          {pageContent}
          {theme.showAgentRail && <AgentRail settings={theme} registeredCount={registeredCount} lastAction={lastAgentAction} onOpenTools={openTools} onOpenStudio={openStudio} onCompose={(trigger) => openComposer(undefined, trigger)} onOpenVoice={openVoicePanel} voiceConnected={voiceAgent.isConnected} />}
        </div>
      </div>
      {selectedPost && <PostReader post={selectedPost} settings={theme} onClose={() => { setSelectedPost(null); restoreOverlayTrigger() }} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onEdit={openComposer} onDelete={deleteArticleFromUi} />}
      {studioOpen && <StudioPanel settings={theme} onChange={setTheme} onMoveHomeBlock={moveHomeBlock} onMoveNavItem={moveNavItem} onReset={resetTheme} onClose={() => setStudioOpen(false)} onRestoreFocus={restoreOverlayTrigger} />}
      {toolsOpen && <ToolInspector registeredNames={registeredNames} onClose={() => setToolsOpen(false)} onRestoreFocus={restoreOverlayTrigger} onPreviewTool={previewTool} />}
      {voiceOpen && <VoiceAgentPanel agent={voiceAgent} onClose={() => setVoiceOpen(false)} onRestoreFocus={restoreOverlayTrigger} />}
      {composeOpen && <ComposeDialog key={`${editingPost?.id ?? 'new'}`} open editingPost={editingPost} draft={articleDraft ?? emptyArticleDraft()} onClose={discardArticleDraft} onRestoreFocus={restoreOverlayTrigger} onDraftChange={setArticleDraft} onSubmit={() => { void publishArticleDraft() }} />}
      {toast && <div className="toast" role="status"><span className="status-dot status-dot-bright" />{toast}</div>}
    </div>
  )
}

interface HomePageProps {
  settings: ThemeSettings
  profile: UserProfile
  posts: Post[]
  query: string
  filter: FeedFilterId
  savedCount: number
  registeredCount: number
  voiceConnected: boolean
  onFilterChange: (filter: FeedFilterId) => void
  onClearSearch: () => void
  onOpenVoice: (trigger?: HTMLElement) => void
  onOpenStudio: (trigger?: HTMLElement) => void
  onCompose: (trigger?: HTMLElement) => void
  onOpenPost: (postId: string, trigger?: HTMLElement) => void
  onToggleSave: (postId: string) => void
  onToggleLike: (postId: string) => void
  onEditPost: (postId: string, trigger?: HTMLElement) => void
  onDeletePost: (postId: string) => void
  onApplyTheme: (patch: Partial<ThemeSettings>) => void
}

function HomePage({ settings, profile, posts, query, filter, savedCount, registeredCount, voiceConnected, onFilterChange, onClearSearch, onOpenVoice, onOpenStudio, onCompose, onOpenPost, onToggleSave, onToggleLike, onEditPost, onDeletePost, onApplyTheme }: HomePageProps) {
  return (
    <main className="page-content page-home">
      {settings.showHomeTopline && <div className="home-topline" data-customization-block="home-topline"><span>{formatToplineDate()}</span></div>}
      <div className="home-block-stack">
        {settings.homeOrder.map((block) => {
          if (block === 'hero' && settings.showHomeHero) {
            return <section className={`home-intro home-hero${settings.showHeroSurface ? '' : ' home-hero-flat'}`} data-customization-block="home-hero" key={block}><div className="home-intro-copy"><p className="home-kicker">{settings.copy.heroKicker.replace('{name}', profile.name.split(' ')[0])}</p><h1>{settings.copy.heroTitle} <em>{settings.copy.heroEmphasis}</em></h1><p className="home-lede">{settings.copy.heroLede}</p><div className="home-actions"><Button className="primary-button" variant="default" size="lg" type="button" onClick={(event) => onOpenVoice(event.currentTarget)}><Icon name="mic" size={16} /> Voice guide</Button><Button className="secondary-button" variant="outline" size="lg" type="button" onClick={(event) => onOpenStudio(event.currentTarget)}><Icon name="spark" size={16} /> Tune page</Button></div></div><div className="home-intro-side" aria-label="Personal surface status"><div className="home-signal-card"><div className="home-signal-label">Surface</div><div className="home-signal-mark" aria-hidden="true"><span /><span /><span /><span /></div><strong>{settings.palette} / {settings.density}</strong><div className="home-signal-palettes" role="group" aria-label="Quick palette switch">{((['paper', 'lichen', 'night'] as const)).map((p) => (<button key={p} type="button" className={`palette-chip palette-chip-${p}${settings.palette === p ? ' is-active' : ''}`} onClick={() => onApplyTheme({ palette: p })} title={`Switch to ${p} palette`}><span className="palette-chip-dot" />{p}</button>))}</div><p>{registeredCount || commonplaceToolSpecs.length} WebMCP tools registered</p><div className="home-signal-meta"><span>{voiceConnected ? 'voice live' : 'voice ready'}</span><span>{settings.contentWidth}ch measure</span></div></div></div></section>
          }

          if (block === 'quote' && settings.showQuote) {
            return <aside className="quote-note home-quote" data-customization-block="home-quote" key={block}><span className="quote-mark">“</span><p>{settings.copy.quoteText}</p><div className="quote-note-footer"><span>{settings.copy.quoteSource}</span><span className="quote-rule" /></div></aside>
          }
          if (block === 'feed' && settings.showHomeFeed) {
            return <section className="feed-section home-feed" data-customization-block="home-feed" aria-labelledby="feed-title" key={block}><div className="section-heading-row"><div><h2 id="feed-title">For you</h2></div><Button className="write-link" variant="link" size="xs" type="button" onClick={(event) => onCompose(event.currentTarget)}><span>Write an article</span><Icon name="arrow-up-right" size={16} /></Button></div><Tabs value={filter} onValueChange={(value) => { if (value === 'for-you' || value === 'saved' || value === 'following') onFilterChange(value) }}><TabsList className="filter-row" aria-label="Feed views">{([['for-you', 'For you'], ['saved', 'Saved'], ['following', 'Following']] as const).map(([id, label]) => <TabsTrigger className={`filter-chip${filter === id ? ' is-active' : ''}`} value={id} key={id}>{label}{id === 'saved' && <span>{savedCount}</span>}</TabsTrigger>)}{query && <span className="query-note">Showing matches for “{query}”</span>}</TabsList></Tabs>{posts.length ? <div className="feed-list">{posts.map((post, index) => <PostCard post={post} index={index} showReadingTimes={settings.showReadingTimes} showArtwork={settings.showPostArtwork} showTags={settings.showPostTags} showActions={settings.showPostActions} showExcerpt={settings.showPostExcerpt} showAuthor={settings.showPostAuthor} showPublished={settings.showPostPublished} layout={settings.postLayout} artworkPosition={settings.artworkPosition} onOpen={onOpenPost} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onEdit={onEditPost} onDelete={onDeletePost} key={post.id} />)}</div> : <EmptyFeed query={query} onReset={() => { onFilterChange('for-you'); onClearSearch() }} />} {settings.showFeedEnd && <div className="feed-end"><span className="feed-end-line" /><span>you are caught up</span><span className="feed-end-line" /></div>}</section>
          }
          return null
        })}
      </div>
    </main>
  )
}

function EmptyFeed({ query, onReset }: { query: string; onReset: () => void }) {
  return <div className="empty-state"><div className="empty-state-mark"><Icon name={query ? 'search' : 'spark'} size={20} /></div><h3>{query ? 'No notes match that yet.' : 'Your reading list is quiet.'}</h3><p>{query ? 'Try a broader phrase or search by a person, topic, or tag.' : 'As you save things, they will collect here with the shape you gave them.'}</p>{query && <Button className="secondary-button" variant="outline" size="sm" type="button" onClick={onReset}>Back to your feed</Button>}</div>
}

interface ProfilePageProps {
  settings: ThemeSettings
  profile: UserProfile
  posts: Post[]
  editorOpen: boolean
  onEdit: (trigger?: HTMLElement) => void
  onCloseEditor: () => void
  onSaveProfile: (patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'location' | 'website'>>) => void
  onOpenPost: (postId: string, trigger?: HTMLElement) => void
  onToggleSave: (postId: string) => void
  onToggleLike: (postId: string) => void
  onEditPost: (postId: string, trigger?: HTMLElement) => void
  onDeletePost: (postId: string) => void
}

function ProfilePage({ settings, profile, posts, editorOpen, onEdit, onCloseEditor, onSaveProfile, onOpenPost, onToggleSave, onToggleLike, onEditPost, onDeletePost }: ProfilePageProps) {
  return (
    <main className="page-content page-profile">
      {settings.showProfileTopline && <div className="profile-topline" data-customization-block="profile-topline"><span>Public profile</span></div>}
      <Card className={`profile-hero${settings.showProfileCover ? '' : ' profile-hero-no-cover'}`} data-customization-block="profile-card">{settings.showProfileCover && <div className="profile-cover" data-customization-block="profile-cover"><Artwork variant="sun" accent="#d7dba7" /></div>}<div className="profile-identity-row"><Avatar initials={getInitials(profile.name)} size="large" tone="brand" /><div className="profile-identity"><div className="profile-name-row"><h1>{profile.name}</h1><span>{profile.pronouns}</span></div><p className="profile-handle">@{profile.handle}</p>{settings.showProfileBio && <div data-customization-block="profile-bio"><p className="profile-bio">{profile.bio}</p><div className="profile-location"><span><Icon name="compass" size={14} /> {profile.location}</span><span><Icon name="link" size={14} /> {profile.website}</span></div></div>}</div><Button className="secondary-button profile-edit-button" variant="outline" size="sm" type="button" onClick={(event) => onEdit(event.currentTarget)}><Icon name="edit" size={16} /> Edit identity</Button></div></Card>
      {editorOpen && <ProfileEditor key={`${profile.name}-${profile.bio}-${profile.location}-${profile.website}`} profile={profile} onSave={onSaveProfile} onClose={onCloseEditor} />}
      {settings.showProfileStats && <div className="profile-stats" data-customization-block="profile-stats"><div><strong>{profile.posts}</strong><span>field notes</span></div><div><strong>{profile.followers.toLocaleString()}</strong><span>following you</span></div><div><strong>{profile.following}</strong><span>you follow</span></div></div>}
      <section className="profile-body"><div className="profile-body-heading"><div><h2>Notes by {profile.name.split(' ')[0]}</h2></div>{settings.showProfileInterests && <div className="interest-list" data-customization-block="profile-interests">{profile.interests.map((interest) => <span className="tag" key={interest}>#{interest}</span>)}</div>}</div>{posts.length ? <div className="feed-list">{posts.map((post, index) => <PostCard post={post} index={index} showReadingTimes={settings.showReadingTimes} showArtwork={settings.showPostArtwork} showTags={settings.showPostTags} showActions={settings.showPostActions} showExcerpt={settings.showPostExcerpt} showAuthor={settings.showPostAuthor} showPublished={settings.showPostPublished} layout={settings.postLayout} artworkPosition={settings.artworkPosition} onOpen={onOpenPost} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onEdit={onEditPost} onDelete={onDeletePost} key={post.id} />)}</div> : <EmptyFeed query="" onReset={() => undefined} />}</section>
    </main>
  )
}

function ReadingListPage({ settings, posts, onNavigateHome, onOpenPost, onToggleSave, onToggleLike, onEditPost, onDeletePost }: { settings: ThemeSettings; posts: Post[]; onNavigateHome: () => void; onOpenPost: (postId: string, trigger?: HTMLElement) => void; onToggleSave: (postId: string) => void; onToggleLike: (postId: string) => void; onEditPost: (postId: string, trigger?: HTMLElement) => void; onDeletePost: (postId: string) => void }) {
  return <main className="page-content page-saved"><div className="saved-topline"><span>Saved</span><span className="saved-count">{posts.length} items</span></div><div className="saved-heading"><h1>Reading list</h1><p>Things you marked because you wanted to come back with a little more time.</p></div>{posts.length ? <div className="feed-list">{posts.map((post, index) => <PostCard post={post} index={index} showReadingTimes={settings.showReadingTimes} showArtwork={settings.showPostArtwork} showTags={settings.showPostTags} showActions={settings.showPostActions} showExcerpt={settings.showPostExcerpt} showAuthor={settings.showPostAuthor} showPublished={settings.showPostPublished} layout={settings.postLayout} artworkPosition={settings.artworkPosition} onOpen={onOpenPost} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onEdit={onEditPost} onDelete={onDeletePost} key={post.id} />)}</div> : <EmptyFeed query="" onReset={onNavigateHome} />}<Button className="back-to-feed" variant="ghost" size="sm" type="button" onClick={onNavigateHome}><Icon name="chevron-left" size={16} /> Back to your feed</Button></main>
}

function PostReader({ post, settings, onClose, onToggleSave, onToggleLike, onEdit, onDelete }: { post: Post; settings: ThemeSettings; onClose: () => void; onToggleSave: (postId: string) => void; onToggleLike: (postId: string) => void; onEdit: (postId: string, trigger?: HTMLElement) => void; onDelete: (postId: string) => void }) {
  return <div className="reader-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><Card className="reader-modal" role="dialog" aria-modal="true" aria-label={post.title}><div className="reader-header"><div className="post-author"><Avatar initials={post.avatar} size="small" tone="brand" /><span><strong>{post.author}</strong><small>@{post.handle} · {post.published}</small></span></div><Button className="icon-button" size="icon-sm" variant="ghost" type="button" onClick={onClose} aria-label="Close post"><Icon name="close" size={18} /></Button></div>{settings.showPostArtwork && <Artwork variant={post.artwork} accent={post.accent} />}<div className="reader-copy">{(settings.showPostTags || settings.showReadingTimes) && <div className="reader-tags">{settings.showPostTags && post.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}{settings.showReadingTimes && <span className="read-time">{post.readTime} min read</span>}</div>}<h1 id="reader-title">{post.title}</h1><p className="reader-dek">{post.excerpt}</p><div className="reader-body">{post.body.split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/u).filter(Boolean).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph.trim()}</p>)}</div>{settings.showReaderActions && <div className="reader-actions"><Button className={`secondary-button${post.liked ? ' is-liked' : ''}`} variant="outline" size="sm" type="button" onClick={() => onToggleLike(post.id)}><Icon name="heart" size={16} /> {post.liked ? 'Liked' : 'Like'} <span>{post.likes}</span></Button><Button className={`secondary-button${post.saved ? ' is-saved' : ''}`} variant="outline" size="sm" type="button" onClick={() => onToggleSave(post.id)}><Icon name="bookmark" size={16} /> {post.saved ? 'Saved' : 'Save for later'}</Button><Button className="secondary-button" variant="outline" size="sm" type="button" onClick={(event) => onEdit(post.id, event.currentTarget)}><Icon name="edit" size={16} /> Edit article</Button><Button className="text-button reader-delete-button" variant="ghost" size="sm" type="button" onClick={() => onDelete(post.id)}><Icon name="trash" size={16} /> Delete</Button><Button className="text-button" variant="ghost" size="sm" type="button" onClick={onClose}>Close article</Button></div>}</div></Card></div>
}

export default App
