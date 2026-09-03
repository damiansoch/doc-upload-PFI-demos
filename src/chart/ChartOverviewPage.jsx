import { useState } from 'react'
import { Download, FileCode2, Loader2 } from 'lucide-react'
import PannableCanvas from '../overview/PannableCanvas'
import ChartPage, { CANVAS_W, CANVAS_H } from './ChartPage'
import { exportChartAsHtml, exportChartAsPng } from './exportChartImage'

// Same pan/zoom infrastructure as the signing-methods overview — reused
// as-is rather than rebuilt, since it's already generic (any children, not
// SVG-specific).
export default function ChartOverviewPage() {
  const [exportingPng, setExportingPng] = useState(false)
  const [exportingHtml, setExportingHtml] = useState(false)

  const handleExportPng = async () => {
    setExportingPng(true)
    try {
      await exportChartAsPng({
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,
        filename: 'documentation-requirements-chart.png',
      })
    } finally {
      setExportingPng(false)
    }
  }

  const handleExportHtml = async () => {
    setExportingHtml(true)
    try {
      exportChartAsHtml({
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,
        filename: 'documentation-requirements-chart.html',
        title: 'Documentation & Requirements — Overview',
      })
    } finally {
      setExportingHtml(false)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans chart-export-root">
      <PannableCanvas contentWidth={CANVAS_W} contentHeight={CANVAS_H}>
        <ChartPage />
      </PannableCanvas>

      <div className="fixed right-6 top-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportHtml}
          disabled={exportingHtml}
          className="inline-flex items-center gap-1.5 rounded-full border border-border1 bg-white px-3.5 py-2 font-sans text-xs font-medium text-ink shadow-lg hover:bg-[#F5F5F4] disabled:opacity-60"
        >
          {exportingHtml ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileCode2 className="h-3.5 w-3.5" />
          )}
          {exportingHtml ? 'Exporting…' : 'Export as HTML'}
        </button>

        <button
          type="button"
          onClick={handleExportPng}
          disabled={exportingPng}
          className="inline-flex items-center gap-1.5 rounded-full border border-border1 bg-white px-3.5 py-2 font-sans text-xs font-medium text-ink shadow-lg hover:bg-[#F5F5F4] disabled:opacity-60"
        >
          {exportingPng ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {exportingPng ? 'Exporting…' : 'Export as image'}
        </button>
      </div>
    </div>
  )
}
