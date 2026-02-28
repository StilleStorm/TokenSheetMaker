// canvas-renderer.js — Draw grid and images on canvas

import { CELL_BORDER_COLOR, CELL_SELECTED_COLOR, CUT_LINE_COLOR, CUT_LINE_DASH, CUT_LINE_WIDTH_PX, CANVAS_BG_COLOR, PAGE_BG_COLOR } from './config.js';
import { getState } from './model.js';
import { drawFrame } from './frames.js';

let canvas = null;
let ctx = null;
let gridLayout = null;
let baseScale = 1;    // fits page to viewport
let viewZoom = 1;     // user zoom multiplier
let viewPanX = 0;
let viewPanY = 0;
let hoveredOverlay = null;

// Overlay buttons: [center, bgColor, frame, duplicate, delete]
const OVERLAY_BUTTONS = ['center', 'bgColor', 'frame', 'duplicate', 'delete'];
const OVERLAY_BTN_SIZE = 20;
const OVERLAY_BTN_GAP = 4;
const TOOLTIP_MAP = {
  center: 'Center image',
  bgColor: 'Background color',
  frame: 'Choose frame',
  duplicate: 'Duplicate to next cell',
  delete: 'Remove image',
};

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
}

export function setGridLayout(layout) { gridLayout = layout; }
export function getScale() { return baseScale * viewZoom; }
export function getViewZoom() { return viewZoom; }
export function setHoveredOverlay(action) { hoveredOverlay = action; }

export function getCellSizePx() {
  if (!gridLayout) return 0;
  return gridLayout.cellSizeMm * baseScale * viewZoom;
}

export function setViewZoom(z) {
  viewZoom = z;
  clampPan();
}

export function setViewPan(px, py) {
  viewPanX = px;
  viewPanY = py;
  clampPan();
}

export function adjustPan(dx, dy) {
  viewPanX += dx;
  viewPanY += dy;
  clampPan();
}

export function resetView() {
  viewZoom = 1;
  viewPanX = 0;
  viewPanY = 0;
}

export function getMaxZoom() {
  if (!canvas || !gridLayout) return 10;
  const container = canvas.parentElement;
  const availW = container.clientWidth - 80;
  const availH = container.clientHeight - 80;
  const cellMm = gridLayout.cellSizeMm;
  return Math.min(availW / (cellMm * baseScale), availH / (cellMm * baseScale));
}

function clampPan() {
  if (!canvas || !gridLayout) return;
  const container = canvas.parentElement;
  const s = baseScale * viewZoom;
  const pageW = gridLayout.pageWidthMm * s;
  const pageH = gridLayout.pageHeightMm * s;
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  if (pageW <= cw) { viewPanX = 0; }
  else {
    const maxPan = (pageW - cw) / 2;
    viewPanX = Math.max(-maxPan, Math.min(maxPan, viewPanX));
  }
  if (pageH <= ch) { viewPanY = 0; }
  else {
    const maxPan = (pageH - ch) / 2;
    viewPanY = Math.max(-maxPan, Math.min(maxPan, viewPanY));
  }
}

export function render() {
  if (!canvas || !ctx || !gridLayout) return;

  const dpr = window.devicePixelRatio || 1;
  const container = canvas.parentElement;
  const cw = container.clientWidth;
  const ch = container.clientHeight;

  // Calculate base scale to fit page in viewport
  const padding = 40;
  const scaleX = (cw - padding * 2) / gridLayout.pageWidthMm;
  const scaleY = (ch - padding * 2) / gridLayout.pageHeightMm;
  baseScale = Math.min(scaleX, scaleY);

  const s = baseScale * viewZoom;
  const pageW = gridLayout.pageWidthMm * s;
  const pageH = gridLayout.pageHeightMm * s;

  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background
  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(0, 0, cw, ch);

  // Page position
  const pageX = (cw - pageW) / 2 + viewPanX;
  const pageY = (ch - pageH) / 2 + viewPanY;

  // Page shadow + background
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = PAGE_BG_COLOR;
  ctx.fillRect(pageX, pageY, pageW, pageH);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.save();
  ctx.translate(pageX, pageY);

  const state = getState();

  // Draw cells
  gridLayout.cells.forEach((cellLayout, i) => {
    const cell = state.cells[i];
    const x = cellLayout.xMm * s;
    const y = cellLayout.yMm * s;
    const w = cellLayout.widthMm * s;
    const h = cellLayout.heightMm * s;
    const isSelected = state.selectedCellIndex === i;

    ctx.save();

    // Clip
    ctx.beginPath();
    if (state.cellShape === 'circle') {
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.clip();

    // Cell background
    ctx.fillStyle = (cell && cell.bgColor) ? cell.bgColor : '#f0f0f0';
    ctx.fillRect(x, y, w, h);

    // Image
    if (cell && cell.image) {
      drawCellImage(ctx, cell, x, y, w, h);
    }

    // Frame
    if (cell && cell.frameId) {
      drawFrame(ctx, cell.frameId, x, y, w, h, state.cellShape);
    }

    ctx.restore();

    // Cell border
    ctx.beginPath();
    if (state.cellShape === 'circle') {
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.strokeStyle = isSelected ? CELL_SELECTED_COLOR : CELL_BORDER_COLOR;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();
  });

  // Cut lines
  if (state.cutLines && gridLayout.cutLinesV.length > 0) {
    ctx.save();
    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.lineWidth = CUT_LINE_WIDTH_PX;
    ctx.setLineDash(CUT_LINE_DASH);

    const gridTop = gridLayout.originYMm * s;
    const gridBottom = (gridLayout.originYMm + gridLayout.gridHeightMm) * s;
    gridLayout.cutLinesV.forEach(xMm => {
      const x = xMm * s;
      ctx.beginPath(); ctx.moveTo(x, gridTop); ctx.lineTo(x, gridBottom); ctx.stroke();
    });

    const gridLeft = gridLayout.originXMm * s;
    const gridRight = (gridLayout.originXMm + gridLayout.gridWidthMm) * s;
    gridLayout.cutLinesH.forEach(yMm => {
      const y = yMm * s;
      ctx.beginPath(); ctx.moveTo(gridLeft, y); ctx.lineTo(gridRight, y); ctx.stroke();
    });
    ctx.restore();
  }

  // Overlay for selected cell
  if (state.selectedCellIndex >= 0) {
    const cl = gridLayout.cells[state.selectedCellIndex];
    if (cl) drawCellOverlay(ctx, cl, state.cells[state.selectedCellIndex], state.cellShape);
  }

  ctx.restore();
}

function drawCellImage(ctx, cell, x, y, w, h) {
  const img = cell.image;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const cellAspect = w / h;
  const sc = cell.imageScale;

  let drawW, drawH;
  if (imgAspect > cellAspect) {
    drawH = h * sc; drawW = drawH * imgAspect;
  } else {
    drawW = w * sc; drawH = drawW / imgAspect;
  }
  const s = baseScale * viewZoom;
  ctx.drawImage(img, x + (w - drawW) / 2 + cell.imageOffsetX * s, y + (h - drawH) / 2 + cell.imageOffsetY * s, drawW, drawH);
}

// ── Overlay buttons ────────────────────────────────

function getOverlayButtonX(rightX, idx) {
  const fromRight = OVERLAY_BUTTONS.length - 1 - idx;
  return rightX - (fromRight + 1) * OVERLAY_BTN_SIZE - fromRight * OVERLAY_BTN_GAP;
}

function drawCellOverlay(ctx, cellLayout, cell, shape) {
  if (!cell || !cell.image) return;
  const s = baseScale * viewZoom;
  const x = cellLayout.xMm * s;
  const y = cellLayout.yMm * s;
  const w = cellLayout.widthMm * s;
  const rightX = x + w;
  const btnY = y - OVERLAY_BTN_SIZE - 4;

  // Center
  drawOverlayBtn(ctx, getOverlayButtonX(rightX, 0), btnY, '⊙', '#888888', hoveredOverlay === 'center');
  // BgColor swatch
  drawOverlayColorBtn(ctx, getOverlayButtonX(rightX, 1), btnY, cell.bgColor || '#ffffff', hoveredOverlay === 'bgColor');
  // Frame
  drawOverlayFrameBtn(ctx, getOverlayButtonX(rightX, 2), btnY, !!cell.frameId, hoveredOverlay === 'frame');
  // Duplicate
  drawOverlayBtn(ctx, getOverlayButtonX(rightX, 3), btnY, '⧉', '#4a9eff', hoveredOverlay === 'duplicate');
  // Delete
  drawOverlayBtn(ctx, getOverlayButtonX(rightX, 4), btnY, '✕', '#ff4a4a', hoveredOverlay === 'delete');

  // Tooltip
  if (hoveredOverlay && TOOLTIP_MAP[hoveredOverlay]) {
    const idx = OVERLAY_BUTTONS.indexOf(hoveredOverlay);
    if (idx >= 0) {
      const bx = getOverlayButtonX(rightX, idx);
      drawTooltip(ctx, bx + OVERLAY_BTN_SIZE / 2, btnY - 4, TOOLTIP_MAP[hoveredOverlay]);
    }
  }
}

function drawOverlayBtn(ctx, x, y, label, color, hovered) {
  ctx.fillStyle = color;
  ctx.globalAlpha = hovered ? 1 : 0.75;
  ctx.beginPath();
  ctx.roundRect(x, y, OVERLAY_BTN_SIZE, OVERLAY_BTN_SIZE, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + OVERLAY_BTN_SIZE / 2, y + OVERLAY_BTN_SIZE / 2);
}

function drawOverlayColorBtn(ctx, x, y, swatchColor, hovered) {
  ctx.fillStyle = '#444444';
  ctx.globalAlpha = hovered ? 1 : 0.75;
  ctx.beginPath();
  ctx.roundRect(x, y, OVERLAY_BTN_SIZE, OVERLAY_BTN_SIZE, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  const ins = 4;
  ctx.fillStyle = swatchColor;
  ctx.beginPath();
  ctx.roundRect(x + ins, y + ins, OVERLAY_BTN_SIZE - ins * 2, OVERLAY_BTN_SIZE - ins * 2, 2);
  ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 0.5; ctx.stroke();
}

function drawOverlayFrameBtn(ctx, x, y, hasFrame, hovered) {
  ctx.fillStyle = hasFrame ? '#7b5ea7' : '#555555';
  ctx.globalAlpha = hovered ? 1 : 0.75;
  ctx.beginPath();
  ctx.roundRect(x, y, OVERLAY_BTN_SIZE, OVERLAY_BTN_SIZE, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Draw small frame icon
  const s = OVERLAY_BTN_SIZE;
  const cx = x + s / 2, cy = y + s / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 5, cy - 5, 10, 10);
  ctx.strokeRect(cx - 3, cy - 3, 6, 6);
}

function drawTooltip(ctx, cx, y, text) {
  ctx.font = '11px sans-serif';
  const metrics = ctx.measureText(text);
  const tw = metrics.width + 10;
  const th = 18;
  const tx = cx - tw / 2;
  const ty = y - th;

  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.beginPath();
  ctx.roundRect(tx, ty, tw, th, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, ty + th / 2);
}

// ── Hit testing ────────────────────────────────────

export function getPageOffset() {
  if (!canvas || !gridLayout) return { x: 0, y: 0 };
  const container = canvas.parentElement;
  const s = baseScale * viewZoom;
  const pageW = gridLayout.pageWidthMm * s;
  const pageH = gridLayout.pageHeightMm * s;
  return {
    x: (container.clientWidth - pageW) / 2 + viewPanX,
    y: (container.clientHeight - pageH) / 2 + viewPanY,
  };
}

export function hitTestCell(canvasX, canvasY) {
  if (!gridLayout) return -1;
  const offset = getPageOffset();
  const state = getState();
  const s = baseScale * viewZoom;

  for (let i = 0; i < gridLayout.cells.length; i++) {
    const cl = gridLayout.cells[i];
    const x = cl.xMm * s + offset.x;
    const y = cl.yMm * s + offset.y;
    const w = cl.widthMm * s;
    const h = cl.heightMm * s;

    if (state.cellShape === 'circle') {
      const cx = x + w / 2, cy = y + h / 2, r = w / 2;
      if (Math.sqrt((canvasX - cx) ** 2 + (canvasY - cy) ** 2) <= r) return i;
    } else {
      if (canvasX >= x && canvasX <= x + w && canvasY >= y && canvasY <= y + h) return i;
    }
  }
  return -1;
}

export function hitTestOverlay(canvasX, canvasY) {
  const state = getState();
  if (state.selectedCellIndex < 0) return null;
  const cell = state.cells[state.selectedCellIndex];
  if (!cell || !cell.image) return null;

  const cl = gridLayout.cells[state.selectedCellIndex];
  const offset = getPageOffset();
  const s = baseScale * viewZoom;
  const x = cl.xMm * s + offset.x;
  const y = cl.yMm * s + offset.y;
  const w = cl.widthMm * s;
  const rightX = x + w;
  const btnY = y - OVERLAY_BTN_SIZE - 4;

  for (let i = 0; i < OVERLAY_BUTTONS.length; i++) {
    const bx = getOverlayButtonX(rightX, i);
    if (canvasX >= bx && canvasX <= bx + OVERLAY_BTN_SIZE &&
        canvasY >= btnY && canvasY <= btnY + OVERLAY_BTN_SIZE) {
      return OVERLAY_BUTTONS[i];
    }
  }
  return null;
}
