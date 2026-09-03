import { Icon } from '../icons'
import type { ThemeSettings } from '../types'
import { commonplaceToolSpecs } from '../webmcp'
import { Button } from '@/components/ui/button'

export interface AgentActionLog {
  name: string
  timestamp: string
  paramsSummary?: string
}

interface AgentRailProps {
  settings: ThemeSettings
  registeredCount: number
  lastAction?: AgentActionLog | null
  onOpenTools: (trigger?: HTMLElement) => void
  onOpenStudio: (trigger?: HTMLElement) => void
  onCompose: (trigger?: HTMLElement) => void
  onOpenVoice: (trigger?: HTMLElement) => void
  voiceConnected: boolean
}

const visibleTools = [
  { label: 'Read page state', icon: 'layout' as const, tone: 'read' },
  { label: 'Search the feed', icon: 'search' as const, tone: 'read' },
  { label: 'Tune the surface', icon: 'spark' as const, tone: 'write' },
  { label: 'Write an article', icon: 'edit' as const, tone: 'write' },
]

export function AgentRail({ settings, registeredCount, lastAction, onOpenTools, onOpenStudio, onCompose, onOpenVoice, voiceConnected }: AgentRailProps) {
  const toolTotal = commonplaceToolSpecs.length

  return (
    <aside className="agent-rail" aria-label="Agent tools and page controls" data-customization-block="agent-rail">
      <div className="rail-header">
        <div className="eyebrow"><span className="status-dot status-dot-bright" /> Agent rail</div>
        <Button className="icon-button icon-button-small" size="icon-xs" variant="ghost" type="button" onClick={(event) => onOpenTools(event.currentTarget)} aria-label="Inspect all WebMCP tools"><Icon name="arrow-up-right" size={15} /></Button>
      </div>

      <div className="rail-intro">
        <h2>{settings.copy.railTitle}</h2>
        <p>{settings.copy.railDescription}</p>
        <p className="rail-trust-note"><Icon name="tool" size={13} /> Local to this tab · reset in studio.</p>
      </div>

      {lastAction && (
        <div className="rail-live-action" data-customization-block="rail-live-action">
          <div className="rail-live-action-head">
            <span className="rail-live-action-badge"><span className="status-dot status-dot-bright status-dot-pulse" /> Agent executed</span>
            <span className="rail-live-action-time">{lastAction.timestamp}</span>
          </div>
          <code className="rail-live-action-name">{lastAction.name}</code>
          {lastAction.paramsSummary && <p className="rail-live-action-params">{lastAction.paramsSummary}</p>}
        </div>
      )}

      {settings.showRailStatus && <div className="rail-status" data-customization-block="rail-status">

        <div className="rail-status-top"><span className="status-dot status-dot-bright" /> Browser bridge <strong>{registeredCount > 0 ? 'ready' : 'waiting'}</strong></div>
        <div className="rail-status-line"><span style={{ width: `${Math.min(100, (registeredCount / toolTotal) * 100)}%` }} /></div>
        <div className="rail-status-bottom"><span>{registeredCount}/{toolTotal} tools live</span><span>WebMCP · local</span></div>
      </div>}

      {settings.showRailTools && <div className="rail-block" data-customization-block="rail-tools">
        <div className="rail-block-heading"><span>What an agent can do</span><Button className="rail-link" variant="link" size="xs" type="button" onClick={(event) => onOpenTools(event.currentTarget)}>View all</Button></div>
        <div className="rail-tool-list">
          {visibleTools.map((tool) => <Button className="rail-tool" variant="ghost" size="xs" type="button" key={tool.label} onClick={(event) => tool.label === 'Write an article' ? onCompose(event.currentTarget) : tool.tone === 'write' ? onOpenStudio(event.currentTarget) : onOpenTools(event.currentTarget)}><span className={`rail-tool-icon rail-tool-${tool.tone}`}><Icon name={tool.icon} size={15} /></span><span>{tool.label}</span><Icon name="chevron-right" size={14} /></Button>)}
        </div>
      </div>}

      <div className="rail-block rail-theme-block">
        <div className="rail-block-heading"><span>Current shape</span><Button className="rail-link" variant="link" size="xs" type="button" onClick={(event) => onOpenStudio(event.currentTarget)}>Edit</Button></div>
        <div className="theme-preview-row"><span className="theme-preview-surface" /><span className="theme-preview-copy"><strong>{settings.palette} / {settings.radius}</strong><small>{settings.fontFamily} body · {settings.contentWidth}ch measure</small></span></div>
      </div>

      <Button className={`voice-rail-button${voiceConnected ? ' is-live' : ''}`} variant={voiceConnected ? 'default' : 'secondary'} size="sm" type="button" onClick={(event) => onOpenVoice(event.currentTarget)}>
        <span className="voice-rail-icon"><Icon name={voiceConnected ? 'waveform' : 'mic'} size={17} /></span>
        <span><strong>{voiceConnected ? 'Listening now' : 'Talk to your space'}</strong><small>{voiceConnected ? 'Say what you want to change' : 'Open the Realtime guide'}</small></span>
        <Icon name="arrow-up-right" size={15} />
      </Button>

      <p className="rail-footnote"><Icon name="tool" size={13} /> Tools stay local to this tab.</p>
    </aside>
  )
}
