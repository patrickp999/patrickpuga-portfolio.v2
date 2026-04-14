import React, { useEffect, useState, useMemo } from 'react'

interface LikeButtonProps {
  slug: string
  prompts?: string[]
}

const DEFAULT_PROMPT = 'Found this useful or interesting?'

const LikeButton: React.FC<LikeButtonProps> = ({ slug, prompts }) => {
  const storageKey = `liked:${slug}`
  const [likes, setLikes]     = useState<number | null>(null)
  const [liked, setLiked]     = useState(false)
  const [popping, setPopping] = useState(false)

  const prompt = useMemo(() => {
    if (!prompts || prompts.length === 0) return DEFAULT_PROMPT
    return prompts[Math.floor(Math.random() * prompts.length)]
  }, [slug])

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === 'true')

    fetch(`/.netlify/functions/likes?slug=${slug}`)
      .then(r => r.json())
      .then(data => setLikes(data.likes))
      .catch(() => {})
  }, [slug])

  const handleLike = async () => {
    if (liked) return

    setLiked(true)
    localStorage.setItem(storageKey, 'true')
    setPopping(true)
    setTimeout(() => setPopping(false), 300)

    try {
      const res = await fetch('/.netlify/functions/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      setLikes(data.likes)
    } catch {
      setLikes(prev => (prev !== null ? prev + 1 : 1))
    }
  }

  return (
    <div className="like-area">
      <p className="like-prompt">{prompt}</p>
      <div className="like-row">
        <button
          className={`like-btn${liked ? ' liked' : ''}${popping ? ' pop' : ''}`}
          onClick={handleLike}
          aria-label="Like this post"
          aria-pressed={liked}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21C12 21 3 15.5 3 9.5C3 7 4.5 5 7 5C9 5 11 6.5 12 8C13 6.5 15 5 17 5C19.5 5 21 7 21 9.5C21 15.5 12 21 12 21Z"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {liked ? 'Liked' : 'Like this post'}
        </button>
        {likes !== null && (
          <span className="like-count">
            <span>{likes}</span> likes
          </span>
        )}
      </div>
    </div>
  )
}

export default LikeButton
