export function ChevronIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 12 8"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.333 1.333 6 6l4.667-4.667"
        stroke="#192618"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ExclamationBadge({ className = '' }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brandRed text-white ${className}`}
      style={{ width: 22, height: 22 }}
    >
      <span className="font-sans text-[13px] font-bold leading-none">!</span>
    </div>
  )
}

export function UploadIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 14.5V4M11 4 7 8m4-4 4 4"
        stroke="#868686"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14.5v2.25A1.25 1.25 0 0 0 5.25 18h11.5A1.25 1.25 0 0 0 18 16.75V14.5"
        stroke="#868686"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DownloadIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 4v10.5M11 14.5 7 10.5m4 4 4-4"
        stroke="#3D6E1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15.5v2.25A1.25 1.25 0 0 0 5.25 19h11.5A1.25 1.25 0 0 0 18 17.75V15.5"
        stroke="#3D6E1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
