// ui-controls.js — Bind sidebar/toolbar controls to model

import { PAPER_SIZES, DEFAULTS, TOKEN_PRESETS } from './config.js';
import { getState, setPaperSize, setCellSizeMm, setCellShape, setCutLines, setCutLineOffsetMm, clearAll } from './model.js';

let onChangeCallback = null;

export function initControls(onChange) {
  onChangeCallback = onChange;

  // Paper size
  const paperSelect = document.getElementById('paper-size');
  Object.keys(PAPER_SIZES).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = PAPER_SIZES[key].name;
    paperSelect.appendChild(opt);
  });
  paperSelect.value = DEFAULTS.paperSize;
  paperSelect.addEventListener('change', () => {
    setPaperSize(paperSelect.value);
    fireChange();
  });

  // Token size preset
  const presetSelect = document.getElementById('token-preset');
  const customOption = document.createElement('option');
  customOption.value = 'custom';
  customOption.textContent = 'Custom';
  presetSelect.appendChild(customOption);
  Object.keys(TOKEN_PRESETS).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = TOKEN_PRESETS[key].name;
    presetSelect.appendChild(opt);
  });
  // Set initial selection based on default cell size
  const matchingPreset = Object.keys(TOKEN_PRESETS).find(k => TOKEN_PRESETS[k].sizeMm === DEFAULTS.cellSizeMm);
  presetSelect.value = matchingPreset || 'custom';

  presetSelect.addEventListener('change', () => {
    const key = presetSelect.value;
    if (key !== 'custom' && TOKEN_PRESETS[key]) {
      const size = TOKEN_PRESETS[key].sizeMm;
      setCellSizeMm(size);
      cellSizeInput.value = size;
      cellSizeValue.textContent = size + ' mm';
      fireChange();
    }
  });

  // Cell size (manual input)
  const cellSizeInput = document.getElementById('cell-size');
  const cellSizeValue = document.getElementById('cell-size-value');
  cellSizeInput.value = DEFAULTS.cellSizeMm;
  cellSizeValue.textContent = DEFAULTS.cellSizeMm + ' mm';
  cellSizeInput.addEventListener('input', () => {
    const val = parseFloat(cellSizeInput.value);
    if (val > 0) {
      setCellSizeMm(val);
      cellSizeValue.textContent = val + ' mm';
      // Update preset selector to "Custom" if value doesn't match any preset
      const match = Object.keys(TOKEN_PRESETS).find(k => TOKEN_PRESETS[k].sizeMm === val);
      presetSelect.value = match || 'custom';
      fireChange();
    }
  });

  // Cell shape
  const shapeRadios = document.querySelectorAll('input[name="cell-shape"]');
  shapeRadios.forEach(radio => {
    if (radio.value === DEFAULTS.cellShape) radio.checked = true;
    radio.addEventListener('change', () => {
      setCellShape(radio.value);
      fireChange();
    });
  });

  // Cut lines toggle
  const cutLinesCheck = document.getElementById('cut-lines');
  cutLinesCheck.checked = DEFAULTS.cutLines;
  cutLinesCheck.addEventListener('change', () => {
    setCutLines(cutLinesCheck.checked);
    document.getElementById('cut-line-offset-group').style.display = cutLinesCheck.checked ? '' : 'none';
    fireChange();
  });

  // Cut line offset
  const cutOffsetInput = document.getElementById('cut-line-offset');
  const cutOffsetValue = document.getElementById('cut-line-offset-value');
  cutOffsetInput.value = DEFAULTS.cutLineOffsetMm;
  cutOffsetValue.textContent = DEFAULTS.cutLineOffsetMm + ' mm';
  cutOffsetInput.addEventListener('input', () => {
    const val = parseFloat(cutOffsetInput.value);
    if (val >= 0) {
      setCutLineOffsetMm(val);
      cutOffsetValue.textContent = val + ' mm';
      fireChange();
    }
  });

  // Clear all button
  const clearBtn = document.getElementById('clear-all');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all images from the sheet?')) {
        clearAll();
        fireChange();
      }
    });
  }

  // Export buttons are bound in app.js
}

function fireChange() {
  if (onChangeCallback) onChangeCallback();
}
