import { type ReactNode } from 'react'
import { Icon } from '../icons'
import type { ArtworkPositionId, ColorOverrides, DensityId, FontFamilyId, GridStyleId, HomeBlockId, PageId, PaletteId, PostLayoutId, RadiusId, ShadowStyleId, SurfaceStyleId, ThemeSettings } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface StudioPanelProps {
  settings: ThemeSettings
  onChange: (patch: Partial<ThemeSettings>) => void
  onMoveHomeBlock: (block: HomeBlockId, toIndex: number) => void
  onMoveNavItem: (page: PageId, toIndex: number) => void
  onReset: () => void
  onClose: () => void
  onRestoreFocus: () => void
}

const paletteChoices: Array<{ id: PaletteId; label: string; note: string; swatches: string[] }> = [
  { id: 'paper', label: 'Paper & pine', note: 'neutral, focused', swatches: ['#f8f8f5', '#176c5b', '#d56535'] },
  { id: 'lichen', label: 'Lichen field', note: 'quiet, earthy', swatches: ['#eef0dd', '#4b7341', '#d26a39'] },
  { id: 'night', label: 'Night reading', note: 'low light, high focus', swatches: ['#302b27', '#8cc4af', '#de8256'] },
]

const densityChoices: Array<{ id: DensityId; label: string; note: string }> = [
  { id: 'airy', label: 'Airy', note: 'more room to wander' },
  { id: 'balanced', label: 'Balanced', note: 'the recommended rhythm' },
  { id: 'dense', label: 'Dense', note: 'more signal per screen' },
]

const fontChoices: Array<{ id: FontFamilyId; label: string; note: string }> = [
  { id: 'geist', label: 'Geist', note: 'clear and contemporary' },
  { id: 'serif', label: 'Serif', note: 'literary and warm' },
  { id: 'mono', label: 'Mono', note: 'precise and technical' },
]

const surfaceChoices: Array<{ id: SurfaceStyleId; label: string; note: string }> = [
  { id: 'flat', label: 'Flat', note: 'quiet surfaces' },
  { id: 'lined', label: 'Lined', note: 'editorial rules' },
  { id: 'lifted', label: 'Lifted', note: 'soft depth' },
]

const gridChoices: Array<{ id: GridStyleId; label: string; note: string }> = [
  { id: 'none', label: 'None', note: 'plain canvas' },
  { id: 'blueprint', label: 'Blueprint', note: 'a quiet grid' },
  { id: 'ruled', label: 'Ruled', note: 'horizontal rhythm' },
]

const shadowChoices: Array<{ id: ShadowStyleId; label: string; note: string }> = [
  { id: 'none', label: 'None', note: 'crisp edges' },
  { id: 'soft', label: 'Soft', note: 'subtle depth' },
  { id: 'strong', label: 'Strong', note: 'clear elevation' },
]

const postLayoutChoices: Array<{ id: PostLayoutId; label: string; note: string }> = [
  { id: 'standard', label: 'Standard', note: 'balanced reading' },
  { id: 'compact', label: 'Compact', note: 'more notes in view' },
  { id: 'magazine', label: 'Magazine', note: 'art-led reading' },
]

const colorFields: Array<{ key: keyof ColorOverrides; label: string; placeholder: string }> = [
  { key: 'background', label: 'Background', placeholder: 'palette default' },
  { key: 'surface', label: 'Surface', placeholder: 'palette default' },
  { key: 'surfaceRaised', label: 'Raised surface', placeholder: 'palette default' },
  { key: 'ink', label: 'Primary text', placeholder: 'palette default' },
  { key: 'muted', label: 'Secondary text', placeholder: 'palette default' },
  { key: 'border', label: 'Rules', placeholder: 'palette default' },
  { key: 'brand', label: 'Brand', placeholder: 'palette default' },
  { key: 'brandSoft', label: 'Soft brand', placeholder: 'palette default' },
  { key: 'accent', label: 'Accent', placeholder: 'palette default' },
  { key: 'accentSoft', label: 'Soft accent', placeholder: 'palette default' },
  { key: 'success', label: 'Success', placeholder: 'palette default' },
  { key: 'warning', label: 'Warning', placeholder: 'palette default' },
  { key: 'error', label: 'Error', placeholder: 'palette default' },
]

const homeBlockLabels: Record<HomeBlockId, string> = { hero: 'Hero welcome', quote: 'Reading quote', feed: 'Personal feed' }
const navLabels: Record<PageId, string> = { home: 'For you', saved: 'Reading list', profile: 'Your profile' }

export function StudioPanel({ settings, onChange, onMoveHomeBlock, onMoveNavItem, onReset, onClose, onRestoreFocus }: StudioPanelProps) {
  return (
    <Sheet open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <SheetContent className="studio-sheet" side="right" showCloseButton={false} onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}>
        <SheetHeader className="sheet-header">
          <div>
            <div className="eyebrow"><Icon name="spark" size={14} /> Live controls</div>
            <SheetTitle>Make this corner yours.</SheetTitle>
            <SheetDescription>Every visible layer is editable here, and callable through the page tools.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button className="icon-button" size="icon-sm" variant="ghost" type="button" aria-label="Close personalization studio"><Icon name="close" size={18} /></Button>
          </SheetClose>
        </SheetHeader>

        <div className="studio-scroll">
          <Tabs defaultValue="layout" className="studio-tabs">
            <TabsList className="studio-tabs-list" aria-label="Personalization studio sections">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="shape">Shape</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="studio-tab-content">
              <ChoiceSection label="Page rhythm" value={settings.density} note={densityChoices.find((choice) => choice.id === settings.density)?.note}>
                <div className="segmented-control segmented-three" role="group" aria-label="Page density">
                  {densityChoices.map((choice) => <Button type="button" className={settings.density === choice.id ? 'is-selected' : ''} variant={settings.density === choice.id ? 'secondary' : 'outline'} size="sm" key={choice.id} onClick={() => onChange({ density: choice.id })}>{choice.label}</Button>)}
                </div>
              </ChoiceSection>
              <ChoiceSection label="Post layout" value={settings.postLayout}>
                <div className="choice-grid choice-grid-three" role="group" aria-label="Post layout">
                  {postLayoutChoices.map((choice) => <ChoiceButton key={choice.id} selected={settings.postLayout === choice.id} label={choice.label} note={choice.note} onClick={() => onChange({ postLayout: choice.id })} />)}
                </div>
              </ChoiceSection>
              <ChoiceSection label="Artwork position" value={settings.artworkPosition}>
                <div className="segmented-control" role="group" aria-label="Artwork position">
                  {(['right', 'left'] as ArtworkPositionId[]).map((position) => <Button key={position} type="button" size="sm" variant={settings.artworkPosition === position ? 'secondary' : 'outline'} className={settings.artworkPosition === position ? 'is-selected' : ''} onClick={() => onChange({ artworkPosition: position })}>{position === 'right' ? 'Text → art' : 'Art → text'}</Button>)}
                </div>
              </ChoiceSection>
              <ChoiceSection label="Canvas grid" value={settings.gridStyle}>
                <div className="choice-grid choice-grid-three" role="group" aria-label="Canvas grid">
                  {gridChoices.map((choice) => <ChoiceButton key={choice.id} selected={settings.gridStyle === choice.id} label={choice.label} note={choice.note} onClick={() => onChange({ gridStyle: choice.id })} />)}
                </div>
              </ChoiceSection>
              <RangeControl id="sidebar-width" label="Sidebar width" value={settings.sidebarWidth} min={180} max={320} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ sidebarWidth: value })} />
              <RangeControl id="rail-width" label="Agent rail width" value={settings.railWidth} min={180} max={320} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ railWidth: value })} />
              <RangeControl id="layout-gap" label="Main column gap" value={settings.layoutGap} min={16} max={96} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ layoutGap: value })} />
              <RangeControl id="post-column-gap" label="Post text / art gap" value={settings.postColumnGap} min={12} max={48} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ postColumnGap: value })} />
              <RangeControl id="artwork-width" label="Artwork width" value={settings.artworkWidth} min={100} max={260} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ artworkWidth: value })} />
              <OrderEditor label="Home block order" description="Agents and people see the same order." items={settings.homeOrder} labels={homeBlockLabels} onMove={onMoveHomeBlock} />
              <OrderEditor label="Navigation order" description="Rearrange the primary surfaces." items={settings.navOrder} labels={navLabels} onMove={onMoveNavItem} />
            </TabsContent>

            <TabsContent value="spacing" className="studio-tab-content">
              <p className="studio-intro">Tune the complete rhythm system. These values drive page padding, surfaces, controls, cards, and the gaps between every major group.</p>
              <RangeControl id="page-padding" label="Page padding" value={settings.pagePadding} min={16} max={72} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ pagePadding: value })} />
              <RangeControl id="topbar-padding" label="Top bar padding" value={settings.topbarPadding} min={12} max={48} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ topbarPadding: value })} />
              <RangeControl id="sidebar-padding" label="Sidebar padding" value={settings.sidebarPadding} min={12} max={40} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ sidebarPadding: value })} />
              <RangeControl id="section-gap" label="Section gap" value={settings.sectionGap} min={16} max={96} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ sectionGap: value })} />
              <RangeControl id="feed-gap" label="Feed gap" value={settings.feedGap} min={0} max={48} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ feedGap: value })} />
              <RangeControl id="rail-gap" label="Rail gap" value={settings.railGap} min={8} max={32} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ railGap: value })} />
              <RangeControl id="group-gap" label="Control group gap" value={settings.groupGap} min={4} max={24} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ groupGap: value })} />
              <RangeControl id="hero-padding" label="Hero padding" value={settings.heroPadding} min={18} max={72} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ heroPadding: value })} />
              <RangeControl id="quote-padding" label="Quote padding" value={settings.quotePadding} min={12} max={48} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ quotePadding: value })} />
              <RangeControl id="reader-padding" label="Reader padding" value={settings.readerPadding} min={16} max={64} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ readerPadding: value })} />
              <RangeControl id="sheet-padding" label="Panel padding" value={settings.sheetPadding} min={16} max={40} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ sheetPadding: value })} />
              <RangeControl id="control-height" label="Control height" value={settings.controlHeight} min={32} max={52} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ controlHeight: value })} />
              <RangeControl id="button-padding" label="Button padding" value={settings.buttonPadding} min={6} max={24} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ buttonPadding: value })} />
              <RangeControl id="card-padding" label="Post card padding" value={settings.cardPadding} min={12} max={42} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ cardPadding: value })} />
            </TabsContent>

            <TabsContent value="type" className="studio-tab-content">
              <FontChoice label="Body typeface" value={settings.fontFamily} choices={fontChoices} onChange={(fontFamily) => onChange({ fontFamily })} />
              <FontChoice label="Display typeface" value={settings.displayFont} choices={fontChoices} onChange={(displayFont) => onChange({ displayFont })} />
              <RangeControl id="type-scale" label="Display scale" value={settings.typeScale} min={0.88} max={1.12} step={0.01} format={(value) => `${value.toFixed(2)}×`} onChange={(value) => onChange({ typeScale: value })} />
              <RangeControl id="body-size" label="Body size" value={settings.bodySize} min={0.88} max={1.12} step={0.01} format={(value) => `${value.toFixed(2)}×`} onChange={(value) => onChange({ bodySize: value })} />
              <RangeControl id="line-height" label="Line height" value={settings.lineHeight} min={1.25} max={1.85} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => onChange({ lineHeight: value })} />
              <RangeControl id="letter-spacing" label="Letter spacing" value={settings.letterSpacing} min={-0.03} max={0.08} step={0.01} format={(value) => `${(value * 100).toFixed(0)}%`} onChange={(value) => onChange({ letterSpacing: value })} />
              <RangeControl id="heading-weight" label="Heading weight" value={settings.headingWeight} min={400} max={700} step={50} format={(value) => `${value}`} onChange={(value) => onChange({ headingWeight: value })} />
              <RangeControl id="body-weight" label="Body weight" value={settings.bodyWeight} min={350} max={600} step={50} format={(value) => `${value}`} onChange={(value) => onChange({ bodyWeight: value })} />
              <RangeControl id="content-width" label="Reading measure" value={settings.contentWidth} min={48} max={78} step={1} format={(value) => `${value}ch`} onChange={(value) => onChange({ contentWidth: value })} />
              <section className="studio-section studio-toggles"><ToggleRow label="Reduce motion" description="Use immediate swaps for people who prefer less motion." checked={settings.reduceMotion} onChange={(checked) => onChange({ reduceMotion: checked })} /></section>
            </TabsContent>

            <TabsContent value="shape" className="studio-tab-content">
              <ChoiceSection label="Corner shape" value={settings.radius}>
                <div className="shape-options" role="group" aria-label="Corner shape">
                  {(['crisp', 'soft', 'round'] as RadiusId[]).map((radius) => <Button type="button" className={`shape-choice shape-${radius}${settings.radius === radius ? ' is-selected' : ''}`} variant={settings.radius === radius ? 'secondary' : 'outline'} size="sm" key={radius} onClick={() => onChange({ radius })}><span className="shape-preview" />{radius}</Button>)}
                </div>
              </ChoiceSection>
              <RangeControl id="control-radius" label="Control radius" value={settings.controlRadius} min={4} max={24} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ controlRadius: value })} />
              <RangeControl id="surface-radius" label="Surface radius" value={settings.surfaceRadius} min={8} max={32} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ surfaceRadius: value })} />
              <RangeControl id="border-width" label="Border width" value={settings.borderWidth} min={0} max={3} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ borderWidth: value })} />
              <ChoiceSection label="Shadow" value={settings.shadowStyle}>
                <div className="choice-grid choice-grid-three" role="group" aria-label="Shadow style">
                  {shadowChoices.map((choice) => <ChoiceButton key={choice.id} selected={settings.shadowStyle === choice.id} label={choice.label} note={choice.note} onClick={() => onChange({ shadowStyle: choice.id })} />)}
                </div>
              </ChoiceSection>
              <ChoiceSection label="Surface treatment" value={settings.surfaceStyle}>
                <div className="choice-grid choice-grid-three" role="group" aria-label="Surface treatment">
                  {surfaceChoices.map((choice) => <ChoiceButton key={choice.id} selected={settings.surfaceStyle === choice.id} label={choice.label} note={choice.note} onClick={() => onChange({ surfaceStyle: choice.id })} />)}
                </div>
              </ChoiceSection>
              <RangeControl id="grid-size" label="Grid size" value={settings.gridSize} min={16} max={64} step={1} format={(value) => `${value}px`} onChange={(value) => onChange({ gridSize: value })} />
              <RangeControl id="grid-opacity" label="Grid opacity" value={settings.gridOpacity} min={0} max={0.35} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onChange={(value) => onChange({ gridOpacity: value })} />
            </TabsContent>

            <TabsContent value="color" className="studio-tab-content">
              <section className="studio-section">
                <div className="studio-label-row"><span className="studio-label">Color language</span><span className="studio-value">{settings.palette}</span></div>
                <div className="palette-grid">
                  {paletteChoices.map((choice) => <Button className={`palette-choice${settings.palette === choice.id ? ' is-selected' : ''}`} variant={settings.palette === choice.id ? 'secondary' : 'outline'} size="lg" type="button" key={choice.id} onClick={() => onChange({ palette: choice.id })}><span className="palette-swatches">{choice.swatches.map((swatch) => <span key={swatch} style={{ backgroundColor: swatch }} />)}</span><strong>{choice.label}</strong><small>{choice.note}</small>{settings.palette === choice.id && <Icon name="check" size={14} className="choice-check" />}</Button>)}
                </div>
              </section>
              <section className="studio-section">
                <div className="studio-label-row"><span className="studio-label">Exact color overrides</span><span className="studio-value">13 tokens</span></div>
                <p className="studio-helper">Use CSS colors. Leave a field blank to return to the selected palette.</p>
                <div className="color-field-grid">
                  {colorFields.map(({ key, label, placeholder }) => <Label className="color-field" key={key}><span>{label}</span><Input aria-label={`${label} color`} value={settings.customColors[key] ?? ''} placeholder={placeholder} onChange={(event) => onChange({ customColors: { ...settings.customColors, [key]: event.target.value } })} /></Label>)}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="content" className="studio-tab-content">
              <section className="studio-section studio-toggles">
                <ToggleRow label="Primary sidebar" description="Keep navigation and the personalization entry point visible." checked={settings.showSidebar} onChange={(checked) => onChange({ showSidebar: checked })} />
                <ToggleRow label="Search top bar" description="Keep search and quick actions at the top of the workspace." checked={settings.showTopbar} onChange={(checked) => onChange({ showTopbar: checked })} />
                <ToggleRow label="Sidebar profile footer" description="Show your profile shortcut at the bottom of the sidebar." checked={settings.showSidebarFooter} onChange={(checked) => onChange({ showSidebarFooter: checked })} />
                <ToggleRow label="Agent rail" description="Show the contextual WebMCP rail on wide screens." checked={settings.showAgentRail} onChange={(checked) => onChange({ showAgentRail: checked })} />
                <ToggleRow label="Rail status" description="Show browser bridge readiness and tool progress." checked={settings.showRailStatus} onChange={(checked) => onChange({ showRailStatus: checked })} />
                <ToggleRow label="Rail tools" description="Show the visible shortcuts to callable actions." checked={settings.showRailTools} onChange={(checked) => onChange({ showRailTools: checked })} />
              </section>
              <VisibilitySection title="Home page" rows={[
                ['showHomeTopline', 'Home status topline', 'Show the date and personalization status.'],
                ['showHomeHero', 'Hero welcome', 'Show the welcome message and voice actions.'],
                ['showHeroSurface', 'Hero surface', 'Keep the hero inside a raised surface.'],
                ['showQuote', 'Reading quote', 'Show the reflective quote block.'],
                ['showHomeFeed', 'Personal feed', 'Show the feed and its filters.'],
                ['showFeedEnd', 'Feed end marker', 'Show the caught-up marker below the feed.'],
              ]} settings={settings} onChange={onChange} />
              <VisibilitySection title="Profile page" rows={[
                ['showProfileTopline', 'Profile status topline', 'Show the profile context label.'],
                ['showProfileCover', 'Profile cover', 'Show the cover artwork.'],
                ['showProfileBio', 'Profile details', 'Show bio, location, and website.'],
                ['showProfileStats', 'Profile statistics', 'Show field note and follower counts.'],
                ['showProfileInterests', 'Profile interests', 'Show the topic chips beside the profile notes.'],
              ]} settings={settings} onChange={onChange} />
              <VisibilitySection title="Post presentation" rows={[
                ['showPostArtwork', 'Post artwork', 'Show artwork on cards and in the reader.'],
                ['showPostTags', 'Post tags', 'Show topic tags on cards and in the reader.'],
                ['showPostActions', 'Post actions', 'Show like, save, and overflow actions.'],
                ['showPostExcerpt', 'Post excerpts', 'Show summaries beneath post titles.'],
                ['showPostAuthor', 'Post authors', 'Show author identity on cards.'],
                ['showPostPublished', 'Published labels', 'Show relative publish dates on cards.'],
                ['showReadingTimes', 'Reading times', 'Show estimated minutes to read.'],
                ['showReaderActions', 'Reader actions', 'Show like and save controls in the reader.'],
              ]} settings={settings} onChange={onChange} />
              <CopyEditor settings={settings} onChange={onChange} />
            </TabsContent>
          </Tabs>

          <div className="studio-footer-note">Changes save locally. WebMCP agents observe this state.</div>
        </div>

        <SheetFooter className="sheet-footer">
          <Button className="text-button" variant="ghost" size="sm" type="button" onClick={onReset}><Icon name="refresh" size={15} /> Reset all controls</Button>
          <SheetClose asChild><Button className="primary-button" variant="default" size="sm" type="button">Done</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ChoiceSection({ label, value, note, children }: { label: string; value: string; note?: string; children: ReactNode }) {
  return <section className="studio-section"><div className="studio-label-row"><span className="studio-label">{label}</span><span className="studio-value">{value}</span></div>{children}{note && <p className="studio-helper">{note}</p>}</section>
}

function ChoiceButton({ selected, label, note, onClick }: { selected: boolean; label: string; note: string; onClick: () => void }) {
  return <Button className={`studio-choice${selected ? ' is-selected' : ''}`} variant={selected ? 'secondary' : 'outline'} size="sm" type="button" onClick={onClick}><strong>{label}</strong><small>{note}</small></Button>
}

function RangeControl({ id, label, value, min, max, step, format, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; format: (value: number) => string; onChange: (value: number) => void }) {
  return <section className="studio-section"><div className="studio-label-row"><Label className="studio-label" htmlFor={id}>{label}</Label><output className="studio-value" htmlFor={id}>{format(value)}</output></div><Slider className="range-input" id={id} aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={(values) => { const next = values[0]; if (typeof next === 'number') onChange(next) }} /><div className="range-ends"><span>{format(min)}</span><span>{format(max)}</span></div></section>
}

function FontChoice({ label, value, choices, onChange }: { label: string; value: FontFamilyId; choices: Array<{ id: FontFamilyId; label: string; note: string }>; onChange: (value: FontFamilyId) => void }) {
  return <ChoiceSection label={label} value={value}><div className="choice-grid" role="group" aria-label={label}>{choices.map((choice) => <ChoiceButton key={choice.id} selected={value === choice.id} label={choice.label} note={choice.note} onClick={() => onChange(choice.id)} />)}</div></ChoiceSection>
}

function OrderEditor<T extends string>({ label, description, items, labels, onMove }: { label: string; description: string; items: T[]; labels: Record<T, string>; onMove: (item: T, toIndex: number) => void }) {
  return <section className="studio-section"><div className="studio-label-row"><span className="studio-label">{label}</span><span className="studio-value">{items.length} items</span></div><p className="studio-helper">{description}</p><div className="order-list">{items.map((item, index) => <div className="order-row" key={item}><span><strong>{labels[item]}</strong><small>position {index + 1}</small></span><div className="order-actions"><Button variant="outline" size="icon-xs" type="button" aria-label={`Move ${labels[item]} up`} disabled={index === 0} onClick={() => onMove(item, index - 1)}><Icon name="chevron-up" size={14} /></Button><Button variant="outline" size="icon-xs" type="button" aria-label={`Move ${labels[item]} down`} disabled={index === items.length - 1} onClick={() => onMove(item, index + 1)}><Icon name="chevron-down" size={14} /></Button></div></div>)}</div></section>
}

type VisibilityKey = 'showHomeTopline' | 'showHomeHero' | 'showHeroSurface' | 'showQuote' | 'showHomeFeed' | 'showFeedEnd' | 'showProfileTopline' | 'showProfileCover' | 'showProfileBio' | 'showProfileStats' | 'showProfileInterests' | 'showPostArtwork' | 'showPostTags' | 'showPostActions' | 'showPostExcerpt' | 'showPostAuthor' | 'showPostPublished' | 'showReadingTimes' | 'showReaderActions'

function VisibilitySection({ title, rows, settings, onChange }: { title: string; rows: Array<[VisibilityKey, string, string]>; settings: ThemeSettings; onChange: (patch: Partial<ThemeSettings>) => void }) {
  return <section className="studio-section studio-toggles"><div className="studio-label-row"><span className="studio-label">{title}</span><span className="studio-value">visibility</span></div>{rows.map(([key, label, description]) => <ToggleRow key={key} label={label} description={description} checked={settings[key]} onChange={(checked) => onChange({ [key]: checked } as Partial<ThemeSettings>)} />)}</section>
}

function CopyEditor({ settings, onChange }: { settings: ThemeSettings; onChange: (patch: Partial<ThemeSettings>) => void }) {
  const copy = settings.copy
  const update = (key: keyof ThemeSettings['copy'], value: string) => onChange({ copy: { ...copy, [key]: value } })
  return <section className="studio-section copy-editor"><div className="studio-label-row"><span className="studio-label">Surface copy</span><span className="studio-value">editable voice</span></div><p className="studio-helper">Change the words the page and its voice agent use. Use <code>{'{name}'}</code> in the welcome line for the profile first name.</p><div className="copy-field-grid">
    <CopyField id="copy-brand-name" label="Brand name" value={copy.brandName} onChange={(value) => update('brandName', value)} />
    <CopyField id="copy-brand-kicker" label="Brand kicker" value={copy.brandKicker} onChange={(value) => update('brandKicker', value)} />
    <CopyField id="copy-hero-kicker" label="Hero kicker" value={copy.heroKicker} onChange={(value) => update('heroKicker', value)} />
    <CopyField id="copy-hero-title" label="Hero title" value={copy.heroTitle} onChange={(value) => update('heroTitle', value)} />
    <CopyField id="copy-hero-emphasis" label="Hero emphasis" value={copy.heroEmphasis} onChange={(value) => update('heroEmphasis', value)} />
    <CopyField id="copy-hero-lede" label="Hero description" value={copy.heroLede} multiline onChange={(value) => update('heroLede', value)} />
    <CopyField id="copy-quote-text" label="Quote" value={copy.quoteText} multiline onChange={(value) => update('quoteText', value)} />
    <CopyField id="copy-quote-source" label="Quote source" value={copy.quoteSource} onChange={(value) => update('quoteSource', value)} />
    <CopyField id="copy-rail-title" label="Rail title" value={copy.railTitle} onChange={(value) => update('railTitle', value)} />
    <CopyField id="copy-rail-description" label="Rail description" value={copy.railDescription} multiline onChange={(value) => update('railDescription', value)} />
  </div></section>
}

function CopyField({ id, label, value, multiline = false, onChange }: { id: string; label: string; value: string; multiline?: boolean; onChange: (value: string) => void }) {
  return <Label className="copy-field"><span>{label}</span>{multiline ? <Textarea id={id} value={value} rows={3} onChange={(event) => onChange(event.target.value)} /> : <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />}</Label>
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{description}</small></span><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /></label>
}
