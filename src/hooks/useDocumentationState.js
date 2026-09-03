import { useState } from 'react'
import { AML_REQUIREMENT, DOCUMENTS } from '../data/documents'

// Per-item completion state for every document + AML upload. Kept independent
// of which items are currently selected for preview (see useDocumentSelection)
// so toggling the selector never discards progress already made in a demo.
export default function useDocumentationState() {
  const [docStatuses, setDocStatuses] = useState(() =>
    Object.fromEntries(DOCUMENTS.map((d) => [d.id, 'pending'])),
  )
  const [amlUploaded, setAmlUploadedState] = useState(() =>
    Object.fromEntries(AML_REQUIREMENT.people.map((p) => [p.id, p.uploaded])),
  )

  const setDocStatus = (id, status) =>
    setDocStatuses((prev) => ({ ...prev, [id]: status }))

  const setAmlUploaded = (id) =>
    setAmlUploadedState((prev) => ({ ...prev, [id]: true }))

  return { docStatuses, setDocStatus, amlUploaded, setAmlUploaded }
}
