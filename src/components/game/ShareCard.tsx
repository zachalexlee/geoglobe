'use client'

import { useState } from 'react'
import type { RoundResult } from '@/lib/game-engine'
import { generateShareText, copyShareText } from '@/lib/share-generator'

interface ShareCardProps {
  puzzleNumber: number
  totalScore: number
  roundResults: RoundResult[]
  streak: number
}

export default function ShareCard({
  puzzleNumber,
  totalScore,
  roundResults,
  streak,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const shareText = generateShareText(puzzleNumber, totalScore, roundResults, streak)

  async function handleCopy() {
    const ok = await copyShareText(shareText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      // Fallback prompt
      window.prompt('Copy your result:', shareText)
    }
  }

  const twitterUrl =
    'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText)

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-4">
      {/* Share text preview */}
      <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/5 rounded-lg p-3 select-all">
        {shareText}
      </pre>

      {/* Action buttons */}
      <div className="flex gap-3">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy Results'}
        </button>

        {/* Share on X / Twitter */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 transition-colors"
        >
          {/* X logo (𝕏) */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-4 h-4 fill-current"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share</span>
        </a>
      </div>
    </div>
  )
}
