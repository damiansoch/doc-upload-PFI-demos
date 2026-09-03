import { FolderOpen } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border2 bg-[#FAFAF9] px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border2 bg-white text-muted">
        <FolderOpen className="h-5 w-5" />
      </span>
      <div>
        <p className="font-sans text-sm font-semibold text-ink2">No documents yet</p>
        <p className="mt-1 max-w-[360px] font-sans text-xs leading-[18px] text-muted">
          Nothing has been generated for this application yet. Documents and requirements
          will appear here automatically as the solicitor pack is put together.
        </p>
      </div>
    </div>
  )
}
