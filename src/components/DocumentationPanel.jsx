import { useState } from 'react'
import { AML_REQUIREMENT, getActionKind } from '../data/documents'
import DocumentItem from './DocumentItem'
import GroupSection from './GroupSection'
import AmlPersonItem from './AmlPersonItem'
import EmptyState from './EmptyState'

// Wet-signature documents are a distinctly different workflow (print, sign by
// hand, scan, upload) from DocuSign-based methods — never interleave them;
// wet-signed items always sort first within a group.
const METHOD_PRIORITY = { wet: 0, embedded: 1, email: 2 }
const byMethod = (a, b) => METHOD_PRIORITY[a.method] - METHOD_PRIORITY[b.method]

export default function DocumentationPanel({
  documents,
  amlIncluded,
  docStatuses,
  setDocStatus,
  amlUploaded,
  setAmlUploaded,
}) {
  // Only one single-item (document or AML) accordion can be open at a time —
  // shared across every section so opening one always closes any other,
  // regardless of which GroupSection it lives in. This is independent of the
  // GroupSections themselves, which can still be open/closed freely.
  const [openItemId, setOpenItemId] = useState(null)

  if (documents.length === 0 && !amlIncluded) {
    return (
      <div className="rounded-b-lg bg-white px-[34px] pb-6 pt-5">
        <EmptyState />
      </div>
    )
  }

  const needsSignature = documents.filter((d) => getActionKind(d) === 'sign').sort(byMethod)
  const needsAction = documents.filter((d) => getActionKind(d) === 'arrange').sort(byMethod)
  const waitingOthers = documents.filter((d) => getActionKind(d) === 'monitor').sort(byMethod)

  const isComplete = (docs) => docs.every((d) => docStatuses[d.id] === 'completed')
  const amlComplete = AML_REQUIREMENT.people.every((p) => amlUploaded[p.id])

  return (
    <div className="flex flex-col gap-5 rounded-b-lg bg-white px-[34px] pb-6 pt-5">
      {amlIncluded && (
        <GroupSection
          tone="purple"
          title="Identity Verification (AML/KYC)"
          subtitle="Uploaded directly by the solicitor, within the portal."
          count={AML_REQUIREMENT.people.length}
          complete={amlComplete}
          defaultOpen
        >
          {AML_REQUIREMENT.people.map((person) => {
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
        </GroupSection>
      )}

      {needsSignature.length > 0 && (
        <GroupSection
          tone="red"
          title="Signature Required"
          subtitle="Signed directly by the solicitor, within the portal."
          count={needsSignature.length}
          complete={isComplete(needsSignature)}
          defaultOpen
        >
          {needsSignature.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              status={docStatuses[doc.id]}
              onStatusChange={(status) => setDocStatus(doc.id, status)}
              open={openItemId === doc.id}
              onOpenChange={(next) => setOpenItemId(next ? doc.id : null)}
            />
          ))}
        </GroupSection>
      )}

      {needsAction.length > 0 && (
        <GroupSection
          tone="amber"
          title="Action Required"
          subtitle="These documents are signed by another party; the solicitor must arrange the signing — either in person or via a secure remote link."
          count={needsAction.length}
          complete={isComplete(needsAction)}
          defaultOpen
        >
          {needsAction.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              status={docStatuses[doc.id]}
              onStatusChange={(status) => setDocStatus(doc.id, status)}
              open={openItemId === doc.id}
              onOpenChange={(next) => setOpenItemId(next ? doc.id : null)}
            />
          ))}
        </GroupSection>
      )}

      {waitingOthers.length > 0 && (
        <GroupSection
          tone="blue"
          title="Awaiting Signature"
          subtitle="Sent directly to the signer's registered email address for electronic signature via DocuSign."
          count={waitingOthers.length}
          complete={isComplete(waitingOthers)}
          defaultOpen
        >
          {waitingOthers.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              status={docStatuses[doc.id]}
              onStatusChange={(status) => setDocStatus(doc.id, status)}
              open={openItemId === doc.id}
              onOpenChange={(next) => setOpenItemId(next ? doc.id : null)}
            />
          ))}
        </GroupSection>
      )}
    </div>
  )
}
