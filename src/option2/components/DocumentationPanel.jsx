import { useState } from 'react'
import { AML_REQUIREMENT, getActionKind } from '../data/documents'
import DocumentItem from './DocumentItem'
import AmlPersonItem from './AmlPersonItem'
import EmptyState from './EmptyState'

// Flattened, single-list layout: no separate Outstanding/Completed
// accordions — everything lives in one list. Outstanding items sort first
// (by kind, then wet-before-embedded-before-email within a kind), completed
// items sink to the end under a plain divider label rather than their own
// collapsible section.
const KIND_PRIORITY = { sign: 0, arrange: 1, monitor: 2 }
const METHOD_PRIORITY = { wet: 0, embedded: 1, email: 2 }

function byKindThenMethod(a, b) {
  const kindDiff = KIND_PRIORITY[getActionKind(a)] - KIND_PRIORITY[getActionKind(b)]
  if (kindDiff !== 0) return kindDiff
  return METHOD_PRIORITY[a.method] - METHOD_PRIORITY[b.method]
}

export default function DocumentationPanel({
  documents,
  amlIncluded,
  docStatuses,
  setDocStatus,
  amlUploaded,
  setAmlUploaded,
}) {
  // Only one single-item (document or AML) accordion can be open at a time.
  const [openItemId, setOpenItemId] = useState(null)

  if (documents.length === 0 && !amlIncluded) {
    return (
      <div className="rounded-b-lg bg-white px-[34px] pb-6 pt-5">
        <EmptyState />
      </div>
    )
  }

  const sortedDocuments = [...documents].sort(byKindThenMethod)
  const pendingDocs = sortedDocuments.filter((d) => docStatuses[d.id] !== 'completed')
  const completedDocs = sortedDocuments.filter((d) => docStatuses[d.id] === 'completed')

  const amlPeople = amlIncluded ? AML_REQUIREMENT.people : []
  const pendingAml = amlPeople.filter((p) => !amlUploaded[p.id])
  const completedAml = amlPeople.filter((p) => amlUploaded[p.id])

  const totalCount = pendingAml.length + completedAml.length + pendingDocs.length + completedDocs.length
  const completedCount = completedAml.length + completedDocs.length
  const hasCompleted = completedCount > 0

  return (
    <div className="flex flex-col gap-5 rounded-b-lg bg-white px-[34px] pb-6 pt-5">
      <p className="font-sans text-xs font-semibold text-ink2">
        {completedCount} of {totalCount} complete
      </p>

      <div className="flex flex-col gap-2.5">
        {pendingAml.map((person) => {
          const itemId = `aml-${person.id}`
          return (
            <AmlPersonItem
              key={person.id}
              person={person}
              uploaded={amlUploaded[person.id]}
              onUpload={() => setAmlUploaded(person.id)}
              open={openItemId === itemId}
              onOpenChange={(next) => setOpenItemId(next ? itemId : null)}
            />
          )
        })}
        {pendingDocs.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            status={docStatuses[doc.id]}
            onStatusChange={(status) => setDocStatus(doc.id, status)}
            open={openItemId === doc.id}
            onOpenChange={(next) => setOpenItemId(next ? doc.id : null)}
          />
        ))}

        {hasCompleted && (
          <p className="mt-2 border-t border-border3 pt-4 font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
            Completed
          </p>
        )}
        {completedAml.map((person) => {
          const itemId = `aml-${person.id}`
          return (
            <AmlPersonItem
              key={person.id}
              person={person}
              uploaded={amlUploaded[person.id]}
              onUpload={() => setAmlUploaded(person.id)}
              open={openItemId === itemId}
              onOpenChange={(next) => setOpenItemId(next ? itemId : null)}
            />
          )
        })}
        {completedDocs.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            status={docStatuses[doc.id]}
            onStatusChange={(status) => setDocStatus(doc.id, status)}
            open={openItemId === doc.id}
            onOpenChange={(next) => setOpenItemId(next ? doc.id : null)}
          />
        ))}
      </div>
    </div>
  )
}
