import { ChevronIcon } from './icons'

export default function ChevronButton({ open }) {
  return (
    <span
      className="flex items-center justify-center rounded-full bg-chevbg transition-transform duration-200"
      style={{ width: 28, height: 28, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <ChevronIcon className="w-2 h-2" />
    </span>
  )
}
