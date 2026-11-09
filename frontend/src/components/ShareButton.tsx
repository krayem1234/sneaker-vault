import { useState } from 'react'
import { ShareIcon, CheckCircleIcon } from './icons'

export default function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // user cancelled or share failed, fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable, nothing more we can do silently
    }
  }

  return (
    <button className="icon-btn" onClick={share} title="Partager" style={{ color: copied ? 'var(--accent)' : 'var(--text)' }}>
      {copied ? <CheckCircleIcon size={19} /> : <ShareIcon size={18} />}
    </button>
  )
}
