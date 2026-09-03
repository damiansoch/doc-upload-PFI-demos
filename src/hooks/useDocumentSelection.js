import { useState } from 'react'
import { DOCUMENTS } from '../data/documents'

// Which documents/requirements are included in this preview — shared across
// every "Option" tab so switching options doesn't reset what's being previewed.
// Starts with the core solicitor-pack set already on (everything except
// Land Registry Form 51 and Precedent Mortgage and Charge, which are less
// commonly needed for a first look) so the panel has something to show
// without every visitor having to select documents themselves first.
const DEFAULT_SELECTED_IDS = new Set([
  'beneficiaries-irrevocable-instruction',
  'renunciation-of-probate',
  'solicitor-letter-of-undertaking',
  'certificate-of-title',
])

export default function useDocumentSelection() {
  const [selectedIds, setSelectedIds] = useState(() =>
    Object.fromEntries(DOCUMENTS.map((d) => [d.id, DEFAULT_SELECTED_IDS.has(d.id)])),
  )
  const [amlIncluded, setAmlIncluded] = useState(true)

  const toggleDoc = (id) =>
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleAml = () => setAmlIncluded((v) => !v)

  const selectAll = () => {
    setSelectedIds(Object.fromEntries(DOCUMENTS.map((d) => [d.id, true])))
    setAmlIncluded(true)
  }

  const clearAll = () => {
    setSelectedIds(Object.fromEntries(DOCUMENTS.map((d) => [d.id, false])))
    setAmlIncluded(false)
  }

  const selectedDocuments = DOCUMENTS.filter((d) => selectedIds[d.id])

  return {
    selectedIds,
    toggleDoc,
    amlIncluded,
    toggleAml,
    selectAll,
    clearAll,
    selectedDocuments,
  }
}
