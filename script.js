/* ============================================================
   DOT SAFARI — game engine
   Two stacked canvases:
     colorCanvas (bottom) — crayon strokes, clipped to the animal shape
     dotsCanvas  (top)    — numbered dots while solving, then the
                            final black outline once revealed
   ============================================================ */

(() => {
  const dotsCanvas = document.getElementById('dotsCanvas');
  const dctx = dotsCanvas.getContext('2d');
  const colorCanvas = document.getElementById('colorCanvas');
  const cctx = colorCanvas.getContext('2d');

  const levelTrack = document.getElementById('levelTrack');
  const messageBanner = document.getElementById('messageBanner');
  const burst = document.getElementById('burst');
  const toolTray = document.getElementById('toolTray');
  const paletteEl = document.getElementById('palette');
  const prevBtn = document.getElementById('prevLevelBtn');
  const nextBtn = document.getElementById('nextLevelBtn');
  const redoBtn = document.getElementById('redoDotsBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearColorBtn = document.getElementById('clearColorBtn');

  const CRAYONS = [
    { name: 'Cherry Red', color: '#FF3B30' },
    { name: 'Tangerine', color: '#FF9F45' },
    { name: 'Sunshine Yellow', color: '#FFC93C' },
    { name: 'Grass Green', color: '#6FCF6F' },
    { name: 'Ocean Teal', color: '#2FBFA6' },
    { name: 'Sky Blue', color: '#4FC3F7' },
    { name: 'Blueberry', color: '#3B5BFF' },
    { name: 'Grape Purple', color: '#A66BFF' },
    { name: 'Bubblegum Pink', color: '#FF6FB1' },
    { name: 'Coral', color: '#FF6F61' },
    { name: 'Chocolate Brown', color: '#8B5E3C' },
    { name: 'Licorice Black', color: '#3B3B3B' },
    { name: 'Lime', color: '#C6E13B' },
    { name: 'Snow White', color: '#FFFFFF' }
  ];

  // ---------------- Game state ----------------
  const state = {
    levelIndex: 0,
    partIndex: 0,
    connectedCount: 0,   // how many dots of the current part are joined
    mode: 'dots',        // 'dots' | 'revealed'
    clipPath: null,
    currentColor: CRAYONS[0].color,
    brushSize: 14,
    erasing: false,
    isDrawing: false,
    lastDrawPos: null,
    flash: null           // { index, until }
  };

  const progress = JSON.parse(localStorage.getItem('dotSafariProgress') || 'null')
    || new Array(ANIMALS.length).fill(false);

  function saveProgress() {
    localStorage.setItem('dotSafariProgress', JSON.stringify(progress));
  }

  // ---------------- Coordinate helpers ----------------
  function getPos(evt, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = evt.touches ? evt.touches[0] : evt;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY
    };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // ---------------- Level track (stepping stones) ----------------
  function renderLevelTrack() {
    levelTrack.innerHTML = '';
    ANIMALS.forEach((animal, i) => {
      const btn = document.createElement('button');
      btn.className = 'levelStone';
      btn.textContent = i + 1;
      btn.title = animal.name;
      if (i === state.levelIndex) btn.classList.add('active');
      if (progress[i]) btn.classList.add('done');
      btn.addEventListener('click', () => loadLevel(i));
      levelTrack.appendChild(btn);
    });
  }

  // ---------------- Building the clip path for coloring ----------------
  function buildClipPath(animal) {
    const path = new Path2D();
    animal.parts.forEach(p => {
      const pts = p.points;
      path.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
      path.closePath();
    });
    return path;
  }

  // ---------------- Rendering: dots mode ----------------
  function drawClosedPart(ctx, pts, strokeStyle, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function renderDots() {
    dctx.clearRect(0, 0, 600, 600);
    const animal = ANIMALS[state.levelIndex];

    // completed parts -> solid black outline
    for (let i = 0; i < state.partIndex; i++) {
      drawClosedPart(dctx, animal.parts[i].points, '#3B3B3B', 5);
    }

    const part = animal.parts[state.partIndex];
    const pts = part.points;
    const n = pts.length;

    // line(s) already connected in the current part
    if (state.connectedCount > 0) {
      dctx.beginPath();
      dctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < state.connectedCount; i++) dctx.lineTo(pts[i].x, pts[i].y);
      dctx.strokeStyle = part.color;
      dctx.lineWidth = 5;
      dctx.lineJoin = 'round';
      dctx.lineCap = 'round';
      dctx.stroke();
    }

    // remaining numbered dot bubbles
    for (let i = state.connectedCount; i < n; i++) {
      const isNext = i === state.connectedCount;
      const r = isNext ? 17 : 13;
      dctx.beginPath();
      dctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
      dctx.fillStyle = isNext ? '#fff' : '#fdfdfd';
      dctx.fill();
      dctx.lineWidth = isNext ? 4 : 2.5;
      dctx.strokeStyle = isNext ? part.color : '#c9c4b6';
      dctx.stroke();

      dctx.fillStyle = isNext ? part.color : '#9a9486';
      dctx.font = isNext ? 'bold 16px Quicksand, sans-serif' : 'bold 12px Quicksand, sans-serif';
      dctx.textAlign = 'center';
      dctx.textBaseline = 'middle';
      dctx.fillText(String(i + 1), pts[i].x, pts[i].y + 1);
    }

    // wrong-tap flash
    if (state.flash && Date.now() < state.flash.until) {
      const p = pts[state.flash.index];
      if (p) {
        dctx.beginPath();
        dctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
        dctx.strokeStyle = 'rgba(255,59,48,0.75)';
        dctx.lineWidth = 4;
        dctx.stroke();
      }
    }
  }

  function renderRevealed() {
    dctx.clearRect(0, 0, 600, 600);
    const animal = ANIMALS[state.levelIndex];
    animal.parts.forEach(p => drawClosedPart(dctx, p.points, '#3B3B3B', 5));
  }

  // ---------------- Dot click handling ----------------
  function handleDotClick(evt) {
    if (state.mode !== 'dots') return;
    const pos = getPos(evt, dotsCanvas);
    const animal = ANIMALS[state.levelIndex];
    const pts = animal.parts[state.partIndex].points;

    // find nearest dot among the ones not yet connected
    let nearestIdx = -1, nearestDist = Infinity;
    for (let i = state.connectedCount; i < pts.length; i++) {
      const d = dist(pos, pts[i]);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    if (nearestIdx === -1 || nearestDist > 34) return;

    if (nearestIdx === state.connectedCount) {
      state.connectedCount++;
      if (state.connectedCount === pts.length) {
        completePart();
        return;
      }
      renderDots();
    } else {
      // tapped the wrong dot — gentle flash, no penalty
      state.flash = { index: nearestIdx, until: Date.now() + 380 };
      renderDots();
      setTimeout(renderDots, 400);
    }
  }

  function completePart() {
    const animal = ANIMALS[state.levelIndex];
    state.partIndex++;
    state.connectedCount = 0;
    if (state.partIndex >= animal.parts.length) {
      completeAnimal();
    } else {
      renderDots();
    }
  }

  function popBurst(emoji) {
    burst.textContent = emoji;
    burst.classList.remove('pop');
    // eslint-disable-next-line no-unused-expressions
    void burst.offsetWidth; // restart animation
    burst.classList.add('pop');
  }

  function completeAnimal() {
    state.mode = 'revealed';
    renderRevealed();
    dotsCanvas.style.pointerEvents = 'none';

    const animal = ANIMALS[state.levelIndex];
    progress[state.levelIndex] = true;
    saveProgress();
    renderLevelTrack();

    messageBanner.textContent = `You found the ${animal.name}! ${animal.emoji} Now color it in!`;
    messageBanner.classList.remove('hidden');
    popBurst(animal.emoji);

    enterColoringMode();
    updateNextButton();
  }

  // ---------------- Coloring mode ----------------
  function enterColoringMode() {
    const animal = ANIMALS[state.levelIndex];
    state.clipPath = buildClipPath(animal);
    toolTray.classList.remove('hidden');
  }

  function drawDab(x, y) {
    cctx.save();
    cctx.clip(state.clipPath);
    cctx.globalCompositeOperation = state.erasing ? 'destination-out' : 'source-over';
    cctx.fillStyle = state.currentColor;
    cctx.beginPath();
    cctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
    cctx.fill();
    cctx.restore();
  }

  function strokeTo(pos) {
    if (state.lastDrawPos) {
      const d = dist(state.lastDrawPos, pos);
      const step = Math.max(2, state.brushSize / 3);
      const steps = Math.max(1, Math.floor(d / step));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        drawDab(
          state.lastDrawPos.x + (pos.x - state.lastDrawPos.x) * t,
          state.lastDrawPos.y + (pos.y - state.lastDrawPos.y) * t
        );
      }
    } else {
      drawDab(pos.x, pos.y);
    }
    state.lastDrawPos = pos;
  }

  function onColorStart(evt) {
    if (state.mode !== 'revealed') return;
    evt.preventDefault();
    state.isDrawing = true;
    state.lastDrawPos = null;
    strokeTo(getPos(evt, colorCanvas));
  }
  function onColorMove(evt) {
    if (!state.isDrawing) return;
    evt.preventDefault();
    strokeTo(getPos(evt, colorCanvas));
  }
  function onColorEnd() {
    state.isDrawing = false;
    state.lastDrawPos = null;
  }

  colorCanvas.addEventListener('pointerdown', onColorStart);
  colorCanvas.addEventListener('pointermove', onColorMove);
  window.addEventListener('pointerup', onColorEnd);

  dotsCanvas.addEventListener('pointerdown', handleDotClick);

  // ---------------- Palette / tools UI ----------------
  function renderPalette() {
    paletteEl.innerHTML = '';
    CRAYONS.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'swatch';
      btn.style.background = c.color;
      btn.title = c.name;
      if (i === 0) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        state.currentColor = c.color;
        state.erasing = false;
        eraserBtn.classList.remove('selected');
        [...paletteEl.children].forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });
      paletteEl.appendChild(btn);
    });
  }

  document.querySelectorAll('.brushBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.brushBtn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.brushSize = Number(btn.dataset.size);
    });
  });

  eraserBtn.addEventListener('click', () => {
    state.erasing = !state.erasing;
    eraserBtn.classList.toggle('selected', state.erasing);
  });

  clearColorBtn.addEventListener('click', () => {
    cctx.clearRect(0, 0, 600, 600);
  });

  // ---------------- Level navigation ----------------
  function updateNextButton() {
    const isLast = state.levelIndex === ANIMALS.length - 1;
    if (state.mode === 'revealed') {
      nextBtn.classList.remove('hidden');
      nextBtn.textContent = isLast ? '🔁 Start Over' : 'Next Animal ➡';
    } else {
      nextBtn.classList.add('hidden');
    }
  }

  function loadLevel(index) {
    state.levelIndex = index;
    state.partIndex = 0;
    state.connectedCount = 0;
    state.mode = 'dots';
    state.flash = null;
    state.erasing = false;
    eraserBtn.classList.remove('selected');

    dotsCanvas.style.pointerEvents = 'auto';
    cctx.clearRect(0, 0, 600, 600);
    messageBanner.classList.add('hidden');
    toolTray.classList.add('hidden');

    renderLevelTrack();
    renderDots();
    updateNextButton();
    prevBtn.disabled = index === 0;
  }

  prevBtn.addEventListener('click', () => {
    if (state.levelIndex > 0) loadLevel(state.levelIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    const isLast = state.levelIndex === ANIMALS.length - 1;
    loadLevel(isLast ? 0 : state.levelIndex + 1);
  });

  redoBtn.addEventListener('click', () => loadLevel(state.levelIndex));

  // ---------------- Init ----------------
  renderPalette();
  loadLevel(0);
})();
