import ChevronButton from './ChevronButton'
import { ExclamationBadge } from './icons'

export default function AccordionRow({
  title,
  isOpen,
  onToggle,
  actionRequired = false,
  children,
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-[60px] w-full items-center justify-between pl-[16px] pr-4 sm:pl-[34px] ${
          isOpen ? 'border-b border-border1' : ''
        }`}
      >
        <span className="flex items-center gap-3">
          {actionRequired && <ExclamationBadge />}
          <span
            className={`text-left text-base leading-5 text-ink ${
              isOpen ? 'font-serifDisplay' : 'font-serifText'
            }`}
          >
            {title}
          </span>
        </span>

        <span className="flex items-center gap-4">
          {actionRequired && (
            <span className="whitespace-nowrap rounded-full bg-brandRed px-[10px] py-1 font-sans text-xs font-semibold leading-4 text-white">
              Action required
            </span>
          )}
          <ChevronButton open={isOpen} />
        </span>
      </button>

      {isOpen && <div>{children}</div>}
    </div>
  )
}
