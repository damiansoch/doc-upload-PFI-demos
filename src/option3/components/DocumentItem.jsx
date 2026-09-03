import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileSignature,
  Printer,
  RefreshCw,
  Upload,
} from 'lucide-react'
import StatusPill from './StatusPill'
import SigningSessionPanel from './SigningSessionPanel'
import DocuSignProcessingModal from './DocuSignProcessingModal'
import { getActionKind, partyName } from '../data/documents'

const PROCESSING_MS = 5000

// Simplified, first-time-user status model — just 3 states instead of the
// 4-way kind split used elsewhere. "Why" it's pending still comes through in
// the one-line footer below, it just doesn't need its own colour/label.
const ICON_CLASSES_BY_TONE = {
  green: 'bg-green/10 text-green border-green/30',
  red: 'bg-red-50 text-red-600 border-red-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  grey: 'bg-gray-100 text-gray-500 border-gray-300',
}

const STRIPE_CLASSES_BY_TONE = {
  green: 'bg-green',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  grey: 'bg-gray-400',
}

// Card background stays plain white for every tone — status color lives in
// the left stripe (and the status pill), not a tinted card.
const CARD_BG_BY_TONE = {
  green: 'bg-white',
  red: 'bg-white',
  blue: 'bg-white',
  grey: 'bg-white',
}

// Small button classes shared by the quick actions that sit inline with the
// (possibly truncated) document name — kept compact on purpose so they never
// force the row to wrap.
const QUICK_BTN = 'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 font-sans text-[11px] font-medium'

// One plain-language sentence — the ONLY place status copy lives, so it's
// never repeated. While the document hasn't been sent for signature yet it
// explains the method; once it's on its way, it switches to a short timing
// note instead of repeating "who signs how" a second time (that already
// showed up before the button was clicked).
function footerText(doc, party, kind, inProgress) {
  if (kind === 'monitor') {
    const multi = doc.signers && doc.signers.length > 1
    let s = `Sent to ${party} to sign by email.`
    if (multi) s += ' Each person signs in turn.'
    if (doc.requiresWitnessing) s += ' Once everyone has signed, it comes back for a final signature.'
    s += ' Updates within a minute or two once everyone required has signed.'
    return s
  }
  if (inProgress) {
    return 'Updates within a minute or two once everyone required has signed.'
  }
  if (doc.signerParty === 'solicitor') {
    return doc.method === 'wet'
      ? 'Signed by hand, then uploaded here.'
      : 'Signed online, directly in the portal.'
  }
  return `Signed by ${party}, either in person or by secure link.`
}

export default function DocumentItem({ doc, status, onStatusChange }) {
  const [signingStarted, setSigningStarted] = useState(false)
  // Per-signer progress for arrange-kind docs. One signing session per
  // signer, not two competing flows — "sign in person" and "send a link" are
  // the same generated session, so it's created once and then used either
  // way, instead of the solicitor picking a path before anything exists.
  // { [signerName]: { stage: 'ready' | 'done', mode: 'in_person' | 'link' | null } }
  const [signerStatus, setSignerStatus] = useState({})
  const [processing, setProcessing] = useState(null) // null | 'own' | <signer name>

  useEffect(() => {
    if (!processing) return
    const timer = setTimeout(() => {
      if (processing === 'own') {
        setSigningStarted(true)
      } else {
        setSignerStatus((prev) => ({ ...prev, [processing]: { stage: 'done', mode: 'in_person' } }))
      }
      setProcessing(null)
    }, PROCESSING_MS)
    return () => clearTimeout(timer)
  }, [processing])

  const kind = getActionKind(doc)
  const party = partyName(doc)
  const isWet = doc.method === 'wet'

  const signerState = (name) => signerStatus[name] || { stage: 'idle', mode: null }
  // Only one signer's session panel open at a time per document — opening one
  // closes whichever other signer's was open (done signers are left alone).
  const startSignerSession = (name) =>
    setSignerStatus((prev) => {
      const next = {}
      for (const [k, v] of Object.entries(prev)) {
        next[k] = v.stage === 'ready' ? { stage: 'idle', mode: null } : v
      }
      next[name] = { stage: 'ready', mode: null }
      return next
    })
  const markSignerSharedViaLink = (name) =>
    setSignerStatus((prev) => ({ ...prev, [name]: { stage: 'done', mode: 'link' } }))
  const resetSigner = (name) =>
    setSignerStatus((prev) => ({ ...prev, [name]: { stage: 'idle', mode: null } }))
  const allSignersDone =
    kind === 'arrange' && (doc.signers || []).length > 0
      ? doc.signers.every((s) => signerState(s.name).stage === 'done')
      : false

  const inProgress = signingStarted || (kind === 'arrange' && allSignersDone) || kind === 'monitor'

  // The signing action has genuinely been taken but isn't confirmed complete
  // yet — gets its own neutral "In process" pill instead of jumping straight
  // to "Complete". Doesn't cover monitor (genuinely just waiting, nothing
  // local to confirm) or wet (the upload itself is the proof).
  const awaitingConfirmation =
    (kind === 'sign' && !isWet && signingStarted) || (kind === 'arrange' && allSignersDone)

  const markComplete = () => {
    onStatusChange('completed')
    setSigningStarted(false)
    setSignerStatus({})
    setProcessing(null)
  }

  // Manual stand-in for what a real refresh would tell us — in production
  // this happens automatically: "Check for update" resyncs from DocuSign, and
  // if signing genuinely wasn't completed, the document comes back showing as
  // unsigned on its own. This mock has no live signal to check against, so
  // the solicitor gets an explicit way to say so instead.
  const resetToUnsigned = () => {
    setSigningStarted(false)
    setSignerStatus({})
    setProcessing(null)
  }

  // Completed: no accordion, no re-reading the instructions — just a
  // compact confirmation. Top row: status + download. Second row: icon + title.
  if (status === 'completed') {
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
              {doc.name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Pending: no click-to-expand. Top row: status pill. Second row: icon +
  // (title + quick action on one line, truncating the name if needed) +
  // any tool block (secure link) + footer.
  const tone = awaitingConfirmation ? 'grey' : kind === 'monitor' ? 'blue' : 'red'
  const iconToneClass = isWet ? 'bg-orange-50 text-orange-600 border-orange-300' : ICON_CLASSES_BY_TONE[tone]
  const iconNode = isWet ? (
    <Printer className="h-4 w-4" />
  ) : tone === 'blue' || tone === 'grey' ? (
    <Clock className="h-4 w-4" />
  ) : (
    <FileSignature className="h-4 w-4" />
  )

  const showSignNow = kind === 'sign' && !isWet && !signingStarted

  return (
    <>
    {processing && (
      <DocuSignProcessingModal
        title="Opening signing session…"
        subtitle={
          processing === 'own'
            ? 'Preparing the document for signing.'
            : `Preparing the document for ${processing}.`
        }
      />
    )}
    <div className={`flex overflow-hidden rounded-lg border border-border2 ${CARD_BG_BY_TONE[tone]}`}>
      <span className={`w-1.5 shrink-0 ${STRIPE_CLASSES_BY_TONE[tone]}`} />
      <div className="min-w-0 flex-1 p-4">
        <StatusPill tone={tone}>
          {tone === 'grey' ? 'In process' : tone === 'blue' ? 'Waiting' : 'Action needed'}
        </StatusPill>

        <div className="mt-3 flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${iconToneClass}`}
          >
            {iconNode}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate font-sans text-[14px] font-semibold leading-[18px] text-ink2">
                {doc.name}
              </p>

              {showSignNow && (
                <button
                  type="button"
                  disabled={processing === 'own'}
                  onClick={() => setProcessing('own')}
                  className={`${QUICK_BTN} bg-ink text-white disabled:opacity-60`}
                >
                  <FileSignature className="h-3 w-3" />
                  Sign now
                </button>
              )}

              {isWet && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    className={`${QUICK_BTN} border border-border1 bg-white text-ink`}
                  >
                    <Download className="h-3 w-3" />
                    Print
                  </button>
                  <label
                    className={`${QUICK_BTN} cursor-pointer bg-ink text-white`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) markComplete()
                      }}
                    />
                  </label>
                </div>
              )}

              {inProgress && (
                <button
                  type="button"
                  onClick={markComplete}
                  className={`${QUICK_BTN} bg-ink text-white`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Check for update
                </button>
              )}
            </div>

            {kind === 'arrange' && (
              <div className="mt-2 flex flex-col gap-1.5">
                {doc.signers.map((s) => {
                  const st = signerState(s.name)
                  const isDone = st.stage === 'done'
                  return (
                    <div key={s.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 font-sans text-xs text-ink2">
                          {isDone ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-green" />
                          ) : (
                            <Circle className="h-3 w-3 shrink-0 text-gray-300" />
                          )}
                          <span className="truncate">{s.name}</span>
                        </span>
                        {isDone ? (
                          <span className="shrink-0 rounded-full bg-green/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-green">
                            {st.mode === 'link' ? 'Link sent' : 'Signed'}
                          </span>
                        ) : st.stage !== 'ready' ? (
                          <button
                            type="button"
                            onClick={() => startSignerSession(s.name)}
                            className={`${QUICK_BTN} bg-ink text-white`}
                          >
                            <FileSignature className="h-3 w-3" />
                            Sign
                          </button>
                        ) : null}
                      </div>
                      {st.stage === 'ready' && (
                        <SigningSessionPanel
                          party={s.name}
                          openingDisabled={processing === s.name}
                          onOpenNow={() => setProcessing(s.name)}
                          onShared={() => markSignerSharedViaLink(s.name)}
                          onBack={() => resetSigner(s.name)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {awaitingConfirmation && (
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={resetToUnsigned}
                  className="font-sans text-[11px] font-medium text-muted underline decoration-dotted underline-offset-2"
                >
                  Wasn&apos;t completed? Start over
                </button>
              </div>
            )}

            {/* Footer — one plain-language line, small and last */}
            <p className="mt-3 border-t border-border3 pt-2 font-sans text-[10px] leading-[14px] text-muted">
              {footerText(doc, party, kind, inProgress)}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
