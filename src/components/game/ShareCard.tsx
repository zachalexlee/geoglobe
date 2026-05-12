'use client'

import { useState } from 'react'
import type { RoundResult } from '@/hooks/useGameState'
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
  const [showAll, setShowAll] = useState(false)

  const shareText = generateShareText(puzzleNumber, totalScore, roundResults, streak)
  const shareUrl = 'https://geoglobe-production.up.railway.app'
  const shareTitle = `GeoGlobe #${puzzleNumber} — ${totalScore}/500`

  async function handleCopy() {
    const ok = await copyShareText(shareText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      window.prompt('Copy your result:', shareText)
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed — fall back to copy
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  // Share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
  const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`
  const smsUrl = `sms:?body=${encodeURIComponent(shareText + '\n' + shareUrl)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\nPlay here: ' + shareUrl)}`

  const shareButtons = [
    { name: 'X', url: twitterUrl, icon: XIcon, color: 'bg-zinc-800 hover:bg-zinc-700' },
    { name: 'WhatsApp', url: whatsappUrl, icon: WhatsAppIcon, color: 'bg-[#25D366] hover:bg-[#20bd5a]' },
    { name: 'iMessage / SMS', url: smsUrl, icon: SMSIcon, color: 'bg-[#34c759] hover:bg-[#2db84e]' },
    { name: 'Telegram', url: telegramUrl, icon: TelegramIcon, color: 'bg-[#2AABEE] hover:bg-[#229ed6]' },
    { name: 'Facebook', url: facebookUrl, icon: FacebookIcon, color: 'bg-[#1877F2] hover:bg-[#166ad4]' },
    { name: 'Threads', url: threadsUrl, icon: ThreadsIcon, color: 'bg-zinc-800 hover:bg-zinc-700' },
    { name: 'Reddit', url: redditUrl, icon: RedditIcon, color: 'bg-[#FF4500] hover:bg-[#e03e00]' },
    { name: 'Email', url: emailUrl, icon: EmailIcon, color: 'bg-[#6366f1] hover:bg-[#5558e6]' },
  ]

  const visibleButtons = showAll ? shareButtons : shareButtons.slice(0, 4)

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-4">
      {/* Share text preview */}
      <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/5 rounded-lg p-3 select-all">
        {shareText}
      </pre>

      {/* Primary actions */}
      <div className="flex gap-3">
        {/* Native share (mobile) or Copy (desktop) */}
        {'share' in navigator ? (
          <button
            onClick={handleNativeShare}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        ) : (
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy Results'}
          </button>
        )}

        {/* Always show copy as secondary */}
        {'share' in navigator && (
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 transition-colors"
          >
            {copied ? '✅' : '📋'}
          </button>
        )}
      </div>

      {/* Share platform buttons */}
      <div className="grid grid-cols-4 gap-2">
        {visibleButtons.map((btn) => (
          <a
            key={btn.name}
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-white transition-colors ${btn.color}`}
          >
            <btn.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium opacity-80">{btn.name}</span>
          </a>
        ))}
      </div>

      {/* Show more/less toggle */}
      {shareButtons.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors py-1"
        >
          {showAll ? '▲ Show less' : `▼ More options (${shareButtons.length - 4} more)`}
        </button>
      )}
    </div>
  )
}

// ── Platform Icons ─────────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function SMSIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.243 1.33-3.023.812-.687 1.9-1.078 3.056-1.1.823-.015 1.578.097 2.277.315-.03-.632-.185-1.129-.465-1.495-.372-.489-1.003-.749-1.822-.753h-.022c-.693 0-1.593.2-2.386.823l-1.14-1.663c1.132-.776 2.467-1.186 3.526-1.186h.036c1.326.01 2.394.472 3.088 1.335.58.722.898 1.688.952 2.87.577.258 1.1.574 1.566.945 1.046.836 1.77 1.936 2.15 3.27.49 1.72.302 3.94-1.3 5.51-1.837 1.8-4.083 2.584-7.278 2.606zm.07-8.861c-.91.05-1.598.4-1.935.987-.264.46-.3 1.005-.1 1.535.202.529.655.916 1.276 1.088.436.12.917.157 1.418.105 1.167-.122 1.944-.728 2.314-1.807.184-.536.266-1.168.244-1.89-.608-.165-1.263-.25-1.957-.25-.088 0-.175.002-.262.005a4.137 4.137 0 00-.998.127z" />
    </svg>
  )
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  )
}
