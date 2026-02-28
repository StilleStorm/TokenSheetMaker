# TokenSheetMaker

## Project Overview
Online tool for creating TTRPG token sheets. Users configure a grid on a paper page, insert images into cells, position them, and export to print-ready PDF with exact physical dimensions.

## Architecture
- **No framework** — vanilla JS, no build step
- **Dual renderer** — Canvas for interactive editing, pdf-lib for PDF export
- **Data model** drives both renderers; PDF is built mathematically from model, never from canvas screenshot
- All internal dimensions in **millimeters**; conversion to PDF points only at final render (`mm * 72 / 25.4`)

## Key Files
- `config.js` — paper sizes, defaults, unit conversions
- `model.js` — sheet state, cell array, image data
- `grid.js` — pure math: cell positions, cut lines, centering
- `canvas-renderer.js` — interactive canvas view
- `cell-interaction.js` — mouse/touch: select, drag, zoom
- `image-handler.js` — file loading, drag & drop
- `export-pdf.js` — pdf-lib PDF generation with exact dimensions
- `export-image.js` — PNG/WebP export at 300 DPI
- `ui-controls.js` — sidebar/toolbar bindings
- `app.js` — entry point, initialization

## Conventions
- Dark theme UI, white page on dark background
- English UI language
- Single page (no multi-page support in MVP)
- Images always "cover" cells (no gaps visible)
- pdf-lib loaded from CDN (no npm)
- Ads never overlap canvas, never appear in exports

## Print Accuracy
- Paper dimensions in mm, converted to PDF points at export
- Grid centered on page
- PrintScaling: None in PDF ViewerPreferences
- No intermediate rounding
