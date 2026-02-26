// =====================================================
// TulipaMouse – Análise de Movimento
// =====================================================

const canvas      = document.getElementById('mouseCanvas');
const ctx         = canvas.getContext('2d');
const canvasArea  = document.getElementById('canvasArea');
const heatmapCanvas = document.getElementById('heatmapCanvas');
const heatCtx     = heatmapCanvas.getContext('2d');
const velCanvas   = document.getElementById('velocityChart');
const velCtx      = velCanvas.getContext('2d');

let recording    = false;
let points       = [];
let lastX = null, lastY = null, lastT = null;
let speedHistory = [];
let totalDist    = 0;
const MAX_SPEED_HIST = 80;

// ── RESIZE ──────────────────────────────────────────
function resizeCanvas() {
  const rect = canvasArea.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;
  heatmapCanvas.width  = heatmapCanvas.offsetWidth;
  velCanvas.width  = velCanvas.offsetWidth;
  velCanvas.height = 80;
  redraw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── CONTROLS ────────────────────────────────────────
const btnRecord = document.getElementById('btnRecord');
const btnClear  = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const instructions = document.getElementById('instructions');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');

btnRecord.addEventListener('click', () => {
  recording = !recording;
  if (recording) {
    btnRecord.textContent = '⏹ Parar Gravação';
    btnRecord.classList.add('recording');
    statusDot.className   = 'status-dot recording-dot';
    statusText.textContent = 'Gravando...';
    instructions.classList.add('hidden');
  } else {
    btnRecord.textContent = '▶ Iniciar Gravação';
    btnRecord.classList.remove('recording');
    statusDot.className   = 'status-dot';
    statusText.textContent = 'Gravação pausada';
    runAnalysis();
  }
});

btnClear.addEventListener('click', () => {
  points = []; speedHistory = []; totalDist = 0;
  lastX = lastY = lastT = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  instructions.classList.remove('hidden');
  updateStats(0, 0, 0, 0);
  updateScore(null);
  drawVelocityChart();
  drawHeatmap();
  document.getElementById('analysisText').textContent =
    'Grave pelo menos 5 segundos de movimento para receber uma análise personalizada do seu padrão.';
  statusText.textContent = 'Aguardando início';
  statusDot.className = 'status-dot inactive';
});

btnExport.addEventListener('click', exportCSV);

// ── MOUSE TRACKING ──────────────────────────────────
canvasArea.addEventListener('mousemove', (e) => {
  const rect = canvasArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const t = performance.now();

  document.getElementById('liveXY').textContent = `x: ${Math.round(x)} y: ${Math.round(y)}`;

  if (!recording) return;

  let speed = 0, vx = 0, vy = 0;

  if (lastX !== null) {
    const dt = (t - lastT) / 1000;
    if (dt > 0) {
      vx = (x - lastX) / dt;
      vy = (y - lastY) / dt;
      speed = Math.sqrt(vx * vx + vy * vy);
      totalDist += Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
    }
  }

  const point = { x, y, t, vx, vy, speed };
  points.push(point);

  speedHistory.push(speed);
  if (speedHistory.length > MAX_SPEED_HIST) speedHistory.shift();

  if (lastX !== null) drawSegment(lastX, lastY, x, y, speed);

  lastX = x; lastY = y; lastT = t;

  const tremorIdx = calcTremorIndex();
  updateStats(Math.round(speed), points.length, tremorIdx, Math.round(totalDist));
  updateScore(tremorIdx);
  drawVelocityChart();
  if (points.length % 20 === 0) drawHeatmap();
});

// ── DRAWING ─────────────────────────────────────────
function speedToColor(speed) {
  const norm = Math.min(speed / 800, 1);
  if (norm < 0.4) {
    const t = norm / 0.4;
    return `rgb(${Math.round(46 + t * (255 - 46))}, ${Math.round(160 + t * (200 - 160))}, ${Math.round(46 - t * 30)})`;
  } else {
    const t = (norm - 0.4) / 0.6;
    return `rgb(255, ${Math.round(200 - t * 200)}, ${Math.round(20 - t * 20)})`;
  }
}

function drawSegment(x1, y1, x2, y2, speed) {
  const color = speedToColor(speed);

  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.lineCap = 'round'; ctx.globalAlpha = 0.85;
  ctx.stroke();

  // glow
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = 6;
  ctx.globalAlpha = 0.1; ctx.stroke();
  ctx.globalAlpha = 1;
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 1; i < points.length; i++) {
    const p = points[i], pp = points[i - 1];
    drawSegment(pp.x, pp.y, p.x, p.y, p.speed);
  }
}

// ── VELOCITY CHART ──────────────────────────────────
function drawVelocityChart() {
  velCtx.clearRect(0, 0, velCanvas.width, velCanvas.height);
  if (speedHistory.length < 2) return;

  const W = velCanvas.width, H = velCanvas.height;
  const max = Math.max(...speedHistory, 1);

  velCtx.strokeStyle = 'rgba(200,16,46,0.1)';
  velCtx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(f => {
    velCtx.beginPath();
    velCtx.moveTo(0, H * f); velCtx.lineTo(W, H * f); velCtx.stroke();
  });

  velCtx.beginPath();
  speedHistory.forEach((s, i) => {
    const x = (i / (MAX_SPEED_HIST - 1)) * W;
    const y = H - (s / max) * (H - 4);
    i === 0 ? velCtx.moveTo(x, y) : velCtx.lineTo(x, y);
  });

  const grd = velCtx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, 'rgba(200,16,46,0.5)');
  grd.addColorStop(1, 'rgba(200,16,46,0)');
  velCtx.lineTo(W, H); velCtx.lineTo(0, H);
  velCtx.closePath(); velCtx.fillStyle = grd; velCtx.fill();

  velCtx.beginPath();
  speedHistory.forEach((s, i) => {
    const x = (i / (MAX_SPEED_HIST - 1)) * W;
    const y = H - (s / max) * (H - 4);
    i === 0 ? velCtx.moveTo(x, y) : velCtx.lineTo(x, y);
  });
  velCtx.strokeStyle = '#E8384F'; velCtx.lineWidth = 2; velCtx.stroke();
}

// ── HEATMAP ─────────────────────────────────────────
function drawHeatmap() {
  const W = heatmapCanvas.width, H = heatmapCanvas.height;
  heatCtx.clearRect(0, 0, W, H);
  if (points.length === 0) return;

  const scaleX = W / canvas.width;
  const scaleY = H / canvas.height;

  points.forEach((p, i) => {
    if (i % 3 !== 0) return;
    const hx = p.x * scaleX, hy = p.y * scaleY;
    const grd = heatCtx.createRadialGradient(hx, hy, 0, hx, hy, 10);
    grd.addColorStop(0, 'rgba(200,16,46,0.3)');
    grd.addColorStop(1, 'rgba(200,16,46,0)');
    heatCtx.fillStyle = grd;
    heatCtx.beginPath(); heatCtx.arc(hx, hy, 10, 0, Math.PI * 2);
    heatCtx.fill();
  });
}

// ── STATS & SCORE ───────────────────────────────────
function updateStats(speed, pts, tremor, dist) {
  document.getElementById('metSpeed').textContent  = speed;
  document.getElementById('metPoints').textContent = pts;
  document.getElementById('metTremor').textContent = tremor !== null ? tremor.toFixed(1) : '—';
  document.getElementById('metDist').textContent   = dist;

  const statEl = document.getElementById('statTremor');
  if (tremor !== null) {
    statEl.className = tremor < 2 ? 'stat good' : tremor < 5 ? 'stat warn' : 'stat accent';
  }
}

function calcTremorIndex() {
  if (points.length < 10) return null;
  const last = points.slice(-30);
  let dirChanges = 0;

  for (let i = 1; i < last.length - 1; i++) {
    const p0 = last[i - 1], p1 = last[i], p2 = last[i + 1];
    const dot = (p1.x - p0.x) * (p2.x - p1.x) + (p1.y - p0.y) * (p2.y - p1.y);
    const m1  = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
    const m2  = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    if (m1 > 0 && m2 > 0) {
      const angle = Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2))));
      if (angle > 0.3) dirChanges++;
    }
  }
  return (dirChanges / last.length) * 10;
}

function updateScore(tremor) {
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreNum    = document.getElementById('scoreNum');
  const scoreLabel  = document.getElementById('scoreLabel');

  if (tremor === null) {
    scoreNum.textContent   = '—';
    scoreLabel.textContent = 'Mova o mouse para calcular';
    scoreCircle.style.background = 'conic-gradient(rgba(200,16,46,0.2) 0%, rgba(200,16,46,0.05) 0%)';
    return;
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - tremor * 10)));
  scoreNum.textContent = score;

  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#E8384F';
  scoreCircle.style.background = `conic-gradient(${color} ${score}%, rgba(200,16,46,0.08) 0%)`;

  if (score >= 70) {
    scoreLabel.textContent  = 'Movimento Suave 🎉';
    scoreLabel.style.color  = '#4ade80';
  } else if (score >= 40) {
    scoreLabel.textContent  = 'Tremore Moderado';
    scoreLabel.style.color  = '#fbbf24';
  } else {
    scoreLabel.textContent  = 'Tremore Intenso';
    scoreLabel.style.color  = '#E8384F';
  }
}

// ── ANALYSIS ────────────────────────────────────────
function runAnalysis() {
  if (points.length < 50) return;

  const speeds   = points.map(p => p.speed);
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const tremor   = calcTremorIndex();
  const duration = ((points[points.length - 1].t - points[0].t) / 1000).toFixed(1);

  let text = '';
  if (tremor < 2) {
    text = `<strong>✅ Movimento Fluido</strong><br>Seu padrão de movimento é notavelmente suave. Velocidade média de <strong>${Math.round(avgSpeed)}px/s</strong>, com baixo índice de mudanças de direção (${tremor.toFixed(1)}). Ótimo controle motor detectado em ${duration}s de análise.`;
  } else if (tremor < 5) {
    text = `<strong>⚠️ Tremor Leve a Moderado</strong><br>Detectamos variações de direção que podem indicar tremor leve. Índice: <strong>${tremor.toFixed(1)}</strong>. O filtro de suavização do TulipaMouse pode reduzir significativamente essas variações.`;
  } else {
    text = `<strong>🔴 Tremor Significativo Detectado</strong><br>Alto índice de variações de direção (${tremor.toFixed(1)}). Recomendamos ativar o <strong>Filtro de Tremor Máximo</strong> e aumentar a Zona de Repouso para 15–20px.`;
  }

  document.getElementById('analysisText').innerHTML = text;
}

// ── SLIDERS ─────────────────────────────────────────
document.getElementById('smoothSlider').addEventListener('input', function () {
  document.getElementById('smoothVal').textContent = this.value + '%';
});
document.getElementById('deadSlider').addEventListener('input', function () {
  document.getElementById('deadVal').textContent = this.value + 'px';
});
document.getElementById('velSlider').addEventListener('input', function () {
  document.getElementById('velVal').textContent = this.value + 'px/s';
});

// ── EXPORT CSV ──────────────────────────────────────
function exportCSV() {
  if (points.length === 0) { alert('Nenhum dado gravado ainda.'); return; }
  let csv = 'timestamp_ms,x,y,speed_px_s,vx,vy\n';
  const t0 = points[0].t;
  points.forEach(p => {
    csv += `${(p.t - t0).toFixed(1)},${p.x.toFixed(1)},${p.y.toFixed(1)},${p.speed.toFixed(1)},${p.vx.toFixed(1)},${p.vy.toFixed(1)}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'tulipamouse_analise.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── INIT ────────────────────────────────────────────
drawVelocityChart();
drawHeatmap();
