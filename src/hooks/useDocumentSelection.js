import { useState } from 'react'
import { DOCUMENTS } from '../data/documents'

// Which documents/requirements are included in this preview — shared across
// every "Option" tab so switching options doesn't reset what's being previewed.
// Nothing is selected by default; the selector above starts empty and the
// panel shows the "no documents selected" empty state until items are chosen.
export default function useDocumentSelection() {
  const [selectedIds, setSelectedIds] = useState(() =>
    Object.fromEntries(DOCUMENTS.map((d) => [d.id, false])),
  )
  const [amlIncluded, setAmlIncluded] = useState(false)

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
