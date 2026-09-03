import { Icon } from '../icons'
import type { ArtworkPositionId, Post, PostLayoutId } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from './Avatar'
import { Artwork } from './Artwork'

interface PostCardProps {
  post: Post
  index: number
  showReadingTimes: boolean
  showArtwork: boolean
  showTags: boolean
  showActions: boolean
  showExcerpt: boolean
  showAuthor: boolean
  showPublished: boolean
  layout: PostLayoutId
  artworkPosition: ArtworkPositionId
  onOpen: (postId: string, trigger?: HTMLElement) => void
  onToggleSave: (postId: string) => void
  onToggleLike: (postId: string) => void
  onEdit?: (postId: string, trigger?: HTMLElement) => void
  onDelete?: (postId: string) => void
}

export function PostCard({ post, index, showReadingTimes, showArtwork, showTags, showActions, showExcerpt, showAuthor, showPublished, layout, artworkPosition, onOpen, onToggleSave, onToggleLike, onEdit, onDelete }: PostCardProps) {
  const avatarTone = index % 3 === 0 ? 'brand' : index % 3 === 1 ? 'coral' : 'sand'

  return (
    <article className="post-card-frame" data-post-id={post.id} data-customization-block="post">
      <Card className={`post-card post-card-${index + 1} post-layout-${layout} artwork-position-${artworkPosition}${showArtwork ? '' : ' post-card-no-art'}`}>
        <div className="post-card-main">
          {(showAuthor || showPublished) && <div className="post-meta-row">
            {showAuthor && <div className="post-author"><Avatar initials={post.avatar} size="small" tone={avatarTone} /><span><strong>{post.author}</strong><small>@{post.handle}</small></span></div>}
            {showPublished && <span className="post-published">{post.published}</span>}
          </div>}
          <Button className="post-title-button" variant="ghost" size="lg" type="button" onClick={(event) => onOpen(post.id, event.currentTarget)}>
            <h3>{post.title}</h3>
            <Icon name="arrow-up-right" size={18} />
          </Button>
          {showExcerpt && <p className="post-excerpt">{post.excerpt}</p>}
          {(showTags || showReadingTimes || showActions) && <div className="post-footer-row">
            {showTags && <div className="post-tags" data-customization-block="post-tags">{post.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>}
            {(showReadingTimes || showActions) && <div className="post-stats" data-customization-block={showActions ? 'post-actions' : 'reading-times'}>
              {showReadingTimes && <span className="read-time">{post.readTime} min read</span>}
              {showActions && <>
                <Button className={`inline-action${post.liked ? ' is-liked' : ''}`} variant="ghost" size="xs" type="button" onClick={() => onToggleLike(post.id)} aria-label={`${post.liked ? 'Unlike' : 'Like'} ${post.title}`}><Icon name="heart" size={16} /><span>{post.likes}</span></Button>
                <Button className={`inline-action${post.saved ? ' is-saved' : ''}`} variant="ghost" size="icon-xs" type="button" onClick={() => onToggleSave(post.id)} aria-label={`${post.saved ? 'Remove' : 'Save'} ${post.title}`}><Icon name="bookmark" size={16} /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="more-button" variant="ghost" size="icon-xs" type="button" aria-label={`More options for ${post.title}`}><Icon name="more" size={16} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="post-options-menu">
                    <DropdownMenuItem onSelect={(event) => onOpen(post.id, event.currentTarget as HTMLElement)}><Icon name="arrow-up-right" size={15} /> Read article</DropdownMenuItem>
                    {onEdit && <DropdownMenuItem onSelect={(event) => onEdit(post.id, event.currentTarget as HTMLElement)}><Icon name="edit" size={15} /> Edit article</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onToggleSave(post.id)}><Icon name="bookmark" size={15} /> {post.saved ? 'Remove from reading list' : 'Save for later'}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggleLike(post.id)}><Icon name="heart" size={15} /> {post.liked ? 'Unlike article' : 'Like article'}</DropdownMenuItem>
                    {onDelete && <><DropdownMenuSeparator /><DropdownMenuItem className="post-delete-item" onSelect={() => onDelete(post.id)}><Icon name="trash" size={15} /> Delete article</DropdownMenuItem></>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>}
            </div>}
          </div>}
        </div>
        {showArtwork && <Button className="post-art-button" data-customization-block="post-artwork" variant="ghost" size="lg" type="button" onClick={(event) => onOpen(post.id, event.currentTarget)} aria-label={`Read ${post.title}`}><Artwork variant={post.artwork} accent={post.accent} /></Button>}
      </Card>
    </article>
  )
}
