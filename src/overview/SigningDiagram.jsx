// The real decision getActionKind() makes in data/documents.js, drawn as a
// tree — not a restated list of method names. Every leaf states the actual
// mechanism a solicitor sees (the real button/copy), not a category label.

export const CANVAS_W = 2220
// Space reserved above the tree for the page title — everything else is
// wrapped in a single translated <g> (see SigningDiagram below) rather than
// hand-shifting every node's y coordinate individually.
const TITLE_OFFSET = 90
export const CANVAS_H = 1940 + TITLE_OFFSET

// Reserved strictly for functional equivalence across branches, not for
// decorating every leaf or distinguishing siblings within one branch —
// default styling everywhere else is plain black/white. Each color here
// maps to exactly one real mechanism, used wherever that mechanism recurs:
// red = present/synchronous signing (In portal; In portal — organize
// meeting), blue = an emailed DocuSign link (Email link, both places it
// appears), amber = the solicitor personally arranging it (Solicitor
// arranges, both places it appears). green is the one exception — a single
// node, not a shared pair — deliberately given its own color specifically
// so it reads as distinct from its amber neighbor (Solicitor arranges) and
// isn't mistaken for sharing that function, since it doesn't.
const TONE_HEX = {
  red: '#EF4444',
  blue: '#3B82F6',
  amber: '#F59E0B',
  green: '#10B981',
}

const NODES = [
  // Root re-centered over its two real children (solicitor / someone) below.
  { id: 'root', x: 784, y: 40, w: 320, h: 64, title: 'A document needs a signature' },
  // Peer of root, not a branch off it — AML/KYC isn't an answer to "who
  // signs it", it's a different category of document entirely (no signer
  // involved at all), so it sits at the same level with no connector from root.
  { id: 'aml1', x: 1920, y: 40, w: 260, h: 64, title: 'No signature needed', dashed: true },

  { id: 'solicitor', parent: 'root', x: 345, y: 280, w: 260, h: 110, title: 'Solicitor signs it' },
  { id: 'someone', parent: 'root', x: 1273, y: 280, w: 280, h: 110, title: 'Someone else signs it' },

  {
    id: 'electronically',
    parent: 'solicitor',
    x: 220,
    y: 520,
    w: 240,
    h: 162,
    title: 'e-sign',
    sub: ['In portal, or', 'by email link'],
    example: 'Solicitor Letter of Undertaking',
  },
  {
    id: 'byHand',
    parent: 'solicitor',
    x: 500,
    y: 520,
    w: 220,
    h: 162,
    title: 'By hand (wet)',
    sub: ['Print, sign by hand,', 'then upload the scan', '— no e-sign involved'],
    example: 'Certificate of Title',
    exampleHref: '/certificate_of_title.pdf',
  },
  // Centered a touch left of e-sign's own center (340) — pair center sits at
  // 320 — so the pair reads as "under e-sign" while leaving room to its right
  // for by-hand and everything else, rather than crowding dead-center.
  {
    id: 'inPortal',
    parent: 'electronically',
    x: 20,
    y: 760,
    w: 280,
    h: 226,
    title: 'In portal',
    tone: 'red',
    compare: true,
    pros: ['Instant — no separate step', 'Nothing extra to check for'],
    cons: ['Only works while logged in'],
  },
  {
    id: 'emailLink',
    parent: 'electronically',
    x: 400,
    y: 760,
    w: 280,
    h: 226,
    title: 'Email link',
    tone: 'blue',
    compare: true,
    description: ['Sent to the solicitor’s own', 'email address.'],
    pros: ['Sign from anywhere, any time'],
    cons: ['One more email to open', 'Same delay as third-party email'],
  },
  // Do we actually have this signer's email on file? That's the real fork —
  // "how it's sent" only makes sense once we know that. "Not on file" leads
  // to a simpler, single-option branch: signer-count detail comes later.
  {
    id: 'hasEmail',
    parent: 'someone',
    x: 1015,
    y: 520,
    w: 240,
    h: 162,
    title: 'Email on file',
    example: 'Beneficiaries',
    example2: ['"Beneficiaries Irrevocable', 'Instruction to Law Firm"'],
  },
  {
    id: 'noEmail',
    parent: 'someone',
    x: 1570,
    y: 520,
    w: 240,
    h: 162,
    title: 'Email not on file',
    example: 'Executors',
    example2: ['"Renunciation of Probate"'],
    // Real exception: an executor who is ALSO a beneficiary already has an
    // email on file from their beneficiary registration, so they route via
    // "Email on file" instead — this box only applies to executors with no
    // other role on the application.
    caveat: ['Exception — also a', 'beneficiary? → Email on file'],
  },

  // A real trade-off, not a default — same treatment as e-sign's In portal /
  // Email link pair: pros and cons instead of a one-line mechanism, plus a
  // decision-needed badge in the gap between them.
  {
    id: 'emailLinkThirdParty',
    parent: 'hasEmail',
    x: 820,
    y: 760,
    w: 260,
    h: 226,
    title: 'Email link',
    tone: 'blue',
    compare: true,
    description: ['Sent to each signer’s own', 'email address.'],
    pros: ['Faster — sent straight to them', 'No meeting to arrange'],
    cons: ['Less solicitor oversight', 'Depends on them checking email'],
  },
  // Its own mechanism (send link+code vs. organize a meeting) is identical
  // to arrangesNo's, sitting below both as a real converge-then-fan-out
  // junction (see MERGE_POINT below) rather than either card owning it —
  // neither the email-on-file nor the no-email path has more claim to it.
  {
    id: 'arrangesYes',
    parent: 'hasEmail',
    x: 1180,
    y: 760,
    w: 280,
    h: 226,
    title: 'Solicitor arranges',
    tone: 'amber',
    compare: true,
    pros: ['Solicitor stays involved', 'Signature confirmed on the spot'],
    cons: ['Slower — needs a meeting', 'Extra coordination required'],
  },
  // Only option when there's no email on file — signer count doesn't change
  // that, so no further split here (yet). Also converges into the shared
  // send-link/organize-meeting pair below, same as arrangesYes — see
  // MERGE_POINT.
  {
    id: 'arrangesNo',
    parent: 'noEmail',
    x: 1560,
    y: 760,
    w: 260,
    h: 226,
    title: 'Solicitor arranges',
    tone: 'amber',
  },
  {
    id: 'amlLeaf',
    parent: 'aml1',
    x: 1930,
    y: 280,
    w: 240,
    h: 110,
    title: 'AML / KYC upload',
    sub: ['Solicitor uploads', 'directly — no signer'],
    dashed: true,
  },

  // Not a document/signer-driven fork like the others above it — this is a
  // portal capability the solicitor can freely pick either side of, case by
  // case. Signer count doesn't factor in here at all, so that split is gone.
  // No single `parent` — both "Solicitor arranges" cards lead here equally,
  // so the connectors are drawn explicitly (see MERGE_POINT below) as a real
  // converge-then-fan-out junction instead of picking one side to own it.
  {
    id: 'sendLink',
    x: 1320,
    y: 1230,
    w: 260,
    h: 232,
    title: 'Send link + code',
    tone: 'green',
    compare: true,
    description: [
      "Solicitor's own choice —",
      'sent via the portal',
      'Real DocuSign signing URL',
      '+ access code sent to',
      'each signer individually',
      'DocuSign security still applies',
    ],
    pros: ['No meeting required', 'Solicitor stays involved', 'Still faster than a meeting'],
  },
  {
    id: 'organizeMeeting',
    x: 1630,
    y: 1230,
    w: 265,
    h: 232,
    title: 'In portal — organize meeting',
    sub: [
      "Solicitor's own choice —",
      'arranged in the portal,',
      'meeting held in person',
      'Multiple signers need not',
      'share a single meeting —',
      'separate meetings are fine.',
    ],
    tone: 'red',
  },
]

// Chips sit on the shared trunk just below a branching parent, before its
// lines diverge — the decision criterion for that branch, stated once
// instead of repeated on every line ("who signs" doesn't need to say twice).
const CHIPS = [
  { x: 944, y: 150, label: 'Who signs it?' },
  { x: 475, y: 460, label: 'How?' },
  { x: 340, y: 720, label: 'Where?' },
  { x: 1413, y: 460, label: 'Do we have their email?' },
  { x: 1135, y: 720, label: 'How is it sent?' },
  { x: 1600, y: 1170, label: 'How?' },
]

// Both "Solicitor arranges" cards (Email on file's and Email not on file's)
// lead to the exact same two mechanisms — genuinely a converge-then-fan-out
// junction, not one card "owning" the pair and the other pointing at it.
// MERGE_POINT is where both incoming lines land AND both outgoing lines
// leave from — deliberately the "Both available" badge's own position, not
// the "How?" chip's: converging on the chip read as cluttered, so the badge
// (which already states "these two are interchangeable") is the actual
// junction, and the chip sits below it, decorating the trunk down to the
// fan-out same as any other chip in the tree. Sits right of center (rather
// than the arithmetic midpoint between the two parents) so the incoming
// line from arrangesYes clears the "PFI decision needed" card sitting just
// below-left of it.
const MERGE_POINT = { x: 1600, y: 1100 }

// Not a "which one" decision like the others — the portal supports both, and
// the solicitor is free to pick either, case by case. This IS the merge
// junction itself (see MERGE_POINT above), not just a note sitting near it.
// A real filled badge, not bare text — pale text on the dot-grid canvas was
// unreadable.
const ARRANGE_NOTE = { x: MERGE_POINT.x, y: MERGE_POINT.y, text: "Both available — solicitor's choice each time" }

// The two genuine trade-offs in the tree (In portal vs. Email link; Email
// link vs. Solicitor arranges) both need the same real explanation, not a
// few words crammed into the small "?" mark's own card — the portal itself
// doesn't prefer either option in either pair, so choosing one is a product
// decision PFI has to make once, not a per-case choice left to the
// solicitor (that's ARRANGE_NOTE's very different situation, just above).
// Each entry pairs a small "?" mark sitting in the gap between the compared
// cards with a properly-sized explanation card underneath, joined by a
// short dashed line — the mark flags the spot, the card does the explaining.
const DECISION_NOTES = [
  {
    markX: 350,
    markY: 810,
    cardX: 140,
    cardY: 1016,
    lines: [
      'Both options already work in the portal.',
      'PFI needs to choose one as the standard flow.',
      "This isn't left as a solicitor's per-case choice.",
    ],
  },
  {
    markX: 1130,
    markY: 810,
    cardX: 930,
    cardY: 1016,
    lines: [
      'Both options already work in the portal.',
      'PFI needs to choose one as the standard flow.',
      "This isn't left as a solicitor's per-case choice.",
    ],
  },
]

// The four edges of the merge junction: both "Solicitor arranges" cards
// converge into MERGE_POINT, which then fans out to the two real mechanism
// cards — a normal, symmetric flowchart convergence, drawn with the same
// solid line/arrowhead style as every other connector (no dashing needed;
// both incoming edges are equally real, not one primary and one "FYI").
const MERGE_LINKS = [
  { from: 'arrangesYes', toPoint: [MERGE_POINT.x, MERGE_POINT.y] },
  { from: 'arrangesNo', toPoint: [MERGE_POINT.x, MERGE_POINT.y] },
]
const FAN_LINKS = [
  { fromPoint: [MERGE_POINT.x, MERGE_POINT.y], to: 'sendLink' },
  { fromPoint: [MERGE_POINT.x, MERGE_POINT.y], to: 'organizeMeeting' },
]

// A real reference key for the tone system above — not another decision
// node, so it's deliberately laid out as its own wide panel at the bottom
// of the canvas rather than another card in the tree. Column heights are
// computed from actual line counts (see LegendPanel), not hand-measured,
// so editing this content later doesn't silently break the layout.
const LEGEND = {
  x: 210,
  y: 1522,
  w: 1800,
  title: 'Signing Mechanism Reference',
  columns: [
    {
      color: 'red',
      label: 'Instant Portal Signing',
      lines: [
        'Upon creation, the document is immediately',
        'available for signing directly within the',
        "portal, using DocuSign's native embedded",
        'signing functionality.',
      ],
    },
    {
      color: 'blue',
      label: 'Emailed Signing Link',
      lines: [
        'Upon creation, a DocuSign signing link is',
        'emailed directly to the signer. Once signed,',
        "the document's status updates to Completed",
        'automatically within the portal.',
      ],
    },
    {
      color: 'amber',
      label: 'Solicitor-Arranged Signing',
      lines: [
        "The most complex signing path — used when a",
        "signer's email address is not on file, or",
        'when closer solicitor involvement is chosen',
        'over an emailed link.',
      ],
      subs: [
        {
          color: 'red',
          label: 'Default',
          lines: [
            'The solicitor organizes an in-person',
            'meeting; the signer completes the',
            'process live, directly in the portal.',
          ],
        },
        {
          color: 'green',
          label: 'Alternative',
          lines: [
            'The solicitor may instead choose to',
            'email a signing link and access code',
            'directly to the signer, who completes',
            'DocuSign remotely — no meeting required.',
          ],
        },
      ],
    },
  ],
}

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))
const topCenter = (n) => [n.x + n.w / 2, n.y]
const bottomCenter = (n) => [n.x + n.w / 2, n.y + n.h]

function bezierPath(x1, y1, x2, y2) {
  const dy = (y2 - y1) / 2
  return `M ${x1},${y1} C ${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`
}

function NodeBox({ node }) {
  const stroke = node.tone ? TONE_HEX[node.tone] : '#192618'
  const hasSub = Array.isArray(node.sub) && node.sub.length > 0
  // A node can carry an example with no mechanism subtitle (e.g. "Yes" —
  // just a routing answer, but still worth naming a real example under) —
  // that still needs the title pinned to the top rather than vertically
  // centered, same as a hasSub box, so it doesn't collide with the example line.
  const titleAtTop = hasSub || !!node.example
  const textX = node.x + node.w / 2 + (node.tone ? 5 : 0)

  // Rows were equalized to a shared height, so a sub-only box (title + a
  // couple of lines, no example) can end up taller than its own content
  // needs — without this, the extra room would just pile up as dead space
  // below the last line. Centers the whole title+sub block vertically
  // instead. Boxes with a bottom-anchored `example` are excluded: that
  // content already tracks node.h on its own (see below), so double-
  // centering would fight it.
  const subOnlyCentering = hasSub && !node.example
  const naturalSubHeight = hasSub ? 58 + (node.sub.length - 1) * 19 + 26 : 0
  const subCenterOffset = subOnlyCentering ? Math.max(0, (node.h - naturalSubHeight) / 2) : 0

  // example2 layout is computed, not hardcoded, so an optional caveat (a
  // note about the PARTY example, e.g. "Executors" above) can sit directly
  // under it instead of after the unrelated document-name example below.
  // With no caveat this reduces to the original fixed offsets exactly.
  const example2ExampleY = node.y + 66
  const caveatCount = node.example2 && node.caveat ? node.caveat.length : 0
  const caveatFirstY = example2ExampleY + 15
  const caveatLineGap = 12
  const example2Divider2Y =
    caveatCount > 0 ? caveatFirstY + (caveatCount - 1) * caveatLineGap + 14 : example2ExampleY + 16
  const example2DocLabelY = example2Divider2Y + 14
  const example2FirstLineY = example2DocLabelY + 16

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={18}
        fill="#FFFFFF"
        stroke={node.dashed ? '#D8D8D8' : node.tone ? stroke : '#192618'}
        strokeWidth={node.tone ? 1.5 : 1.75}
        strokeDasharray={node.dashed ? '5 4' : undefined}
        filter="url(#cardShadow)"
      />
      {node.tone && (
        <rect x={node.x + 10} y={node.y + 12} width={5} height={node.h - 24} rx={2.5} fill={stroke} />
      )}
      <text
        x={textX}
        y={titleAtTop ? node.y + 34 + subCenterOffset : node.y + node.h / 2 + 6}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={titleAtTop ? 16 : 18}
        fontWeight={600}
        fill="#192618"
        textDecoration="underline"
      >
        {node.title}
      </text>
      {hasSub &&
        node.sub.map((line, i) => (
          <text
            key={i}
            x={textX}
            y={node.y + 58 + subCenterOffset + i * 19}
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize={13}
            fill="#868686"
          >
            {line}
          </text>
        ))}
      {node.example && !node.example2 && (
        <g>
          <line
            x1={node.x + 16}
            y1={node.y + node.h - 32}
            x2={node.x + node.w - 16}
            y2={node.y + node.h - 32}
            stroke="#EFEFEF"
            strokeWidth={1}
          />
          {node.exampleHref ? (
            <a href={node.exampleHref} target="_blank" rel="noopener noreferrer">
              <text
                x={textX}
                y={node.y + node.h - 12}
                textAnchor="middle"
                fontFamily="'DM Sans', sans-serif"
                fontSize={12.5}
                style={{ cursor: 'pointer' }}
              >
                <tspan fill="#868686" fontStyle="italic">e.g. </tspan>
                <tspan fill="#192618" fontWeight={700} textDecoration="underline">
                  {node.example}
                </tspan>
                <tspan fill="#192618" fontWeight={700}>
                  {' '}↗
                </tspan>
              </text>
            </a>
          ) : (
            <text
              x={textX}
              y={node.y + node.h - 12}
              textAnchor="middle"
              fontFamily="'DM Sans', sans-serif"
              fontSize={12.5}
            >
              <tspan fill="#868686" fontStyle="italic">e.g. </tspan>
              <tspan fill="#192618" fontWeight={700}>
                {node.example}
              </tspan>
            </text>
          )}
        </g>
      )}
      {node.example2 && (
        <g>
          <line
            x1={node.x + 16}
            y1={node.y + 50}
            x2={node.x + node.w - 16}
            y2={node.y + 50}
            stroke="#EFEFEF"
            strokeWidth={1}
          />
          <text
            x={textX}
            y={example2ExampleY}
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize={12.5}
          >
            <tspan fill="#868686" fontStyle="italic">e.g. </tspan>
            <tspan fill="#192618" fontWeight={700}>
              {node.example}
            </tspan>
          </text>
          {node.caveat &&
            node.caveat.map((line, i) => (
              <text
                key={`cv${i}`}
                x={textX}
                y={caveatFirstY + i * caveatLineGap}
                textAnchor="middle"
                fontFamily="'DM Sans', sans-serif"
                fontSize={10.5}
                fontStyle="italic"
                fill="#868686"
              >
                {line}
              </text>
            ))}
          <line
            x1={node.x + 16}
            y1={example2Divider2Y}
            x2={node.x + node.w - 16}
            y2={example2Divider2Y}
            stroke="#EFEFEF"
            strokeWidth={1}
          />
          <text
            x={textX}
            y={example2DocLabelY}
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize={11}
            fontStyle="italic"
            fill="#868686"
          >
            e.g. document name
          </text>
          {node.example2.map((line, i) => (
            <text
              key={i}
              x={textX}
              y={example2FirstLineY + i * 15}
              textAnchor="middle"
              fontFamily="'DM Sans', sans-serif"
              fontSize={12}
              fontWeight={700}
              fill="#192618"
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </g>
  )
}

// This is a real trade-off, or at least genuinely more than a one-line
// mechanism — so it earns an actual comparison / detail card instead, per
// the diagramming rule: draw the difference, don't just restate the option
// as a bare box. `cons` is optional — a card can be pros-only detail rather
// than a strict trade-off (e.g. explaining why a path is worth using, not
// weighing it against an alternative). `description` is an optional block
// of plain mechanism/context lines rendered between the title and PROS.
function CompareBox({ node }) {
  const stroke = TONE_HEX[node.tone]
  const left = node.x + 22
  const titleY = node.y + 32
  const description = node.description || []
  const pros = node.pros || []
  const cons = node.cons || []

  const lines = [
    ...(pros.length > 0 ? [{ kind: 'header', text: 'PROS', color: '#3D6E1F' }] : []),
    ...pros.map((text) => ({ kind: 'pro', text })),
    ...(cons.length > 0 ? [{ kind: 'header', text: 'CONS', color: '#B45309' }] : []),
    ...cons.map((text) => ({ kind: 'con', text })),
  ]

  let cursorY = titleY + 28 + description.length * 16
  const positioned = lines.map((line) => {
    const ly = cursorY
    cursorY += line.kind === 'header' ? 20 : 19
    if (line.kind === 'header') cursorY += 2
    return { ...line, y: ly }
  })

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={18}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={1.5}
        filter="url(#cardShadow)"
      />
      <rect x={node.x + 10} y={node.y + 12} width={5} height={node.h - 24} rx={2.5} fill={stroke} />
      <text
        x={node.x + node.w / 2 + 5}
        y={titleY}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={17}
        fontWeight={600}
        fill="#192618"
        textDecoration="underline"
      >
        {node.title}
      </text>
      {description.map((line, i) => (
        <text
          key={`d${i}`}
          x={node.x + node.w / 2 + 5}
          y={titleY + 26 + i * 16}
          textAnchor="middle"
          fontFamily="'DM Sans', sans-serif"
          fontSize={12}
          fill="#868686"
        >
          {line}
        </text>
      ))}
      {positioned.map((line, i) =>
        line.kind === 'header' ? (
          <text
            key={i}
            x={left}
            y={line.y}
            fontFamily="'DM Sans', sans-serif"
            fontSize={11}
            fontWeight={700}
            letterSpacing="0.6"
            fill={line.color}
          >
            {line.text}
          </text>
        ) : (
          <text key={i} x={left} y={line.y} fontFamily="'DM Sans', sans-serif" fontSize={12.5} fill="#192618">
            <tspan fill={line.kind === 'pro' ? '#3D6E1F' : '#B45309'} fontWeight={700}>
              {line.kind === 'pro' ? '+ ' : '– '}
            </tspan>
            {line.text}
          </text>
        ),
      )}
    </g>
  )
}

// A visibly different badge from Chip/the "DECISION NEEDED" cards — filled
// blue tint, not white — so it reads at a glance as "FYI" rather than
// "choose one" without having to read the words first.
function InfoBadge({ x, y, text }) {
  const w = text.length * 6.7 + 46
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 18}
        width={w}
        height={36}
        rx={18}
        fill="#EFF6FF"
        stroke="#93C5FD"
        strokeWidth={1.5}
        filter="url(#cardShadow)"
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={12.5}
        fontWeight={700}
        fill="#1D4ED8"
      >
        <tspan fontSize={14}>ⓘ </tspan>
        {text}
      </text>
    </g>
  )
}

// Sits in the gap between a genuinely compared pair — just flags "there's a
// note about this," small enough to fit the tight gap. The actual
// explanation lives in DecisionCard below, connected by a short dashed line.
function DecisionMark({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r={22} fill="#FFFFFF" stroke="#B8B8B8" strokeWidth={1.5} filter="url(#cardShadow)" />
      <text x={x} y={y + 7} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={20} fontWeight={700} fill="#192618">
        ?
      </text>
    </g>
  )
}

// The real explanation, given real room — both options are already working
// portal capabilities, so choosing between them is a product decision for
// PFI to make once, not a per-case choice left to the solicitor (unlike
// ARRANGE_NOTE's pair, which genuinely is left open). Amber-brown accent
// reuses the same hue already established for CONS markers elsewhere in
// this diagram — "something here needs attention" — kept distinct from the
// amber TONE_HEX used for the arrange-branch cards themselves.
function DecisionCard({ x, y, lines }) {
  const w = 420
  const headerY = y + 30
  const firstLineY = headerY + 26
  const lineGap = 19
  const h = firstLineY - y + (lines.length - 1) * lineGap + 26

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#FFFFFF" stroke="#DDD6C8" strokeWidth={1.5} filter="url(#cardShadow)" />
      <rect x={x + 12} y={y + 14} width={5} height={h - 28} rx={2.5} fill="#B45309" />
      <text x={x + 30} y={headerY} fontFamily="'DM Sans', sans-serif" fontSize={14} fontWeight={700} fill="#192618">
        PFI decision needed
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + 30}
          y={firstLineY + i * lineGap}
          fontFamily="'DM Sans', sans-serif"
          fontSize={12.5}
          fill="#4B5563"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function Chip({ x, y, label }) {
  const w = label.length * 6.6 + 28
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 15}
        width={w}
        height={30}
        rx={15}
        fill="#FFFFFF"
        stroke="#D8D8D8"
        strokeWidth={1.25}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={12}
        fontWeight={500}
        fill="#192618"
      >
        {label}
      </text>
    </g>
  )
}

// Reference panel for the tone system — not part of the decision tree
// itself, so it gets its own distinct treatment: a wide neutral-bordered
// panel with column dividers, rather than another colored card that could
// be mistaken for a node. Column heights come from the actual line counts
// in LEGEND, computed here rather than hand-tuned, so future edits to the
// copy can't silently overflow or leave dead space.
function LegendPanel({ data }) {
  const { x, y, w, title, columns } = data
  const padding = 32
  const gap = 44
  const colW = (w - padding * 2 - gap * (columns.length - 1)) / columns.length
  const headerY = y + 38
  const colStartY = y + 78

  const renderedCols = columns.map((col, ci) => {
    const colX = x + padding + ci * (colW + gap)
    let cursorY = colStartY
    const labelY = cursorY
    cursorY += 22
    const lineYs = col.lines.map(() => {
      const yy = cursorY
      cursorY += 18
      return yy
    })
    cursorY += 14
    const subs = (col.subs || []).map((sub) => {
      const subLabelY = cursorY
      cursorY += 19
      const subLineYs = sub.lines.map(() => {
        const yy = cursorY
        cursorY += 16
        return yy
      })
      cursorY += 16
      return { ...sub, subLabelY, subLineYs }
    })
    return { ...col, colX, labelY, lineYs, subs, bottomY: cursorY }
  })

  const panelH = Math.max(...renderedCols.map((c) => c.bottomY)) - y + 30

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={panelH}
        rx={18}
        fill="#FFFFFF"
        stroke="#D8D8D8"
        strokeWidth={1.5}
        filter="url(#cardShadow)"
      />
      <text
        x={x + padding}
        y={headerY}
        fontFamily="'DM Sans', sans-serif"
        fontSize={17}
        fontWeight={700}
        fill="#192618"
      >
        {title}
      </text>
      <line
        x1={x + padding}
        y1={headerY + 16}
        x2={x + w - padding}
        y2={headerY + 16}
        stroke="#EFEFEF"
        strokeWidth={1}
      />
      {renderedCols.map((col, ci) => (
        <g key={ci}>
          {ci > 0 && (
            <line
              x1={col.colX - gap / 2}
              y1={colStartY - 20}
              x2={col.colX - gap / 2}
              y2={y + panelH - 20}
              stroke="#EFEFEF"
              strokeWidth={1}
            />
          )}
          <circle cx={col.colX + 6} cy={col.labelY - 4} r={5.5} fill={TONE_HEX[col.color]} />
          <text
            x={col.colX + 20}
            y={col.labelY}
            fontFamily="'DM Sans', sans-serif"
            fontSize={14}
            fontWeight={700}
            fill="#192618"
          >
            {col.label}
          </text>
          {col.lines.map((line, li) => (
            <text
              key={li}
              x={col.colX}
              y={col.lineYs[li]}
              fontFamily="'DM Sans', sans-serif"
              fontSize={12.5}
              fill="#4B5563"
            >
              {line}
            </text>
          ))}
          {col.subs.map((sub, si) => (
            <g key={si}>
              <circle cx={col.colX + 10} cy={sub.subLabelY - 4} r={4.5} fill={TONE_HEX[sub.color]} />
              <text
                x={col.colX + 22}
                y={sub.subLabelY}
                fontFamily="'DM Sans', sans-serif"
                fontSize={12.5}
                fontWeight={700}
                fill="#192618"
              >
                {sub.label}
              </text>
              {sub.lines.map((line, li) => (
                <text
                  key={li}
                  x={col.colX + 22}
                  y={sub.subLineYs[li]}
                  fontFamily="'DM Sans', sans-serif"
                  fontSize={11.5}
                  fill="#4B5563"
                >
                  {line}
                </text>
              ))}
            </g>
          ))}
        </g>
      ))}
    </g>
  )
}

export default function SigningDiagram() {
  const connectors = NODES.filter((n) => n.parent).map((n) => ({ from: byId[n.parent], to: n }))

  return (
    <svg
      role="img"
      aria-label="Decision tree of every document-signing path: the solicitor e-signs it (in portal or by an emailed link, compared by pros and cons) or signs by hand; someone else signs it, first depending on whether their email is on file — if on file, by email link or arranged by the solicitor (also compared by pros and cons), the arranged path further splitting by the solicitor's own choice to send a link and access code or organize an in-person meeting, if not on file, the solicitor arranges it as the only option; or no signature is needed for AML/KYC uploads."
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: 'block' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="#B8B8B8" />
        </marker>
        <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#192618" floodOpacity="0.10" />
        </filter>
      </defs>

      <text
        x={CANVAS_W / 2}
        y={52}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={30}
        fontWeight={700}
        fill="#192618"
      >
        Signing Methods — Overview
      </text>

      <g transform={`translate(0, ${TITLE_OFFSET})`}>

      {connectors.map((c, i) => {
        const [x1, y1] = bottomCenter(c.from)
        const [x2, y2] = topCenter(c.to)
        return (
          <path
            key={i}
            d={bezierPath(x1, y1, x2, y2)}
            fill="none"
            stroke="#B8B8B8"
            strokeWidth={1.75}
            markerEnd="url(#arrowhead)"
          />
        )
      })}

      {MERGE_LINKS.map((m, i) => {
        const [x1, y1] = bottomCenter(byId[m.from])
        const [x2, y2] = m.toPoint
        return (
          <path
            key={`merge${i}`}
            d={bezierPath(x1, y1, x2, y2)}
            fill="none"
            stroke="#B8B8B8"
            strokeWidth={1.75}
            markerEnd="url(#arrowhead)"
          />
        )
      })}

      {FAN_LINKS.map((f, i) => {
        const [x1, y1] = f.fromPoint
        const [x2, y2] = topCenter(byId[f.to])
        return (
          <path
            key={`fan${i}`}
            d={bezierPath(x1, y1, x2, y2)}
            fill="none"
            stroke="#B8B8B8"
            strokeWidth={1.75}
            markerEnd="url(#arrowhead)"
          />
        )
      })}

      {CHIPS.map((c, i) => (
        <Chip key={i} {...c} />
      ))}

      <InfoBadge x={ARRANGE_NOTE.x} y={ARRANGE_NOTE.y} text={ARRANGE_NOTE.text} />

      {NODES.map((n) =>
        n.compare ? <CompareBox key={n.id} node={n} /> : <NodeBox key={n.id} node={n} />,
      )}

      {/* Both genuine trade-offs (In portal/Email link, and Email
          link/Solicitor arranges) get the same treatment: a small "?" mark
          in the gap, a dashed line down to a properly-sized explanation
          card — real sentences, not a few words crammed into the mark itself. */}
      {DECISION_NOTES.map((n, i) => (
        <g key={i}>
          <DecisionMark x={n.markX} y={n.markY} />
          <line
            x1={n.markX}
            y1={n.markY + 22}
            x2={n.markX}
            y2={n.cardY}
            stroke="#B8B8B8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <DecisionCard x={n.cardX} y={n.cardY} lines={n.lines} />
        </g>
      ))}

      <LegendPanel data={LEGEND} />
      </g>
    </svg>
  )
}
