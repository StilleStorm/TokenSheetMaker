// frames.js — Decorative frame definitions and rendering
// 7 categories × 5 frames = 35 frames total

const CATEGORIES = [
  { id: 'fantasy',   name: 'Classic Fantasy' },
  { id: 'dark',      name: 'Dark & Horror' },
  { id: 'elemental', name: 'Elemental' },
  { id: 'scifi',     name: 'Sci-Fi & Cyber' },
  { id: 'anime',     name: 'Anime & Stylized' },
  { id: 'metal',     name: 'Metal & Material' },
  { id: 'minimal',   name: 'Minimal & Clean' },
];

const FRAMES = [

  // ══════════════════════════════════════════════════
  //  CLASSIC FANTASY
  // ══════════════════════════════════════════════════

  {
    id: 'gold-ornate', category: 'fantasy', name: 'Gold Ornate',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#c9a03c');
      grad.addColorStop(0.3, '#f0d67b');
      grad.addColorStop(0.5, '#ffe8a1');
      grad.addColorStop(0.7, '#f0d67b');
      grad.addColorStop(1, '#c9a03c');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#8b6914', p * 1, p * 7);
      drawCornerDots(ctx, x, y, w, h, shape, '#f0d67b', p * 2, p * 4.5);
    }
  },
  {
    id: 'celtic', category: 'fantasy', name: 'Celtic Weave',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const amp = p * 2.5;
      const strandW = p * 2;
      const crossings = 6;
      const steps = 360;
      const numCross = crossings * 2;
      const cx = x + w / 2, cy = y + h / 2;

      // Generate two interweaving strand paths
      function strandPoints(phase) {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const wave = Math.sin(t * crossings * Math.PI * 2 + phase) * amp;
          if (shape === 'circle') {
            const angle = t * Math.PI * 2;
            const r = w / 2 - p * 4 + wave;
            pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
          } else {
            const inset = p * 4;
            const pt = rectPerimeterPoint(x, y, w, h, inset, t, wave);
            pts.push(pt);
          }
        }
        return pts;
      }

      const strandA = strandPoints(0);
      const strandB = strandPoints(Math.PI);

      // Draw segments between crossings in alternating z-order
      for (let k = 0; k < numCross; k++) {
        const s = Math.max(0, Math.round((k / numCross) * steps) - 3);
        const e = Math.min(steps, Math.round(((k + 1) / numCross) * steps) + 3);

        const under = k % 2 === 0 ? strandB : strandA;
        const over  = k % 2 === 0 ? strandA : strandB;

        // Under strand: dark outline then fill
        drawStrandSeg(ctx, under, s, e, '#0a2e15', strandW + p * 1.8);
        drawStrandSeg(ctx, under, s, e, '#1a5c32', strandW);

        // Over strand: dark outline then fill
        drawStrandSeg(ctx, over, s, e, '#0a2e15', strandW + p * 1.8);
        drawStrandSeg(ctx, over, s, e, '#2d8e4f', strandW);
      }
    }
  },
  {
    id: 'royal', category: 'fantasy', name: 'Royal Crest',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#4a0e6b', p * 3.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#c9a03c', p * 1, p * 7);
      drawCornerDiamonds(ctx, x, y, w, h, shape, '#c9a03c', p * 3, p * 4.5);
    }
  },
  {
    id: 'silver-filigree', category: 'fantasy', name: 'Silver Filigree',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#8a9bae');
      grad.addColorStop(0.3, '#c8d6e5');
      grad.addColorStop(0.5, '#eaf0f6');
      grad.addColorStop(0.7, '#c8d6e5');
      grad.addColorStop(1, '#8a9bae');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 2.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#a0b4c8', p * 0.8, p * 6);
      drawCornerDots(ctx, x, y, w, h, shape, '#dde6ef', p * 1.5, p * 4);
      drawCardinalDots(ctx, x, y, w, h, shape, '#c8d6e5', p * 1, p * 4);
    }
  },
  {
    id: 'runic', category: 'fantasy', name: 'Runic Circle',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#5599ff';
      ctx.shadowBlur = p * 4;
      strokeBorder(ctx, x, y, w, h, shape, '#2a4a7a', p * 2.5, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#6699cc', p * 0.8, p * 6);
      drawRuneMarks(ctx, x, y, w, h, shape, '#88bbee', p * 1.5, p * 3.5, 16);
    }
  },

  // ══════════════════════════════════════════════════
  //  DARK & HORROR
  // ══════════════════════════════════════════════════

  {
    id: 'gothic', category: 'dark', name: 'Gothic',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#6a0dad';
      ctx.shadowBlur = p * 4;
      strokeBorder(ctx, x, y, w, h, shape, '#1a1a2e', p * 4, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#3d1f5c', p * 1, p * 2);
      drawCornerSpikes(ctx, x, y, w, h, shape, '#1a1a2e', p * 5, p * 2);
    }
  },
  {
    id: 'bone', category: 'dark', name: 'Bone',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#3d2b1f', p * 4, p * 1.5);
      strokeBorder(ctx, x, y, w, h, shape, '#d4c5a0', p * 2.5, p * 3);
      drawCornerDots(ctx, x, y, w, h, shape, '#d4c5a0', p * 3, p * 3);
      drawCornerDots(ctx, x, y, w, h, shape, '#3d2b1f', p * 1.5, p * 3);
    }
  },
  {
    id: 'eldritch', category: 'dark', name: 'Eldritch',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = p * 6;
      strokeBorder(ctx, x, y, w, h, shape, '#2d0a4e', p * 3, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#00ff88', p * 1, p * 6);
      drawWavyBorder(ctx, x, y, w, h, shape, '#00ff8844', p * 1.5, p * 3, 12);
    }
  },
  {
    id: 'thorns', category: 'dark', name: 'Thorns',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#2a0a0a', p * 3, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#5c1a1a', p * 1, p * 2);
      // Inward-pointing thorns
      drawSpikes(ctx, x, y, w, h, shape, '#3a0e0e', p * 4, p * 2, 20, true);
      drawCornerDots(ctx, x, y, w, h, shape, '#8b0000', p * 1.5, p * 3.5);
    }
  },
  {
    id: 'infernal', category: 'dark', name: 'Infernal',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#8b0000');
      grad.addColorStop(0.5, '#ff4500');
      grad.addColorStop(1, '#8b0000');
      ctx.save();
      ctx.shadowColor = '#ff2200';
      ctx.shadowBlur = p * 6;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#ff660044', p * 1.5, p * 6);
      drawSpikes(ctx, x, y, w, h, shape, '#ff440066', p * 5, p * 1.5, 14);
    }
  },

  // ══════════════════════════════════════════════════
  //  ELEMENTAL
  // ══════════════════════════════════════════════════

  {
    id: 'fire', category: 'elemental', name: 'Fire',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y + h, x, y);
      grad.addColorStop(0, '#ff2200');
      grad.addColorStop(0.4, '#ff6600');
      grad.addColorStop(0.7, '#ffaa00');
      grad.addColorStop(1, '#ffdd44');
      ctx.save();
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = p * 5;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      ctx.restore();
      drawSpikes(ctx, x, y, w, h, shape, '#ff660088', p * 5, p * 1.5, 16);
      drawSpikes(ctx, x, y, w, h, shape, '#ffaa0044', p * 3, p * 1, 16, false, Math.PI / 16);
    }
  },
  {
    id: 'ice', category: 'elemental', name: 'Ice',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#88ccee');
      grad.addColorStop(0.3, '#cceeff');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(0.7, '#cceeff');
      grad.addColorStop(1, '#88ccee');
      ctx.save();
      ctx.shadowColor = '#66ccff';
      ctx.shadowBlur = p * 4;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 2.5, p * 2.5);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#aaddff55', p * 1, p * 6);
      drawCrystalCorners(ctx, x, y, w, h, shape, '#cceeFF', p * 4, p * 3);
    }
  },
  {
    id: 'lightning', category: 'elemental', name: 'Lightning',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = p * 6;
      strokeBorder(ctx, x, y, w, h, shape, '#2244aa', p * 2.5, p * 2.5);
      ctx.restore();
      drawZigzagBorder(ctx, x, y, w, h, shape, '#66aaff', p * 1.5, p * 4, 24, p * 2);
      ctx.save();
      ctx.shadowColor = '#88ccff';
      ctx.shadowBlur = p * 3;
      drawZigzagBorder(ctx, x, y, w, h, shape, '#aaddff', p * 0.8, p * 4, 24, p * 2);
      ctx.restore();
    }
  },
  {
    id: 'nature', category: 'elemental', name: 'Nature',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y + h, x, y);
      grad.addColorStop(0, '#2d5a1e');
      grad.addColorStop(0.5, '#4a8c3f');
      grad.addColorStop(1, '#6aaa55');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#2d5a1e', p * 0.8, p * 6.5);
      drawLeafDecorations(ctx, x, y, w, h, shape, '#5a9e48', p * 4, p * 3.5);
    }
  },
  {
    id: 'water', category: 'elemental', name: 'Water',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#1a5276');
      grad.addColorStop(0.5, '#2e86c1');
      grad.addColorStop(1, '#1a5276');
      ctx.save();
      ctx.shadowColor = '#2288cc';
      ctx.shadowBlur = p * 3;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      ctx.restore();
      drawWavyBorder(ctx, x, y, w, h, shape, '#5dade2', p * 1.5, p * 4, 10);
      drawWavyBorder(ctx, x, y, w, h, shape, '#85c1e955', p * 1, p * 5.5, 10);
    }
  },

  // ══════════════════════════════════════════════════
  //  SCI-FI & CYBER
  // ══════════════════════════════════════════════════

  {
    id: 'hud', category: 'scifi', name: 'HUD Interface',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      drawCornerBrackets(ctx, x, y, w, h, shape, '#00e5ff', p * 1.5, p * 3, w * 0.25);
      drawTickMarks(ctx, x, y, w, h, shape, '#00e5ff88', p * 1, p * 3, 8);
    }
  },
  {
    id: 'neon', category: 'scifi', name: 'Neon Glow',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = p * 8;
      strokeBorder(ctx, x, y, w, h, shape, '#ff00ff', p * 2, p * 3);
      ctx.restore();
      ctx.save();
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = p * 4;
      strokeBorder(ctx, x, y, w, h, shape, '#ff88ff', p * 1, p * 5);
      ctx.restore();
    }
  },
  {
    id: 'matrix', category: 'scifi', name: 'Digital Grid',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#00ff41', p * 1.5, p * 2);
      drawScanLines(ctx, x, y, w, h, '#00ff4122', p * 2);
      drawCornerBrackets(ctx, x, y, w, h, shape, '#00ff41', p * 1, p * 2, w * 0.15);
    }
  },
  {
    id: 'hextech', category: 'scifi', name: 'Hex Tech',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#00ccff';
      ctx.shadowBlur = p * 3;
      strokeBorder(ctx, x, y, w, h, shape, '#004466', p * 3, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#00ccff', p * 1, p * 2);
      drawHexPattern(ctx, x, y, w, h, shape, '#00ccff66', p * 1, p * 3, p * 5);
    }
  },
  {
    id: 'holographic', category: 'scifi', name: 'Holographic',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#ff0088');
      grad.addColorStop(0.2, '#ff8800');
      grad.addColorStop(0.4, '#ffff00');
      grad.addColorStop(0.6, '#00ff88');
      grad.addColorStop(0.8, '#0088ff');
      grad.addColorStop(1, '#8800ff');
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = p * 3;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 2.5, p * 2.5);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#ffffff44', p * 0.8, p * 6);
    }
  },

  // ══════════════════════════════════════════════════
  //  ANIME & STYLIZED
  // ══════════════════════════════════════════════════

  {
    id: 'sakura', category: 'anime', name: 'Sakura',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = p * 3;
      strokeBorder(ctx, x, y, w, h, shape, '#ff69b4', p * 2, p * 3);
      ctx.restore();
      drawPetals(ctx, x, y, w, h, shape, '#ffb7d5', p * 3, p * 3, 8);
    }
  },
  {
    id: 'energy', category: 'anime', name: 'Power Aura',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#ff6b00');
      grad.addColorStop(0.5, '#ffd700');
      grad.addColorStop(1, '#ff6b00');
      ctx.save();
      ctx.shadowColor = '#ff8c00';
      ctx.shadowBlur = p * 6;
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      ctx.restore();
      drawSpikes(ctx, x, y, w, h, shape, '#ffd70088', p * 4, p * 2, 16);
    }
  },
  {
    id: 'kawaii', category: 'anime', name: 'Pastel Dream',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#ffb3d9');
      grad.addColorStop(0.25, '#b3d9ff');
      grad.addColorStop(0.5, '#b3ffb3');
      grad.addColorStop(0.75, '#ffffb3');
      grad.addColorStop(1, '#ffb3d9');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 4, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#ffffff88', p * 1.5, p * 7);
      drawCornerStars(ctx, x, y, w, h, shape, '#ffffff', p * 3, p * 4);
    }
  },
  {
    id: 'crystal', category: 'anime', name: 'Crystal',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#9b59b6');
      grad.addColorStop(0.3, '#d2b4de');
      grad.addColorStop(0.5, '#f0e0ff');
      grad.addColorStop(0.7, '#d2b4de');
      grad.addColorStop(1, '#9b59b6');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#ffffff33', p * 1, p * 6);
      drawCrystalCorners(ctx, x, y, w, h, shape, '#d2b4de', p * 4, p * 3);
      drawCornerDots(ctx, x, y, w, h, shape, '#ffffff99', p * 1.2, p * 2);
    }
  },
  {
    id: 'starlight', category: 'anime', name: 'Starlight',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#aaaaff';
      ctx.shadowBlur = p * 4;
      strokeBorder(ctx, x, y, w, h, shape, '#1a1a4e', p * 3.5, p * 2);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#3333aa', p * 0.8, p * 6.5);
      // Stars at corners and cardinals
      drawCornerStars(ctx, x, y, w, h, shape, '#eeeeff', p * 2.5, p * 4);
      drawCardinalStars(ctx, x, y, w, h, shape, '#ccccff', p * 1.8, p * 4);
    }
  },

  // ══════════════════════════════════════════════════
  //  METAL & MATERIAL
  // ══════════════════════════════════════════════════

  {
    id: 'metal-gold', category: 'metal', name: 'Gold',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
      grad.addColorStop(0, '#b8860b');
      grad.addColorStop(0.2, '#daa520');
      grad.addColorStop(0.4, '#ffd700');
      grad.addColorStop(0.5, '#ffec8b');
      grad.addColorStop(0.6, '#ffd700');
      grad.addColorStop(0.8, '#daa520');
      grad.addColorStop(1, '#b8860b');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 4, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#8b6914aa', p * 0.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#8b6914aa', p * 0.5, p * 7);
    }
  },
  {
    id: 'metal-silver', category: 'metal', name: 'Silver',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
      grad.addColorStop(0, '#707070');
      grad.addColorStop(0.2, '#a0a0a0');
      grad.addColorStop(0.4, '#d0d0d0');
      grad.addColorStop(0.5, '#f0f0f0');
      grad.addColorStop(0.6, '#d0d0d0');
      grad.addColorStop(0.8, '#a0a0a0');
      grad.addColorStop(1, '#707070');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 4, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#50505088', p * 0.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#50505088', p * 0.5, p * 7);
    }
  },
  {
    id: 'metal-copper', category: 'metal', name: 'Copper',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
      grad.addColorStop(0, '#8b4513');
      grad.addColorStop(0.2, '#b87333');
      grad.addColorStop(0.4, '#da8a67');
      grad.addColorStop(0.5, '#e8a882');
      grad.addColorStop(0.6, '#da8a67');
      grad.addColorStop(0.8, '#b87333');
      grad.addColorStop(1, '#8b4513');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 4, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#6b331388', p * 0.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#6b331388', p * 0.5, p * 7);
    }
  },
  {
    id: 'metal-iron', category: 'metal', name: 'Iron',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
      grad.addColorStop(0, '#3a3a3a');
      grad.addColorStop(0.2, '#555555');
      grad.addColorStop(0.4, '#6a6a6a');
      grad.addColorStop(0.5, '#787878');
      grad.addColorStop(0.6, '#6a6a6a');
      grad.addColorStop(0.8, '#555555');
      grad.addColorStop(1, '#3a3a3a');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 4.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#22222288', p * 0.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#22222288', p * 0.5, p * 7.5);
      // Rivets
      drawCornerDots(ctx, x, y, w, h, shape, '#888888', p * 1.5, p * 4);
      drawCardinalDots(ctx, x, y, w, h, shape, '#888888', p * 1.2, p * 4);
    }
  },
  {
    id: 'metal-bronze', category: 'metal', name: 'Bronze',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      const grad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
      grad.addColorStop(0, '#6b4226');
      grad.addColorStop(0.2, '#8c6239');
      grad.addColorStop(0.4, '#cd7f32');
      grad.addColorStop(0.5, '#daa06d');
      grad.addColorStop(0.6, '#cd7f32');
      grad.addColorStop(0.8, '#8c6239');
      grad.addColorStop(1, '#6b4226');
      strokeBorder(ctx, x, y, w, h, shape, grad, p * 3.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#5a351588', p * 0.5, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#5a351588', p * 0.5, p * 7);
      drawCornerDiamonds(ctx, x, y, w, h, shape, '#cd7f32', p * 2.5, p * 4);
    }
  },

  // ══════════════════════════════════════════════════
  //  MINIMAL & CLEAN
  // ══════════════════════════════════════════════════

  {
    id: 'thin', category: 'minimal', name: 'Thin Border',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#ffffff', p * 1.5, p * 3);
    }
  },
  {
    id: 'double', category: 'minimal', name: 'Double Line',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#cccccc', p * 1, p * 2);
      strokeBorder(ctx, x, y, w, h, shape, '#cccccc', p * 1, p * 6);
    }
  },
  {
    id: 'elegant', category: 'minimal', name: 'Elegant',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      strokeBorder(ctx, x, y, w, h, shape, '#d4af37', p * 1, p * 4);
      drawCornerDiamonds(ctx, x, y, w, h, shape, '#d4af37', p * 2.5, p * 4);
    }
  },
  {
    id: 'shadow', category: 'minimal', name: 'Shadow Ring',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.save();
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = p * 6;
      ctx.shadowOffsetX = p * 1.5;
      ctx.shadowOffsetY = p * 1.5;
      strokeBorder(ctx, x, y, w, h, shape, '#444444', p * 3, p * 2.5);
      ctx.restore();
      strokeBorder(ctx, x, y, w, h, shape, '#666666', p * 1, p * 2.5);
    }
  },
  {
    id: 'dotted', category: 'minimal', name: 'Dotted',
    draw(ctx, x, y, w, h, shape) {
      const p = w * 0.012;
      ctx.setLineDash([p * 1.5, p * 2.5]);
      strokeBorder(ctx, x, y, w, h, shape, '#cccccc', p * 2, p * 3);
      ctx.setLineDash([]);
    }
  },
];

// ── Public API ─────────────────────────────────────

export function getCategories() { return CATEGORIES; }
export function getFrames() { return FRAMES; }
export function getFrameById(id) { return FRAMES.find(f => f.id === id) || null; }
export function getFramesByCategory(catId) { return FRAMES.filter(f => f.category === catId); }

export function drawFrame(ctx, frameId, x, y, w, h, shape) {
  const frame = getFrameById(frameId);
  if (!frame) return;
  ctx.save();
  frame.draw(ctx, x, y, w, h, shape);
  ctx.restore();
}

// ══════════════════════════════════════════════════
//  HELPER DRAWING FUNCTIONS
// ══════════════════════════════════════════════════

function strokeBorder(ctx, x, y, w, h, shape, color, lineWidth, inset) {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(x + w / 2, y + h / 2, w / 2 - inset, 0, Math.PI * 2);
  } else {
    ctx.roundRect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, Math.max(1, lineWidth * 0.5));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// ── Point helpers ──────────────────────────────────

function getCardinalPoints(x, y, w, h, shape, inset) {
  const cx = x + w / 2, cy = y + h / 2;
  if (shape === 'circle') {
    const r = w / 2 - inset;
    return [
      { x: cx, y: cy - r },
      { x: cx + r, y: cy },
      { x: cx, y: cy + r },
      { x: cx - r, y: cy },
    ];
  }
  return [
    { x: cx, y: y + inset },
    { x: x + w - inset, y: cy },
    { x: cx, y: y + h - inset },
    { x: x + inset, y: cy },
  ];
}

function getCornerPoints(x, y, w, h, shape, inset) {
  const cx = x + w / 2, cy = y + h / 2;
  if (shape === 'circle') {
    const r = w / 2 - inset;
    const d = r * Math.SQRT1_2;
    return [
      { x: cx - d, y: cy - d },
      { x: cx + d, y: cy - d },
      { x: cx + d, y: cy + d },
      { x: cx - d, y: cy + d },
    ];
  }
  return [
    { x: x + inset, y: y + inset },
    { x: x + w - inset, y: y + inset },
    { x: x + w - inset, y: y + h - inset },
    { x: x + inset, y: y + h - inset },
  ];
}

function get8Points(x, y, w, h, shape, inset) {
  return [
    ...getCornerPoints(x, y, w, h, shape, inset),
    ...getCardinalPoints(x, y, w, h, shape, inset),
  ];
}

// ── Corner/cardinal decorations ────────────────────

function drawCornerDots(ctx, x, y, w, h, shape, color, radius, inset) {
  ctx.fillStyle = color;
  for (const pt of getCornerPoints(x, y, w, h, shape, inset)) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCardinalDots(ctx, x, y, w, h, shape, color, radius, inset) {
  ctx.fillStyle = color;
  for (const pt of getCardinalPoints(x, y, w, h, shape, inset)) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCornerDiamonds(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.fillStyle = color;
  for (const pt of getCardinalPoints(x, y, w, h, shape, inset)) {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

function drawCornerStars(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.fillStyle = color;
  for (const pt of getCornerPoints(x, y, w, h, shape, inset)) {
    drawStar(ctx, pt.x, pt.y, size, 4);
  }
}

function drawCardinalStars(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.fillStyle = color;
  for (const pt of getCardinalPoints(x, y, w, h, shape, inset)) {
    drawStar(ctx, pt.x, pt.y, size, 4);
  }
}

function drawStar(ctx, cx, cy, r, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCornerSpikes(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.fillStyle = color;
  const pts = getCornerPoints(x, y, w, h, shape, inset);
  const cx = x + w / 2, cy = y + h / 2;
  for (const pt of pts) {
    const angle = Math.atan2(pt.y - cy, pt.x - cx);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.3);
    ctx.lineTo(size * 0.5, 0);
    ctx.lineTo(-size * 0.5, size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ── Brackets and ticks ─────────────────────────────

function drawCornerBrackets(ctx, x, y, w, h, shape, color, lineWidth, inset, len) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  if (shape === 'circle') {
    const cx = x + w / 2, cy = y + h / 2;
    const r = w / 2 - inset;
    const arcLen = len / r;
    const positions = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    for (const a of positions) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, a - arcLen / 2, a + arcLen / 2);
      ctx.stroke();
    }
  } else {
    const corners = [
      { x: x + inset, y: y + inset, dx: 1, dy: 1 },
      { x: x + w - inset, y: y + inset, dx: -1, dy: 1 },
      { x: x + w - inset, y: y + h - inset, dx: -1, dy: -1 },
      { x: x + inset, y: y + h - inset, dx: 1, dy: -1 },
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * len, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * len);
      ctx.stroke();
    }
  }
}

function drawTickMarks(ctx, x, y, w, h, shape, color, lineWidth, inset, count) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const tickLen = w * 0.02;
  const cx = x + w / 2, cy = y + h / 2;

  if (shape === 'circle') {
    const r = w / 2 - inset;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (r - tickLen), cy + Math.sin(a) * (r - tickLen));
      ctx.stroke();
    }
  } else {
    const step = (w - 2 * inset) / (count / 4);
    for (let side = 0; side < 4; side++) {
      for (let i = 1; i < count / 4; i++) {
        ctx.beginPath();
        if (side === 0) {
          ctx.moveTo(x + inset + i * step, y + inset);
          ctx.lineTo(x + inset + i * step, y + inset + tickLen);
        } else if (side === 1) {
          ctx.moveTo(x + w - inset, y + inset + i * step);
          ctx.lineTo(x + w - inset - tickLen, y + inset + i * step);
        } else if (side === 2) {
          ctx.moveTo(x + inset + i * step, y + h - inset);
          ctx.lineTo(x + inset + i * step, y + h - inset - tickLen);
        } else {
          ctx.moveTo(x + inset, y + inset + i * step);
          ctx.lineTo(x + inset + tickLen, y + inset + i * step);
        }
        ctx.stroke();
      }
    }
  }
}

// ── Rune marks ─────────────────────────────────────

function drawRuneMarks(ctx, x, y, w, h, shape, color, lineWidth, inset, count) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  const cx = x + w / 2, cy = y + h / 2;
  const tickLen = w * 0.035;
  const halfTick = tickLen / 2;

  if (shape === 'circle') {
    const r = w / 2 - inset;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      // Rune-like mark: main line + small cross or angle
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -halfTick);
      ctx.lineTo(0, halfTick);
      if (i % 3 === 0) {
        ctx.moveTo(-halfTick * 0.5, -halfTick * 0.3);
        ctx.lineTo(halfTick * 0.5, halfTick * 0.3);
      } else if (i % 3 === 1) {
        ctx.moveTo(-halfTick * 0.4, 0);
        ctx.lineTo(halfTick * 0.4, 0);
      }
      ctx.stroke();
      ctx.restore();
    }
  } else {
    // Square: distribute runes along sides
    const sideCount = Math.floor(count / 4);
    for (let side = 0; side < 4; side++) {
      for (let i = 1; i <= sideCount; i++) {
        const t = i / (sideCount + 1);
        let px, py, angle;
        if (side === 0) { px = x + inset + t * (w - 2 * inset); py = y + inset; angle = 0; }
        else if (side === 1) { px = x + w - inset; py = y + inset + t * (h - 2 * inset); angle = Math.PI / 2; }
        else if (side === 2) { px = x + w - inset - t * (w - 2 * inset); py = y + h - inset; angle = Math.PI; }
        else { px = x + inset; py = y + h - inset - t * (h - 2 * inset); angle = Math.PI * 1.5; }
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -halfTick);
        ctx.lineTo(0, halfTick);
        if (i % 3 === 0) {
          ctx.moveTo(-halfTick * 0.5, -halfTick * 0.3);
          ctx.lineTo(halfTick * 0.5, halfTick * 0.3);
        } else if (i % 3 === 1) {
          ctx.moveTo(-halfTick * 0.4, 0);
          ctx.lineTo(halfTick * 0.4, 0);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// ── Spikes ─────────────────────────────────────────

function drawSpikes(ctx, x, y, w, h, shape, color, size, inset, count, inward, rotOffset) {
  ctx.fillStyle = color;
  const cx = x + w / 2, cy = y + h / 2;
  const r = (shape === 'circle') ? w / 2 - inset : w / 2 - inset;
  const dir = inward ? -1 : 1;
  const offset = rotOffset || 0;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + offset;
    let px, py;
    if (shape === 'circle') {
      px = cx + Math.cos(a) * r;
      py = cy + Math.sin(a) * r;
    } else {
      // Map angle to rectangle perimeter
      const pt = rectPerimeterFromAngle(x, y, w, h, inset, a);
      px = pt.x; py = pt.y;
    }
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.lineTo(size * 0.8 * dir, 0);
    ctx.lineTo(0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function rectPerimeterFromAngle(x, y, w, h, inset, angle) {
  // Find intersection of ray from center at given angle with inset rectangle
  const cx = x + w / 2, cy = y + h / 2;
  const hw = w / 2 - inset, hh = h / 2 - inset;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const tx = cos !== 0 ? hw / Math.abs(cos) : Infinity;
  const ty = sin !== 0 ? hh / Math.abs(sin) : Infinity;
  const t = Math.min(tx, ty);
  return { x: cx + cos * t, y: cy + sin * t };
}

// ── Petals ─────────────────────────────────────────

function drawPetals(ctx, x, y, w, h, shape, color, size, inset, count) {
  ctx.fillStyle = color;
  const cx = x + w / 2, cy = y + h / 2;
  const r = (shape === 'circle') ? w / 2 - inset : w / 2 - inset * 1.5;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    for (let p = 0; p < 5; p++) {
      const pa = a + (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(pa) * size * 0.4, py + Math.sin(pa) * size * 0.4,
                  size * 0.5, size * 0.25, pa, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Wavy border ────────────────────────────────────

function drawWavyBorder(ctx, x, y, w, h, shape, color, lineWidth, inset, waves) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const cx = x + w / 2, cy = y + h / 2;
  const r = (shape === 'circle') ? w / 2 - inset : null;
  const amp = w * 0.015;

  ctx.beginPath();
  if (shape === 'circle') {
    for (let i = 0; i <= 360; i++) {
      const a = (i * Math.PI) / 180;
      const wobble = r + Math.sin(a * waves) * amp;
      const px = cx + Math.cos(a) * wobble;
      const py = cy + Math.sin(a) * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else {
    const perimeter = 2 * (w - 2 * inset) + 2 * (h - 2 * inset);
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const d = t * perimeter;
      const wSide = w - 2 * inset, hSide = h - 2 * inset;
      let px, py, nx, ny;
      if (d < wSide) {
        px = x + inset + d; py = y + inset; nx = 0; ny = -1;
      } else if (d < wSide + hSide) {
        px = x + w - inset; py = y + inset + d - wSide; nx = 1; ny = 0;
      } else if (d < 2 * wSide + hSide) {
        px = x + w - inset - (d - wSide - hSide); py = y + h - inset; nx = 0; ny = 1;
      } else {
        px = x + inset; py = y + h - inset - (d - 2 * wSide - hSide); nx = -1; ny = 0;
      }
      const wobble = Math.sin(t * waves * Math.PI * 2) * amp;
      if (i === 0) ctx.moveTo(px + nx * wobble, py + ny * wobble);
      else ctx.lineTo(px + nx * wobble, py + ny * wobble);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

// ── Zigzag border ──────────────────────────────────

function drawZigzagBorder(ctx, x, y, w, h, shape, color, lineWidth, inset, segments, amplitude) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const cx = x + w / 2, cy = y + h / 2;

  ctx.beginPath();
  if (shape === 'circle') {
    const r = w / 2 - inset;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const offset = (i % 2 === 0 ? 1 : -1) * amplitude;
      const pr = r + offset;
      const px = cx + Math.cos(a) * pr;
      const py = cy + Math.sin(a) * pr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else {
    const perim = 2 * (w - 2 * inset) + 2 * (h - 2 * inset);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const offset = (i % 2 === 0 ? 1 : -1) * amplitude;
      const pt = rectPerimeterPointFromT(x, y, w, h, inset, t);
      const px = pt.x + pt.nx * offset;
      const py = pt.y + pt.ny * offset;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

function rectPerimeterPointFromT(x, y, w, h, inset, t) {
  const ix = x + inset, iy = y + inset;
  const iw = w - 2 * inset, ih = h - 2 * inset;
  const perim = 2 * iw + 2 * ih;
  const d = ((t % 1) + 1) % 1 * perim;
  if (d < iw) return { x: ix + d, y: iy, nx: 0, ny: -1 };
  if (d < iw + ih) return { x: ix + iw, y: iy + d - iw, nx: 1, ny: 0 };
  if (d < 2 * iw + ih) return { x: ix + iw - (d - iw - ih), y: iy + ih, nx: 0, ny: 1 };
  return { x: ix, y: iy + ih - (d - 2 * iw - ih), nx: -1, ny: 0 };
}

// ── Crystal corners ────────────────────────────────

function drawCrystalCorners(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  const cx = x + w / 2, cy = y + h / 2;
  const pts = getCornerPoints(x, y, w, h, shape, inset);

  for (const pt of pts) {
    const angle = Math.atan2(pt.y - cy, pt.x - cx);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);
    // Draw a small diamond/crystal shape
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(0, -size * 0.35);
    ctx.lineTo(size * 0.5, 0);
    ctx.lineTo(0, size * 0.35);
    ctx.closePath();
    ctx.stroke();
    // Inner highlight
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(0, -size * 0.15);
    ctx.lineTo(size * 0.2, 0);
    ctx.strokeStyle = color + '88';
    ctx.stroke();
    ctx.restore();
  }
}

// ── Leaf decorations ───────────────────────────────

function drawLeafDecorations(ctx, x, y, w, h, shape, color, size, inset) {
  ctx.fillStyle = color;
  const pts = getCardinalPoints(x, y, w, h, shape, inset);
  const cx = x + w / 2, cy = y + h / 2;

  for (const pt of pts) {
    const angle = Math.atan2(pt.y - cy, pt.x - cx);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle + Math.PI / 2);
    // Left leaf
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, 0, size * 0.4, size * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right leaf
    ctx.beginPath();
    ctx.ellipse(size * 0.3, 0, size * 0.4, size * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Hex pattern ────────────────────────────────────

function drawHexPattern(ctx, x, y, w, h, shape, color, lineWidth, inset, hexSize) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const cx = x + w / 2, cy = y + h / 2;
  const count = 8;

  if (shape === 'circle') {
    const r = w / 2 - inset;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      drawHex(ctx, px, py, hexSize * 0.5, a);
    }
  } else {
    // Place hexes along rectangle sides
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const pt = rectPerimeterPointFromT(x, y, w, h, inset, t);
      drawHex(ctx, pt.x, pt.y, hexSize * 0.5, 0);
    }
  }
}

function drawHex(ctx, cx, cy, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i / 6) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

// ── Scan lines ─────────────────────────────────────

function drawScanLines(ctx, x, y, w, h, color, spacing) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let ly = y; ly < y + h; ly += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }
}

// ── Celtic weave helpers ───────────────────────────

function rectPerimeterPoint(x, y, w, h, inset, t, offsetNormal) {
  const ix = x + inset, iy = y + inset;
  const iw = w - 2 * inset, ih = h - 2 * inset;
  const perim = 2 * iw + 2 * ih;
  const d = ((t % 1) + 1) % 1 * perim;
  let px, py, nx, ny;
  if (d < iw) { px = ix + d; py = iy; nx = 0; ny = -1; }
  else if (d < iw + ih) { px = ix + iw; py = iy + d - iw; nx = 1; ny = 0; }
  else if (d < 2 * iw + ih) { px = ix + iw - (d - iw - ih); py = iy + ih; nx = 0; ny = 1; }
  else { px = ix; py = iy + ih - (d - 2 * iw - ih); nx = -1; ny = 0; }
  return { x: px + nx * offsetNormal, y: py + ny * offsetNormal };
}

function drawStrandSeg(ctx, points, start, end, color, width) {
  if (start >= end || start >= points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[start].x, points[start].y);
  for (let i = start + 1; i <= end && i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
