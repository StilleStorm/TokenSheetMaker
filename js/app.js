// app.js — Entry point, initialization

import { getState, getPaperDimensions, initGrid } from './model.js';
import { calculateGrid } from './grid.js';
import { initRenderer, setGridLayout, render } from './canvas-renderer.js';
import { initControls } from './ui-controls.js';
import { initInteraction } from './cell-interaction.js';
import { initImageHandler } from './image-handler.js';
import { exportPDF } from './export-pdf.js';
import { exportImage } from './export-image.js';

function recalculate() {
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

  initGrid(grid.cols, grid.rows);
  setGridLayout(grid);

  // Update grid info display
  const info = document.getElementById('grid-info');
  if (info) {
    info.textContent = `${grid.cols} × ${grid.rows} cells (${grid.cols * grid.rows} total)`;
  }

  render();
}

function init() {
  const canvas = document.getElementById('sheet-canvas');
  initRenderer(canvas);
  initControls(recalculate);
  initInteraction(canvas, recalculate);
  initImageHandler(canvas, recalculate);

  // Export buttons
  const exportPDFBtn = document.getElementById('export-pdf');
  if (exportPDFBtn) {
    exportPDFBtn.addEventListener('click', async () => {
      exportPDFBtn.disabled = true;
      exportPDFBtn.textContent = 'Generating...';
      try {
        await exportPDF();
      } catch (err) {
        console.error('PDF export failed:', err);
        alert('PDF export failed: ' + err.message);
      }
      exportPDFBtn.disabled = false;
      exportPDFBtn.textContent = 'Export PDF';
    });
  }

  const exportPNGBtn = document.getElementById('export-png');
  if (exportPNGBtn) {
    exportPNGBtn.addEventListener('click', () => exportImage('png'));
  }

  const exportWebPBtn = document.getElementById('export-webp');
  if (exportWebPBtn) {
    exportWebPBtn.addEventListener('click', () => exportImage('webp'));
  }

  // Initial calculation
  recalculate();

  // Resize handler
  window.addEventListener('resize', () => {
    render();
  });
}

document.addEventListener('DOMContentLoaded', init);
