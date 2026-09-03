import { X, Mail, Link2 } from 'lucide-react'
import {
  DOCUMENTS,
  SIGNER_PARTY_LABELS,
  RENUNCIATION_OF_PROBATE_ID,
  partyName,
} from '../data/documents'

const PARTY_ORDER = ['solicitor', 'beneficiaries', 'executors']

function MethodToggle({ value, onChange, emailDisabled, emailDisabledReason }) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-border1 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange('embedded')}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[11px] font-medium transition-colors ${
          value === 'embedded' ? 'bg-ink text-white' : 'text-muted'
        }`}
      >
        <Link2 className="h-3 w-3" />
        Embedded
      </button>
      <button
        type="button"
        onClick={() => !emailDisabled && onChange('email')}
        disabled={emailDisabled}
        title={emailDisabled ? emailDisabledReason : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[11px] font-medium transition-colors ${
          value === 'email' ? 'bg-ink text-white' : emailDisabled ? 'text-gray-300' : 'text-muted'
        } ${emailDisabled ? 'cursor-not-allowed' : ''}`}
      >
        <Mail className="h-3 w-3" />
        Email
      </button>
    </div>
  )
}

function DocRow({ doc, method, onChange, canBeEmailed, isRenunciation, executorsAreBeneficiaries, onToggleExecutors }) {
  return (
    <div className="rounded-lg border border-border3 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium text-ink2">{doc.name}</p>
          <p className="mt-0.5 font-sans text-[11px] leading-[15px] text-muted">
            Signed by {partyName(doc)}.
          </p>
        </div>
        <MethodToggle
          value={method}
          onChange={(m) => onChange(doc.id, m)}
          emailDisabled={!canBeEmailed(doc.id)}
          emailDisabledReason="Confirm the executors' email address is on file below before switching this to email."
        />
      </div>

      {isRenunciation && (
        <label className="mt-3 flex items-start gap-2 rounded-lg border border-border3 bg-[#FAFAF9] px-3 py-2">
          <input
            type="checkbox"
            checked={executorsAreBeneficiaries}
            onChange={onToggleExecutors}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-green"
          />
          <span className="font-sans text-[11px] leading-[16px] text-muted">
            <span className="font-medium text-ink2">The executors are also beneficiaries</span> — their
            email address is already on file, so this document can be emailed like the others. Left
            unchecked, an executor's email can't be assumed to be on file, so this document stays
            embedded and is excluded from “Set all to Email Signing” below.
          </span>
        </label>
      )}
    </div>
  )
}

export default function SigningOptionsModal({
  open,
  onClose,
  methods,
  setMethod,
  setAllTo,
  resetToDefault,
  executorsAreBeneficiaries,
  toggleExecutorsAreBeneficiaries,
  canBeEmailed,
}) {
  if (!open) return null

  const configurable = DOCUMENTS.filter((d) => d.method !== 'wet')
  const wetDocs = DOCUMENTS.filter((d) => d.method === 'wet')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink2/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border3 px-5 py-4">
          <div>
            <p className="font-sans text-sm font-semibold text-ink2">Signing options</p>
            <p className="mt-0.5 font-sans text-xs leading-[17px] text-muted">
              Choose how each document is signed. AML/KYC certifications and wet-signed documents
              have no alternative and aren't shown here.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 text-muted hover:bg-[#F5F5F4]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border3 px-5 py-3">
          <button
            type="button"
            onClick={resetToDefault}
            className="rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
          >
            Reset to default
          </button>
          <span className="h-4 w-px bg-border2" />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
            Easy path
          </span>
          <button
            type="button"
            onClick={() => setAllTo('embedded')}
            className="rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
          >
            Set all to Embedded Signing
          </button>
          <button
            type="button"
            onClick={() => setAllTo('email')}
            className="rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
          >
            Set all to Email Signing
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          {PARTY_ORDER.map((party) => {
            const docs = configurable.filter((d) => d.signerParty === party)
            if (docs.length === 0) return null
            return (
              <div key={party} className="flex flex-col gap-2">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {SIGNER_PARTY_LABELS[party]}
                </p>
                <div className="flex flex-col gap-2">
                  {docs.map((doc) => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      method={methods[doc.id]}
                      onChange={setMethod}
                      canBeEmailed={canBeEmailed}
                      isRenunciation={doc.id === RENUNCIATION_OF_PROBATE_ID}
                      executorsAreBeneficiaries={executorsAreBeneficiaries}
                      onToggleExecutors={toggleExecutorsAreBeneficiaries}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {wetDocs.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
                Wet signing — not configurable
              </p>
              <div className="flex flex-col gap-2">
                {wetDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-border3 bg-[#FAFAF9] px-3 py-2.5 opacity-70"
                  >
                    <p className="font-sans text-[13px] font-medium text-ink2">{doc.name}</p>
                    <p className="mt-0.5 font-sans text-[11px] text-muted">
                      Printed, signed by hand, then scanned and uploaded — no electronic
                      alternative.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border3 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-ink px-4 py-2 font-sans text-xs font-medium text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
