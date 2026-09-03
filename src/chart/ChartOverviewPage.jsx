import PannableCanvas from '../overview/PannableCanvas'
import ChartPage, { CANVAS_W, CANVAS_H } from './ChartPage'

// Same pan/zoom infrastructure as the signing-methods overview — reused
// as-is rather than rebuilt, since it's already generic (any children, not
// SVG-specific).
export default function ChartOverviewPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans">
      <PannableCanvas contentWidth={CANVAS_W} contentHeight={CANVAS_H}>
        <ChartPage />
      </PannableCanvas>
    </div>
  )
}
