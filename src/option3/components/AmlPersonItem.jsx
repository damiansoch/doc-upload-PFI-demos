import { CheckCircle2, Download, ShieldCheck, Upload } from 'lucide-react'
import StatusPill from './StatusPill'

// Uses the same red/green palette as DocumentItem (not a separate AML
// colour) — one less colour for a first-time user to learn.
const ICON_CLASSES_BY_TONE = {
  green: 'bg-green/10 text-green border-green/30',
  red: 'bg-red-50 text-red-600 border-red-200',
}

const STRIPE_CLASSES_BY_TONE = {
  green: 'bg-green',
  red: 'bg-red-500',
}

// Card background stays plain white for every tone — status color lives in
// the left stripe (and the status pill), not a tinted card.
const CARD_BG_BY_TONE = {
  green: 'bg-white',
  red: 'bg-white',
}

export default function AmlPersonItem({ person, uploaded, onUpload }) {
  if (uploaded) {
    return (
      <div className={`flex overflow-hidden rounded-lg border border-border2 ${CARD_BG_BY_TONE.green}`}>
        <span className={`w-1.5 shrink-0 ${STRIPE_CLASSES_BY_TONE.green}`} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between gap-3">
            <StatusPill tone="green">Complete</StatusPill>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border1 bg-white px-2.5 py-1 font-sans text-[11px] font-medium text-ink"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ICON_CLASSES_BY_TONE.green}`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="truncate font-sans text-[14px] font-semibold leading-[18px] text-muted">
              {person.name} — KYC certification
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex overflow-hidden rounded-lg border border-border2 ${CARD_BG_BY_TONE.red}`}>
      <span className={`w-1.5 shrink-0 ${STRIPE_CLASSES_BY_TONE.red}`} />
      <div className="min-w-0 flex-1 p-4">
        <StatusPill tone="red">Action needed</StatusPill>

        <div className="mt-3 flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ICON_CLASSES_BY_TONE.red}`}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate font-sans text-[14px] font-semibold leading-[18px] text-ink2">
                {person.name} — KYC certification
              </p>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-ink px-2.5 py-1.5 font-sans text-[11px] font-medium text-white">
                <Upload className="h-3 w-3" />
                Upload
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onUpload()
                  }}
                />
              </label>
            </div>
            <p className="mt-3 border-t border-border3 pt-2 font-sans text-[10px] leading-[14px] text-muted">
              Solicitor-signed KYC certification confirming {person.name}&apos;s identity has been verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
