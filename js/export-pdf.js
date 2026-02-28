// export-pdf.js — Generate print-ready PDF with exact physical dimensions via pdf-lib

import { MM_TO_PT } from './config.js';
import { getState, getPaperDimensions } from './model.js';
import { calculateGrid } from './grid.js';
import { drawFrame } from './frames.js';

export async function exportPDF() {
  const { PDFDocument, rgb, pushGraphicsState, popGraphicsState, PDFName } = PDFLib;

  const state = getState();
  const paper = getPaperDimensions();
  const grid = calculateGrid({
    pageWidthMm: paper.widthMm,
    pageHeightMm: paper.heightMm,
    cellSizeMm: state.cellSizeMm,
    cutLineOffsetMm: state.cutLineOffsetMm,
    cutLines: state.cutLines,
    marginMm: state.marginMm,
  });

  const pdfDoc = await PDFDocument.create();

  // ViewerPreferences: PrintScaling = None (so PDF opens at "Actual Size")
  try {
    const catalog = pdfDoc.catalog;
    const vpDict = pdfDoc.context.obj({ PrintScaling: 'None' });
    catalog.set(PDFName.of('ViewerPreferences'), vpDict);
  } catch (e) {
    console.warn('Could not set ViewerPreferences:', e);
  }

  const pageWidthPt = paper.widthMm * MM_TO_PT;
  const pageHeightPt = paper.heightMm * MM_TO_PT;
  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Embed unique images
  const imageCache = new Map();
  for (const cell of state.cells) {
    if (!cell.imageData || imageCache.has(cell.imageData)) continue;
    try {
      const embedded = cell.imageType === 'image/png'
        ? await pdfDoc.embedPng(cell.imageData)
        : await pdfDoc.embedJpg(cell.imageData);
      imageCache.set(cell.imageData, embedded);
    } catch (err) {
      console.warn('Failed to embed image:', err);
    }
  }

  // Draw each cell with image
  for (let i = 0; i < grid.cells.length; i++) {
    const cellLayout = grid.cells[i];
    const cellData = state.cells[i];
    if (!cellData || !cellData.image || !cellData.imageData) continue;

    const pdfImage = imageCache.get(cellData.imageData);
    if (!pdfImage) continue;

    const cellXPt = cellLayout.xMm * MM_TO_PT;
    const cellYPt = pageHeightPt - (cellLayout.yMm + cellLayout.heightMm) * MM_TO_PT;
    const cellWPt = cellLayout.widthMm * MM_TO_PT;
    const cellHPt = cellLayout.heightMm * MM_TO_PT;

    // Draw cell background color (clipped)
    const bgColor = hexToRgb(cellData.bgColor || '#ffffff');
    page.pushOperators(pushGraphicsState());
    drawClipPath(page, state.cellShape, cellXPt, cellYPt, cellWPt, cellHPt);
    page.drawRectangle({
      x: cellXPt,
      y: cellYPt,
      width: cellWPt,
      height: cellHPt,
      color: rgb(bgColor.r, bgColor.g, bgColor.b),
    });
    page.pushOperators(popGraphicsState());

    // Cover mode dimensions
    const img = cellData.image;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const cellAspect = cellWPt / cellHPt;
    const imgScale = cellData.imageScale;

    let drawW, drawH;
    if (imgAspect > cellAspect) {
      drawH = cellHPt * imgScale;
      drawW = drawH * imgAspect;
    } else {
      drawW = cellWPt * imgScale;
      drawH = drawW / imgAspect;
    }

    // Offsets are in mm, convert to PDF points
    const offsetXPt = cellData.imageOffsetX * MM_TO_PT;
    const offsetYPt = cellData.imageOffsetY * MM_TO_PT;

    const drawXPt = cellXPt + (cellWPt - drawW) / 2 + offsetXPt;
    const drawYPt = cellYPt + (cellHPt - drawH) / 2 - offsetYPt;

    // Clipping path for image
    page.pushOperators(pushGraphicsState());
    drawClipPath(page, state.cellShape, cellXPt, cellYPt, cellWPt, cellHPt);

    page.drawImage(pdfImage, {
      x: drawXPt,
      y: drawYPt,
      width: drawW,
      height: drawH,
    });

    page.pushOperators(popGraphicsState());

    // Frame overlay (rasterized to canvas, then embedded as PNG)
    if (cellData.frameId) {
      const frameImg = await rasterizeFrame(pdfDoc, cellData.frameId,
        cellLayout.widthMm, cellLayout.heightMm, state.cellShape);
      if (frameImg) {
        page.pushOperators(pushGraphicsState());
        drawClipPath(page, state.cellShape, cellXPt, cellYPt, cellWPt, cellHPt);
        page.drawImage(frameImg, { x: cellXPt, y: cellYPt, width: cellWPt, height: cellHPt });
        page.pushOperators(popGraphicsState());
      }
    }
  }

  // Draw cut lines
  if (state.cutLines) {
    grid.cutLinesV.forEach(xMm => {
      const x = xMm * MM_TO_PT;
      page.drawLine({
        start: { x, y: pageHeightPt - grid.originYMm * MM_TO_PT },
        end: { x, y: pageHeightPt - (grid.originYMm + grid.gridHeightMm) * MM_TO_PT },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
        dashArray: [3, 3],
      });
    });

    grid.cutLinesH.forEach(yMm => {
      const y = pageHeightPt - yMm * MM_TO_PT;
      page.drawLine({
        start: { x: grid.originXMm * MM_TO_PT, y },
        end: { x: (grid.originXMm + grid.gridWidthMm) * MM_TO_PT, y },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
        dashArray: [3, 3],
      });
    });
  }

  const pdfBytes = await pdfDoc.save();
  downloadBlob(pdfBytes, 'token-sheet.pdf', 'application/pdf');
}

function drawClipPath(page, cellShape, x, y, w, h) {
  const { moveTo, lineTo, closePath, clip, endPath, PDFOperator, PDFNumber } = PDFLib;

  if (cellShape === 'circle') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = w / 2;
    const k = 0.5522847498;

    page.pushOperators(
      moveTo(cx + r, cy),
      PDFOperator.of('c', [
        PDFNumber.of(cx + r), PDFNumber.of(cy + r * k),
        PDFNumber.of(cx + r * k), PDFNumber.of(cy + r),
        PDFNumber.of(cx), PDFNumber.of(cy + r),
      ]),
      PDFOperator.of('c', [
        PDFNumber.of(cx - r * k), PDFNumber.of(cy + r),
        PDFNumber.of(cx - r), PDFNumber.of(cy + r * k),
        PDFNumber.of(cx - r), PDFNumber.of(cy),
      ]),
      PDFOperator.of('c', [
        PDFNumber.of(cx - r), PDFNumber.of(cy - r * k),
        PDFNumber.of(cx - r * k), PDFNumber.of(cy - r),
        PDFNumber.of(cx), PDFNumber.of(cy - r),
      ]),
      PDFOperator.of('c', [
        PDFNumber.of(cx + r * k), PDFNumber.of(cy - r),
        PDFNumber.of(cx + r), PDFNumber.of(cy - r * k),
        PDFNumber.of(cx + r), PDFNumber.of(cy),
      ]),
      clip(),
      endPath(),
    );
  } else {
    page.pushOperators(
      moveTo(x, y),
      lineTo(x + w, y),
      lineTo(x + w, y + h),
      lineTo(x, y + h),
      closePath(),
      clip(),
      endPath(),
    );
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 1, g: 1, b: 1 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

async function rasterizeFrame(pdfDoc, frameId, widthMm, heightMm, shape) {
  const res = 4; // px per mm for frame rasterization (~100 DPI, plenty for vector-like frames)
  const w = Math.round(widthMm * res);
  const h = Math.round(heightMm * res);
  const cvs = document.createElement('canvas');
  cvs.width = w; cvs.height = h;
  const fctx = cvs.getContext('2d');
  drawFrame(fctx, frameId, 0, 0, w, h, shape);
  const blob = await new Promise(resolve => cvs.toBlob(resolve, 'image/png'));
  if (!blob) return null;
  const buf = await blob.arrayBuffer();
  try { return await pdfDoc.embedPng(buf); } catch { return null; }
}

function downloadBlob(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
