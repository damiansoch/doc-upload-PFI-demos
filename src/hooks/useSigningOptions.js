import { useState } from 'react'
import { DOCUMENTS, RENUNCIATION_OF_PROBATE_ID } from '../data/documents'

// Which documents actually have a choice of signing method — wet signing
// (Certificate of Title) has no email/embedded alternative, so it's left
// out entirely rather than shown as a locked row.
const CONFIGURABLE_DOCS = DOCUMENTS.filter((d) => d.method !== 'wet')
const CONFIGURABLE_IDS = CONFIGURABLE_DOCS.map((d) => d.id)
const DEFAULT_METHODS = Object.fromEntries(DOCUMENTS.map((d) => [d.id, d.method]))

// Solicitor-configurable per-document signing methods, independent of the
// underlying DOCUMENTS data (which stays the source of truth for defaults,
// who signs, stage, etc.) — only `method` is ever overridden here.
export default function useSigningOptions() {
  const [methods, setMethods] = useState(DEFAULT_METHODS)
  // Renunciation of Probate defaults to embedded specifically because an
  // executor's email usually isn't already on file — this flag is the
  // solicitor's explicit confirmation that, for this application, it is
  // (because the executor is also a beneficiary already registered with an
  // email on record). Only once confirmed can that document move to email,
  // manually or via "Set all to Email Signing".
  const [executorsAreBeneficiaries, setExecutorsAreBeneficiaries] = useState(false)

  const canBeEmailed = (id) => id !== RENUNCIATION_OF_PROBATE_ID || executorsAreBeneficiaries

  const setMethod = (id, method) => {
    if (method === 'email' && !canBeEmailed(id)) return
    setMethods((prev) => ({ ...prev, [id]: method }))
  }

  const setAllTo = (method) => {
    setMethods((prev) => {
      const next = { ...prev }
      for (const id of CONFIGURABLE_IDS) {
        if (method === 'email' && !canBeEmailed(id)) continue
        next[id] = method
      }
      return next
    })
  }

  const resetToDefault = () => {
    setMethods(DEFAULT_METHODS)
    setExecutorsAreBeneficiaries(false)
  }

  const toggleExecutorsAreBeneficiaries = () => {
    setExecutorsAreBeneficiaries((prev) => {
      const next = !prev
      // Turning the confirmation off while Renunciation of Probate is
      // currently set to email would leave it pointed at an email address
      // the solicitor just said isn't actually confirmed — fall back to
      // embedded rather than leave it in that inconsistent state.
      if (!next) {
        setMethods((m) => ({ ...m, [RENUNCIATION_OF_PROBATE_ID]: 'embedded' }))
      }
      return next
    })
  }

  return {
    methods,
    setMethod,
    setAllTo,
    resetToDefault,
    executorsAreBeneficiaries,
    toggleExecutorsAreBeneficiaries,
    canBeEmailed,
    configurableIds: CONFIGURABLE_IDS,
  }
}
