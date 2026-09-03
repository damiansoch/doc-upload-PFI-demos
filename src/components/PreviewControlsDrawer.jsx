import { useState } from 'react'
import { Menu, X } from 'lucide-react'

// Everything that's "for building this, not part of the design" — document
// selection, signing-method overrides, the diagram links — lives behind
// this closed-by-default drawer instead of sitting in the page itself, so a
// screenshot or share of the app reads as the actual product, not a preview
// harness. Manages its own open state; nothing outside needs to know.
export default function PreviewControlsDrawer({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close preview controls' : 'Open preview controls'}
        className="fixed left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-border2 bg-white text-ink2 shadow-sm transition-colors hover:border-border1"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink2/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 flex h-screen w-[380px] max-w-[85vw] flex-col overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border3 px-4 py-3 pl-16">
          <p className="font-sans text-[13px] font-semibold text-ink2">Preview controls</p>
        </div>
        <div className="flex flex-col gap-4 p-4">{children}</div>
      </div>
    </>
  )
}
