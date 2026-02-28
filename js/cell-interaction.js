// cell-interaction.js — Mouse/touch: select, drag image, zoom, frame picker

import { getState, selectCell, moveCellImage, setCellImageScale, duplicateToNext,
         clearCell, centerCellImage, setCellBgColor, setCellFrame } from './model.js';
import { hitTestCell, hitTestOverlay, getScale, getViewZoom, getMaxZoom,
         setViewZoom, adjustPan, resetView, setHoveredOverlay, render } from './canvas-renderer.js';
import { IMAGE_SCALE_MIN, IMAGE_SCALE_MAX, IMAGE_SCALE_STEP } from './config.js';
import { getCategories, getFramesByCategory } from './frames.js';

let canvas = null;
let onChangeCallback = null;
let isDragging = false;
let isPanning = false;
let dragStartX = 0;
let dragStartY = 0;
let framePicker = null;

export function initInteraction(canvasEl, onChange) {
  canvas = canvasEl;
  onChangeCallback = onChange;

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('mousedown', onDocumentClick);

  // Zoom buttons
  document.getElementById('zoom-in')?.addEventListener('click', () => {
    zoomBy(0.2);
    fireChange();
  });
  document.getElementById('zoom-out')?.addEventListener('click', () => {
    zoomBy(-0.2);
    fireChange();
  });
  document.getElementById('zoom-reset')?.addEventListener('click', () => {
    resetView();
    fireChange();
  });
}

function zoomBy(delta) {
  const cur = getViewZoom();
  const max = getMaxZoom();
  setViewZoom(Math.max(1, Math.min(max, cur + delta)));
  updateZoomDisplay();
}

function updateZoomDisplay() {
  const el = document.getElementById('zoom-level');
  if (el) el.textContent = Math.round(getViewZoom() * 100) + '%';
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onMouseDown(e) {
  const { x, y } = getCanvasCoords(e);

  // Overlay buttons
  const action = hitTestOverlay(x, y);
  if (action) {
    handleOverlayAction(action);
    return;
  }

  // Middle mouse or Ctrl+click = pan
  if (e.button === 1 || (e.button === 0 && e.ctrlKey && getViewZoom() > 1)) {
    isPanning = true;
    dragStartX = x;
    dragStartY = y;
    canvas.style.cursor = 'move';
    e.preventDefault();
    return;
  }

  // Cell hit
  const cellIndex = hitTestCell(x, y);
  const state = getState();

  if (cellIndex >= 0) {
    selectCell(cellIndex);
    const cell = state.cells[cellIndex];
    if (cell && cell.image) {
      isDragging = true;
      dragStartX = x;
      dragStartY = y;
      canvas.style.cursor = 'grabbing';
    }
  } else {
    selectCell(-1);
    closeFramePicker();
    // Left-click on empty space while zoomed in = pan
    if (getViewZoom() > 1) {
      isPanning = true;
      dragStartX = x;
      dragStartY = y;
      canvas.style.cursor = 'move';
    }
  }
  fireChange();
}

function onMouseMove(e) {
  const { x, y } = getCanvasCoords(e);

  if (isPanning) {
    adjustPan(x - dragStartX, y - dragStartY);
    dragStartX = x;
    dragStartY = y;
    fireChange();
    return;
  }

  if (isDragging) {
    const s = getScale();
    moveCellImage(getState().selectedCellIndex, (x - dragStartX) / s, (y - dragStartY) / s);
    dragStartX = x;
    dragStartY = y;
    fireChange();
    return;
  }

  // Hover
  const overlay = hitTestOverlay(x, y);
  setHoveredOverlay(overlay);
  if (overlay) {
    canvas.style.cursor = 'pointer';
    render();
    return;
  }
  const cellIndex = hitTestCell(x, y);
  if (cellIndex >= 0) {
    const cell = getState().cells[cellIndex];
    canvas.style.cursor = cell && cell.image ? 'grab' : 'default';
  } else {
    canvas.style.cursor = getViewZoom() > 1 ? 'move' : 'default';
  }
  render();
}

function onMouseUp() {
  isDragging = false;
  isPanning = false;
  canvas.style.cursor = 'default';
}

function onWheel(e) {
  e.preventDefault();
  const { x, y } = getCanvasCoords(e);

  // Ctrl+wheel = sheet zoom
  if (e.ctrlKey) {
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    zoomBy(delta);
    fireChange();
    return;
  }

  // Wheel on cell = image scale
  const cellIndex = hitTestCell(x, y);
  if (cellIndex < 0) {
    // Wheel on empty = sheet zoom
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomBy(delta);
    fireChange();
    return;
  }

  const cell = getState().cells[cellIndex];
  if (!cell || !cell.image) return;

  const delta = e.deltaY > 0 ? -IMAGE_SCALE_STEP : IMAGE_SCALE_STEP;
  setCellImageScale(cellIndex, Math.max(IMAGE_SCALE_MIN, Math.min(IMAGE_SCALE_MAX, cell.imageScale + delta)));
  fireChange();
}

// Touch
function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  onMouseDown({ clientX: t.clientX, clientY: t.clientY, button: 0, ctrlKey: false, preventDefault() {} });
  e.preventDefault();
}
function onTouchMove(e) {
  if (e.touches.length !== 1) return;
  onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  e.preventDefault();
}
function onTouchEnd() { onMouseUp(); }

function onKeyDown(e) {
  const state = getState();
  if (state.selectedCellIndex < 0) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { clearCell(state.selectedCellIndex); fireChange(); }
  if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const r = duplicateToNext(state.selectedCellIndex);
    if (r >= 0) selectCell(r);
    fireChange();
  }
  if (e.key === 'Escape') { selectCell(-1); closeFramePicker(); fireChange(); }
}

function onDocumentClick(e) {
  if (framePicker && !framePicker.contains(e.target) && !canvas.contains(e.target)) {
    closeFramePicker();
  }
}

// ── Overlay actions ────────────────────────────────

function handleOverlayAction(action) {
  const state = getState();
  const idx = state.selectedCellIndex;
  if (idx < 0) return;

  switch (action) {
    case 'center':
      centerCellImage(idx);
      fireChange();
      break;
    case 'bgColor':
      openColorPicker(idx);
      break;
    case 'frame':
      toggleFramePicker(idx);
      break;
    case 'duplicate': {
      const r = duplicateToNext(idx);
      if (r >= 0) selectCell(r);
      fireChange();
      break;
    }
    case 'delete':
      clearCell(idx);
      closeFramePicker();
      fireChange();
      break;
  }
}

function openColorPicker(cellIndex) {
  let picker = document.getElementById('cell-bg-picker');
  if (!picker) {
    picker = document.createElement('input');
    picker.type = 'color';
    picker.id = 'cell-bg-picker';
    picker.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
    document.body.appendChild(picker);
  }
  const cell = getState().cells[cellIndex];
  picker.value = cell ? cell.bgColor : '#ffffff';
  picker.oninput = () => { setCellBgColor(cellIndex, picker.value); fireChange(); };
  picker.click();
}

// ── Frame picker ───────────────────────────────────

function toggleFramePicker(cellIndex) {
  if (framePicker) { closeFramePicker(); return; }
  showFramePicker(cellIndex);
}

function closeFramePicker() {
  if (framePicker) { framePicker.remove(); framePicker = null; }
}

function showFramePicker(cellIndex) {
  closeFramePicker();
  const cell = getState().cells[cellIndex];
  if (!cell) return;

  const panel = document.createElement('div');
  panel.className = 'frame-picker';

  // "None" option
  const noneBtn = document.createElement('div');
  noneBtn.className = 'frame-option' + (!cell.frameId ? ' active' : '');
  noneBtn.innerHTML = '<div class="frame-preview frame-none">✕</div><span>None</span>';
  noneBtn.addEventListener('click', () => {
    setCellFrame(cellIndex, null);
    closeFramePicker();
    fireChange();
  });
  panel.appendChild(noneBtn);

  // Categories
  for (const cat of getCategories()) {
    const header = document.createElement('div');
    header.className = 'frame-category-header';
    header.textContent = cat.name;
    panel.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'frame-option-grid';

    for (const frame of getFramesByCategory(cat.id)) {
      const opt = document.createElement('div');
      opt.className = 'frame-option' + (cell.frameId === frame.id ? ' active' : '');
      opt.title = frame.name;

      // Mini preview canvas
      const cvs = document.createElement('canvas');
      cvs.width = 48; cvs.height = 48;
      cvs.className = 'frame-preview-canvas';
      const pctx = cvs.getContext('2d');

      // Draw preview: gray bg circle/square + frame
      const shape = getState().cellShape;
      pctx.fillStyle = '#555';
      pctx.beginPath();
      if (shape === 'circle') pctx.arc(24, 24, 22, 0, Math.PI * 2);
      else pctx.rect(2, 2, 44, 44);
      pctx.fill();

      // Draw a gradient to simulate an image
      const grd = pctx.createRadialGradient(24, 24, 4, 24, 24, 22);
      grd.addColorStop(0, '#8899aa');
      grd.addColorStop(1, '#445566');
      pctx.fillStyle = grd;
      pctx.fill();

      // Clip & draw frame
      pctx.save();
      pctx.beginPath();
      if (shape === 'circle') pctx.arc(24, 24, 22, 0, Math.PI * 2);
      else pctx.rect(2, 2, 44, 44);
      pctx.clip();
      frame.draw(pctx, 2, 2, 44, 44, shape);
      pctx.restore();

      opt.appendChild(cvs);
      const label = document.createElement('span');
      label.textContent = frame.name;
      opt.appendChild(label);

      opt.addEventListener('click', () => {
        setCellFrame(cellIndex, frame.id);
        closeFramePicker();
        fireChange();
      });
      grid.appendChild(opt);
    }
    panel.appendChild(grid);
  }

  // Position
  const container = canvas.parentElement;
  container.appendChild(panel);
  framePicker = panel;
}

function fireChange() {
  updateZoomDisplay();
  if (onChangeCallback) onChangeCallback();
}
