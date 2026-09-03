import { domToPng } from 'modern-screenshot'

// A few of this diagram's flex/badge patterns get slightly wider text
// metrics during off-screen rendering than they do live (a known class of
// limitation with any DOM-to-image capture, not specific to this page),
// which can trip some short labels into wrapping when they never do on
// screen. These rules only apply for the instant of capture — restored
// immediately after — and only pin down the specific patterns that were
// actually confirmed to need it.
const CAPTURE_FIX_CSS = `
  button, button span { line-height: normal !important; }
  .font-serifText, .font-serifDisplay { white-space: nowrap !important; }
  span.rounded-full.bg-\\[\\#F5F5F4\\] { white-space: nowrap !important; }
  h3, .text-\\[13px\\].font-semibold { white-space: nowrap !important; }
  .flex.flex-wrap.items-center.gap-2 { flex-wrap: nowrap !important; }
`

// Exports the chart's PannableCanvas content at its true native pixel size
// (not whatever the browser happens to have it scaled/panned to right now),
// as a single downloadable PNG — reusable from a button, so it stays
// available the same way after future edits to the chart's content.
export async function exportChartAsPng({ canvasWidth, canvasHeight, filename }) {
  const content = document.querySelector('.chart-export-root > div:first-child > div:first-child')
  const viewport = content?.parentElement
  if (!content || !viewport) throw new Error('Chart canvas not found')

  const prevTransform = content.style.transform
  const prevOverflow = viewport.style.overflow

  const style = document.createElement('style')
  style.textContent = CAPTURE_FIX_CSS
  document.head.appendChild(style)
  content.style.transform = 'translate(0px, 0px) scale(1)'
  viewport.style.overflow = 'visible'

  try {
    await document.fonts.ready
    const dataUrl = await domToPng(content, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    content.style.transform = prevTransform
    viewport.style.overflow = prevOverflow
    style.remove()
  }
}

// Reimplements just PannableCanvas's drag-to-pan and ctrl/cmd+wheel-to-zoom
// behavior in plain JS, since the exported file ships no React. Kept small
// and self-contained (no dependency on the app's own PannableCanvas.jsx —
// that one is a React component, this is a vanilla rewrite of the same
// interaction) so the file stays a single portable page.
const PAN_ZOOM_SCRIPT = `
(function () {
  var MIN_SCALE = 0.4, MAX_SCALE = 2;
  var viewport = document.getElementById('chart-viewport');
  var content = document.getElementById('chart-content');
  var contentWidth = content.offsetWidth, contentHeight = content.offsetHeight;
  var x = (window.innerWidth - contentWidth) / 2;
  var y = (window.innerHeight - contentHeight) / 2;
  var scale = 1;
  var dragging = false, moved = false, lastX = 0, lastY = 0;

  function apply() {
    content.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
    viewport.style.backgroundPosition = x + 'px ' + y + 'px';
  }
  apply();

  viewport.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY;
    viewport.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
    lastX = e.clientX; lastY = e.clientY;
    x += dx; y += dy;
    apply();
  });
  window.addEventListener('mouseup', function () {
    dragging = false;
    viewport.style.cursor = 'grab';
  });
  viewport.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      var rect = viewport.getBoundingClientRect();
      var cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      var nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale - e.deltaY * 0.0015));
      var ratio = nextScale / scale;
      x = cx - (cx - x) * ratio;
      y = cy - (cy - y) * ratio;
      scale = nextScale;
    } else {
      x -= e.deltaX; y -= e.deltaY;
    }
    apply();
  }, { passive: false });

  var resetBtn = document.getElementById('chart-reset-view');
  resetBtn.addEventListener('click', function () {
    x = (window.innerWidth - contentWidth) / 2;
    y = (window.innerHeight - contentHeight) / 2;
    scale = 1;
    apply();
  });
})();
`

// Exports the chart as one self-contained, static HTML file — the current
// rendered markup and the page's actual compiled CSS inlined together, so
// it opens and looks identical in any browser with no dev server, no build
// step, and no dependency on this app still existing. It's a visual
// snapshot, not a live copy: buttons/accordions render exactly as they
// currently look, but aren't interactive (there's no React shipped with
// it) — the one piece of interactivity it does keep is drag-to-pan and
// ctrl/cmd+wheel-to-zoom over the whole canvas, via a small vanilla-JS
// reimplementation of PannableCanvas's own behavior.
export function exportChartAsHtml({ canvasWidth, canvasHeight, filename, title }) {
  const content = document.querySelector('.chart-export-root > div:first-child > div:first-child')
  if (!content) throw new Error('Chart canvas not found')

  const styleText = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
  const fontHref = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis"]')?.href

  const clone = content.cloneNode(true)
  clone.style.transform = 'none'
  clone.style.position = 'relative'

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
${fontHref ? `<link rel="stylesheet" href="${fontHref}" />` : ''}
<style>
html, body { margin: 0; height: 100%; overflow: hidden; }
#chart-viewport {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  cursor: grab;
  background-color: #ffffff;
  background-image: radial-gradient(circle, #E2E2E2 1.5px, transparent 1.5px);
  background-size: 28px 28px;
}
#chart-content {
  position: absolute;
  left: 0;
  top: 0;
  width: ${canvasWidth}px;
  height: ${canvasHeight}px;
  transform-origin: 0 0;
}
#chart-reset-view {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 50;
  border: 1px solid #D8D8D8;
  background: #ffffff;
  border-radius: 9999px;
  padding: 8px 16px;
  font-family: "DM Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #192618;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  cursor: pointer;
}
${styleText}
</style>
</head>
<body>
<div id="chart-viewport">
  <div id="chart-content">${clone.innerHTML}</div>
</div>
<button type="button" id="chart-reset-view">Reset view</button>
<script>${PAN_ZOOM_SCRIPT}</script>
</body>
</html>
`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
