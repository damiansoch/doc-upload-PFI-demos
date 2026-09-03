import { useLayoutEffect, useRef, useState } from 'react'
import AccordionRow from '../components/AccordionRow'
import DocumentationPanel from '../components/DocumentationPanel'
import GroupSection from '../components/GroupSection'
import AmlPersonItem from '../components/AmlPersonItem'
import DocumentItem from '../components/DocumentItem'
import { AML_REQUIREMENT, DOCUMENTS } from '../data/documents'

export const CANVAS_W = 3260
export const CANVAS_H = 4300

// Fixed pixel column geometry, in canvas coordinates (not page/viewport
// coordinates — this whole page renders inside PannableCanvas, so
// everything here is authored against CANVAS_W/CANVAS_H, same as the
// signing-methods diagram).
const LEFT_X = 40
const LEFT_W = 360
const PANEL_X = LEFT_X + LEFT_W + 80
const PANEL_W = 670
const EXAMPLES_X = PANEL_X + PANEL_W + 80
const EXAMPLE_W = 430
const EXAMPLE_GAP_X = 60
const ROW_TOP = 190
const PANEL_TOP = ROW_TOP + 160

// Where each group's example chain starts vertically — deliberately NOT
// derived from that group's position inside the (much more tightly packed)
// main panel. Panel groups sit only ~250-350px apart; example rows need far
// more room than that (each one can run 400-900px wide and tall), so every
// group gets its own authored row, stacked with real spacing. AML and
// Signature Required exist so far; Action Required and Awaiting Signature's
// rows go below as they're built.
const CHAIN_ROW_Y = {
  aml: ROW_TOP,
  sign: ROW_TOP + 610,
  action: ROW_TOP + 1760,
  awaiting: ROW_TOP + 3010,
}

// The single shared "everything's done" endpoint all four routes converge
// on — authored separately from CHAIN_ROW_Y since it isn't the next step of
// any one route, but the common destination of all of them. Placed to the
// right of every route's furthest column, roughly centered on their span.
const FINAL_X = 2700
const FINAL_Y = 1500

// One representative document per group — enough to show every branch of
// getActionKind() without the visual noise of every document in the real
// set repeating the same pattern four times over.
const SNAPSHOT_IDS = [
  'certificate-of-title',
  'solicitor-letter-of-undertaking',
  'renunciation-of-probate',
  'beneficiaries-irrevocable-instruction',
]
const SNAPSHOT_DOCS = SNAPSHOT_IDS.map((id) => DOCUMENTS.find((d) => d.id === id))
const SNAPSHOT_STATUSES = Object.fromEntries(SNAPSHOT_IDS.map((id) => [id, 'pending']))
const SNAPSHOT_AML_UPLOADED = Object.fromEntries(AML_REQUIREMENT.people.map((p) => [p.id, false]))

// Same snapshot, everything signed — the final convergence example below.
const FINAL_STATUSES = Object.fromEntries(SNAPSHOT_IDS.map((id) => [id, 'completed']))
const FINAL_AML_UPLOADED = Object.fromEntries(AML_REQUIREMENT.people.map((p) => [p.id, true]))

// The two Signature Required documents, referenced directly (not re-derived
// by filtering) for the wet-vs-embedded example below.
const CERT_OF_TITLE = DOCUMENTS.find((d) => d.id === 'certificate-of-title')
const SOLICITOR_LOU = DOCUMENTS.find((d) => d.id === 'solicitor-letter-of-undertaking')

// The Action Required example — the only document in the set signed by a
// third party rather than the solicitor.
const RENUNCIATION = DOCUMENTS.find((d) => d.id === 'renunciation-of-probate')

// The Awaiting Signature example — email/DocuSign, no action for the
// solicitor beyond monitoring.
const BENEFICIARIES = DOCUMENTS.find((d) => d.id === 'beneficiaries-irrevocable-instruction')

// The real component, not a redrawn mockup — reusing DocumentationPanel
// means this "image" is pixel-accurate today and stays accurate if the real
// panel's styling changes later, instead of silently drifting out of sync
// the way a static screenshot or a hand-copied recreation would.
const CALLOUTS = [
  {
    id: 'aml',
    match: 'Identity Verification (AML/KYC)',
    title: 'AML / KYC',
    body: [
      'Solicitor KYC Certification documents, uploaded directly',
      'by the solicitor for each beneficiary. No signature or',
      'third-party involvement is required.',
    ],
  },
  {
    id: 'sign',
    match: 'Signature Required',
    title: 'Signature Required',
    body: [
      'Documents signed directly by the solicitor — either',
      'electronically, in-portal, or by hand for wet-signed',
      'documents.',
    ],
  },
  {
    id: 'action',
    match: 'Action Required',
    title: 'Action Required',
    body: [
      'Documents that must be signed in-portal, but by a third',
      'party rather than the solicitor. The solicitor is responsible',
      'for arranging the signing, either in person or via a',
      'secure link.',
    ],
  },
  {
    id: 'awaiting',
    match: 'Awaiting Signature',
    title: 'Awaiting Signature',
    body: [
      'Documents sent directly to the signer by DocuSign email.',
      'No further action is required from the solicitor beyond',
      'monitoring for completion.',
    ],
  },
]

// Opened-item examples. Each chain starts with sourceId (a group in the
// main panel) and reads left to right from there — every subsequent step
// uses sourceExampleId (the previous step) and renders to ITS right, same
// row, not stacked below. One row per group's story; more groups' rows are
// added below this one as later steps, each starting its own left-to-right
// chain aligned with its own group.
const EXAMPLES = [
  {
    id: 'aml-upload',
    sourceId: 'aml',
    explanation: [
      'The solicitor simply selects Upload certification to',
      'mark this requirement complete.',
    ],
    content: (
      <GroupSection
        tone="purple"
        title="Identity Verification (AML/KYC)"
        subtitle="Uploaded directly by the solicitor, within the portal."
        count={AML_REQUIREMENT.people.length}
        defaultOpen
      >
        {AML_REQUIREMENT.people.map((person, i) => (
          <AmlPersonItem
            key={person.id}
            person={person}
            uploaded={false}
            onUpload={() => {}}
            open={i === 0}
            onOpenChange={() => {}}
          />
        ))}
      </GroupSection>
    ),
  },
  // Step 2 — to the right of step 1, same row: not "here's another view of
  // the main panel's AML group" but "here's what step 1 leads to."
  {
    id: 'aml-completed',
    sourceExampleId: 'aml-upload',
    explanation: [
      'Once a certification is uploaded, that item automatically',
      'updates to Completed — no further action is needed for them.',
      'Once every certification in the group is uploaded, the whole',
      'group is marked Complete, and the solicitor can download the',
      "signed copy directly from each person's entry.",
    ],
    content: (
      <GroupSection
        tone="purple"
        title="Identity Verification (AML/KYC)"
        subtitle="Uploaded directly by the solicitor, within the portal."
        count={AML_REQUIREMENT.people.length}
        complete
        keepOpenWhenComplete
      >
        {AML_REQUIREMENT.people.map((person, i) => (
          <AmlPersonItem
            key={person.id}
            person={person}
            uploaded
            onUpload={() => {}}
            open={i !== 0}
            onOpenChange={() => {}}
          />
        ))}
      </GroupSection>
    ),
  },
  // Signature Required's own row — split into two genuinely different
  // flows sharing one group: embedded (signed in-portal) and wet (printed,
  // hand-signed, scanned back in). This starter shows the wet-signed
  // document specifically, since that's the flow that diverges.
  {
    id: 'sign-wet',
    sourceId: 'sign',
    explanation: [
      {
        lines: [
          'Signature Required actually covers two distinct flows sharing',
          'one group: documents signed electronically in-portal, and',
          'documents that must be wet-signed.',
        ],
      },
      {
        title: 'Wet-signed documents',
        lines: [
          'The solicitor downloads the document to print, signs it by',
          'hand, then scans and uploads the signed copy here as a',
          'single PDF.',
        ],
      },
      {
        title: 'Electronically signed documents',
        lines: [
          'Selecting Sign now launches the standard DocuSign signing',
          'session in-portal, exactly as it does for every other',
          'embedded-signing document — the solicitor signs',
          'electronically, with nothing to print or upload.',
        ],
      },
    ],
    content: (
      <GroupSection
        tone="red"
        title="Signature Required"
        subtitle="Signed directly by the solicitor, within the portal."
        count={2}
        defaultOpen
      >
        <DocumentItem
          doc={CERT_OF_TITLE}
          status="pending"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
        <DocumentItem
          doc={SOLICITOR_LOU}
          status="pending"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
      </GroupSection>
    ),
  },
  // Step 2 — to the right of sign-wet, same row: both documents signed,
  // by whichever method applies to each.
  {
    id: 'sign-completed',
    sourceExampleId: 'sign-wet',
    explanation: [
      'Once a document is signed — the wet-signed copy uploaded, or the',
      'DocuSign session completed — it automatically updates to',
      'Completed, showing exactly how it was signed. Once every',
      'document in the group is signed, the whole group is marked',
      'Complete.',
    ],
    content: (
      <GroupSection
        tone="red"
        title="Signature Required"
        subtitle="Signed directly by the solicitor, within the portal."
        count={2}
        complete
        keepOpenWhenComplete
      >
        <DocumentItem
          doc={CERT_OF_TITLE}
          status="completed"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
        <DocumentItem
          doc={SOLICITOR_LOU}
          status="completed"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
      </GroupSection>
    ),
  },
  // Action Required's own row.
  {
    id: 'action-arrange',
    sourceId: 'action',
    explanation: [
      'This document is signed by a third party — here, the executors',
      "— never the solicitor. When there's no email on file for them,",
      'or the document must be signed in person, DocuSign cannot be',
      'used, so the solicitor arranges the signing directly instead:',
      'in the office, or via a secure link.',
    ],
    content: (
      <GroupSection
        tone="amber"
        title="Action Required"
        subtitle="These documents are signed by another party; the solicitor must arrange the signing — either in person or via a secure remote link."
        count={1}
        defaultOpen
      >
        <DocumentItem
          doc={RENUNCIATION}
          status="pending"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
      </GroupSection>
    ),
  },
  // Step 2 — arranging the signing itself, once "Start signing" has been
  // selected for a signer.
  {
    id: 'action-session',
    sourceExampleId: 'action-arrange',
    explanation: [
      {
        title: 'Signer at the office',
        lines: [
          'Open now — sign in person launches the standard DocuSign',
          'signing session directly in the portal, so the signer can',
          'sign immediately, in person.',
        ],
      },
      {
        title: 'Signer not at the office',
        lines: [
          'The solicitor can instead share the signing link and access',
          'code directly with the signer, so they can complete signing',
          'remotely, in their own time.',
        ],
      },
      {
        note: true,
        lines: [
          'Sharing the link and code this way is technically possible',
          "in the portal, though it's not yet clear whether it will",
          'actually be used — that depends on the specific document',
          'requirements once live documents are available. Where it',
          'applies, it could make signing considerably quicker.',
        ],
      },
    ],
    content: (
      <GroupSection
        tone="amber"
        title="Action Required"
        subtitle="These documents are signed by another party; the solicitor must arrange the signing — either in person or via a secure remote link."
        count={1}
        defaultOpen
      >
        <DocumentItem
          doc={RENUNCIATION}
          status="pending"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
          initialSignerStatus={{ 'John Murphy': { stage: 'ready', mode: null } }}
        />
      </GroupSection>
    ),
  },
  // Step 3 — signed, regardless of which of the two paths above was used.
  {
    id: 'action-completed',
    sourceExampleId: 'action-session',
    explanation: [
      "It doesn't matter which method was used to get there — once the",
      'signer has signed, whether in person or via the shared link, the',
      'document moves to Completed and the signed copy is available',
      'for the solicitor to download, same as any other document.',
    ],
    content: (
      <GroupSection
        tone="amber"
        title="Action Required"
        subtitle="These documents are signed by another party; the solicitor must arrange the signing — either in person or via a secure remote link."
        count={1}
        complete
        keepOpenWhenComplete
      >
        <DocumentItem
          doc={RENUNCIATION}
          status="completed"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
      </GroupSection>
    ),
  },
  // Awaiting Signature's own row.
  {
    id: 'awaiting-monitor',
    sourceId: 'awaiting',
    explanation: [
      "There's no action for the solicitor here at all — only",
      'monitoring until it comes back signed. They can preview the',
      'document, but the signers simply follow the standard DocuSign',
      'email flow on their own.',
    ],
    content: (
      <GroupSection
        tone="blue"
        title="Awaiting Signature"
        subtitle="Sent directly to the signer's registered email address for electronic signature via DocuSign."
        count={1}
        defaultOpen
      >
        <DocumentItem
          doc={BENEFICIARIES}
          status="pending"
          onStatusChange={() => {}}
          open
          onOpenChange={() => {}}
        />
      </GroupSection>
    ),
  },
  // The shared endpoint every route leads to, regardless of which of the
  // four signing paths a document took — everything's signed, the panel is
  // fully collapsed back down to its resting state.
  {
    id: 'final-complete',
    sourceExampleIds: ['aml-completed', 'sign-completed', 'action-completed', 'awaiting-monitor'],
    fixedPos: { x: FINAL_X, y: FINAL_Y },
    explanation: [
      'This is the last stage for every route: once every document and',
      'identity check is signed, each group collapses back down showing',
      "Complete, and there's nothing further for the solicitor to do here.",
    ],
    content: (
      <AccordionRow title="Documentation & Requirements" isOpen onToggle={() => {}}>
        <DocumentationPanel
          documents={SNAPSHOT_DOCS}
          amlIncluded
          docStatuses={FINAL_STATUSES}
          setDocStatus={() => {}}
          amlUploaded={FINAL_AML_UPLOADED}
          setAmlUploaded={() => {}}
        />
      </AccordionRow>
    ),
  },
]

// Mostly-vertical connections (small x-gap, large y-gap) — the left
// callouts into the main panel.
function bezierV(x1, y1, x2, y2) {
  const dy = (y2 - y1) / 2
  return `M ${x1},${y1} C ${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`
}

// Mostly-horizontal connections (large x-gap) — panel into an example
// chain, and each chained step into the next, left to right.
function bezierH(x1, y1, x2, y2) {
  const dx = (x2 - x1) / 2
  return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
}

export default function ChartPage() {
  const panelRef = useRef(null)
  const [targets, setTargets] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const panel = panelRef.current
      if (!panel) return
      const panelRect = panel.getBoundingClientRect()
      // panelRect.top corresponds to PANEL_TOP in canvas coordinates, so any
      // rect measured against panelRect converts to canvas coordinates by
      // adding PANEL_TOP back in.
      const next = {}
      for (const c of CALLOUTS) {
        const leaf = [...panel.querySelectorAll('*')].find(
          (el) => el.children.length === 0 && el.textContent.trim() === c.match,
        )
        const card = leaf?.closest('.rounded-lg.border')
        if (!card) continue
        const r = card.getBoundingClientRect()
        next[c.id] = {
          top: r.top - panelRect.top + PANEL_TOP,
          centerY: r.top - panelRect.top + r.height / 2 + PANEL_TOP,
        }
      }
      setTargets(next)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Each example's (x, y) is resolved from its chain: the first step in a
  // chain uses that group's authored CHAIN_ROW_Y (its own dedicated row,
  // independent of where the group sits in the tightly-packed main panel);
  // every later step sits to the right of the one before it, same row.
  const positions = {}
  for (const ex of EXAMPLES) {
    if (ex.fixedPos) {
      positions[ex.id] = ex.fixedPos
    } else if (ex.sourceExampleId) {
      const prev = positions[ex.sourceExampleId]
      positions[ex.id] = prev ? { x: prev.x + EXAMPLE_W + EXAMPLE_GAP_X, y: prev.y } : null
    } else {
      const t = targets?.[ex.sourceId]
      positions[ex.id] = t ? { x: EXAMPLES_X, y: CHAIN_ROW_Y[ex.sourceId] } : null
    }
  }

  return (
    <div className="relative h-full w-full bg-white">
      <h1
        className="absolute text-center font-sans text-[28px] font-bold text-ink2"
        style={{ left: 0, top: 40, width: CANVAS_W }}
      >
        Documentation &amp; Requirements — Overview
      </h1>
      <p
        className="absolute mx-auto text-center font-sans text-sm leading-[20px] text-muted"
        style={{ left: (CANVAS_W - 640) / 2, top: 84, width: 640 }}
      >
        This is the complete view of the Documentation &amp; Requirements section — every document
        and identity check the application requires, automatically grouped by what the solicitor
        needs to do next.
      </p>

      {CALLOUTS.map((c) => {
        const t = targets?.[c.id]
        return (
          <div
            key={c.id}
            className="absolute rounded-lg border border-border2 bg-white p-4 shadow-sm transition-opacity duration-300"
            style={{ left: LEFT_X, width: LEFT_W, top: t ? t.top : ROW_TOP, opacity: t ? 1 : 0 }}
          >
            <p className="font-sans text-[13px] font-semibold text-ink2">{c.title}</p>
            <p className="mt-1 font-sans text-xs leading-[18px] text-muted">
              {c.body.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < c.body.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        )
      })}

      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        width={CANVAS_W}
        height={CANVAS_H}
        aria-hidden="true"
      >
        {targets &&
          CALLOUTS.map((c) => {
            const t = targets[c.id]
            if (!t) return null
            return (
              <path
                key={c.id}
                d={bezierV(LEFT_X + LEFT_W, t.top + 30, PANEL_X, t.centerY)}
                fill="none"
                stroke="#B8B8B8"
                strokeWidth={1.5}
                markerEnd="url(#chart-arrowhead)"
              />
            )
          })}
        {EXAMPLES.map((ex) => {
          const pos = positions[ex.id]
          if (!pos) return null
          // Convergence node — several routes' last steps all point at the
          // same shared endpoint, arriving from wildly different rows, so
          // each arrow picks whichever curve emphasis fits its own
          // dx/dy instead of assuming one shape for all of them.
          if (ex.sourceExampleIds) {
            return (
              <g key={`ex-${ex.id}`}>
                {ex.sourceExampleIds.map((srcId) => {
                  const src = positions[srcId]
                  if (!src) return null
                  const x1 = src.x + EXAMPLE_W
                  const y1 = src.y + 30
                  const x2 = pos.x
                  const y2 = pos.y + 30
                  const curve = Math.abs(y2 - y1) > Math.abs(x2 - x1) ? bezierV : bezierH
                  return (
                    <path
                      key={srcId}
                      d={curve(x1, y1, x2, y2)}
                      fill="none"
                      stroke="#B8B8B8"
                      strokeWidth={1.5}
                      markerEnd="url(#chart-arrowhead)"
                    />
                  )
                })}
              </g>
            )
          }
          // Chained (example→example) arrows are always same-row, purely
          // horizontal — bezierH. The first step of a chain now often has a
          // real vertical jump too (its row is independent of the panel
          // group's own position), so it uses bezierV instead, same as the
          // left callouts.
          if (ex.sourceExampleId) {
            const prev = positions[ex.sourceExampleId]
            return (
              <path
                key={`ex-${ex.id}`}
                d={bezierH(prev.x + EXAMPLE_W, prev.y + 30, pos.x, pos.y + 30)}
                fill="none"
                stroke="#B8B8B8"
                strokeWidth={1.5}
                markerEnd="url(#chart-arrowhead)"
              />
            )
          }
          const t = targets[ex.sourceId]
          return (
            <path
              key={`ex-${ex.id}`}
              d={bezierV(PANEL_X + PANEL_W, t.centerY, pos.x, pos.y + 30)}
              fill="none"
              stroke="#B8B8B8"
              strokeWidth={1.5}
              markerEnd="url(#chart-arrowhead)"
            />
          )
        })}
        <defs>
          <marker
            id="chart-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#B8B8B8" />
          </marker>
        </defs>
      </svg>

      <div
        ref={panelRef}
        className="absolute pointer-events-none"
        style={{ left: PANEL_X, width: PANEL_W, top: PANEL_TOP }}
      >
        <AccordionRow title="Documentation & Requirements" isOpen actionRequired onToggle={() => {}}>
          <DocumentationPanel
            documents={SNAPSHOT_DOCS}
            amlIncluded
            docStatuses={SNAPSHOT_STATUSES}
            setDocStatus={() => {}}
            amlUploaded={SNAPSHOT_AML_UPLOADED}
            setAmlUploaded={() => {}}
          />
        </AccordionRow>
      </div>

      {EXAMPLES.map((ex) => {
        const pos = positions[ex.id]
        return (
          <div
            key={ex.id}
            className="absolute transition-opacity duration-300"
            style={{
              left: pos ? pos.x : EXAMPLES_X,
              width: EXAMPLE_W,
              top: pos ? pos.y : ROW_TOP,
              opacity: pos ? 1 : 0,
            }}
          >
            <div className="pointer-events-none">{ex.content}</div>
            {typeof ex.explanation[0] === 'string' ? (
              <p className="mt-2 font-sans text-xs leading-[18px] text-muted">
                {ex.explanation.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < ex.explanation.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ) : (
              <div className="mt-2 flex flex-col gap-3">
                {ex.explanation.map((section, si) => (
                  <p
                    key={si}
                    className={`font-sans leading-[17px] ${
                      section.note ? 'text-[11px] italic text-muted/80' : 'text-xs leading-[18px] text-muted'
                    }`}
                  >
                    {section.title && (
                      <span className="mb-0.5 block font-semibold text-ink2">{section.title}</span>
                    )}
                    {section.lines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < section.lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
