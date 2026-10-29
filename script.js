(() => {
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGsap && !reduce;
if (!motion) root.classList.remove('motion');
/* safety net: whatever happens, reveal hero text after 3.5s */
const revealAll = () => { root.classList.add('revealed');
  document.querySelectorAll('.name .ch, .headline .hl>span, .hero-loc, .cta, .scroll-cue, .nav, #hexbase, #hexfield, .mask>span')
    .forEach(e => { e.style.opacity = ''; e.style.transform = ''; e.style.visibility = ''; }); };
setTimeout(() => { if (!root.classList.contains('intro-done')) revealAll(); }, 3500);

/* ---------- data ---------- */
const certs = [
  {g:'Materials Science', items:[
    ['Materials Science: 10 Things Every Engineer Should Know','UC Davis','Jun 2026'],
    ['AI Materials','KAIST','Jul 2026'],
    ['Fundamentals of Materials Science','Shanghai Jiao Tong University','Jul 2026']]},
  {g:'Oil, Gas & Process Engineering', items:[
    ['From Wellhead to Refinery: Midstream Oil and Gas Processing','L&T EduTech','Jul 2026'],
    ['Hydrocarbon Exploration and Production','L&T EduTech','Jul 2026'],
    ['Natural Gas Production and Processing','L&T EduTech','Jul 2026'],
    ['Petroleum Engineering with AI Applications','L&T EduTech','Aug 2026'],
    ['Utilities, Safety & Environmental Care in Oil & Gas Industry','L&T EduTech','Aug 2026'],
    ['AI & ML Applications in Oil and Gas Industry','L&T EduTech','Aug 2026'],
    ['Oil & Gas Industry Operations and Markets','Duke University','Aug 2026']]},
  {g:'HSE & Sustainability', items:[
    ['Engineering a Sustainable World: Work Experience with IChemE','Springpod','May 2026'],
    ['Environmental Protection and Sustainability','Khalifa University','Aug 2026'],
    ['Risk Management and Industrial Safety','Khalifa University','Aug 2026'],
    ['Introduction to HSE Engineering','Khalifa University','Aug 2026'],
    ['Health, Safety, and Environmental (HSE) Engineering','Khalifa University','Aug 2026']]},
  {g:'AI, Data & MATLAB', items:[
    ['Inspirit AI Scholars Program','Inspirit AI','Jul 2024'],
    ['Introduction to MATLAB Copilot','MathWorks','Aug 2026'],
    ['Creating Custom Apps in MATLAB','MathWorks','Aug 2026'],
    ['Practical MATLAB Skills','MathWorks','Aug 2026'],
    ['MATLAB Skills for the AI Era','MathWorks','']]},
  {g:'Business & Leadership', items:[
    ['Building Competitive Advantage','Harvard Business School Online','Jul 2026'],
    ['Creating Customer Value','Harvard Business School Online','Jul 2026'],
    ['Introduction to Business Strategy','Harvard Business School Online','Aug 2026'],
    ['Leadership Problem-Solving with AI: Think Like a Leader','Saïd Business School, University of Oxford','Jul 2026']]}
];
const LOGO = {'UC Davis':'ucdavis.png','KAIST':'kaist.png','Shanghai Jiao Tong University':'sjtu.png','L&T EduTech':'lt-edutech.png',
  'Duke University':'duke.png','Springpod':'springpod.png','Khalifa University':'khalifa.png','Inspirit AI':'inspirit.png','MathWorks':'mathworks.png',
  'Harvard Business School Online':'hbs.png','Saïd Business School, University of Oxford':'oxford.png'};
const mono = n => n.replace(/[^A-Za-z& ]/g,'').split(/\s+/).filter(w => /^[A-Z&]/.test(w)).map(w => w[0]).join('').slice(0,3);
const logoChip = n => LOGO[n] ? `<span class="logo" title="${n.replace(/&/g,'&amp;')}"><img src="logos/${LOGO[n]}" alt="${n.replace(/&/g,'&amp;')} logo" loading="lazy" decoding="async"></span>`
  : `<span class="logo mono-tile" title="${n}">${mono(n)}</span>`;
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let total = 0;
document.getElementById('cert-groups').innerHTML = certs.map((c, i) => { total += c.items.length; return `
  <div class="cg${i === 0 ? ' open' : ''}">
    <button class="cg-head" aria-expanded="${i === 0}">
      <span class="mono n">0${i + 1}</span><h3>${esc(c.g)}</h3><span class="mono c">${String(c.items.length).padStart(2,'0')}</span><span class="pm" aria-hidden="true"></span>
    </button>
    <div class="cg-body"><ul>
      ${c.items.map(([t, s, d]) => `<li class="cert">${logoChip(s)}<b>${esc(t)}</b><small>${esc(s)}</small>${d ? `<time>${d}</time>` : ''}</li>`).join('')}
    </ul></div>
  </div>`; }).join('');
document.getElementById('cert-total').textContent = total;
const cc = document.getElementById('cert-count'); cc.textContent = total; cc.dataset.to = total;
document.getElementById('yr').textContent = new Date().getFullYear();

document.querySelectorAll('.cg-head').forEach(h => h.addEventListener('click', () => {
  const g = h.parentElement, open = !g.classList.contains('open');
  g.classList.toggle('open', open); h.setAttribute('aria-expanded', open);
  if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 750);
}));

/* marquee: duplicate content for seamless loop */
document.querySelectorAll('.mq-track').forEach(t => { t.innerHTML += t.innerHTML; });
/* logo fallback: monogram tile if an image fails */
function logoFallback(img){ const c = img.parentElement; if (!c || c.classList.contains('mono-tile')) return;
  c.classList.add('mono-tile'); c.textContent = mono(c.title || img.alt.replace(/ logo$/,'')); }
document.querySelectorAll('.logo img').forEach(i => { if (i.complete && !i.naturalWidth && i.src) logoFallback(i); else i.addEventListener('error', () => logoFallback(i)); });

/* theme (dark default) */
document.getElementById('theme').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next; localStorage.setItem('wk-theme', next);
  document.querySelector('meta[name=theme-color]').content = next === 'light' ? '#efede6' : '#0a0a0b';
  hexColors();
});

/* ---------- graphene honeycomb canvas ---------- */
const cv = document.getElementById('hexfield'), ctx = cv.getContext('2d');
const hero = document.querySelector('.hero');
let W = 0, H = 0, dpr = 1, N = 0, VX, VY, EA, EB, NE = 0, E, base = null, ink = '239,237,230', acc = '200,255,46';
let dirty = true; const waves = []; let px = -1e4, py = -1e4, hoverAmt = 0, lastIdle = 0, nextIdle = 1.2;
function hexColors(){
  const light = root.dataset.theme === 'light';
  ink = light ? '13,13,14' : '239,237,230'; acc = light ? '79,111,0' : '200,255,46';
  renderBase(); if (!motion) frame(0);
}
function build(){
  const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  W = w; H = h; dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const a = W < 700 ? 17 : 21, sx = Math.sqrt(3) * a, sy = 1.5 * a;      // graphene: bond length a
  const cols = Math.ceil(W / sx) + 3, rows = Math.ceil(H / sy) + 3;
  const idA = (i, j) => (j * cols + i) * 2, idB = (i, j) => (j * cols + i) * 2 + 1;
  N = cols * rows * 2; VX = new Float32Array(N); VY = new Float32Array(N); E = new Float32Array(N);
  const ea = [], eb = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
    const x = (i - 1) * sx + (j % 2) * sx / 2 - sx / 2, y = (j - 1) * sy;   // A atom (offset rows = honeycomb)
    VX[idA(i,j)] = x; VY[idA(i,j)] = y; VX[idB(i,j)] = x; VY[idB(i,j)] = y + a;  // B atom directly below A
    ea.push(idA(i,j)); eb.push(idB(i,j));                                    // A–B vertical bond
    if (j > 0){                                                                // A to the two B atoms of the row above
      const o = j % 2;                                                         // odd rows are shifted right by sx/2
      const l = i - 1 + o, r = i + o;
      if (l >= 0 && l < cols){ ea.push(idA(i,j)); eb.push(idB(l, j - 1)); }
      if (r >= 0 && r < cols){ ea.push(idA(i,j)); eb.push(idB(r, j - 1)); }
    }
  }
  EA = Int32Array.from(ea); EB = Int32Array.from(eb); NE = EA.length;
  F = new Float32Array(N); for (let v = 0; v < N; v++) F[v] = fadeAt(VX[v], VY[v]);
  renderBase();
}
function fadeAt(x, y){
  const dx = (x - W * .5) / (1.2 * W), dy = (y - H * .18) / (.85 * H), d = Math.sqrt(dx*dx + dy*dy);
  return d < .3 ? 1 : d < .58 ? 1 - (d - .3) / .28 * .45 : d < .88 ? .55 * (1 - (d - .58) / .3) : 0;
}
let F = new Float32Array(1);
function renderBase(){
  if (!W) return;
  if (!base){ base = document.createElement('canvas'); base.id = 'hexbase'; base.setAttribute('aria-hidden','true'); cv.parentNode.insertBefore(base, cv); }
  base.width = cv.width; base.height = cv.height;
  const b = base.getContext('2d'); b.setTransform(dpr,0,0,dpr,0,0); b.clearRect(0,0,W,H);
  const FL = 6; b.lineWidth = .8;
  for (let l = 1; l <= FL; l++){ const lo = (l - 1) / FL, hi = l / FL;
    b.strokeStyle = `rgba(${ink},${(.075 * (l - .5) / FL).toFixed(4)})`; b.beginPath();
    for (let k = 0; k < NE; k++){ const p = EA[k], q = EB[k], f = (F[p] + F[q]) / 2; if (f > lo && f <= hi){ b.moveTo(VX[p], VY[p]); b.lineTo(VX[q], VY[q]); } }
    b.stroke();
    b.fillStyle = `rgba(${ink},${(.16 * (l - .5) / FL).toFixed(4)})`; b.beginPath();
    for (let v = 0; v < N; v++){ const f = F[v]; if (f > lo && f <= hi){ b.moveTo(VX[v] + 1.1, VY[v]); b.arc(VX[v], VY[v], 1.1, 0, 6.2832); } }
    b.fill(); }
}
const LV = 7; const binsE = Array.from({length: LV}, () => []), binsV = Array.from({length: LV}, () => []);
const DX = new Float32Array(1), DY = new Float32Array(1); let dX = DX, dY = DY;
function frame(t){
  if (dirty){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); dirty = false; }
  if (!motion || !N) return;
  if (dX.length !== N){ dX = new Float32Array(N); dY = new Float32Array(N); }
  // idle: occasional soft ripples so it's alive without input
  if (t - lastIdle > nextIdle){ lastIdle = t; nextIdle = 2.6 + Math.random() * 2.4;
    waves.push({ x: W * (.15 + Math.random() * .7), y: H * (.08 + Math.random() * .45), t0: t, amp: .55 }); }
  while (waves.length && t - waves[0].t0 > 3.2) waves.shift();
  if (waves.length > 6) waves.splice(0, waves.length - 6);
  const R = W < 700 ? 110 : 150, R2 = R * R, ring = W < 700 ? 24 : 34, speed = W < 700 ? 380 : 520;
  let any = false;
  for (let v = 0; v < N; v++){
    const x = VX[v], y = VY[v]; let e = 0, ox = 0, oy = 0;
    if (hoverAmt > .01){ const ddx = x - px, ddy = y - py, d2 = ddx*ddx + ddy*ddy;
      if (d2 < R2){ const d = Math.sqrt(d2) || 1, f = (1 - d / R); const k = f * f * hoverAmt; e += k; ox += ddx / d * k * 5; oy += ddy / d * k * 5; } }
    for (let w = 0; w < waves.length; w++){ const W0 = waves[w], age = t - W0.t0, r = age * speed;
      const ddx = x - W0.x, ddy = y - W0.y, d = Math.sqrt(ddx*ddx + ddy*ddy) || 1, q = (d - r) / ring;
      if (q > -2.2 && q < 2.2){ const k = Math.exp(-q*q) * Math.exp(-age * 1.15) * W0.amp; e += k; ox += ddx / d * k * 4; oy += ddy / d * k * 4 - k * 2; } }
    if (e > 1) e = 1; e *= F[v]; E[v] = e; dX[v] = x + ox; dY[v] = y + oy; if (e > .035) any = true;
  }
  if (!any) return;
  dirty = true;
  for (let l = 0; l < LV; l++){ binsE[l].length = 0; binsV[l].length = 0; }
  for (let k = 0; k < NE; k++){ const e = Math.max(E[EA[k]], E[EB[k]]); if (e > .035) binsE[Math.min(LV - 1, (e * LV) | 0)].push(k); }
  for (let v = 0; v < N; v++){ const e = E[v]; if (e > .05) binsV[Math.min(LV - 1, (e * LV) | 0)].push(v); }
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.lineWidth = 1;
  for (let l = 0; l < LV; l++){ const ks = binsE[l]; if (!ks.length) continue;
    ctx.strokeStyle = `rgba(${acc},${(.08 + (l + .5) / LV * .55).toFixed(3)})`; ctx.beginPath();
    for (const k of ks){ const p = EA[k], q = EB[k]; ctx.moveTo(dX[p], dY[p]); ctx.lineTo(dX[q], dY[q]); }
    ctx.stroke(); }
  for (let l = 0; l < LV; l++){ const vs = binsV[l]; if (!vs.length) continue;
    const rr = 1.2 + (l + .5) / LV * 1.9; ctx.fillStyle = `rgba(${acc},${(.2 + (l + .5) / LV * .8).toFixed(3)})`; ctx.beginPath();
    for (const v of vs){ ctx.moveTo(dX[v] + rr, dY[v]); ctx.arc(dX[v], dY[v], rr, 0, 6.2832); }
    ctx.fill(); }
}
build(); hexColors();
let rsT; const onResize = () => { clearTimeout(rsT); rsT = setTimeout(() => { const w = cv.clientWidth, h = cv.clientHeight; if (w !== W || h !== H){ build(); frame(performance.now()/1000); } }, 120); };
if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(cv); else addEventListener('resize', onResize);
addEventListener('load', () => { build(); frame(performance.now()/1000); });
if (motion){
  const local = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  hero.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; [px, py] = local(e); hoverAmt = 1; }, { passive: true });
  hero.addEventListener('pointerleave', () => { hoverAmt = 0; }, { passive: true });
  hero.addEventListener('pointerdown', e => { const [x, y] = local(e); waves.push({ x, y, t0: performance.now()/1000, amp: 1 }); }, { passive: true });
  window.__ripple = (x, y) => waves.push({ x, y, t0: performance.now()/1000, amp: 1 });
  (function loop(){
    if (!document.hidden && cv.getBoundingClientRect().bottom > 0){ if (hoverAmt > 0 && hoverAmt < 1) hoverAmt *= .9; frame(performance.now()/1000); }
    requestAnimationFrame(loop);
  })();
}

if (!motion){ root.classList.add('intro-done'); document.querySelectorAll('.ms').forEach(m => m.classList.add('on')); return; }

/* ---------- motion ---------- */
gsap.registerPlugin(ScrollTrigger);
root.classList.add('js-ready');
let lenis = null;
if (typeof window.Lenis !== 'undefined'){
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const el = document.querySelector(a.getAttribute('href')); if (!el) return;
  e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' });
}));

/* hero letters */
document.querySelectorAll('.name .chars').forEach(w => {
  w.innerHTML = [...w.textContent].map(c => `<span class="ch">${c}</span>`).join('');
});
const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => root.classList.add('intro-done') });
intro.from('.name .ch', { yPercent: 115, rotate: 8, duration: 1.4, stagger: .045 })
     .from('.headline .hl>span', { yPercent: 110, duration: 1.1, stagger: .08 }, .55)
     .from('.hero-loc, .cta, .scroll-cue, .nav', { opacity: 0, y: 16, duration: 1, stagger: .08 }, .75)
     .from('#hexbase, #hexfield', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0);
gsap.to('.name', { yPercent: -18, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('#hexbase, #hexfield', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

/* split words on scroll */
function splitWords(el){
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3){
      const f = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(' '));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; f.appendChild(s); }
      });
      c.replaceWith(f);
    } else if (c.nodeType === 1) walk(c);
  });
  walk(el); return el.querySelectorAll('.w');
}
document.querySelectorAll('.split').forEach(el => {
  gsap.fromTo(splitWords(el), { opacity: .12, y: 10 }, { opacity: 1, y: 0, stagger: .06, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } });
});

/* masked headings + labels */
gsap.utils.toArray('.mask>span').forEach(s => gsap.from(s, { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 90%' } }));
gsap.utils.toArray('.label').forEach(l => gsap.from(l, { opacity: 0, x: -20, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 92%' } }));

/* count-ups */
gsap.utils.toArray('.count').forEach(el => {
  const o = { v: 0 }, to = +el.dataset.to;
  gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' },
    onUpdate: () => el.textContent = Math.round(o.v) });
});

/* marquee: speed up with scroll velocity */
const tracks = gsap.utils.toArray('.mq-track').map(t => t.getAnimations()[0]).filter(Boolean);
ScrollTrigger.create({ onUpdate: s => {
  const v = Math.min(Math.abs(s.getVelocity()) / 400, 5);
  tracks.forEach(a => { a.playbackRate = 1 + v; });
  gsap.delayedCall(.25, () => tracks.forEach(a => a.playbackRate = 1));
}});

/* timeline */
const tl = document.querySelector('.tl'), track = tl.querySelector('.tl-track');
const mm = gsap.matchMedia();
mm.add('(min-width: 900px)', () => {
  tl.classList.add('is-h');
  const dist = () => track.scrollWidth - innerWidth;
  const h = gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: tl, pin: true, scrub: .8, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true,
      onUpdate: s => tl.style.setProperty('--p', s.progress.toFixed(4)) } });
  tl.querySelectorAll('.ms').forEach(m => {
    ScrollTrigger.create({ trigger: m, containerAnimation: h, start: 'left 70%', onEnter: () => m.classList.add('on'), onLeaveBack: () => m.classList.remove('on') });
    gsap.from(m.querySelectorAll('.when, h3, p, .tag'), { y: 40, opacity: 0, stagger: .06, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: m, containerAnimation: h, start: 'left 85%' } });
    gsap.fromTo(m.querySelector('.yr'), { xPercent: 25 }, { xPercent: -10, ease: 'none',
      scrollTrigger: { trigger: m, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } });
  });
  return () => { tl.classList.remove('is-h'); gsap.set(track, { clearProps: 'transform' }); };
});
mm.add('(max-width: 899px)', () => {
  tl.style.setProperty('--p', 0);
  ScrollTrigger.create({ trigger: track, start: 'top 60%', end: 'bottom 60%', scrub: true,
    onUpdate: s => tl.style.setProperty('--p', s.progress.toFixed(4)) });
  tl.querySelectorAll('.ms').forEach(m => {
    ScrollTrigger.create({ trigger: m, start: 'top 62%', onEnter: () => m.classList.add('on'), onLeaveBack: () => m.classList.remove('on') });
    gsap.from(m.children, { y: 40, opacity: 0, stagger: .07, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: m, start: 'top 85%' } });
  });
});

/* cert rows */
gsap.utils.toArray('.cg').forEach((g, i) => gsap.from(g, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: i * .04, scrollTrigger: { trigger: g, start: 'top 92%' } }));

/* projects: parallax + tilt */
gsap.utils.toArray('.proj').forEach(p => {
  gsap.from(p, { y: 100, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%' } });
  gsap.fromTo(p.querySelector('.proj-num'), { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: p, scrub: true } });
  if (!fine) return;
  const rx = gsap.quickTo(p, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(p, 'rotationY', { duration: .6, ease: 'power3' });
  p.addEventListener('pointermove', e => {
    const r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ry((x - .5) * 10); rx((.5 - y) * 8);
    p.style.setProperty('--mx', x * 100 + '%'); p.style.setProperty('--my', y * 100 + '%');
  });
  p.addEventListener('pointerleave', () => { rx(0); ry(0); });
});

/* connect rows */
gsap.from('.soc li', { y: 60, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.soc', start: 'top 85%' } });
/* skills list stagger */
gsap.from('.skill-list li, .langs li', { y: 30, opacity: 0, stagger: .05, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.skills', start: 'top 80%' } });
gsap.from('.orb', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.orb', start: 'top 92%' } });
gsap.fromTo('.foot-name', { xPercent: 8 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

/* nav hide on scroll down */
let lastY = 0;
ScrollTrigger.create({ onUpdate: s => {
  const y = s.scroll(), down = y > lastY && y > 200; lastY = y;
  gsap.to('.nav', { yPercent: down ? -160 : 0, duration: .5, ease: 'power3.out', overwrite: 'auto' });
}});

/* desktop: cursor + magnetic */
if (fine){
  document.body.classList.add('has-cursor');
  const cur = document.querySelector('.cursor'), dot = cur.querySelector('.c-dot'), ring = cur.querySelector('.c-ring');
  const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
  const rxq = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ryq = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rxq(e.clientX); ryq(e.clientY); });
  document.querySelectorAll('a, button, .cert, .logo').forEach(el => {
    el.addEventListener('pointerenter', () => cur.classList.add('hover'));
    el.addEventListener('pointerleave', () => cur.classList.remove('hover'));
  });
  document.querySelectorAll('.magnetic').forEach(m => {
    const x = gsap.quickTo(m, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), y = gsap.quickTo(m, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    const inner = m.querySelector('span');
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect(), ox = e.clientX - (r.left + r.width / 2), oy = e.clientY - (r.top + r.height / 2);
      x(ox * .35); y(oy * .35); if (inner) gsap.to(inner, { x: ox * .15, y: oy * .15, duration: .4 });
    });
    m.addEventListener('pointerleave', () => { x(0); y(0); if (inner) gsap.to(inner, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); });
  });
}

document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());
})();
