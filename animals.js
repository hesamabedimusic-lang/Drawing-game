/* ============================================================
   ANIMAL SHAPE LIBRARY
   Every animal is built from simple closed shapes (circle, ellipse,
   triangle, custom polygon). Each shape becomes one "part" of the
   dot-to-dot puzzle — numbering restarts at 1 for every part, just
   like a real dot-to-dot book.
   ============================================================ */

// ---- geometry helpers ----
function ellipsePts(cx, cy, rx, ry, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return pts;
}

function rotatePts(pts, cx, cy, deg) {
  const r = (deg * Math.PI) / 180;
  return pts.map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    return {
      x: cx + dx * Math.cos(r) - dy * Math.sin(r),
      y: cy + dx * Math.sin(r) + dy * Math.cos(r)
    };
  });
}

function starPts(cx, cy, rOuter, rInner, spikes) {
  const pts = [];
  const n = spikes * 2;
  for (let i = 0; i < n; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function tri(p1, p2, p3) { return [p1, p2, p3]; }

// part color = the color the connecting line is drawn in while solving
// (final revealed outline is always plain black)
function part(points, color) { return { points, color }; }

const PARTCOLORS = ['#FF6F61', '#4FC3F7', '#FFC93C', '#6FCF6F', '#A66BFF', '#FF9F45'];

const ANIMALS = [

  // 1. CAT -------------------------------------------------
  {
    name: 'Cat', emoji: '🐱',
    parts: [
      part(tri({ x: 245, y: 195 }, { x: 225, y: 110 }, { x: 288, y: 175 }), PARTCOLORS[0]),
      part(tri({ x: 355, y: 195 }, { x: 375, y: 110 }, { x: 312, y: 175 }), PARTCOLORS[1]),
      part(ellipsePts(300, 235, 78, 68, 12), PARTCOLORS[2]),
      part(ellipsePts(300, 400, 105, 90, 14), PARTCOLORS[3]),
      part(rotatePts(ellipsePts(430, 410, 60, 16, 10), 430, 410, -35), PARTCOLORS[4])
    ]
  },

  // 2. DOG -------------------------------------------------
  {
    name: 'Dog', emoji: '🐶',
    parts: [
      part(rotatePts(ellipsePts(228, 210, 26, 55, 9), 228, 210, -20), PARTCOLORS[1]),
      part(rotatePts(ellipsePts(372, 210, 26, 55, 9), 372, 210, 20), PARTCOLORS[0]),
      part(ellipsePts(300, 245, 82, 72, 13), PARTCOLORS[2]),
      part(ellipsePts(300, 300, 26, 20, 8), PARTCOLORS[5]),
      part(ellipsePts(300, 410, 108, 92, 14), PARTCOLORS[3]),
      part(rotatePts(ellipsePts(420, 460, 45, 14, 8), 420, 460, 40), PARTCOLORS[4])
    ]
  },

  // 3. RABBIT ------------------------------------------------
  {
    name: 'Rabbit', emoji: '🐰',
    parts: [
      part(rotatePts(ellipsePts(255, 150, 24, 85, 9), 255, 150, -10), PARTCOLORS[0]),
      part(rotatePts(ellipsePts(345, 150, 24, 85, 9), 345, 150, 10), PARTCOLORS[1]),
      part(ellipsePts(300, 280, 68, 62, 12), PARTCOLORS[2]),
      part(ellipsePts(300, 420, 95, 82, 13), PARTCOLORS[3]),
      part(ellipsePts(400, 445, 24, 22, 8), PARTCOLORS[4])
    ]
  },

  // 4. BEAR ----------------------------------------------
  {
    name: 'Bear', emoji: '🐻',
    parts: [
      part(ellipsePts(222, 165, 30, 30, 8), PARTCOLORS[0]),
      part(ellipsePts(378, 165, 30, 30, 8), PARTCOLORS[1]),
      part(ellipsePts(300, 250, 88, 78, 13), PARTCOLORS[2]),
      part(ellipsePts(300, 415, 112, 98, 15), PARTCOLORS[3])
    ]
  },

  // 5. FISH ------------------------------------------------
  {
    name: 'Fish', emoji: '🐟',
    parts: [
      part(ellipsePts(280, 300, 130, 85, 14), PARTCOLORS[0]),
      part(tri({ x: 410, y: 300 }, { x: 500, y: 250 }, { x: 500, y: 350 }), PARTCOLORS[1]),
      part(tri({ x: 260, y: 218 }, { x: 300, y: 155 }, { x: 335, y: 218 }), PARTCOLORS[2]),
      part(ellipsePts(215, 275, 15, 15, 6), PARTCOLORS[4])
    ]
  },

  // 6. BIRD ------------------------------------------------
  {
    name: 'Bird', emoji: '🐦',
    parts: [
      part(ellipsePts(300, 340, 95, 78, 13), PARTCOLORS[0]),
      part(ellipsePts(230, 235, 58, 52, 11), PARTCOLORS[1]),
      part(tri({ x: 178, y: 232 }, { x: 130, y: 245 }, { x: 180, y: 262 }), PARTCOLORS[2]),
      part(rotatePts(ellipsePts(345, 350, 62, 30, 10), 345, 350, 20), PARTCOLORS[3]),
      part(tri({ x: 370, y: 415 }, { x: 430, y: 440 }, { x: 380, y: 455 }), PARTCOLORS[4])
    ]
  },

  // 7. OWL -------------------------------------------------
  {
    name: 'Owl', emoji: '🦉',
    parts: [
      part(tri({ x: 245, y: 175 }, { x: 232, y: 130 }, { x: 275, y: 168 }), PARTCOLORS[0]),
      part(tri({ x: 355, y: 175 }, { x: 368, y: 130 }, { x: 325, y: 168 }), PARTCOLORS[1]),
      part(ellipsePts(300, 320, 105, 115, 15), PARTCOLORS[2]),
      part(ellipsePts(262, 285, 22, 22, 8), PARTCOLORS[3]),
      part(ellipsePts(338, 285, 22, 22, 8), PARTCOLORS[4]),
      part(rotatePts(ellipsePts(205, 340, 45, 65, 10), 205, 340, 12), PARTCOLORS[5]),
      part(rotatePts(ellipsePts(395, 340, 45, 65, 10), 395, 340, -12), PARTCOLORS[0])
    ]
  },

  // 8. TURTLE ------------------------------------------------
  {
    name: 'Turtle', emoji: '🐢',
    parts: [
      part(ellipsePts(300, 330, 110, 95, 15), PARTCOLORS[3]),
      part(ellipsePts(430, 335, 34, 26, 9), PARTCOLORS[0]),
      part(ellipsePts(215, 245, 26, 22, 7), PARTCOLORS[1]),
      part(ellipsePts(215, 420, 26, 22, 7), PARTCOLORS[2]),
      part(ellipsePts(385, 245, 26, 22, 7), PARTCOLORS[4]),
      part(ellipsePts(385, 420, 26, 22, 7), PARTCOLORS[5])
    ]
  },

  // 9. ELEPHANT --------------------------------------------
  {
    name: 'Elephant', emoji: '🐘',
    parts: [
      part(rotatePts(ellipsePts(185, 300, 60, 78, 11), 185, 300, -15), PARTCOLORS[0]),
      part(rotatePts(ellipsePts(415, 300, 60, 78, 11), 415, 300, 15), PARTCOLORS[1]),
      part(ellipsePts(300, 330, 118, 108, 16), PARTCOLORS[2]),
      part([
        { x: 340, y: 385 }, { x: 355, y: 420 }, { x: 350, y: 455 },
        { x: 365, y: 480 }, { x: 355, y: 495 }, { x: 335, y: 480 },
        { x: 328, y: 445 }, { x: 322, y: 405 }
      ], PARTCOLORS[3])
    ]
  },

  // 10. BUTTERFLY --------------------------------------------
  {
    name: 'Butterfly', emoji: '🦋',
    parts: [
      part(ellipsePts(300, 300, 14, 105, 9), PARTCOLORS[0]),
      part(rotatePts(ellipsePts(220, 235, 75, 55, 11), 220, 235, -25), PARTCOLORS[1]),
      part(rotatePts(ellipsePts(380, 235, 75, 55, 11), 380, 235, 25), PARTCOLORS[2]),
      part(rotatePts(ellipsePts(235, 350, 55, 40, 10), 235, 350, -15), PARTCOLORS[3]),
      part(rotatePts(ellipsePts(365, 350, 55, 40, 10), 365, 350, 15), PARTCOLORS[4])
    ]
  },

  // 11. FROG -----------------------------------------------
  {
    name: 'Frog', emoji: '🐸',
    parts: [
      part(ellipsePts(240, 210, 24, 24, 8), PARTCOLORS[0]),
      part(ellipsePts(360, 210, 24, 24, 8), PARTCOLORS[1]),
      part(ellipsePts(300, 320, 118, 100, 15), PARTCOLORS[2]),
      part(rotatePts(ellipsePts(190, 420, 55, 34, 9), 190, 420, -30), PARTCOLORS[3]),
      part(rotatePts(ellipsePts(410, 420, 55, 34, 9), 410, 420, 30), PARTCOLORS[4])
    ]
  },

  // 12. LION (final level — the most parts) -----------------
  {
    name: 'Lion', emoji: '🦁',
    parts: [
      part(starPts(300, 250, 128, 92, 10), PARTCOLORS[2]),
      part(ellipsePts(300, 250, 68, 62, 12), PARTCOLORS[0]),
      part(tri({ x: 255, y: 205 }, { x: 245, y: 170 }, { x: 280, y: 200 }), PARTCOLORS[1]),
      part(tri({ x: 345, y: 205 }, { x: 355, y: 170 }, { x: 320, y: 200 }), PARTCOLORS[1]),
      part(ellipsePts(300, 415, 100, 85, 14), PARTCOLORS[3]),
      part(rotatePts(ellipsePts(425, 430, 68, 15, 9), 425, 430, -25), PARTCOLORS[4]),
      part(ellipsePts(478, 400, 17, 17, 6), PARTCOLORS[5])
    ]
  }
];
