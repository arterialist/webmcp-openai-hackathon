/// <reference types="node" />

const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls'
const DEFAULT_MODEL = 'gpt-realtime-2.1'
const DEFAULT_VOICE = 'marin'

function jsonResponse(value: unknown, status: number) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function createRealtimeMultipartBody(sdp: string, session: string) {
  const boundary = `----commonplace-realtime-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const offer = sdp.endsWith('\n') ? sdp : `${sdp}\r\n`
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="sdp"',
    'Content-Type: application/sdp',
    '',
    offer,
    `--${boundary}`,
    'Content-Disposition: form-data; name="session"',
    'Content-Type: application/json',
    '',
    session,
    `--${boundary}--`,
    '',
  ].join('\r\n')
  return { body, contentType: `multipart/form-data; boundary=${boundary}` }
}

export async function createRealtimeAnswer(
  sdp: string,
  options: { apiKey?: string; model?: string; voice?: string } = {},
) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY
  if (!apiKey) return jsonResponse({ error: 'OPENAI_API_KEY is not configured on the server.' }, 500)
  if (!sdp.trim()) return jsonResponse({ error: 'The WebRTC offer is empty.' }, 400)

  const session = JSON.stringify({
    type: 'realtime',
    model: options.model ?? process.env.OPENAI_REALTIME_MODEL ?? DEFAULT_MODEL,
    audio: { output: { voice: options.voice ?? process.env.OPENAI_REALTIME_VOICE ?? DEFAULT_VOICE } },
  })
  const multipart = createRealtimeMultipartBody(sdp, session)

  try {
    const response = await fetch(OPENAI_REALTIME_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': multipart.contentType,
      },
      body: multipart.body,
    })
    const body = await response.text()
    const contentType = response.headers.get('content-type') ?? (response.ok ? 'application/sdp' : 'application/json')
    return new Response(body, { status: response.status, headers: { 'Content-Type': contentType } })
  } catch (error) {
    console.error('[Commonplace] Realtime session request failed', error)
    return jsonResponse({ error: 'Could not reach the Realtime API.' }, 502)
  }
}
