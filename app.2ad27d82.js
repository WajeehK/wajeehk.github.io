(() => {
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGsap && !reduce;
if (!motion) root.classList.remove('motion');
/* safety net: whatever happens, reveal hero text after 3.5s */
const revealAll = () => { root.classList.add('revealed');
  document.querySelectorAll('.name .ch, .headline .hl>span, .hero-loc, .cta, .scroll-cue, .nav, #lattice, .mask>span')
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
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let total = 0;
document.getElementById('cert-groups').innerHTML = certs.map((c, i) => { total += c.items.length; return `
  <div class="cg${i === 0 ? ' open' : ''}">
    <button class="cg-head" aria-expanded="${i === 0}">
      <span class="mono n">0${i + 1}</span><h3>${esc(c.g)}</h3><span class="mono c">${String(c.items.length).padStart(2,'0')}</span><span class="pm" aria-hidden="true"></span>
    </button>
    <div class="cg-body"><ul>
      ${c.items.map(([t, s, d]) => `<li class="cert"><b>${esc(t)}</b><small>${esc(s)}</small>${d ? `<time>${d}</time>` : ''}</li>`).join('')}
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

/* theme (dark default) */
document.getElementById('theme').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next; localStorage.setItem('wk-theme', next);
  document.querySelector('meta[name=theme-color]').content = next === 'light' ? '#efede6' : '#0a0a0b';
  latticeColor();
});

/* ---------- lattice canvas ---------- */
const cv = document.getElementById('lattice'), ctx = cv.getContext('2d');
let W, H, dpr, pts = [], edges = [], rgb = '239,237,230', acc = '200,255,46', mx = 0, my = 0, running = true;
function latticeColor(){
  const light = root.dataset.theme === 'light';
  rgb = light ? '13,13,14' : '239,237,230'; acc = light ? '79,111,0' : '200,255,46';
  if (!motion) draw(0.6);
}
function build(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
  const n = W < 700 ? 5 : 7, s = 1 / (n - 1); pts = []; edges = [];
  const id = (x,y,z) => (x*n + y)*n + z;
  for (let x=0;x<n;x++) for (let y=0;y<n;y++) for (let z=0;z<n;z++){
    pts.push([x*s-.5, y*s-.5, z*s-.5]);
    if (x<n-1) edges.push([id(x,y,z), id(x+1,y,z)]);
    if (y<n-1) edges.push([id(x,y,z), id(x,y+1,z)]);
    if (z<n-1) edges.push([id(x,y,z), id(x,y,z+1)]);
  }
}
function draw(t){
  const ay = t*.08 + mx*.4, ax = .55 + my*.25, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
  const scale = Math.min(W, H) * (W < 700 ? .95 : .78), ox = W * (W < 700 ? .62 : .7), oy = H * .42;
  const proj = pts.map(([x,y,z]) => {
    let X = x*cy - z*sy, Z = x*sy + z*cy, Y = y*cx - Z*sx; Z = y*sx + Z*cx;
    const p = 2.2 / (2.2 + Z); return [ox + X*scale*p, oy + Y*scale*p, Z];
  });
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H); ctx.lineWidth = 1;
  for (const [a,b] of edges){
    const A = proj[a], B = proj[b], d = (1 - (A[2]+B[2])/2) * .5;
    ctx.strokeStyle = `rgba(${rgb},${(.03 + d*.11).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(A[0],A[1]); ctx.lineTo(B[0],B[1]); ctx.stroke();
  }
  proj.forEach((P, i) => {
    const d = 1 - (P[2] + .5); const hot = i % 11 === 0;
    ctx.fillStyle = hot ? `rgba(${acc},${(.35 + d*.6).toFixed(3)})` : `rgba(${rgb},${(.12 + d*.4).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(P[0], P[1], (hot ? 2.6 : 1.4) * (0.7 + d*.8), 0, 6.283); ctx.fill();
  });
}
build(); latticeColor(); draw(0.6);
addEventListener('load', () => { build(); draw(performance.now()/1000); });
addEventListener('resize', () => { build(); draw(performance.now()/1000); });
if (motion){
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  (function loop(){ if (!document.hidden && cv.getBoundingClientRect().bottom > 0) draw(performance.now()/1000); requestAnimationFrame(loop); })();
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
     .from('#lattice', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0);
gsap.to('.name', { yPercent: -18, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('#lattice', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

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
  document.querySelectorAll('a, button, .cert').forEach(el => {
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
