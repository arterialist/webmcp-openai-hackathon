import { Icon } from '../icons'
import type { PageId } from '../types'
import { BrandLogo } from './BrandLogo'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface TopbarProps {
  activePage: PageId
  savedCount: number
  query: string
  onQueryChange: (query: string) => void
  onOpenVoice: (trigger?: HTMLElement) => void
  onOpenTools: (trigger?: HTMLElement) => void
  onOpenStudio: (trigger?: HTMLElement) => void
  onNavigate: (page: PageId) => void
  onCompose: (trigger?: HTMLElement) => void
  voiceConnected: boolean
  registeredCount: number
  brandName: string
}

export function Topbar({ activePage, savedCount, query, onQueryChange, onOpenVoice, onOpenTools, onOpenStudio, onNavigate, onCompose, voiceConnected, registeredCount, brandName }: TopbarProps) {
  const navigation = [
    { page: 'home' as const, label: 'For you', icon: 'home' as const },
    { page: 'saved' as const, label: `Reading list${savedCount ? ` ${savedCount}` : ''}`, icon: 'bookmark' as const },
    { page: 'profile' as const, label: 'Your profile', icon: 'user' as const },
  ]

  return (
    <header className="topbar" data-customization-block="topbar">
      <div className="mobile-brand">
        <BrandLogo size={24} className="brand-logo brand-logo-small" />
        <span>{brandName}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mobile-menu-button" size="icon" variant="outline" type="button" aria-label="Open navigation"><Icon name="menu" size={18} /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mobile-nav-menu" align="start">
          <DropdownMenuLabel>Your corner</DropdownMenuLabel>
          {navigation.map((item) => <DropdownMenuItem key={item.page} className={activePage === item.page ? 'is-active' : undefined} onSelect={() => onNavigate(item.page)}><Icon name={item.icon} size={16} /> {item.label}</DropdownMenuItem>)}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(event) => onOpenStudio(event.currentTarget as HTMLElement)}><Icon name="spark" size={16} /> Personalization studio</DropdownMenuItem>
          <DropdownMenuItem onSelect={(event) => onOpenTools(event.currentTarget as HTMLElement)}><Icon name="tool" size={16} /> WebMCP tools</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form
        className="search-box"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="search"]')
          if (input) onQueryChange(input.value)
        }}
        {...({
          toolname: 'commonplace_search_feed',
          tooldescription: 'Search posts in Commonplace by keywords, topic tags, or author handle',
          toolautosubmit: '',
        } as unknown as React.FormHTMLAttributes<HTMLFormElement>)}
      >
        <Icon className="search-icon" name="search" size={17} />
        <Input
          className="search-field"
          value={query}
          type="search"
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search your feed"
          aria-keyshortcuts="/"
          placeholder="Search your corner of the web"
          name="query"
          {...({ toolparamdescription: 'Words, author names, or topic tags to search for' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        <kbd>/</kbd>
      </form>
      <div className="topbar-actions">
        <Button className={`topbar-tool${voiceConnected ? ' is-live' : ''}`} variant="secondary" size="sm" type="button" onClick={(event) => onOpenVoice(event.currentTarget)}>
          <span className="topbar-tool-icon"><Icon name="mic" size={16} /></span>
          <span className="topbar-tool-text">{voiceConnected ? 'Listening' : 'Talk to your space'}</span>
        </Button>
        <Button className="icon-button topbar-inspector" size="icon" variant="outline" type="button" onClick={(event) => onOpenTools(event.currentTarget)} aria-label="Open WebMCP tools">
          <Icon name="tool" size={18} />
          <span className="topbar-inspector-label">Tools</span>
          <span className="tool-badge">{registeredCount}</span>
        </Button>
        <Button className="compose-button" variant="default" size="sm" type="button" onClick={(event) => onCompose(event.currentTarget)}><Icon name="plus" size={17} /> <span>Write</span></Button>
      </div>
    </header>
  )
}
