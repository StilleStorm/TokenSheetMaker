// grid.js — Pure math: grid layout calculation
// All inputs/outputs in mm

/**
 * Calculate grid layout from configuration.
 * @param {object} params
 * @param {number} params.pageWidthMm
 * @param {number} params.pageHeightMm
 * @param {number} params.cellSizeMm
 * @param {number} params.cutLineOffsetMm - offset on each side of cell for cut lines
 * @param {boolean} params.cutLines - whether cut lines are enabled
 * @param {number} params.marginMm
 * @returns {object} grid layout info
 */
export function calculateGrid({ pageWidthMm, pageHeightMm, cellSizeMm, cutLineOffsetMm, cutLines, marginMm }) {
  const offset = cutLines ? cutLineOffsetMm : 0;
  const cellPitch = cellSizeMm + 2 * offset;

  const usableWidth = pageWidthMm - 2 * marginMm;
  const usableHeight = pageHeightMm - 2 * marginMm;

  const cols = Math.max(1, Math.floor(usableWidth / cellPitch));
  const rows = Math.max(1, Math.floor(usableHeight / cellPitch));

  // Center the grid on the page
  const gridWidthMm = cols * cellPitch;
  const gridHeightMm = rows * cellPitch;
  const originXMm = (pageWidthMm - gridWidthMm) / 2;
  const originYMm = (pageHeightMm - gridHeightMm) / 2;

  // Cell positions (center of each cell in page coords, mm)
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellLeftMm = originXMm + c * cellPitch + offset;
      const cellTopMm = originYMm + r * cellPitch + offset;
      cells.push({
        row: r,
        col: c,
        xMm: cellLeftMm,
        yMm: cellTopMm,
        widthMm: cellSizeMm,
        heightMm: cellSizeMm,
      });
    }
  }

  // Cut lines positions (in mm from page edge)
  const cutLinesH = []; // horizontal lines
  const cutLinesV = []; // vertical lines

  if (cutLines) {
    // Vertical cut lines
    for (let c = 0; c <= cols; c++) {
      const x = originXMm + c * cellPitch;
      // Left side of gap
      if (c > 0) {
        cutLinesV.push(x);
      }
      // Right side of gap
      if (c < cols) {
        cutLinesV.push(x);
      }
    }

    // Horizontal cut lines
    for (let r = 0; r <= rows; r++) {
      const y = originYMm + r * cellPitch;
      if (r > 0) {
        cutLinesH.push(y);
      }
      if (r < rows) {
        cutLinesH.push(y);
      }
    }

    // Actually, the cut lines should be at the edges of each cell.
    // Each cell goes from (originX + c*pitch + offset) to (originX + c*pitch + offset + cellSize)
    // Cut lines are at: originX + c*pitch (left of gap) and originX + c*pitch + 2*offset + cellSize... no
    // Let me reconsider: pitch = cellSize + 2*offset
    // Cell area: [originX + c*pitch + offset, originX + (c+1)*pitch - offset]
    // Cut lines at: originX + c*pitch + offset (left edge) and originX + c*pitch + offset + cellSize (right edge)
    // Which is the same as: cellLeft and cellLeft + cellSize
    cutLinesV.length = 0;
    cutLinesH.length = 0;

    for (let c = 0; c < cols; c++) {
      const left = originXMm + c * cellPitch + offset;
      const right = left + cellSizeMm;
      if (!cutLinesV.includes(left)) cutLinesV.push(left);
      if (!cutLinesV.includes(right)) cutLinesV.push(right);
    }
    for (let r = 0; r < rows; r++) {
      const top = originYMm + r * cellPitch + offset;
      const bottom = top + cellSizeMm;
      if (!cutLinesH.includes(top)) cutLinesH.push(top);
      if (!cutLinesH.includes(bottom)) cutLinesH.push(bottom);
    }
  }

  return {
    cols,
    rows,
    cellPitch,
    cellSizeMm,
    gridWidthMm,
    gridHeightMm,
    originXMm,
    originYMm,
    cells,
    cutLinesH: cutLines ? cutLinesH : [],
    cutLinesV: cutLines ? cutLinesV : [],
    pageWidthMm,
    pageHeightMm,
  };
}
