import { useState } from 'react'
import { Icon } from '../icons'
import type { RealtimeStatus, VoiceLog } from '../useRealtimeAgent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface VoiceAgentController {
  status: RealtimeStatus
  logs: VoiceLog[]
  liveTranscript: string
  error: string
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  sendText: (text: string) => boolean
}

interface VoiceAgentPanelProps {
  agent: VoiceAgentController
  onClose: () => void
  onRestoreFocus: () => void
}

export function VoiceAgentPanel({ agent, onClose, onRestoreFocus }: VoiceAgentPanelProps) {
  const [text, setText] = useState('')
  const statusCopy = {
    idle: 'Standby',
    connecting: 'Opening a secure session',
    connected: 'Listening to your voice',
    error: 'Needs attention',
  }[agent.status]

  const sendText = () => {
    if (agent.sendText(text)) setText('')
  }

  return (
    <Sheet open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <SheetContent className="voice-sheet" side="right" showCloseButton={false} onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}>
        <SheetHeader className="sheet-header">
          <div>
            <div className="eyebrow"><span className={`voice-status-dot${agent.isConnected ? ' is-live' : ''}`} /> Realtime guide</div>
            <SheetTitle>Say what you mean.</SheetTitle>
            <SheetDescription>Optional AI voice control for this tab. It can read, search, tune, and draft with page tools; it asks before consequential changes.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button className="icon-button" size="icon-sm" variant="ghost" type="button" aria-label="Close voice agent"><Icon name="close" size={18} /></Button>
          </SheetClose>
        </SheetHeader>

        <div className={`voice-orb voice-orb-${agent.status}`} aria-hidden="true"><span className="voice-orb-inner"><Icon name={agent.isConnected ? 'waveform' : 'mic'} size={30} /></span><span className="voice-orb-ring voice-orb-ring-one" /><span className="voice-orb-ring voice-orb-ring-two" /></div>
        <div className="voice-status-copy" aria-live="polite"><strong>{statusCopy}</strong><span>{agent.isConnected ? 'Try “make the page quieter” or “open my saved posts.”' : 'Use the visible page controls if you do not want to connect voice.'}</span></div>

        <div className="voice-contract" aria-label="Voice control boundaries">
          <div><strong>Available now</strong><span>Read, search, tune, and draft.</span></div>
          <div><strong>Needs confirmation</strong><span>Publish, edits, likes, saves, profile changes, and deletion.</span></div>
        </div>

        <div className="voice-log" aria-live="polite">
          {agent.logs.map((log) => <div className={`voice-log-row voice-log-${log.kind}`} key={log.id}><span className="voice-log-label">{log.kind === 'agent' ? 'guide' : log.kind === 'tool' ? 'tool' : log.kind === 'user' ? 'you' : 'system'}</span><p>{log.text}</p></div>)}
          {agent.liveTranscript && <div className="voice-log-row voice-log-agent"><span className="voice-log-label">guide</span><p>{agent.liveTranscript}<span className="typing-cursor" /></p></div>}
        </div>

        {agent.error && <div className="voice-error" role="alert"><Icon name="refresh" size={15} /><span>{agent.error}</span></div>}

        <div className="voice-controls">
          {!agent.isConnected ? <Button className="primary-button voice-connect-button" variant="default" size="sm" type="button" onClick={() => void agent.connect()} disabled={agent.status === 'connecting'}><Icon name="mic" size={16} /> {agent.status === 'connecting' ? 'Connecting…' : 'Start listening'}</Button> : <Button className="secondary-button voice-connect-button" variant="outline" size="sm" type="button" onClick={agent.disconnect}><span className="recording-square" /> Stop listening</Button>}
          <div className="text-compose-row"><Input className="text-input" id="voice-text-fallback" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendText() }} aria-label="Send a text instruction" placeholder="Or type an instruction" disabled={!agent.isConnected} /><Button className="icon-button" size="icon-sm" variant="outline" type="button" onClick={sendText} disabled={!text.trim() || !agent.isConnected} aria-label="Send instruction"><Icon name="arrow-up-right" size={17} /></Button></div>
        </div>
        <div className="voice-footnote"><Icon name="link" size={13} /> WebRTC audio · page tools run locally in this tab · stop any time</div>
      </SheetContent>
    </Sheet>
  )
}
