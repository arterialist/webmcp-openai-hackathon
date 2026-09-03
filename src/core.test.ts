import { describe, expect, it, vi } from 'vitest'
import { createRealtimeAnswer } from '../server/realtime'
import { initialProfile } from './data'
import { defaultTheme, getThemeStyle, normalizeThemeSettings, paletteTokens } from './theme'
import type { AppSnapshot, ArticleDraft, ArticleEditorState, Post, ThemeSettings, UserProfile } from './types'
import { buildVoiceInstructions } from './useRealtimeAgent'
import { commonplaceToolSpecs, getRealtimeToolDefinitions, getWebMcpToolNameFromRealtimeName, registerCommonplaceTools, type AppActions } from './webmcp'

const baseTheme: ThemeSettings = normalizeThemeSettings(defaultTheme)

describe('Commonplace design system', () => {
  it('ships three non-indigo palettes with complete semantic tokens', () => {
    expect(Object.keys(paletteTokens)).toEqual(['paper', 'lichen', 'night'])
    for (const palette of Object.values(paletteTokens)) {
      expect(palette.bg).toMatch(/^oklch\(/)
      expect(palette.brand).toMatch(/^oklch\(/)
      expect(palette.accent).toMatch(/^oklch\(/)
    }
  })

  it('turns every user preference into live CSS variables', () => {
    const vars = getThemeStyle({ ...baseTheme, palette: 'night', density: 'airy', radius: 'soft', typeScale: 1.08, contentWidth: 74, showAgentRail: false, reduceMotion: true, sidebarWidth: 280, fontFamily: 'serif', customColors: { brand: '#123456' } }) as Record<string, string>
    expect(vars['--color-bg']).toBe(paletteTokens.night.bg)
    expect(vars['--radius-control']).toBe('6px')
    expect(vars['--type-scale']).toBe('1.08')
    expect(vars['--content-width']).toBe('74ch')
    expect(vars['--rail-width']).toBe('0px')
    expect(vars['--sidebar-width']).toBe('280px')
    expect(vars['--font-body']).toContain('Baskerville')
    expect(vars['--color-brand']).toBe('#123456')
    expect(vars['--motion-normal']).toBe('1ms')
  })

  it('fills in new controls when loading an older saved theme', () => {
    expect(normalizeThemeSettings({ palette: 'night' })).toMatchObject({
      palette: 'night',
      fontFamily: 'geist',
      showSidebar: true,
      homeOrder: ['hero', 'quote', 'feed'],
      navOrder: ['home', 'saved', 'profile'],
      customColors: {},
    })
  })
})

describe('WebMCP contract', () => {
  it('exposes the full Commonplace surface as named tools', () => {
    expect(commonplaceToolSpecs).toHaveLength(44)
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_theme')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_customization')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.get_customization_schema')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.move_home_block')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.create_post')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.create_article')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.update_article')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.get_article_draft')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_article_draft')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_article_title')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_article_excerpt')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_article_body')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_article_tags')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.publish_article_draft')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.discard_article_draft')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.delete_article')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_spacing')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.set_copy')
    expect(commonplaceToolSpecs.map((tool) => tool.name)).toContain('commonplace.open_composer')
    expect(commonplaceToolSpecs.every((tool) => tool.inputSchema.type === 'object')).toBe(true)
  })

  it('maps the same tool contract into Realtime function definitions', () => {
    const definitions = getRealtimeToolDefinitions()
    expect(definitions).toHaveLength(commonplaceToolSpecs.length)
    expect(definitions.every((tool) => tool.type === 'function' && tool.parameters.type === 'object')).toBe(true)
    expect(definitions.find((tool) => tool.name === 'commonplace_navigate')?.parameters.required).toEqual(['page'])
    expect(getWebMcpToolNameFromRealtimeName('commonplace_navigate')).toBe('commonplace.navigate')
    expect(definitions.every((tool) => /^[a-zA-Z0-9_-]+$/.test(tool.name))).toBe(true)
  })

  it('executes every tool with a valid payload and returns the shared response envelope', async () => {
    const post: Post = {
      id: 'post-test',
      author: 'Ada Lovelace',
      handle: 'ada',
      avatar: 'AL',
      published: 'Just now',
      title: 'A test note',
      excerpt: 'A small note used to exercise the browser contract.',
      body: 'A small note used to exercise the browser contract.',
      tags: ['testing'],
      readTime: 1,
      accent: '#d7dba7',
      artwork: 'paper',
      saved: true,
      liked: false,
      likes: 2,
      comments: 0,
    }
    const profile: UserProfile = {
      name: 'Maya Chen',
      handle: 'mayachen',
      pronouns: 'she / her',
      bio: 'A profile used in the WebMCP contract test.',
      location: 'Kuala Lumpur',
      website: 'maya.example',
      interests: ['testing'],
      following: 4,
      followers: 12,
      posts: 1,
    }
    let snapshot: AppSnapshot = { page: 'home', feedFilter: 'for-you', selectedPostId: null, searchQuery: '', theme: baseTheme, profile, posts: [post], voiceConnected: false }
    const draft: ArticleDraft = { title: 'A draft article', excerpt: 'A draft summary.', body: 'A draft body with enough words.', tags: ['draft'] }
    let editor: ArticleEditorState | null = null
    const calls: Array<{ name: string; input?: unknown }> = []
    const updateEditor = (patch: Partial<ArticleDraft>) => {
      if (!editor) return null
      editor = { ...editor, draft: { ...editor.draft, ...patch }, canPublish: true }
      return editor
    }
    const actions: AppActions = {
      getSnapshot: () => snapshot,
      navigate: (page) => { calls.push({ name: 'navigate', input: page }); snapshot = { ...snapshot, page } },
      setFeedFilter: (filter) => { calls.push({ name: 'setFeedFilter', input: filter }); snapshot = { ...snapshot, page: 'home', feedFilter: filter } },
      searchFeed: (query) => { calls.push({ name: 'searchFeed', input: query }); snapshot = { ...snapshot, searchQuery: query }; return [post] },
      setSearchQuery: (query) => { calls.push({ name: 'setSearchQuery', input: query }); snapshot = { ...snapshot, searchQuery: query }; return [post] },
      clearSearch: () => { calls.push({ name: 'clearSearch' }); snapshot = { ...snapshot, searchQuery: '' } },
      openPost: (postId) => { calls.push({ name: 'openPost', input: postId }); snapshot = { ...snapshot, selectedPostId: postId }; return postId === post.id ? post : null },
      toggleSavePost: (postId) => { calls.push({ name: 'toggleSavePost', input: postId }); return postId === post.id ? post : null },
      toggleLikePost: (postId) => { calls.push({ name: 'toggleLikePost', input: postId }); return postId === post.id ? post : null },
      createPost: (input) => { calls.push({ name: 'createPost', input }); return post },
      updatePost: (postId, patch) => { calls.push({ name: 'updatePost', input: { postId, patch } }); return postId === post.id ? post : null },
      deletePost: (postId) => { calls.push({ name: 'deletePost', input: postId }); return postId === post.id ? post : null },
      updateProfile: (patch) => { calls.push({ name: 'updateProfile', input: patch }); return { ...profile, ...patch } },
      setTheme: (patch) => { calls.push({ name: 'setTheme', input: patch }); snapshot = { ...snapshot, theme: { ...snapshot.theme, ...patch } }; return snapshot.theme },
      moveHomeBlock: (block, toIndex) => { calls.push({ name: 'moveHomeBlock', input: { block, toIndex } }); const order = snapshot.theme.homeOrder.filter((item) => item !== block); order.splice(toIndex, 0, block); snapshot = { ...snapshot, theme: { ...snapshot.theme, homeOrder: order } }; return snapshot.theme },
      moveNavItem: (page, toIndex) => { calls.push({ name: 'moveNavItem', input: { page, toIndex } }); const order = snapshot.theme.navOrder.filter((item) => item !== page); order.splice(toIndex, 0, page); snapshot = { ...snapshot, theme: { ...snapshot.theme, navOrder: order } }; return snapshot.theme },
      resetTheme: () => { calls.push({ name: 'resetTheme' }); snapshot = { ...snapshot, theme: baseTheme }; return baseTheme },
      openStudio: () => { calls.push({ name: 'openStudio' }) },
      openVoicePanel: () => { calls.push({ name: 'openVoicePanel' }) },
      openComposer: (postId) => {
        calls.push({ name: 'openComposer', input: postId })
        const nextDraft = postId ? { ...draft, tags: [...draft.tags] } : { title: '', excerpt: '', body: '', tags: [] }
        editor = { mode: postId ? 'edit' : 'create', postId: postId ?? null, draft: nextDraft, canPublish: postId !== undefined }
        return editor
      },
      getArticleDraft: () => editor,
      setArticleDraft: (patch) => { calls.push({ name: 'setArticleDraft', input: patch }); return updateEditor(patch) },
      setArticleTitle: (title) => { calls.push({ name: 'setArticleTitle', input: title }); return updateEditor({ title }) },
      setArticleExcerpt: (excerpt) => { calls.push({ name: 'setArticleExcerpt', input: excerpt }); return updateEditor({ excerpt }) },
      setArticleBody: (body) => { calls.push({ name: 'setArticleBody', input: body }); return updateEditor({ body }) },
      setArticleTags: (tags) => { calls.push({ name: 'setArticleTags', input: tags }); return updateEditor({ tags }) },
      publishArticleDraft: () => { calls.push({ name: 'publishArticleDraft' }); editor = null; return post },
      discardArticleDraft: () => { calls.push({ name: 'discardArticleDraft' }); editor = null },
      openProfileEditor: () => { calls.push({ name: 'openProfileEditor' }) },
      openTools: () => { calls.push({ name: 'openTools' }) },
      closeOverlays: () => { calls.push({ name: 'closeOverlays' }) },
    }

    await registerCommonplaceTools(() => actions)

    const run = async (name: string, input: Record<string, unknown>) => {
      const spec = commonplaceToolSpecs.find((tool) => tool.name === name)
      expect(spec).toBeDefined()
      const result = await spec!.execute(input) as { content: Array<{ type: string; text: string }>; structuredContent: unknown }
      expect(result.content[0]?.type).toBe('text')
      expect(() => JSON.parse(result.content[0]?.text ?? '')).not.toThrow()
      return result.structuredContent
    }

    expect(run).toBeTypeOf('function')
    expect((await run('commonplace.get_page_state', {}))).toMatchObject({ page: 'home', posts: [{ id: post.id }] })
    expect(await run('commonplace.get_reading_list', {})).toEqual([expect.objectContaining({ id: post.id, saved: true })])
    expect(await run('commonplace.get_profile', {})).toEqual(profile)
    expect(await run('commonplace.get_customization', {})).toEqual(baseTheme)
    expect(await run('commonplace.get_customization_schema', {})).toMatchObject({ homeBlocks: ['hero', 'quote', 'feed'], pages: ['home', 'saved', 'profile'] })
    expect(await run('commonplace.navigate', { page: 'profile' })).toEqual({ ok: true, page: 'profile' })
    expect(await run('commonplace.set_feed_filter', { filter: 'following' })).toEqual({ ok: true, filter: 'following' })
    expect(await run('commonplace.search_feed', { query: 'testing' })).toEqual([expect.objectContaining({ id: post.id })])
    expect(await run('commonplace.set_search_query', { query: 'article' })).toEqual({ query: 'article', posts: [expect.objectContaining({ id: post.id })] })
    expect(await run('commonplace.clear_search', {})).toEqual({ ok: true, query: '' })
    expect(await run('commonplace.open_post', { postId: post.id })).toEqual(post)
    expect(await run('commonplace.get_article', { postId: post.id })).toEqual(post)
    expect(await run('commonplace.get_article_draft', {})).toEqual({ ok: false, error: 'The article editor is not open.' })
    expect(await run('commonplace.toggle_save_post', { postId: post.id })).toEqual(post)
    expect(await run('commonplace.toggle_like_post', { postId: post.id })).toEqual(post)
    expect(await run('commonplace.create_post', { title: 'A new note', excerpt: 'A longer excerpt for the contract test.', tags: ['webmcp'] })).toEqual(post)
    expect(await run('commonplace.create_article', { title: 'A complete article', body: 'A complete article body for the contract test.', tags: ['writing'] })).toEqual(post)
    expect(await run('commonplace.update_article', { postId: post.id, title: 'An edited article', body: 'An edited body for the contract test.' })).toEqual(post)
    expect(await run('commonplace.delete_article', { postId: post.id })).toEqual(post)
    expect(await run('commonplace.update_profile', { name: 'Ada' })).toEqual({ ...profile, name: 'Ada' })
    expect(await run('commonplace.set_theme', { palette: 'night', typeScale: 2, contentWidth: 20 })).toEqual({ ...baseTheme, palette: 'night', typeScale: 1.12, contentWidth: 48 })
    expect(await run('commonplace.set_customization', { fontFamily: 'serif', sidebarWidth: 320, showQuote: false, homeOrder: ['feed', 'hero', 'quote'], customColors: { brand: '#123456' } })).toMatchObject({ fontFamily: 'serif', sidebarWidth: 320, showQuote: false, homeOrder: ['feed', 'hero', 'quote'], customColors: { brand: '#123456' } })
    expect(await run('commonplace.set_spacing', { pagePadding: 64, cardPadding: 30, feedGap: 24 })).toMatchObject({ pagePadding: 64, cardPadding: 30, feedGap: 24 })
    expect(await run('commonplace.set_shape', { radius: 'round', surfaceRadius: 30, shadowStyle: 'strong' })).toMatchObject({ radius: 'round', surfaceRadius: 30, shadowStyle: 'strong' })
    expect(await run('commonplace.set_typography', { displayFont: 'serif', headingWeight: 650, lineHeight: 1.7 })).toMatchObject({ displayFont: 'serif', headingWeight: 650, lineHeight: 1.7 })
    expect(await run('commonplace.set_visual_grid', { gridStyle: 'ruled', gridSize: 48, gridOpacity: 0.2 })).toMatchObject({ gridStyle: 'ruled', gridSize: 48, gridOpacity: 0.2 })
    expect(await run('commonplace.set_copy', { heroTitle: 'Hold onto' })).toMatchObject({ copy: expect.objectContaining({ heroTitle: 'Hold onto' }) })
    expect(await run('commonplace.set_block_visibility', { block: 'home-quote', visible: true })).toMatchObject({ showQuote: true })
    expect(await run('commonplace.move_home_block', { block: 'feed', toIndex: 0 })).toMatchObject({ homeOrder: ['feed', 'hero', 'quote'] })
    expect(await run('commonplace.move_navigation_item', { page: 'profile', toIndex: 0 })).toMatchObject({ navOrder: ['profile', 'home', 'saved'] })
    expect(await run('commonplace.reset_customization', {})).toEqual(baseTheme)
    expect(await run('commonplace.open_studio', {})).toEqual({ ok: true, opened: 'studio' })
    expect(await run('commonplace.open_composer', { postId: post.id })).toMatchObject({ mode: 'edit', postId: post.id, draft: { title: draft.title } })
    expect(await run('commonplace.get_article_draft', {})).toMatchObject({ mode: 'edit', draft: { title: draft.title, tags: draft.tags } })
    expect(await run('commonplace.set_article_draft', { title: 'Tool draft title', excerpt: 'Tool summary', body: 'Tool body with enough words.', tags: ['one', 'two'] })).toMatchObject({ draft: { title: 'Tool draft title', excerpt: 'Tool summary', body: 'Tool body with enough words.', tags: ['one', 'two'] } })
    expect(await run('commonplace.set_article_title', { title: 'Specific title' })).toMatchObject({ draft: { title: 'Specific title' } })
    expect(await run('commonplace.set_article_excerpt', { excerpt: 'Specific summary' })).toMatchObject({ draft: { excerpt: 'Specific summary' } })
    expect(await run('commonplace.set_article_body', { body: 'Specific body with enough words.' })).toMatchObject({ draft: { body: 'Specific body with enough words.' } })
    expect(await run('commonplace.set_article_tags', { tags: ['specific'] })).toMatchObject({ draft: { tags: ['specific'] } })
    expect(await run('commonplace.publish_article_draft', {})).toEqual(post)
    expect(await run('commonplace.open_composer', {})).toMatchObject({ mode: 'create', postId: null, draft: { title: '' } })
    expect(await run('commonplace.discard_article_draft', {})).toEqual({ ok: true, discarded: true })
    expect(await run('commonplace.open_profile_editor', {})).toEqual({ ok: true, opened: 'profile-editor' })
    expect(await run('commonplace.open_tool_inspector', {})).toEqual({ ok: true, opened: 'tool-inspector' })
    expect(await run('commonplace.start_voice_agent', {})).toEqual({ ok: true, opened: 'voice-agent' })
    expect(await run('commonplace.close_overlays', {})).toEqual({ ok: true, closed: 'overlays' })
    expect(calls.map((call) => call.name)).toEqual(['navigate', 'setFeedFilter', 'searchFeed', 'setSearchQuery', 'clearSearch', 'openPost', 'toggleSavePost', 'toggleLikePost', 'createPost', 'createPost', 'updatePost', 'deletePost', 'updateProfile', 'setTheme', 'setTheme', 'setTheme', 'setTheme', 'setTheme', 'setTheme', 'setTheme', 'setTheme', 'moveHomeBlock', 'moveNavItem', 'resetTheme', 'openStudio', 'openComposer', 'setArticleDraft', 'setArticleTitle', 'setArticleExcerpt', 'setArticleBody', 'setArticleTags', 'publishArticleDraft', 'openComposer', 'discardArticleDraft', 'openProfileEditor', 'openTools', 'openVoicePanel', 'closeOverlays'])
  })
})

describe('Realtime proxy boundary', () => {
  it('gives the voice agent explicit mood-aware personalization guidance', () => {
    const instructions = buildVoiceInstructions({ page: 'home', feedFilter: 'for-you', selectedPostId: null, searchQuery: '', theme: baseTheme, profile: initialProfile, posts: [], voiceConnected: false })
    expect(instructions).toContain('commonplace_set_customization')
    expect(instructions).toContain('overload, noise, clutter, fatigue, anxiety')
    expect(instructions).toContain('Treat tone as evidence, not a diagnosis')
    expect(instructions).toContain('curiosity, playfulness, exploration')
    expect(instructions).toContain('Do not wait for an imperative verb')
    expect(instructions).toContain('this is a lot')
    expect(instructions).toContain('high-confidence implied request')
    expect(instructions).toContain('If one sentence contains both an action and a feeling')
    expect(instructions).toContain('unsaved draft fields')
    expect(instructions).toContain('Never claim an action succeeded until the tool returns')
  })

  it('rejects missing credentials and empty offers before making a network call', async () => {
    const missingKey = await createRealtimeAnswer('v=0', { apiKey: '' })
    expect(missingKey.status).toBe(500)
    expect(await missingKey.json()).toEqual({ error: 'OPENAI_API_KEY is not configured on the server.' })

    const emptyOffer = await createRealtimeAnswer('   ', { apiKey: 'test-key' })
    expect(emptyOffer.status).toBe(400)
    expect(await emptyOffer.json()).toEqual({ error: 'The WebRTC offer is empty.' })
  })

  it('forwards the browser offer with the configured Realtime session', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('v=0\nanswer', { status: 201, headers: { 'Content-Type': 'application/sdp' } }))
    try {
      const result = await createRealtimeAnswer('v=0\noffer', { apiKey: 'test-key', model: 'test-realtime', voice: 'verse' })
      expect(result.status).toBe(201)
      expect(await result.text()).toBe('v=0\nanswer')
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0] ?? []
      expect(url).toBe('https://api.openai.com/v1/realtime/calls')
      expect(init?.method).toBe('POST')
      const headers = init?.headers as Record<string, string> | undefined
      expect(headers).toMatchObject({ Authorization: 'Bearer test-key' })
      const contentType = String(headers?.['Content-Type'] ?? '')
      expect(contentType).toMatch(/^multipart\/form-data; boundary=----commonplace-realtime-/)
      const body = String(init?.body ?? '')
      expect(body).toContain('Content-Disposition: form-data; name="sdp"')
      expect(body).toContain('Content-Type: application/sdp')
      expect(body).toContain('v=0\noffer')
      expect(body).toContain('Content-Disposition: form-data; name="session"')
      expect(body).toContain('Content-Type: application/json')
      expect(body).toContain(JSON.stringify({ type: 'realtime', model: 'test-realtime', audio: { output: { voice: 'verse' } } }))
    } finally {
      fetchMock.mockRestore()
    }
  })
})
