import { Icon } from '../icons'
import type { PageId, UserProfile } from '../types'
import { Button } from '@/components/ui/button'
import { Avatar } from './Avatar'

interface SidebarProps {
  activePage: PageId
  profile: UserProfile
  savedCount: number
  navOrder: PageId[]
  showFooter: boolean
  brandName: string
  brandKicker: string
  onNavigate: (page: PageId) => void
  onOpenStudio: (trigger?: HTMLElement) => void
}

export function Sidebar({ activePage, profile, savedCount, navOrder, showFooter, brandName, brandKicker, onNavigate, onOpenStudio }: SidebarProps) {
  const linksByPage: Record<PageId, { page: PageId; label: string; icon: 'home' | 'compass' | 'bookmark' | 'user' }> = {
    home: { page: 'home', label: 'For you', icon: 'home' },
    saved: { page: 'saved', label: 'Reading list', icon: 'bookmark' },
    profile: { page: 'profile', label: 'Your profile', icon: 'user' },
  }
  const links = navOrder.map((page) => linksByPage[page])

  return (
    <aside className="sidebar" aria-label="Primary navigation" data-customization-block="sidebar">
      <div className="sidebar-navigation">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <div>
              <div className="brand-name">{brandName}</div>
              <div className="brand-kicker">{brandKicker}</div>
            </div>
          </div>
          <div className="sidebar-section-label">Your corner</div>
        </div>
        <nav className="primary-nav" aria-label="Your corner">
          {links.map((link) => (
            <Button
              className={`nav-item${activePage === link.page ? ' is-active' : ''}`}
              key={link.page}
              variant="ghost"
              size="lg"
              type="button"
              onClick={() => onNavigate(link.page)}
              aria-current={activePage === link.page ? 'page' : undefined}
            >
              <Icon name={link.icon} size={18} />
              <span>{link.label}</span>
              {link.page === 'saved' && <span className="nav-count">{savedCount}</span>}
            </Button>
          ))}
        </nav>
      </div>

      <div className="sidebar-custom">
        <div className="sidebar-rule" />
        <div className="sidebar-section-label">Make it yours</div>
        <Button className="nav-item nav-item-studio" variant="secondary" size="sm" type="button" onClick={(event) => onOpenStudio(event.currentTarget)}>
          <span className="studio-swatch"><Icon name="spark" size={14} /></span>
          <span>Personalization studio</span>
          <Icon name="arrow-up-right" className="nav-trailing-icon" size={15} />
        </Button>
      </div>

      {showFooter && <div className="sidebar-footer">
        <Button className="mini-profile" variant="ghost" size="sm" type="button" onClick={() => onNavigate('profile')}>
          <Avatar initials={profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()} size="small" />
          <span className="mini-profile-copy"><strong>{profile.name}</strong><small>@{profile.handle}</small></span>
          <Icon name="chevron-right" size={15} />
        </Button>
      </div>}
    </aside>
  )
}
