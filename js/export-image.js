// export-image.js — Export sheet as PNG or WebP at 300 DPI

import { MM_TO_PX_300DPI, CUT_LINE_COLOR } from './config.js';
import { getState, getPaperDimensions } from './model.js';
import { calculateGrid } from './grid.js';
import { drawFrame } from './frames.js';

/**
 * Export sheet as image.
 * @param {'png'|'webp'} format
 */
export async function exportImage(format = 'png') {
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

  const scale = MM_TO_PX_300DPI;
  const width = Math.round(paper.widthMm * scale);
  const height = Math.round(paper.heightMm * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw cells with images
  for (let i = 0; i < grid.cells.length; i++) {
    const cellLayout = grid.cells[i];
    const cell = state.cells[i];

    const x = cellLayout.xMm * scale;
    const y = cellLayout.yMm * scale;
    const w = cellLayout.widthMm * scale;
    const h = cellLayout.heightMm * scale;

    if (cell && cell.image) {
      ctx.save();

      // Clip
      ctx.beginPath();
      if (state.cellShape === 'circle') {
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.clip();

      // Fill cell background color
      ctx.fillStyle = cell.bgColor || '#ffffff';
      ctx.fillRect(x, y, w, h);

      // Draw image (cover mode)
      const img = cell.image;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cellAspect = w / h;
      const imgScale = cell.imageScale;

      let drawW, drawH;
      if (imgAspect > cellAspect) {
        drawH = h * imgScale;
        drawW = drawH * imgAspect;
      } else {
        drawW = w * imgScale;
        drawH = drawW / imgAspect;
      }

      // Offsets are in mm, convert to export pixels
      const offsetXExport = cell.imageOffsetX * scale;
      const offsetYExport = cell.imageOffsetY * scale;

      const drawX = x + (w - drawW) / 2 + offsetXExport;
      const drawY = y + (h - drawH) / 2 + offsetYExport;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Draw frame
      if (cell.frameId) {
        drawFrame(ctx, cell.frameId, x, y, w, h, state.cellShape);
      }

      ctx.restore();
    }
  }

  // Draw cut lines
  if (state.cutLines) {
    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    const gridTop = grid.originYMm * scale;
    const gridBottom = (grid.originYMm + grid.gridHeightMm) * scale;
    const gridLeft = grid.originXMm * scale;
    const gridRight = (grid.originXMm + grid.gridWidthMm) * scale;

    grid.cutLinesV.forEach(xMm => {
      const x = xMm * scale;
      ctx.beginPath();
      ctx.moveTo(x, gridTop);
      ctx.lineTo(x, gridBottom);
      ctx.stroke();
    });

    grid.cutLinesH.forEach(yMm => {
      const y = yMm * scale;
      ctx.beginPath();
      ctx.moveTo(gridLeft, y);
      ctx.lineTo(gridRight, y);
      ctx.stroke();
    });
  }

  // Export
  const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
  const ext = format === 'webp' ? 'webp' : 'png';

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-sheet.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, mimeType);
}
