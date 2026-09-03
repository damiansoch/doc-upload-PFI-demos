import { useState } from 'react'
import { Lock } from 'lucide-react'

const PASSWORD = 'damiansoch'

// Frontend-only gate — there's no backend here for this to actually
// authenticate against, so this is just a speed bump to keep the Fixes tab
// from being casually stumbled into, not real access control.
export default function FixesPasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return children

  const submit = (e) => {
    e.preventDefault()
    if (value === PASSWORD) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-white px-4 py-10 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border2 bg-[#F5F5F4]">
        <Lock className="h-4 w-4 text-muted" />
      </span>
      <p className="font-sans text-[13px] font-semibold text-ink2">This tab is password protected</p>
      <form onSubmit={submit} className="flex w-full max-w-[240px] flex-col gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Password"
          autoFocus
          className={`w-full rounded-lg border px-3 py-2 font-sans text-xs text-ink2 outline-none ${
            error ? 'border-red-400' : 'border-border2'
          }`}
        />
        {error && <p className="font-sans text-[11px] text-red-500">Incorrect password.</p>}
        <button
          type="submit"
          className="rounded-lg bg-ink px-3 py-2 font-sans text-xs font-medium text-white"
        >
          Unlock
        </button>
      </form>
    </div>
  )
}
