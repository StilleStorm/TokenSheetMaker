// image-handler.js — Load images, drag & drop, file input

import { getState, setCellImage, selectCell } from './model.js';
import { hitTestCell } from './canvas-renderer.js';

let onChangeCallback = null;
let canvas = null;

export function initImageHandler(canvasEl, onChange) {
  canvas = canvasEl;
  onChangeCallback = onChange;

  // Drag & drop on canvas
  canvas.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  canvas.addEventListener('drop', onDrop);

  // File input
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const files = fileInput.files;
      if (files.length > 0) {
        loadImagesToSelectedOrNext(Array.from(files));
      }
      fileInput.value = '';
    });
  }

  // Add image button triggers file input
  const addBtn = document.getElementById('add-image-btn');
  if (addBtn && fileInput) {
    addBtn.addEventListener('click', () => fileInput.click());
  }
}

function onDrop(e) {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length === 0) return;

  // Determine which cell was dropped on
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cellIndex = hitTestCell(x, y);

  if (cellIndex >= 0) {
    selectCell(cellIndex);
    loadImageToCell(files[0], cellIndex).then(() => {
      // Load remaining files to subsequent cells
      for (let i = 1; i < files.length; i++) {
        const targetIndex = cellIndex + i;
        const state = getState();
        if (targetIndex < state.cells.length) {
          loadImageToCell(files[i], targetIndex);
        }
      }
    });
  } else {
    loadImagesToSelectedOrNext(files);
  }
}

function loadImagesToSelectedOrNext(files) {
  const state = getState();
  let startIndex = state.selectedCellIndex >= 0 ? state.selectedCellIndex : findFirstEmptyCell();
  if (startIndex < 0) startIndex = 0;

  files.forEach((file, i) => {
    const targetIndex = startIndex + i;
    if (targetIndex < state.cells.length) {
      loadImageToCell(file, targetIndex);
    }
  });
}

function findFirstEmptyCell() {
  const state = getState();
  return state.cells.findIndex(c => !c.image);
}

async function loadImageToCell(file, cellIndex) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    let imageType = file.type;
    let imageData = arrayBuffer;

    // Convert WebP to PNG for broader PDF compatibility
    if (imageType === 'image/webp') {
      const converted = await convertWebPToPNG(arrayBuffer);
      imageData = converted.data;
      imageType = 'image/png';
    }

    // Ensure we only use PNG or JPEG
    if (imageType !== 'image/png' && imageType !== 'image/jpeg') {
      const converted = await convertToPNG(arrayBuffer, imageType);
      imageData = converted.data;
      imageType = 'image/png';
    }

    const img = await createImageFromBuffer(arrayBuffer, file.type);
    setCellImage(cellIndex, img, imageData, imageType);
    if (onChangeCallback) onChangeCallback();
  } catch (err) {
    console.error('Failed to load image:', err);
  }
}

function createImageFromBuffer(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

async function convertWebPToPNG(arrayBuffer) {
  return convertToPNG(arrayBuffer, 'image/webp');
}

async function convertToPNG(arrayBuffer, mimeType) {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const bitmap = await createImageBitmap(blob);
  const cvs = document.createElement('canvas');
  cvs.width = bitmap.width;
  cvs.height = bitmap.height;
  const cctx = cvs.getContext('2d');
  cctx.drawImage(bitmap, 0, 0);
  const pngBlob = await new Promise(resolve => cvs.toBlob(resolve, 'image/png'));
  const data = await pngBlob.arrayBuffer();
  return { data, type: 'image/png' };
}

