import PannableCanvas from './PannableCanvas'
import SigningDiagram, { CANVAS_W, CANVAS_H } from './SigningDiagram'

export default function OverviewPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans">
      <PannableCanvas contentWidth={CANVAS_W} contentHeight={CANVAS_H}>
        <SigningDiagram />
      </PannableCanvas>
    </div>
  )
}
