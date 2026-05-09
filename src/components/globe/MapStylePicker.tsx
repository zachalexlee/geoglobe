'use client'

import { useState } from 'react'
import { MAP_STYLES, type MapStyle } from '@/lib/globe-config'

interface MapStylePickerProps {
  selected: MapStyle
  onChange: (style: MapStyle) => void
}

export default function MapStylePicker({ selected, onChange }: MapStylePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium hover:bg-black/80 transition-colors shadow-lg"
        title="Change map style"
      >
        <span className="text-base">{selected.icon}</span>
        <span className="hidden sm:inline">{selected.label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="mt-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onChange(style)
                setOpen(false)
              }}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                selected.id === style.id
                  ? 'bg-indigo-600/40 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{style.icon}</span>
              <span className="font-medium">{style.label}</span>
              {selected.id === style.id && (
                <svg className="w-4 h-4 ml-auto text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
