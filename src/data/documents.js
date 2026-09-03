// Mock data modelled on the real document-requirements table (see DocumentsUpload.jsx
// in the solicitor portal) — application_stage, who_needs_to_sign, signing_method.
// This view is part of the SOLICITOR portal. Copy is written in professional
// third person ("the solicitor") rather than second person ("you") throughout.
// Only documents that are actually available right now are listed (nothing
// stage-gated / not-yet-generated is shown).

// The only document with signerParty 'executors' — referenced by id (not
// re-derived by filtering) wherever the signing-options logic needs to
// single it out, so there's one place that knows which document this is.
export const RENUNCIATION_OF_PROBATE_ID = 'renunciation-of-probate';

export const STAGE_LABELS = {
  initial_application: 'Loan Application',
  pa_part: 'Loan Agreement',
  solicitor_pack: 'Solicitor Pack',
};

export const SIGNER_PARTY_LABELS = {
  solicitor: 'Solicitor',
  executors: 'Executors',
  beneficiaries: 'Beneficiaries',
};

export const METHOD_INFO = {
  email: {
    label: 'Email Signing',
    sub: 'DocuSign',
    explain: 'Sent by DocuSign email — the signer opens a secure link and signs electronically.',
  },
  embedded: {
    label: 'Embedded Signing',
    sub: 'In Portal / Secure Link',
    explain: 'Signed in-portal (in person) or via a secure one-time link generated and shared by the solicitor.',
  },
  wet: {
    label: 'Wet Signing',
    sub: 'Print, Sign & Upload',
    explain: 'Printed, signed by hand, then scanned and uploaded here as a single PDF.',
  },
};

// signerParty: who actually applies the signature.
//   'solicitor'     — signed directly by the solicitor, in this portal
//   'executors'     — the SA2 applicants sign (Renunciation of Probate only —
//                      see RENUNCIATION_OF_PROBATE_ID below)
//   'beneficiaries' — a beneficiary signs
//
// actionKind derives what the solicitor needs to do, and is what the UI
// groups by — signerParty alone isn't enough, because the signing method
// changes whether a document is passive or requires the solicitor to
// actively do or arrange something:
//   'monitor' — method === 'email', regardless of who signs: DocuSign
//               emails the signer directly (the solicitor themself, or a
//               third party) and there's genuinely nothing more to do
//               locally until it comes back signed — the same passive
//               DocuSign-email mechanism either way, so it reads the same
//               "Awaiting Signature" regardless of recipient.
//   'sign'    — signerParty === 'solicitor' + embedded/wet: signed directly
//               by the solicitor, in-portal or by hand — an immediate,
//               active step, not a wait.
//   'arrange' — signerParty is executors/beneficiaries + embedded/wet: the
//               solicitor has to get the signer into the office (or send a
//               secure link) and set the signing in motion — this is work
//               for the solicitor, even though they're not the one signing
export function getActionKind(doc) {
  if (doc.method === 'email') return 'monitor';
  if (doc.signerParty === 'solicitor') return 'sign';
  return 'arrange';
}

// The actual person/people to name in instructions — signerLabel is a role
// category (e.g. "Primary Beneficiary — Individual") and reads badly dropped
// into a sentence like "contact primary beneficiary — individual"; use the
// real name(s) from `signers` instead, falling back to signerLabel only when
// there's no signer list (e.g. solicitor-signed documents).
export function partyName(doc) {
  const names = (doc.signers || []).map((s) => s.name);
  if (names.length === 0) return doc.signerLabel;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export const DOCUMENTS = [
  {
    id: 'beneficiaries-irrevocable-instruction',
    name: 'Beneficiaries Irrevocable Instruction to Law Firm',
    stage: 'solicitor_pack',
    signerParty: 'beneficiaries',
    signerLabel: 'Primary Beneficiaries — All Together',
    signerDetail: '1 shared document, signed by all beneficiaries',
    method: 'email',
    signers: [
      { name: 'Sarah Byrne', signed: false },
      { name: 'Jane Byrne', signed: false },
    ],
  },
  // Defaults to embedded (not email) — unlike beneficiaries, an executor's
  // email address usually isn't already on file, so DocuSign has nothing to
  // send a link to until the solicitor confirms otherwise. See
  // RENUNCIATION_OF_PROBATE_ID / the "executors are also beneficiaries"
  // toggle in useSigningOptions.
  {
    id: 'renunciation-of-probate',
    name: 'Renunciation of Probate',
    stage: 'solicitor_pack',
    signerParty: 'executors',
    signerLabel: 'SA2 Form Applicants — All Together',
    signerDetail: '1 shared document, signed by the executors (SA2 applicants)',
    method: 'embedded',
    requiresWitnessing: true,
    signers: [
      { name: 'John Murphy', signed: false },
      { name: 'Patricia Murphy', signed: false },
    ],
  },
  {
    id: 'solicitor-letter-of-undertaking',
    name: 'Solicitor Letter of Undertaking',
    description: 'Undertaking not to distribute the estate',
    stage: 'solicitor_pack',
    signerParty: 'solicitor',
    signerLabel: 'Solicitor',
    signerDetail: 'Signed directly by the solicitor, within the portal',
    method: 'embedded',
    signers: [],
  },
  {
    id: 'certificate-of-title',
    name: 'Certificate of Title',
    stage: 'solicitor_pack',
    signerParty: 'solicitor',
    signerLabel: 'Solicitor',
    signerDetail: 'Signed directly by the solicitor, by hand',
    method: 'wet',
    signers: [],
  },
  {
    id: 'land-registry-form-51',
    name: 'Land Registry Form 51',
    stage: 'solicitor_pack',
    signerParty: 'solicitor',
    signerLabel: 'Solicitor',
    signerDetail: 'Signed directly by the solicitor, within the portal',
    method: 'embedded',
    signers: [],
  },
  {
    id: 'precedent-mortgage-and-charge',
    name: 'Precedent Mortgage and Charge',
    stage: 'solicitor_pack',
    signerParty: 'solicitor',
    signerLabel: 'Solicitor',
    signerDetail: 'Signed directly by the solicitor, within the portal',
    method: 'embedded',
    signers: [],
  },
];

// AML / KYC — "Solicitor KYC Certification", required for every beneficiary on
// this application (the list below is however many are actually on the case,
// not a fixed threshold). Nothing is pre-completed — every upload starts
// outstanding so the mock upload flow can be demonstrated end-to-end.
export const AML_REQUIREMENT = {
  name: 'Solicitor KYC Certification',
  description:
    'A Solicitor KYC Certification is required for every beneficiary on this application before the loan can complete — one certification document per person.',
  docType: 'Solicitor KYC Certification',
  docDescription: 'Solicitor-signed KYC certification confirming this person’s identity has been verified',
  people: [
    { id: 'sarah-byrne', name: 'Sarah Byrne', uploaded: false },
    { id: 'jane-byrne', name: 'Jane Byrne', uploaded: false },
  ],
};
