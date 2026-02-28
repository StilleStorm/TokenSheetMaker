// config.js — Constants, paper sizes, unit conversions

export const MM_TO_PT = 72 / 25.4;
export const MM_TO_PX_96DPI = 96 / 25.4;
export const MM_TO_PX_300DPI = 300 / 25.4;

export const PAPER_SIZES = {
  A4:     { name: 'A4',     widthMm: 210,   heightMm: 297   },
  A3:     { name: 'A3',     widthMm: 297,   heightMm: 420   },
  Letter: { name: 'Letter', widthMm: 215.9, heightMm: 279.4 },
  Legal:  { name: 'Legal',  widthMm: 215.9, heightMm: 355.6 },
};

export const DEFAULTS = {
  paperSize: 'A4',
  cellSizeMm: 25.4,       // 1 inch
  cellShape: 'circle',     // 'square' | 'circle'
  cutLines: true,
  cutLineOffsetMm: 1,
  marginMm: 5,
};

// Standard TTRPG token sizes (D&D 5e / Pathfinder grid = 1 inch = 25.4mm per square)
export const TOKEN_PRESETS = {
  Tiny:       { name: 'Tiny (½")',       sizeMm: 12.7  },  // 0.5 inch
  Small:      { name: 'Small (1")',      sizeMm: 25.4  },  // 1 inch
  Medium:     { name: 'Medium (1")',     sizeMm: 25.4  },  // 1 inch
  Large:      { name: 'Large (2")',      sizeMm: 50.8  },  // 2 inch
  Huge:       { name: 'Huge (3")',       sizeMm: 76.2  },  // 3 inch
  Gargantuan: { name: 'Gargantuan (4")', sizeMm: 101.6 },  // 4 inch
};

export const IMAGE_SCALE_MIN = 0.5;
export const IMAGE_SCALE_MAX = 3.0;
export const IMAGE_SCALE_STEP = 0.05;

export const CUT_LINE_COLOR = '#888888';
export const CUT_LINE_DASH = [4, 4];
export const CUT_LINE_WIDTH_PX = 1;

export const CELL_BORDER_COLOR = '#555555';
export const CELL_SELECTED_COLOR = '#4a9eff';
export const CANVAS_BG_COLOR = '#1e1e1e';
export const PAGE_BG_COLOR = '#ffffff';
