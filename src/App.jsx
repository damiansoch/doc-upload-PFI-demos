import { useState } from 'react'
import { ArrowUpRight, BarChart3, Settings2 } from 'lucide-react'
import AccordionRow from './components/AccordionRow'
import DocumentationPanel from './components/DocumentationPanel'
import DocumentSelector from './components/DocumentSelector'
import SigningOptionsModal from './components/SigningOptionsModal'
import ApiFixesPanel from './components/ApiFixesPanel'
import useDocumentationState from './hooks/useDocumentationState'
import useDocumentSelection from './hooks/useDocumentSelection'
import useSigningOptions from './hooks/useSigningOptions'
import { AML_REQUIREMENT, DOCUMENTS } from './data/documents'

import AccordionRow2 from './option2/components/AccordionRow'
import DocumentationPanel2 from './option2/components/DocumentationPanel'
import useDocumentationState2 from './option2/hooks/useDocumentationState'
import { AML_REQUIREMENT as AML_REQUIREMENT2, DOCUMENTS as DOCUMENTS2 } from './option2/data/documents'

import AccordionRow3 from './option3/components/AccordionRow'
import DocumentationPanel3 from './option3/components/DocumentationPanel'
import useDocumentationState3 from './option3/hooks/useDocumentationState'
import { AML_REQUIREMENT as AML_REQUIREMENT3, DOCUMENTS as DOCUMENTS3 } from './option3/data/documents'

const SECTIONS = [
  { id: 'application-info', title: 'Application Information' },
  { id: 'beneficiary', title: 'Beneficiary Registration' },
  { id: 'legal-rep', title: 'Legal Representation' },
  { id: 'estate', title: 'Estate Assessment' },
  { id: 'docs', title: 'Documentation & Requirements' },
]

const TABS = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3' },
  { id: 'fixes', label: 'Fixes' },
]

function PlaceholderPanel({ title }) {
  return (
    <div className="rounded-b-lg bg-white px-[34px] pb-6 pt-4 font-sans text-sm text-muted">
      {title} content goes here.
    </div>
  )
}

function App() {
  const [tab, setTab] = useState('option1')
  const [openId, setOpenId] = useState(null)
  const [openId2, setOpenId2] = useState(null)
  const [openId3, setOpenId3] = useState(null)
  const [signingOptionsOpen, setSigningOptionsOpen] = useState(false)

  const documentationState = useDocumentationState()
  const documentationState2 = useDocumentationState2()
  const documentationState3 = useDocumentationState3()
  const selection = useDocumentSelection()
  const signingOptions = useSigningOptions()

  // Signing options apply to all three display options at once — they're
  // three presentations of the same underlying documents, not three
  // independent document sets, so one "Signing options" modal drives all of
  // them. Only `method` is overridden on each option's own document data;
  // everything else (who signs, stage, signers list, that option's own
  // labels/vocabulary) stays exactly as that option already has it.
  const effectiveDocuments = DOCUMENTS.map((d) => ({
    ...d,
    method: signingOptions.methods[d.id] ?? d.method,
  }))
  const effectiveDocuments2 = DOCUMENTS2.map((d) => ({
    ...d,
    method: signingOptions.methods[d.id] ?? d.method,
  }))
  const effectiveDocuments3 = DOCUMENTS3.map((d) => ({
    ...d,
    method: signingOptions.methods[d.id] ?? d.method,
  }))
  const selectedDocuments1 = effectiveDocuments.filter((d) => selection.selectedIds[d.id])
  const selectedDocuments2 = effectiveDocuments2.filter((d) => selection.selectedIds[d.id])
  const selectedDocuments3 = effectiveDocuments3.filter((d) => selection.selectedIds[d.id])

  // Option 1 completion — resolves the shared selection against Option 1's own data.
  const amlTotal = AML_REQUIREMENT.people.length
  const amlVerifiedCount = Object.values(documentationState.amlUploaded).filter(Boolean).length
  const amlMet = amlVerifiedCount >= amlTotal
  const amlOk = selection.amlIncluded ? amlMet : true
  const docsComplete = selectedDocuments1.every(
    (d) => documentationState.docStatuses[d.id] === 'completed',
  )
  const allComplete = docsComplete && amlOk

  // Option 2 completion — same shared selection, resolved against Option 2's own
  // (currently identical, independently editable) data and its own status state.
  const amlTotal2 = AML_REQUIREMENT2.people.length
  const amlVerifiedCount2 = Object.values(documentationState2.amlUploaded).filter(Boolean).length
  const amlMet2 = amlVerifiedCount2 >= amlTotal2
  const amlOk2 = selection.amlIncluded ? amlMet2 : true
  const docsComplete2 = selectedDocuments2.every(
    (d) => documentationState2.docStatuses[d.id] === 'completed',
  )
  const allComplete2 = docsComplete2 && amlOk2

  // Option 3 completion — same pattern, resolved against Option 3's own data/state
  // (currently a duplicate of Option 2's, seeded here so it can diverge independently).
  const amlTotal3 = AML_REQUIREMENT3.people.length
  const amlVerifiedCount3 = Object.values(documentationState3.amlUploaded).filter(Boolean).length
  const amlMet3 = amlVerifiedCount3 >= amlTotal3
  const amlOk3 = selection.amlIncluded ? amlMet3 : true
  const docsComplete3 = selectedDocuments3.every(
    (d) => documentationState3.docStatuses[d.id] === 'completed',
  )
  const allComplete3 = docsComplete3 && amlOk3

  return (
    <div className="min-h-screen w-full bg-[#F5F5F4] px-6 py-12">
      <div className="mx-auto flex w-full max-w-[670px] flex-col gap-5 pb-[200px]">
        <div className="flex items-stretch gap-2">
          <a
            href="/overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-between gap-3 rounded-lg border border-border2 bg-white px-4 py-3 transition-colors hover:border-border1"
          >
            <span>
              <span className="block font-sans text-[13px] font-semibold text-ink2">
                Signing methods — overview
              </span>
              <span className="mt-0.5 block font-sans text-xs text-muted">
                Every signing path in one diagram — opens full-screen in a new tab.
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
          </a>
          <button
            type="button"
            onClick={() => setSigningOptionsOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border2 bg-white px-4 py-3 font-sans text-[13px] font-semibold text-ink2 transition-colors hover:border-border1"
          >
            <Settings2 className="h-4 w-4 text-muted" />
            Options
          </button>
          {/* Placeholder destination — opens a blank full-screen page for now
              (see src/chart/ChartPage.jsx); the actual chart is a follow-up
              step, same "button + full-screen new tab" pattern as the
              signing-methods diagram above. */}
          <a
            href="/chart.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border2 bg-white px-4 py-3 font-sans text-[13px] font-semibold text-ink2 transition-colors hover:border-border1"
          >
            <BarChart3 className="h-4 w-4 text-muted" />
            New chart
          </a>
        </div>

        <SigningOptionsModal
          open={signingOptionsOpen}
          onClose={() => setSigningOptionsOpen(false)}
          methods={signingOptions.methods}
          setMethod={signingOptions.setMethod}
          setAllTo={signingOptions.setAllTo}
          resetToDefault={signingOptions.resetToDefault}
          executorsAreBeneficiaries={signingOptions.executorsAreBeneficiaries}
          toggleExecutorsAreBeneficiaries={signingOptions.toggleExecutorsAreBeneficiaries}
          canBeEmailed={signingOptions.canBeEmailed}
        />

        <DocumentSelector
          documents={effectiveDocuments}
          selectedIds={selection.selectedIds}
          toggleDoc={selection.toggleDoc}
          amlIncluded={selection.amlIncluded}
          toggleAml={selection.toggleAml}
          selectAll={selection.selectAll}
          clearAll={selection.clearAll}
        />

        <div className="flex gap-1 border-b border-border3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 font-sans text-xs font-semibold transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-green text-green'
                  : 'border-b-2 border-transparent text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'option1' && (
          <div className="flex flex-col gap-3">
            {SECTIONS.map((section) => {
              const isOpen = openId === section.id
              const actionRequired = section.id === 'docs' ? !allComplete : false
              return (
                <AccordionRow
                  key={section.id}
                  title={section.title}
                  actionRequired={actionRequired}
                  isOpen={isOpen}
                  onToggle={() => setOpenId(isOpen ? null : section.id)}
                >
                  {section.id === 'docs' ? (
                    <DocumentationPanel
                      documents={selectedDocuments1}
                      amlIncluded={selection.amlIncluded}
                      docStatuses={documentationState.docStatuses}
                      setDocStatus={documentationState.setDocStatus}
                      amlUploaded={documentationState.amlUploaded}
                      setAmlUploaded={documentationState.setAmlUploaded}
                    />
                  ) : (
                    <PlaceholderPanel title={section.title} />
                  )}
                </AccordionRow>
              )
            })}
          </div>
        )}

        {tab === 'option2' && (
          <div className="flex flex-col gap-3">
            {SECTIONS.map((section) => {
              const isOpen = openId2 === section.id
              const actionRequired = section.id === 'docs' ? !allComplete2 : false
              return (
                <AccordionRow2
                  key={section.id}
                  title={section.title}
                  actionRequired={actionRequired}
                  isOpen={isOpen}
                  onToggle={() => setOpenId2(isOpen ? null : section.id)}
                >
                  {section.id === 'docs' ? (
                    <DocumentationPanel2
                      documents={selectedDocuments2}
                      amlIncluded={selection.amlIncluded}
                      docStatuses={documentationState2.docStatuses}
                      setDocStatus={documentationState2.setDocStatus}
                      amlUploaded={documentationState2.amlUploaded}
                      setAmlUploaded={documentationState2.setAmlUploaded}
                    />
                  ) : (
                    <PlaceholderPanel title={section.title} />
                  )}
                </AccordionRow2>
              )
            })}
          </div>
        )}

        {tab === 'option3' && (
          <div className="flex flex-col gap-3">
            {SECTIONS.map((section) => {
              const isOpen = openId3 === section.id
              const actionRequired = section.id === 'docs' ? !allComplete3 : false
              return (
                <AccordionRow3
                  key={section.id}
                  title={section.title}
                  actionRequired={actionRequired}
                  isOpen={isOpen}
                  onToggle={() => setOpenId3(isOpen ? null : section.id)}
                >
                  {section.id === 'docs' ? (
                    <DocumentationPanel3
                      documents={selectedDocuments3}
                      amlIncluded={selection.amlIncluded}
                      docStatuses={documentationState3.docStatuses}
                      setDocStatus={documentationState3.setDocStatus}
                      amlUploaded={documentationState3.amlUploaded}
                      setAmlUploaded={documentationState3.setAmlUploaded}
                    />
                  ) : (
                    <PlaceholderPanel title={section.title} />
                  )}
                </AccordionRow3>
              )
            })}
          </div>
        )}

        {tab === 'fixes' && (
          <div className="overflow-hidden rounded-lg border border-border2">
            <ApiFixesPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
