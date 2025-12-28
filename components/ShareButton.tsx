'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'

interface ShareButtonProps {
  url: string
  title: string
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `You're invited to ${title}!`,
          url: url,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <button
      onClick={handleShare}
      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
    >
      {copied ? '✓ Copied!' : 'Share'}
    </button>
  )
}
