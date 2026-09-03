import { Settings2 } from 'lucide-react'
import { DOCUMENTS, AML_REQUIREMENT, METHOD_INFO, partyName } from '../data/documents'

const METHOD_ORDER = ['email', 'embedded', 'wet']

function Row({ checked, onChange, title, subtitle }) {
  return (
    <label className="flex items-start gap-2.5 rounded-lg border border-border2 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-green"
      />
      <span className="min-w-0">
        <span className="block font-sans text-xs font-medium leading-[17px] text-ink2">
          {title}
        </span>
        <span className="mt-0.5 block font-sans text-[11px] leading-[16px] text-muted">
          {subtitle}
        </span>
      </span>
    </label>
  )
}

function GroupLabel({ children, count }) {
  return (
    <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
      {children}
      <span className="rounded-full bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold normal-case tracking-normal text-muted">
        {count}
      </span>
    </p>
  )
}

export default function DocumentSelector({
  documents = DOCUMENTS,
  selectedIds,
  toggleDoc,
  amlIncluded,
  toggleAml,
  selectAll,
  clearAll,
  onOpenSigningOptions,
}) {
  return (
    <div className="rounded-lg border border-border2 bg-[#FAFAF9] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[13px] font-semibold text-ink2">
            Documents included in this preview
          </p>
          <p className="mt-0.5 font-sans text-xs leading-[17px] text-muted">
            Choose which documents and requirements to show, grouped by how they're signed —
            this selection applies to every option below.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-sans text-xs font-semibold">
            <button type="button" onClick={selectAll} className="text-green">
              Select all
            </button>
            <span className="text-border2">|</span>
            <button type="button" onClick={clearAll} className="text-muted">
              Clear all
            </button>
          </div>
          {onOpenSigningOptions && (
            <button
              type="button"
              onClick={onOpenSigningOptions}
              className="flex items-center gap-1.5 rounded-lg border border-border2 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-ink2 transition-colors hover:border-border1"
            >
              <Settings2 className="h-3.5 w-3.5 text-muted" />
              Options
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <GroupLabel count={1}>Direct upload — no signature</GroupLabel>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Row
              checked={amlIncluded}
              onChange={toggleAml}
              title={AML_REQUIREMENT.name}
              subtitle="Uploaded directly by the solicitor — one certification per beneficiary on the application. Not sent to any party."
            />
          </div>
        </div>

        {METHOD_ORDER.map((method) => {
          const docs = documents.filter((d) => d.method === method)
          if (docs.length === 0) return null
          const info = METHOD_INFO[method]
          return (
            <div key={method} className="flex flex-col gap-2">
              <GroupLabel count={docs.length}>
                {info.label} · {info.sub}
              </GroupLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {docs.map((doc) => (
                  <Row
                    key={doc.id}
                    checked={!!selectedIds[doc.id]}
                    onChange={() => toggleDoc(doc.id)}
                    title={doc.name}
                    subtitle={
                      doc.signerParty === 'solicitor'
                        ? 'Signed by the solicitor, directly in the portal.'
                        : `Signed by ${partyName(doc)}.`
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
