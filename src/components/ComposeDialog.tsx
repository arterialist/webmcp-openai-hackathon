import { Icon } from '../icons'
import type { ArticleDraft, Post } from '../types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ComposeDialogProps {
  open: boolean
  editingPost?: Post | null
  draft: ArticleDraft
  onClose: () => void
  onRestoreFocus: () => void
  onDraftChange: (patch: Partial<ArticleDraft>) => void
  onSubmit: () => void
}

export function ComposeDialog({ open, editingPost, draft, onClose, onRestoreFocus, onDraftChange, onSubmit }: ComposeDialogProps) {
  const isEditing = Boolean(editingPost)

  const canSubmit = draft.title.trim().length > 3 && draft.body.trim().length > 10

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent className="compose-modal" showCloseButton={false} aria-describedby="compose-description" onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}>
        <DialogHeader className="compose-header">
          <div>
            <div className="eyebrow"><Icon name="edit" size={14} /> {isEditing ? 'Edit article' : 'Article studio'}</div>
            <DialogTitle>{isEditing ? 'Shape it again.' : 'Write something worth keeping.'}</DialogTitle>
            <DialogDescription id="compose-description">A complete article is available to people and agents through the same callable page tools.</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button className="icon-button" size="icon-sm" variant="ghost" type="button" aria-label="Close article editor"><Icon name="close" size={18} /></Button>
          </DialogClose>
        </DialogHeader>
        <form onSubmit={(event) => { event.preventDefault(); if (!canSubmit) return; onSubmit() }}>
          <div className="field-group">
            <Label htmlFor="compose-post-title">Title</Label>
            <Input id="compose-post-title" className="compose-title-input" value={draft.title} onChange={(event) => onDraftChange({ title: event.target.value })} placeholder="A thought worth keeping" required />
          </div>
          <div className="field-group">
            <Label htmlFor="compose-post-excerpt">Short version <span>(optional)</span></Label>
            <Textarea id="compose-post-excerpt" className="compose-textarea" value={draft.excerpt} onChange={(event) => onDraftChange({ excerpt: event.target.value })} placeholder="What should a reader carry with them?" rows={3} />
          </div>
          <div className="field-group">
            <Label htmlFor="compose-post-body">Article body</Label>
            <Textarea id="compose-post-body" className="compose-body-textarea" value={draft.body} onChange={(event) => onDraftChange({ body: event.target.value })} placeholder="Begin with the thing you keep returning to…" rows={11} required />
            <span className="field-hint">Use blank lines to separate paragraphs. {draft.body.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <div className="field-group">
            <Label htmlFor="compose-post-tags">Topics <span>(comma separated)</span></Label>
            <Input id="compose-post-tags" value={draft.tags.join(', ')} onChange={(event) => onDraftChange({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} placeholder="notes, design practice" />
          </div>
          <DialogFooter className="compose-footer">
            <span className="compose-hint"><span className="status-dot" /> {isEditing ? 'Edits stay local to this browser' : 'Article stays local to this browser'}</span>
            <div className="compose-actions">
              <DialogClose asChild><Button className="text-button" variant="ghost" size="sm" type="button">Cancel</Button></DialogClose>
              <Button className="primary-button" variant="default" size="sm" type="submit" disabled={!canSubmit}>{isEditing ? 'Save article' : 'Publish article'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
