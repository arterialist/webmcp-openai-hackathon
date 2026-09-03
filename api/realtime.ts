import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRealtimeAnswer } from '../server/realtime.js'

export const config = { api: { bodyParser: false } }

async function readBody(request: VercelRequest) {
  if (typeof request.body === 'string') return request.body
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }
  const result = await createRealtimeAnswer(await readBody(request))
  response.status(result.status)
  result.headers.forEach((value, key) => response.setHeader(key, value))
  response.send(await result.text())
}
