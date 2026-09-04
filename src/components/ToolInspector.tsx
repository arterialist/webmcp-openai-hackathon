import { useState } from 'react'
import { commonplaceToolSpecs } from '../webmcp'
import { Icon, type IconName } from '../icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface ToolInspectorProps {
  registeredNames: string[]
  onClose: () => void
  onRestoreFocus: () => void
  onPreviewTool: (name: string) => Promise<unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function formatToolPreview(value: unknown) {
  if (isRecord(value) && Array.isArray(value.content)) {
    const textContent = value.content.find((entry): entry is { type: 'text'; text: string } => isRecord(entry) && entry.type === 'text' && typeof entry.text === 'string')
    if (textContent) {
      try {
        return JSON.stringify(JSON.parse(textContent.text), null, 2)
      } catch {
        return textContent.text
      }
    }
  }

  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2) ?? String(value)
}

function getToolIcon(name: string, readOnly: boolean): IconName {
  if (name.includes('delete')) return 'trash'
  if (name.includes('profile')) return 'user'
  if (name.includes('reading_list') || name.includes('get_article') || name.includes('open_post')) return 'bookmark'
  if (name.includes('like')) return 'heart'
  if (name.includes('search') || name.includes('filter')) return 'search'
  if (name.includes('navigate')) return 'compass'
  if (name.includes('voice')) return 'mic'
  if (name.includes('reset')) return 'refresh'
  if (name.includes('typography') || name.includes('copy')) return 'type'
  if (name.includes('grid') || name.includes('visibility') || name.includes('move_')) return 'layout'
  if (name.includes('theme') || name.includes('customization') || name.includes('spacing') || name.includes('shape') || name.includes('studio')) return 'settings'
  if (name.includes('article') || name.includes('post') || name.includes('composer') || name.includes('draft')) return 'edit'
  if (name.includes('tool_inspector')) return 'tool'
  return readOnly ? 'layout' : 'spark'
}

export function ToolInspector({ registeredNames, onClose, onRestoreFocus, onPreviewTool }: ToolInspectorProps) {
  const [selectedTool, setSelectedTool] = useState(commonplaceToolSpecs[0]?.name ?? '')
  const [preview, setPreview] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const selectedSpec = commonplaceToolSpecs.find((tool) => tool.name === selectedTool)
  const canPreview = !selectedSpec?.inputSchema.required?.length
  const readOnly = selectedSpec?.annotations?.readOnlyHint === true

  const runPreview = async () => {
    if (!canPreview) return
    setPreviewing(true)
    try {
      const result = await onPreviewTool(selectedTool)
      setPreview(formatToolPreview(result))
      setCopyStatus('idle')
    } finally {
      setPreviewing(false)
    }
  }

  const copyPreview = async () => {
    if (!preview) return
    try {
      await navigator.clipboard.writeText(preview)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <Sheet open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <SheetContent className="tool-sheet" side="right" showCloseButton={false} onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}>
        <SheetHeader className="sheet-header tool-sheet-header">
          <div>
            <div className="eyebrow"><Icon name="tool" size={14} /> WebMCP bridge</div>
            <SheetTitle>The page is callable.</SheetTitle>
            <SheetDescription>These tools are registered on <code>document.modelContext</code> for browser agents.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button className="icon-button" size="icon-sm" variant="ghost" type="button" aria-label="Close tool inspector"><Icon name="close" size={18} /></Button>
          </SheetClose>
        </SheetHeader>

        <Card className="tool-summary">
          <div><strong>{registeredNames.length}</strong><span>registered tools</span></div>
          <div><strong>0</strong><span>remote calls</span></div>
          <div><strong>local</strong><span>execution mode</span></div>
        </Card>

        <ScrollArea className="tool-list">
          <div role="listbox" aria-label="Registered WebMCP tools">
            {commonplaceToolSpecs.map((tool) => {
              const registered = registeredNames.includes(tool.name)
              const readOnly = tool.annotations?.readOnlyHint
              const selected = selectedTool === tool.name
              return (
                <Button
                  className={`tool-list-item${selected ? ' is-selected' : ''}`}
                  key={tool.name}
                  variant={selected ? 'secondary' : 'ghost'}
                  size="default"
                  type="button"
                  onClick={() => { setSelectedTool(tool.name); setPreview('') }}
                  role="option"
                  aria-selected={selected}
                  aria-label={tool.name}
                >
                  <span className={`tool-list-icon${readOnly ? ' tool-list-icon-read' : ''}`}><Icon name={getToolIcon(tool.name, readOnly === true)} size={15} /></span>
                  <span className="tool-list-copy"><strong>{tool.name}</strong><small>{tool.description}</small></span>
                  <Badge variant={registered ? 'secondary' : 'outline'} className="tool-registration">{registered ? 'live' : 'local'}</Badge>
                  <Icon name={selected ? 'check' : 'chevron-right'} size={15} />
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        <div className="tool-playground">
          <div className="studio-label-row"><span className="studio-label">Tool preview</span><span className="studio-value">{selectedSpec?.title}</span></div>
          <p>{canPreview ? (readOnly ? 'Run a read-only tool against the current page state.' : 'Run this no-argument tool against the current page.') : 'This tool needs arguments. Ask the browser agent to call it with the required input.'}</p>
          <div className="tool-code-row"><code>{selectedTool}()</code>{canPreview && <Button className="secondary-button secondary-button-small" variant="outline" size="xs" type="button" onClick={() => void runPreview()} disabled={previewing}>{previewing ? 'Running…' : 'Try it'}</Button>}</div>
          {preview && <div className="tool-output">
            <div className="tool-output-header">
              <span className="tool-output-label">Result</span>
              <Button className="text-button tool-copy-button" variant="ghost" size="xs" type="button" onClick={() => void copyPreview()}>{copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy unavailable' : 'Copy result'}</Button>
            </div>
            <pre className="tool-preview-output">{preview}</pre>
          </div>}
        </div>

        <SheetFooter className="sheet-footer tool-sheet-footer"><span className="tool-footnote">{registeredNames.length > 0 ? 'WebMCP browser bridge active' : 'WebMCP bridge will connect when supported'}</span><SheetClose asChild><Button className="primary-button" variant="default" size="sm" type="button">Close</Button></SheetClose></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
