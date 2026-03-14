/* ═══════════════════════════════════════
   NOVA EXECUTOR — main.js
═══════════════════════════════════════ */

// ── CURSOR ────────────────────────────────────────────────────
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * .1;
  ry += (my - ry) * .1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .feat-card, .hstat, .cl-head, .ver-refresh-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
});

// ── CANVAS BACKGROUND ─────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Particles
const PARTICLE_COUNT = 80;
const particles = Array.from({length: PARTICLE_COUNT}, () => makeParticle(true));

function makeParticle(randomY = false) {
  return {
    x:    Math.random() * canvas.width,
    y:    randomY ? Math.random() * canvas.height : canvas.height + 4,
    vy:   Math.random() * .5 + .2,
    vx:   (Math.random() - .5) * .2,
    r:    Math.random() * 1.8 + .4,
    life: Math.random() * .6 + .4,
    max:  0,
    get maxLife() { return this.max || (this.max = this.life); }
  };
}

// Grid squares with mouse-reactive tilt
const COLS = Math.ceil(window.innerWidth / 80) + 2;
const ROWS = Math.ceil(window.innerHeight / 80) + 2;
let mouseGridX = -999, mouseGridY = -999;
document.addEventListener('mousemove', e => { mouseGridX = e.clientX; mouseGridY = e.clientY; });

let t = 0;
function drawBg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ── Grid squares ──────────────────────────────────────────
  const cellW = 80, cellH = 80;
  const cols = Math.ceil(canvas.width  / cellW) + 1;
  const rows = Math.ceil(canvas.height / cellH) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cellW;
      const cy = r * cellH;
      const dist = Math.hypot(cx + cellW/2 - mouseGridX, cy + cellH/2 - mouseGridY);
      const proximity = Math.max(0, 1 - dist / 280);
      const glow      = proximity * .18;

      // Grid line
      ctx.strokeStyle = `rgba(110,80,255,${.045 + glow * .4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + .5, cy + .5, cellW, cellH);

      // Fill glow on hover
      if (glow > .02) {
        ctx.fillStyle = `rgba(110,80,255,${glow * .12})`;
        ctx.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);

        // Corner dot
        const cornerAlpha = glow * .9;
        ctx.fillStyle = `rgba(160,90,255,${cornerAlpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── Particles ─────────────────────────────────────────────
  for (const p of particles) {
    p.y   -= p.vy;
    p.x   += p.vx;
    p.life -= .002;
    if (p.life <= 0 || p.y < -4) { Object.assign(p, makeParticle()); }

    const a = Math.pow(p.life / p.maxLife, 1.3);
    ctx.globalAlpha = a * .55;
    ctx.fillStyle = '#a05aff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  t += .008;
  requestAnimationFrame(drawBg);
}
drawBg();

// ── REVEAL ON SCROLL ──────────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: .1 });

document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * .08 + 's';
  revObs.observe(el);
});

// ── FEAT CARD MOUSE GLOW ──────────────────────────────────────
document.querySelectorAll('.feat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const mx2 = ((e.clientX - r.left) / r.width)  * 100;
    const my2 = ((e.clientY - r.top)  / r.height) * 100;
    card.style.setProperty('--mx', mx2 + '%');
    card.style.setProperty('--my', my2 + '%');
  });
});

// ── NAV SCROLL ACTIVE ─────────────────────────────────────────
const sections = ['hero','features','version','changelog','download'];
window.addEventListener('scroll', () => {
  let active = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 80) active = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + active);
  });

  // Nav bg on scroll
  const nav = document.querySelector('nav');
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(0,0,0,.92)';
    nav.style.backdropFilter = 'blur(14px)';
    nav.style.borderBottom = '1px solid rgba(110,80,255,.08)';
  } else {
    nav.style.background = 'linear-gradient(to bottom, rgba(0,0,0,.92) 0%, transparent 100%)';
    nav.style.backdropFilter = 'blur(1px)';
    nav.style.borderBottom = 'none';
  }
});

// ── CHANGELOG ACCORDION ───────────────────────────────────────
document.querySelectorAll('.cl-head').forEach(head => {
  head.addEventListener('click', () => {
    const entry = head.closest('.cl-entry');
    const isOpen = entry.classList.contains('open');
    document.querySelectorAll('.cl-entry.open').forEach(e => e.classList.remove('open'));
    if (!isOpen) entry.classList.add('open');
  });
});

// ── WEAO VERSION CHECK ────────────────────────────────────────
async function fetchWeao() {
  const btn    = document.getElementById('ver-refresh');
  const numEl  = document.getElementById('weao-ver-num');
  const dateEl = document.getElementById('weao-ver-date');
  const pillEl = document.getElementById('ver-status-pill');
  const localEl= document.getElementById('local-ver-val');
  const badgeEl= document.getElementById('hero-badge-text');

  btn.classList.add('spinning');

  try {
    const res  = await fetch('https://weao.xyz/api/versions/current', {
      headers: { 'User-Agent': 'WEAO-3PService' }
    });
    const data = await res.json();
    const ver  = data.Windows || '—';
    const date = data.WindowsDate || '';
    let dateStr = '';
    try { dateStr = new Date(date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); }
    catch { dateStr = date; }

    numEl.textContent   = ver || '—';
    dateEl.textContent  = 'Released: ' + (dateStr || 'Unknown');
    localEl.textContent = ver ? 'Checking local install...' : '—';

    pillEl.className = 'ver-pill ok';
    pillEl.innerHTML = `<span class="pd"></span> Roblox Up to Date`;
    if (badgeEl) badgeEl.textContent = `v8.0 NOW AVAILABLE  ·  Roblox ${ver ? ver.slice(0,18) : ''}`;

  } catch {
    numEl.textContent  = 'Error';
    dateEl.textContent = 'Could not reach weao.gg';
    pillEl.className   = 'ver-pill err';
    pillEl.innerHTML   = `<span class="pd"></span> Connection Failed`;
    localEl.textContent= '—';
  }

  btn.classList.remove('spinning');
}

document.getElementById('ver-refresh')?.addEventListener('click', fetchWeao);
fetchWeao();

// ── HERO BADGE VERSION ────────────────────────────────────────
async function fetchLatestRelease() {
  // Just show static for now — can hook to GitHub releases API
  const badgeEl = document.getElementById('hero-badge-text');
  if (badgeEl) badgeEl.textContent = 'v8.0  —  NOW AVAILABLE';
}
fetchLatestRelease();
