document.documentElement.classList.add('js');
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
const wrap = document.getElementById('cert-groups');
let total = 0;
wrap.innerHTML = certs.map(c => { total += c.items.length; return `
  <div class="group reveal"><header><h3>${esc(c.g)}</h3><span>${c.items.length}</span></header><ul>
  ${c.items.map(([t,i,d]) => `<li><div><b>${esc(t)}</b><small>${esc(i)}</small></div>${d?`<time>${d}</time>`:''}</li>`).join('')}
  </ul></div>`; }).join('');
document.getElementById('cert-total').textContent = total;
document.getElementById('cert-count').textContent = total;
document.getElementById('yr').textContent = new Date().getFullYear();

// theme toggle (defaults to system)
const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const cur = root.dataset.theme || (sysDark ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next; localStorage.setItem('theme', next);
});

// scroll reveal
const els = document.querySelectorAll('.reveal');
if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
  els.forEach(e => e.classList.add('in'));
} else {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), {rootMargin:'0px 0px -8% 0px', threshold:.12});
  els.forEach(e => io.observe(e));
}
