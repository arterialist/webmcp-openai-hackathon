import { useState } from 'react'
import { Icon } from '../icons'
import type { UserProfile } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ProfileEditorProps {
  profile: UserProfile
  onSave: (patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'location' | 'website'>>) => void
  onClose: () => void
}

export function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [location, setLocation] = useState(profile.location)
  const [website, setWebsite] = useState(profile.website)

  return (
    <section className="profile-editor" aria-label="Edit your profile">
      <div className="profile-editor-header"><div><div className="eyebrow"><Icon name="user" size={14} /> Profile tool</div><h3>Edit your identity</h3></div><Button className="icon-button" size="icon-sm" variant="ghost" type="button" onClick={onClose} aria-label="Close profile editor"><Icon name="close" size={16} /></Button></div>
      <div className="profile-editor-grid">
        <div className="field-label"><Label htmlFor="profile-name">Name</Label><Input className="text-input" id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
        <div className="field-label"><Label htmlFor="profile-location">Based in</Label><Input className="text-input" id="profile-location" value={location} onChange={(event) => setLocation(event.target.value)} required /></div>
        <div className="field-label field-label-wide"><Label htmlFor="profile-bio">Bio</Label><Textarea className="text-input" id="profile-bio" rows={3} value={bio} onChange={(event) => setBio(event.target.value)} required /></div>
        <div className="field-label"><Label htmlFor="profile-website">Website</Label><Input className="text-input" id="profile-website" value={website} onChange={(event) => setWebsite(event.target.value)} required /></div>
      </div>
      <div className="profile-editor-footer"><span className="compose-hint">Also accessible via WebMCP</span><Button className="primary-button" variant="default" size="sm" type="button" onClick={() => { onSave({ name: name.trim() || profile.name, bio: bio.trim() || profile.bio, location: location.trim() || profile.location, website: website.trim() || profile.website }); onClose() }}>Save identity</Button></div>
    </section>
  )
}
