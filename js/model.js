// model.js — Data model: sheet state, cells, images

import { PAPER_SIZES, DEFAULTS } from './config.js';

function createCell(row, col) {
  return {
    row,
    col,
    image: null,          // HTMLImageElement (for canvas rendering)
    imageData: null,      // ArrayBuffer (for PDF embedding)
    imageType: null,      // 'image/png' | 'image/jpeg'
    imageOffsetX: 0,      // px offset within cell (canvas coords)
    imageOffsetY: 0,
    imageScale: 1.0,
    bgColor: '#ffffff',   // background color shown when image doesn't cover cell
    frameId: null,        // decorative frame id (from frames.js) or null
  };
}

const state = {
  paperSize: DEFAULTS.paperSize,
  cellSizeMm: DEFAULTS.cellSizeMm,
  cellShape: DEFAULTS.cellShape,
  cutLines: DEFAULTS.cutLines,
  cutLineOffsetMm: DEFAULTS.cutLineOffsetMm,
  marginMm: DEFAULTS.marginMm,
  cells: [],
  rows: 0,
  cols: 0,
  selectedCellIndex: -1,
};

export function getState() {
  return state;
}

export function getPaperDimensions() {
  return PAPER_SIZES[state.paperSize];
}

export function setPaperSize(key) {
  state.paperSize = key;
}

export function setCellSizeMm(mm) {
  state.cellSizeMm = mm;
}

export function setCellShape(shape) {
  state.cellShape = shape;
}

export function setCutLines(enabled) {
  state.cutLines = enabled;
}

export function setCutLineOffsetMm(mm) {
  state.cutLineOffsetMm = mm;
}

export function initGrid(cols, rows) {
  state.cols = cols;
  state.rows = rows;
  const oldCells = state.cells;
  state.cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Preserve existing cell data if grid dimensions overlap
      const existing = oldCells.find(cell => cell.row === r && cell.col === c);
      if (existing) {
        state.cells.push(existing);
      } else {
        state.cells.push(createCell(r, c));
      }
    }
  }
  // Reset selection if out of range
  if (state.selectedCellIndex >= state.cells.length) {
    state.selectedCellIndex = -1;
  }
}

export function getCell(index) {
  return state.cells[index] || null;
}

export function getCellAt(row, col) {
  return state.cells.find(c => c.row === row && c.col === col) || null;
}

export function getCellIndex(row, col) {
  return state.cells.findIndex(c => c.row === row && c.col === col);
}

export function selectCell(index) {
  state.selectedCellIndex = index;
}

export function getSelectedCell() {
  if (state.selectedCellIndex < 0) return null;
  return state.cells[state.selectedCellIndex] || null;
}

export function setCellImage(index, image, imageData, imageType) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.image = image;
  cell.imageData = imageData;
  cell.imageType = imageType;
  cell.imageOffsetX = 0;
  cell.imageOffsetY = 0;
  cell.imageScale = 1.0;
}

export function moveCellImage(index, dx, dy) {
  const cell = state.cells[index];
  if (!cell || !cell.image) return;
  cell.imageOffsetX += dx;
  cell.imageOffsetY += dy;
}

export function setCellImageOffset(index, ox, oy) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.imageOffsetX = ox;
  cell.imageOffsetY = oy;
}

export function setCellImageScale(index, scale) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.imageScale = scale;
}

export function duplicateToNext(index) {
  const src = state.cells[index];
  if (!src || !src.image) return -1;
  const nextIndex = index + 1;
  if (nextIndex >= state.cells.length) return -1;
  const dst = state.cells[nextIndex];
  dst.image = src.image;
  dst.imageData = src.imageData;
  dst.imageType = src.imageType;
  dst.imageOffsetX = src.imageOffsetX;
  dst.imageOffsetY = src.imageOffsetY;
  dst.imageScale = src.imageScale;
  dst.bgColor = src.bgColor;
  dst.frameId = src.frameId;
  return nextIndex;
}

export function clearCell(index) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.image = null;
  cell.imageData = null;
  cell.imageType = null;
  cell.imageOffsetX = 0;
  cell.imageOffsetY = 0;
  cell.imageScale = 1.0;
  cell.bgColor = '#ffffff';
  cell.frameId = null;
}

export function setCellFrame(index, frameId) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.frameId = frameId;
}

export function setCellBgColor(index, color) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.bgColor = color;
}

export function centerCellImage(index) {
  const cell = state.cells[index];
  if (!cell) return;
  cell.imageOffsetX = 0;
  cell.imageOffsetY = 0;
}

export function clearAll() {
  state.cells.forEach((_, i) => clearCell(i));
  state.selectedCellIndex = -1;
}
