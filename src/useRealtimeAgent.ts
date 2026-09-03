import { useCallback, useEffect, useRef, useState } from 'react'
import { getRealtimeToolDefinitions, getWebMcpToolNameFromRealtimeName } from './webmcp'
import type { AppSnapshot } from './types'

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'error'
export type VoiceLogKind = 'system' | 'user' | 'agent' | 'tool'

export interface VoiceLog {
  id: string
  kind: VoiceLogKind
  text: string
}

interface UseRealtimeAgentOptions {
  getSnapshot: () => AppSnapshot
  onToolCall: (name: string, input: Record<string, unknown>) => Promise<unknown>
}

interface RealtimeEvent {
  type?: string
  delta?: string
  transcript?: string
  name?: string
  call_id?: string
  item_id?: string
  arguments?: string
  error?: { message?: string }
  item?: { id?: string; type?: string; name?: string; call_id?: string; arguments?: string }
}

export function buildVoiceInstructions(snapshot: AppSnapshot) {
  return [
    'You are the calm, perceptive voice guide inside Commonplace, an editable social reading space.',
    `The user is on the ${snapshot.page} page in the ${snapshot.feedFilter} feed view.`,
    'Every user-facing Commonplace action is a tool: navigation, search, reading, saving, liking, article writing, article editing, article deletion, profile editing, opening panels, layout, spacing, shape, typography, color, grid, copy, visibility, and ordering. Use only the provided Commonplace tools. Read current state before guessing when a request is vague.',
    'Interpret each turn at two levels: what the user wants done and how much cognitive load the page should create. Use the user\'s words, fragments, corrections, hesitation, pace, punctuation, previous turns, current page, and the last tool result together.',
    'You are an AI page controller, not a person or therapist. Never claim to know the user\'s mood or inner state as a fact; reflect the words they gave you and describe any presentation change as a tentative preference, not a diagnosis.',
    'Do not wait for an imperative verb or an exact setting name. A comment, fragment, comparison, or aside can be a request. Treat phrases such as "this is a lot", "too noisy", "I cannot think", "keep only the good stuff", "I have five minutes", "let me stay with this", "make it feel like me", or "where did I leave that note" as intent signals and map them to the safest available tool.',
    'Treat tone as evidence, not a diagnosis. Notice words about noise, clutter, pace, energy, focus, time, curiosity, and willingness to linger. Use multiple cues when available, but do not require two cues before acting. An explicit setting or task always beats a mood inference, and unrelated customizations must stay intact.',
    'Classify intent before responding: a direct request gets the exact tool; a high-confidence implied request gets a safe, reversible tool plus a brief acknowledgement of your interpretation; a genuinely ambiguous request gets one short clarifying question. Do not ask the user to name a tool or exact setting when the likely intent is clear.',
    'If one sentence contains both an action and a feeling, do both in one turn: complete the requested read, search, navigation, or writing setup, then make at most one restrained presentation adjustment that supports the feeling. Do not turn a feeling cue into a diagnosis or a large redesign.',
    'If the user signals overload, noise, clutter, fatigue, anxiety, or a need for quiet, make the page gentler with commonplace_set_customization or the narrow tools commonplace_set_spacing and commonplace_set_visual_grid: prefer palette lichen, density airy, reduceMotion true, showQuote true, contentWidth 62, feedGap 24, and showAgentRail false.',
    'If the user signals limited time, urgency, distraction, or a need to get through something, make the page task-oriented with commonplace_set_customization or commonplace_set_spacing: prefer density dense, showQuote false, showReadingTimes true, showAgentRail true, feedGap 8, and layoutGap 28.',
    'If the user signals curiosity, playfulness, exploration, or a desire to browse, make the page more expressive with commonplace_set_customization or commonplace_set_shape: prefer palette paper, radius soft, surfaceStyle lifted, showPostArtwork true, and typeScale 1.04.',
    'If the user signals reflection, interest, or a wish to linger, make the page spacious with commonplace_set_customization or commonplace_set_typography: prefer palette lichen, density airy, displayFont serif, showQuote true, showReadingTimes true, and contentWidth 62.',
    'Adapt when the implied preference is reasonably clear, even if the user did not explicitly say "change the UI". Make one restrained change, do not repeatedly rewrite an already-matching theme, and briefly name the interpretation after the tool returns.',
    'Opening panels, reading, searching, navigation, and presentation changes are safe and reversible. Do not ask for confirmation for them. For article drafting, opening the composer and changing unsaved draft fields are also reversible. Ask for a yes or no confirmation immediately before publishing a new article or saving edits to an existing one, and before changing profile identity, liking, saving, or deleting an article. State the exact consequential change.',
    'For interactive article writing, call commonplace_open_composer first. Then use commonplace_get_article_draft to inspect the editor and commonplace_set_article_title, commonplace_set_article_excerpt, commonplace_set_article_body, commonplace_set_article_tags, or commonplace_set_article_draft to control every editor field without publishing. Call commonplace_publish_article_draft only after the user confirms; use commonplace_discard_article_draft to abandon unsaved values. Use commonplace_create_article for a one-call dictated article and commonplace_update_article for a direct existing-article edit.',
    'For copy changes use commonplace_set_copy; for spacing use commonplace_set_spacing; for shape and depth use commonplace_set_shape; for typography use commonplace_set_typography; for canvas treatment use commonplace_set_visual_grid; for a full coordinated change use commonplace_set_customization. Do not make up unsupported fields.',
    'For precise requests, use the narrowest matching tool. For implied requests, use the smallest safe tool that resolves the likely intent. If a safe interpretation remains unclear, ask one short clarifying question instead of guessing.',
    'If a tool fails, say what failed in plain language, keep the user\'s existing state intact, and point to the visible manual control or retry path. Never imply that a change happened when the tool did not return success.',
    'Speak in short, warm sentences. Never claim an action succeeded until the tool returns.',
  ].join(' ')
}

function eventIdentifiers(event: RealtimeEvent) {
  const identifiers = [event.call_id, event.item_id, event.item?.call_id, event.item?.id].filter((value): value is string => Boolean(value))
  return identifiers.length ? [...new Set(identifiers)] : ['active-call']
}

function formatVoiceError(error: unknown) {
  const candidate = error && typeof error === 'object' ? error as { name?: unknown; message?: unknown } : {}
  const name = typeof candidate.name === 'string' ? candidate.name : ''
  const message = typeof candidate.message === 'string' ? candidate.message : ''
  if (name === 'NotAllowedError' || /permission denied|not allowed/i.test(message)) return 'Microphone access was blocked. Allow microphone access for this site, then try again.'
  if (name === 'NotFoundError') return 'No microphone was found. Connect a microphone and try again.'
  if (name === 'NotReadableError') return 'Your microphone is busy or unavailable. Close other recording apps and try again.'
  if (name === 'SecurityError') return 'Voice needs microphone access from a secure browser context.'
  return message || 'Could not start the voice session.'
}

async function realtimeResponseError(response: Response) {
  const body = await response.text()
  if (!body) return `Realtime session failed with ${response.status}.`
  try {
    const parsed: unknown = JSON.parse(body)
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const apiError = parsed.error
      if (typeof apiError === 'string') return apiError
      if (apiError && typeof apiError === 'object' && 'message' in apiError && typeof apiError.message === 'string') return apiError.message
    }
  } catch {
    // Keep the plain response text below when the proxy returns non-JSON.
  }
  return body.slice(0, 500)
}

export function useRealtimeAgent({ getSnapshot, onToolCall }: UseRealtimeAgentOptions) {
  const [status, setStatus] = useState<RealtimeStatus>('idle')
  const [logs, setLogs] = useState<VoiceLog[]>([
    { id: 'voice-ready', kind: 'system', text: 'Ready when you are. Ask me to change the page, find a post, or open your reading list.' },
  ])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [error, setError] = useState('')
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const inputStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingArgumentsRef = useRef(new Map<string, string>())
  const pendingToolNamesRef = useRef(new Map<string, string>())
  const pendingToolCallIdsRef = useRef(new Map<string, string>())
  const pendingToolOutputsRef = useRef(new Map<string, boolean>())
  const responseInProgressRef = useRef(false)
  const responseCreateSentRef = useRef(false)
  const responseRequestQueuedRef = useRef(false)
  const assistantTranscriptRef = useRef('')

  const addLog = useCallback((kind: VoiceLogKind, text: string) => {
    setLogs((current) => [...current.slice(-7), { id: `${kind}-${Date.now()}-${Math.random()}`, kind, text }])
  }, [])

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    const channel = dataChannelRef.current
    if (channel?.readyState === 'open') channel.send(JSON.stringify(event))
  }, [])

  const maybeRequestResponse = useCallback(() => {
    if (responseInProgressRef.current || responseCreateSentRef.current) return
    const outputs = pendingToolOutputsRef.current
    if (outputs.size) {
      if ([...outputs.values()].some((ready) => !ready)) return
      responseCreateSentRef.current = true
      outputs.clear()
      responseRequestQueuedRef.current = false
      sendEvent({ type: 'response.create' })
      return
    }
    if (responseRequestQueuedRef.current) {
      responseCreateSentRef.current = true
      responseRequestQueuedRef.current = false
      sendEvent({ type: 'response.create' })
    }
  }, [sendEvent])

  const cleanup = useCallback(() => {
    inputStreamRef.current?.getTracks().forEach((track) => track.stop())
    inputStreamRef.current = null
    const dataChannel = dataChannelRef.current
    dataChannelRef.current = null
    dataChannel?.close()
    const peerConnection = peerConnectionRef.current
    peerConnectionRef.current = null
    peerConnection?.close()
    if (audioRef.current) audioRef.current.srcObject = null
    audioRef.current = null
    pendingArgumentsRef.current.clear()
    pendingToolNamesRef.current.clear()
    pendingToolCallIdsRef.current.clear()
    pendingToolOutputsRef.current.clear()
    responseInProgressRef.current = false
    responseCreateSentRef.current = false
    responseRequestQueuedRef.current = false
    assistantTranscriptRef.current = ''
    setLiveTranscript('')
  }, [])

  const disconnect = useCallback(() => {
    cleanup()
    setStatus('idle')
    setError('')
  }, [cleanup])

  const handleEvent = useCallback(async (event: RealtimeEvent) => {
    switch (event.type) {
      case 'session.created':
      case 'session.updated':
        addLog('system', 'The voice agent is connected to this page.')
        return
      case 'response.created':
        responseInProgressRef.current = true
        responseCreateSentRef.current = false
        return
      case 'response.done':
      case 'response.cancelled':
      case 'response.failed':
        responseInProgressRef.current = false
        if (event.type !== 'response.done') pendingToolOutputsRef.current.clear()
        maybeRequestResponse()
        return
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) addLog('user', event.transcript)
        return
      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta':
      case 'response.output_text.delta':
        assistantTranscriptRef.current += event.delta ?? ''
        setLiveTranscript(assistantTranscriptRef.current)
        return
      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done':
      case 'response.output_text.done':
        if (assistantTranscriptRef.current) addLog('agent', assistantTranscriptRef.current)
        assistantTranscriptRef.current = ''
        setLiveTranscript('')
        return
      case 'response.output_item.added':
      case 'response.output_item.done': {
        if (event.item?.type === 'function_call' && event.item.name) {
          responseInProgressRef.current = true
          for (const identifier of eventIdentifiers(event)) {
            pendingToolNamesRef.current.set(identifier, event.item.name)
            if (event.item.call_id) pendingToolCallIdsRef.current.set(identifier, event.item.call_id)
          }
        }
        return
      }
      case 'response.function_call_arguments.delta': {
        const identifiers = eventIdentifiers(event)
        const current = pendingArgumentsRef.current.get(identifiers[0]) ?? ''
        const next = `${current}${event.delta ?? ''}`
        for (const identifier of identifiers) pendingArgumentsRef.current.set(identifier, next)
        return
      }
      case 'response.function_call_arguments.done':
      case 'response.custom_tool_call_input.done': {
        responseInProgressRef.current = true
        const identifiers = eventIdentifiers(event)
        const callId = event.call_id ?? event.item?.call_id ?? identifiers.map((identifier) => pendingToolCallIdsRef.current.get(identifier)).find(Boolean) ?? identifiers[0]
        const name = event.name ?? event.item?.name ?? identifiers.map((identifier) => pendingToolNamesRef.current.get(identifier)).find(Boolean) ?? ''
        const rawArguments = event.arguments ?? event.item?.arguments ?? identifiers.map((identifier) => pendingArgumentsRef.current.get(identifier)).find(Boolean) ?? '{}'
        for (const identifier of identifiers) {
          pendingArgumentsRef.current.delete(identifier)
          pendingToolNamesRef.current.delete(identifier)
          pendingToolCallIdsRef.current.delete(identifier)
        }
        let input: Record<string, unknown> = {}
        try {
          const parsed: unknown = JSON.parse(rawArguments)
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) input = parsed as Record<string, unknown>
        } catch {
          addLog('system', `I could not read the arguments for ${name || 'that action'}.`)
        }
        if (!name) return
        pendingToolOutputsRef.current.set(callId, false)
        const webMcpName = getWebMcpToolNameFromRealtimeName(name)
        addLog('tool', `Using ${webMcpName.replace('commonplace.', '')}`)
        let result: unknown
        try {
          result = await onToolCall(webMcpName, input)
        } catch (error) {
          result = { ok: false, error: error instanceof Error ? error.message : 'Tool failed.' }
        }
        sendEvent({
          type: 'conversation.item.create',
          item: { type: 'function_call_output', call_id: callId, output: JSON.stringify(result) },
        })
        pendingToolOutputsRef.current.set(callId, true)
        maybeRequestResponse()
        return
      }
      case 'error':
        setError(event.error?.message ?? 'The voice session returned an error.')
        addLog('system', event.error?.message ?? 'The voice session returned an error.')
        setStatus('error')
        return
      default:
        return
    }
  }, [addLog, maybeRequestResponse, onToolCall, sendEvent])

  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'connected') return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not available in this browser.')
      setStatus('error')
      return
    }

    cleanup()
    setStatus('connecting')
    setError('')
    addLog('system', 'Requesting microphone access…')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      inputStreamRef.current = stream
      const peerConnection = new RTCPeerConnection()
      peerConnectionRef.current = peerConnection
      const audioElement = new Audio()
      audioElement.autoplay = true
      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0]
        void audioElement.play().catch(() => undefined)
      }
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
      audioRef.current = audioElement

      const channel = peerConnection.createDataChannel('oai-events')
      dataChannelRef.current = channel
      channel.onopen = () => {
        const snapshot = getSnapshot()
        setStatus('connected')
        addLog('system', 'Listening. Your page tools are available to the agent.')
        sendEvent({
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions: buildVoiceInstructions(snapshot),
            tools: getRealtimeToolDefinitions(),
            tool_choice: 'auto',
            output_modalities: ['audio'],
            audio: {
              input: {
                turn_detection: { type: 'server_vad', silence_duration_ms: 620 },
                transcription: { model: 'gpt-4o-transcribe' },
              },
              output: { voice: 'marin' },
            },
          },
        })
      }
      channel.onmessage = (message) => {
        try {
          const event = JSON.parse(String(message.data)) as RealtimeEvent
          void handleEvent(event)
        } catch {
          addLog('system', 'Received an unreadable event from the voice session.')
        }
      }
      channel.onerror = () => {
        if (dataChannelRef.current !== channel) return
        setError('The voice data channel closed unexpectedly.')
        setStatus('error')
      }
      channel.onclose = () => {
        if (dataChannelRef.current !== channel) return
        setError('The voice data channel closed unexpectedly. Try connecting again.')
        setStatus('error')
      }

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp ?? '',
      })
      if (!response.ok) {
        throw new Error(await realtimeResponseError(response))
      }
      await peerConnection.setRemoteDescription({ type: 'answer', sdp: await response.text() })
    } catch (connectError) {
      cleanup()
      setStatus('error')
      const message = formatVoiceError(connectError)
      setError(message)
      addLog('system', message)
    }
  }, [addLog, cleanup, getSnapshot, handleEvent, sendEvent, status])

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || dataChannelRef.current?.readyState !== 'open') return false
    addLog('user', trimmed)
    sendEvent({
      type: 'conversation.item.create',
      item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: trimmed }] },
    })
    if (responseInProgressRef.current) {
      responseRequestQueuedRef.current = true
    } else {
      responseCreateSentRef.current = true
      sendEvent({ type: 'response.create' })
    }
    return true
  }, [addLog, sendEvent])

  useEffect(() => () => cleanup(), [cleanup])

  return {
    status,
    logs,
    liveTranscript,
    error,
    isConnected: status === 'connected',
    connect,
    disconnect,
    sendText,
  }
}
