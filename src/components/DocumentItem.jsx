import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Eye,
  FileSignature,
  Printer,
  Upload,
  Users,
} from 'lucide-react'
import ChevronButton from './ChevronButton'
import StatusPill from './StatusPill'
import MethodBadge from './MethodBadge'
import SigningStatusPanel from './SigningStatusPanel'
import SigningSessionPanel from './SigningSessionPanel'
import DocuSignProcessingModal from './DocuSignProcessingModal'
import { METHOD_INFO, STAGE_LABELS, getActionKind, partyName } from '../data/documents'

const PROCESSING_MS = 5000

const PILL_BY_KIND = {
  sign: { tone: 'red', label: 'Signature Required' },
  arrange: { tone: 'amber', label: 'Action Required' },
  monitor: { tone: 'blue', label: 'Awaiting Signature' },
}

const ICON_BY_KIND = {
  sign: <FileSignature className="h-4 w-4" />,
  arrange: <Users className="h-4 w-4" />,
  monitor: <Clock className="h-4 w-4" />,
}

const ICON_CLASSES_BY_TONE = {
  green: 'bg-green/10 text-green border-green/30',
  red: 'bg-red-50 text-red-600 border-red-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  grey: 'bg-gray-100 text-gray-500 border-gray-300',
}

const STRIPE_CLASSES_BY_TONE = {
  green: 'bg-green',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  grey: 'bg-gray-400',
}

// Card background stays plain white for every tone — the app's overall look
// is kept black/white/grey, with status color reserved for the left stripe
// (and the status pill) rather than tinting the whole card.
const CARD_BG_BY_TONE = {
  green: 'bg-white',
  red: 'bg-white',
  amber: 'bg-white',
  blue: 'bg-white',
  grey: 'bg-white',
}

function pillForStatus(kind, status, method) {
  if (status === 'completed') {
    const via = method === 'wet' ? 'Signed — wet signature uploaded' : 'Signed via DocuSign'
    return { tone: 'green', label: 'Completed', detail: via }
  }
  return { ...PILL_BY_KIND[kind], detail: null }
}

export default function DocumentItem({
  doc,
  status,
  onStatusChange,
  open,
  onOpenChange,
  // Opt-in starting point for arrange-kind signer progress — lets a static
  // reference example open showing a signing session already in progress,
  // rather than every signer's real idle starting state.
  initialSignerStatus = {},
}) {
  const [signingStarted, setSigningStarted] = useState(false)
  // Per-signer progress for arrange-kind docs. One signing session per
  // signer — not two competing flows — since generating the session (link +
  // access code) is the same underlying action either way; only what's done
  // with it afterwards (open it now vs. share the link) differs.
  // { [signerName]: { stage: 'ready' | 'done', mode: 'in_person' | 'link' | null } }
  const [signerStatus, setSignerStatus] = useState(initialSignerStatus)
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
  const methodInfo = METHOD_INFO[doc.method]
  const party = partyName(doc)
  const isWet = doc.method === 'wet'

  const signerState = (name) => signerStatus[name] || { stage: 'idle', mode: null }
  // Only one signer's session panel open at a time — mirrors the single-item
  // accordion rule used elsewhere, applied here per document: opening one
  // signer's session closes whichever other signer's was open (done signers
  // are left alone, only an in-progress 'ready' one gets collapsed).
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

  // The signing action has genuinely been taken (solicitor's own signature,
  // or every arrange-kind signer handled) but isn't confirmed complete yet —
  // shown with its own neutral "In Process" pill rather than jumping straight
  // to the green "Completed" one, since nothing has actually confirmed the
  // signature landed. Doesn't apply to monitor-kind (emailed) — that's
  // genuinely just waiting from the moment it's sent, no local action to
  // await confirmation on — or to wet-signing (the upload itself is the proof).
  const awaitingConfirmation =
    status === 'pending' &&
    ((kind === 'sign' && !isWet && signingStarted) || (kind === 'arrange' && allSignersDone))

  const pill = awaitingConfirmation
    ? { tone: 'grey', label: 'In Process', detail: null }
    : pillForStatus(kind, status, doc.method)

  const iconToneClass =
    status === 'completed'
      ? ICON_CLASSES_BY_TONE.green
      : awaitingConfirmation
        ? ICON_CLASSES_BY_TONE.grey
        : isWet
          ? 'bg-orange-50 text-orange-600 border-orange-300'
          : ICON_CLASSES_BY_TONE[pill.tone]

  const iconNode =
    status === 'completed' ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : awaitingConfirmation ? (
      <Clock className="h-4 w-4" />
    ) : isWet ? (
      <Printer className="h-4 w-4" />
    ) : (
      ICON_BY_KIND[kind]
    )

  const markComplete = () => {
    onStatusChange('completed')
    setSigningStarted(false)
    setSignerStatus({})
    setProcessing(null)
    onOpenChange(false)
  }

  // Manual stand-in for what a real refresh would tell us — in production this
  // is exactly what happens automatically: "Check for update" resyncs from
  // DocuSign, and if signing genuinely wasn't completed, the document comes
  // back showing as unsigned on its own. This mock has no live signal to
  // check against, so the solicitor gets an explicit way to say so instead.
  const resetToUnsigned = () => {
    setSigningStarted(false)
    setSignerStatus({})
    setProcessing(null)
  }

  return (
    <>
    {processing && (
      <DocuSignProcessingModal
        title="Connecting to DocuSign…"
        subtitle={
          processing === 'own'
            ? 'Preparing your signing session.'
            : `Preparing the signing session for ${processing}.`
        }
      />
    )}
    <div
      className={`flex overflow-hidden rounded-lg border border-border2 transition-colors ${CARD_BG_BY_TONE[pill.tone]}`}
    >
      <span className={`w-1.5 shrink-0 ${STRIPE_CLASSES_BY_TONE[pill.tone]}`} />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-2 p-4 text-left"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${iconToneClass}`}
            >
              {iconNode}
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={`font-sans text-[14px] font-semibold leading-[18px] ${
                    status === 'completed' ? 'text-muted' : 'text-ink2'
                  }`}
                >
                  {doc.name}
                </span>
                <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {STAGE_LABELS[doc.stage]}
                </span>
              </span>
              {doc.description && (
                <span className="mt-0.5 block font-sans text-xs text-muted">
                  {doc.description}
                </span>
              )}
              <span className="mt-1.5 block">
                <MethodBadge method={doc.method} />
              </span>
            </span>
          </div>

          <span className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
            <span className="flex items-center gap-3">
              <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
              <ChevronButton open={open} />
            </span>
            {pill.detail && (
              <span className="font-sans text-[11px] text-muted">{pill.detail}</span>
            )}
          </span>
        </button>

        {open && (
          <div className="border-t border-border3 px-4 pb-4 pt-3">
            {kind === 'monitor' && (
              <button
                type="button"
                className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview document
              </button>
            )}

            <p className="font-sans text-xs leading-[18px] text-muted">
              <span className="font-medium text-ink2">Who signs: </span>
              {doc.signerLabel} — {doc.signerDetail}
            </p>

            {methodInfo && (
              <p className="mt-2 font-sans text-xs leading-[18px] text-muted">
                <span className="font-medium text-ink2">How it works: </span>
                {methodInfo.explain}
              </p>
            )}

            {kind === 'arrange' && status === 'pending' && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs leading-[18px] text-amber-800">
                <span className="font-semibold">Action required: </span>
                arrange for {party} to sign — either in person at the office, or remotely via a
                secure link.
              </p>
            )}

            {kind !== 'arrange' && doc.signers?.length > 1 && (
              <div className="mt-3 flex flex-col gap-1.5 rounded-lg border border-border3 bg-[#FAFAF9] p-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Signers ({status === 'completed' ? doc.signers.length : 0}/{doc.signers.length} signed)
                </p>
                {doc.signers.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 font-sans text-xs text-ink2">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                    )}
                    <span className={status === 'completed' ? '' : 'text-muted'}>{s.name}</span>
                  </div>
                ))}
              </div>
            )}

            {kind === 'monitor' && status === 'pending' && doc.signers?.length > 1 && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                  Signing order
                </p>
                <p className="mt-1 font-sans text-xs leading-[18px] text-blue-900">
                  Signers are notified in sequence rather than all at once — DocuSign sends the
                  document to the next signer only once the previous signer has completed theirs.
                </p>
                {doc.requiresWitnessing && (
                  <p className="mt-2 font-sans text-xs leading-[18px] text-blue-900">
                    Once every beneficiary listed above has signed, the document will be
                    forwarded to the solicitor for the final signature as witness.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-3">
              {status === 'completed' && (
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 font-sans text-xs font-semibold text-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {pill.detail}
                  </p>
                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download signed document
                  </button>
                </div>
              )}

              {status === 'pending' && kind === 'sign' && doc.method !== 'wet' && !signingStarted && (
                <button
                  type="button"
                  disabled={processing === 'own'}
                  onClick={() => setProcessing('own')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white disabled:opacity-60"
                >
                  <FileSignature className="h-3.5 w-3.5" />
                  Sign now
                </button>
              )}

              {status === 'pending' && kind === 'sign' && doc.method !== 'wet' && signingStarted && (
                <SigningStatusPanel
                  variant="own"
                  signerLabel={party}
                  onCheckUpdate={markComplete}
                  onReset={resetToUnsigned}
                />
              )}

              {status === 'pending' && kind === 'arrange' && (
                <div className="flex flex-col gap-2">
                  {doc.signers.map((s) => {
                    const st = signerState(s.name)
                    const isDone = st.stage === 'done'
                    return (
                      <div key={s.name} className="rounded-lg border border-border3 bg-white p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-ink2">
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                            )}
                            {s.name}
                          </span>
                          {isDone ? (
                            <span className="font-sans text-[11px] font-semibold text-green">
                              {st.mode === 'link' ? 'Link sent' : 'Signed'}
                            </span>
                          ) : st.stage !== 'ready' ? (
                            <button
                              type="button"
                              onClick={() => startSignerSession(s.name)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white"
                            >
                              <Users className="h-3 w-3" />
                              Start signing
                            </button>
                          ) : null}
                        </div>
                        {st.stage === 'ready' && (
                          <div className="mt-2">
                            <SigningSessionPanel
                              party={s.name}
                              openingDisabled={processing === s.name}
                              onOpenNow={() => setProcessing(s.name)}
                              onShared={() => markSignerSharedViaLink(s.name)}
                              onBack={() => resetSigner(s.name)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {allSignersDone && (
                    <SigningStatusPanel
                      variant="arrange_done"
                      signerLabel={party}
                      onCheckUpdate={markComplete}
                      onReset={resetToUnsigned}
                    />
                  )}
                </div>
              )}

              {status === 'pending' && kind === 'monitor' && (
                <SigningStatusPanel variant="emailed" signerLabel={party} onCheckUpdate={markComplete} />
              )}

              {status === 'pending' && doc.method === 'wet' && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download to print
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white">
                    <Upload className="h-3.5 w-3.5" />
                    Upload signed copy
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
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
