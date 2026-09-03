import { createRealtimeAnswer } from './realtime.js'

const port = Number(process.env.PORT ?? 8787)

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, service: 'commonplace-api' })
    }
    if (url.pathname !== '/api/realtime') return Response.json({ error: 'Not found' }, { status: 404 })
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    return createRealtimeAnswer(await request.text())
  },
})

console.log(`[Commonplace] API listening on http://localhost:${server.port}`)
