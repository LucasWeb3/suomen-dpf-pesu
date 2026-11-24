// Suomen DPF-Pesu – small progressive enhancements. The page works without this file.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Mobile menu ---------- */
const toggle = $('[data-menu-toggle]');
const nav = $('#nav');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Logos: back to the top ---------- */
// Both logos scroll to the top, close the mobile menu and clear any #section hash.
$$('.brand').forEach((link) => link.addEventListener('click', (e) => {
  e.preventDefault();
  setMenu(false);
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', window.location.pathname + window.location.search);
}));

/* ---------- Header state + current section in nav ---------- */
const header = $('[data-header]');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const navLinks = $$('.nav ul a');
const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
const inView = new Set();
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) inView.add(entry.target.id); else inView.delete(entry.target.id);
  });
  // the section crossing the middle of the screen wins; none (e.g. the hero) clears it
  const current = sections.find((s) => inView.has(s.id));
  navLinks.forEach((a) => a.classList.toggle('is-current', !!current && a.getAttribute('href') === '#' + current.id));
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- Reveal on scroll (only for things that start below the fold) ---------- */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const groups = ['.section-head', '.scope-copy', '.scope-media', '.price-grid > *', '.courier', '.proof-copy',
    '.filter-demo', '.step', '.map-panel', '.loc', '.product', '.join-copy', '.join-side', '.faq details',
    '.quote-copy', '.quote-form'];
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObserver.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  groups.forEach((sel) => {
    $$(sel).forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.dataset.reveal = '';
      el.style.setProperty('--d', `${Math.min(i % 4, 3) * 70}ms`);
      revealObserver.observe(el);
    });
  });
}

/* ---------- Filter demo: a sooty DPF face washes clean ---------- */
const demo = $('[data-filter-demo]');
if (demo) {
  const face = $('[data-filter-face]', demo);
  const pressureEl = $('[data-pressure]', demo);
  const cleanEl = $('[data-clean]', demo);
  const N = 14;
  const SOOT = ['#1c1a17', '#221f1b', '#29251f', '#302b24', '#191816', '#3a342c'];
  const CERAMIC = ['#d8dccf', '#e0e3d8', '#d2d7c9', '#dcdfd3'];
  const FROM = 188, TO = 11, DURATION = 2800;
  const cells = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const el = document.createElement('i');
      el.style.setProperty('--c', pick(SOOT));
      el.style.setProperty('--k', pick(CERAMIC));
      face.appendChild(el);
      const dist = Math.hypot(r - (N - 1) / 2, c - (N - 1) / 2) / (N / 1.4);
      cells.push({ el, at: Math.min(1, dist * 0.82 + Math.random() * 0.18) });
    }
  }

  let raf = 0;
  const timers = [];
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function render(progress) {
    const p = ease(progress);
    pressureEl.textContent = Math.round(FROM - (FROM - TO) * p);
    cleanEl.textContent = Math.round(100 * p);
  }
  function finish() {
    cells.forEach(({ el }) => { el.classList.remove('is-flash'); el.classList.add('is-clean'); });
    render(1);
    demo.classList.add('is-done');
  }
  function reset() {
    cancelAnimationFrame(raf);
    timers.splice(0).forEach(clearTimeout);
    cells.forEach(({ el }) => el.classList.remove('is-clean', 'is-flash'));
    demo.classList.remove('is-done');
    render(0);
  }
  function run() {
    reset();
    if (reduceMotion) { finish(); return; }
    cells.forEach(({ el, at }) => {
      timers.push(setTimeout(() => {
        el.classList.add('is-flash');
        timers.push(setTimeout(() => { el.classList.remove('is-flash'); el.classList.add('is-clean'); }, 140));
      }, at * DURATION));
    });
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (DURATION + 140));
      render(t);
      if (t < 1) raf = requestAnimationFrame(tick); else finish();
    };
    raf = requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const once = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { run(); once.disconnect(); }
    }, { threshold: 0.45 });
    once.observe(demo);
  } else {
    finish();
  }
  $('[data-replay]', demo).addEventListener('click', run);
}

/* ---------- Map <-> location list ---------- */
function setActivePin(id) {
  $$('[data-pin]').forEach((el) => el.classList.toggle('is-active', !!id && el.dataset.pin === id));
}
$$('.loc[data-pin], .map-label[data-pin]').forEach((el) => {
  el.addEventListener('pointerenter', () => setActivePin(el.dataset.pin));
  el.addEventListener('pointerleave', () => setActivePin(null));
  el.addEventListener('focusin', () => setActivePin(el.dataset.pin));
  el.addEventListener('focusout', () => setActivePin(null));
});

/* ---------- Quote form ---------- */
const form = $('[data-quote-form]');
const statusEl = $('[data-form-status]');

$$('[data-kalusto]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const opt = $(`[data-kalusto-opt="${btn.dataset.kalusto}"]`, form);
    if (opt) opt.checked = true;
  });
});

function fieldOf(input) { return input.closest('.field'); }
function validate() {
  const email = form.elements.email;
  const place = form.elements.toimipiste;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
  const placeOk = place.value !== '';
  fieldOf(email).classList.toggle('is-invalid', !emailOk);
  fieldOf(place).classList.toggle('is-invalid', !placeOk);
  email.setAttribute('aria-invalid', String(!emailOk));
  place.setAttribute('aria-invalid', String(!placeOk));
  if (!emailOk) email.focus(); else if (!placeOk) place.focus();
  return emailOk && placeOk;
}
['input', 'change'].forEach((type) => form.addEventListener(type, (e) => {
  const field = fieldOf(e.target);
  if (field && field.classList.contains('is-invalid')) {
    const ok = e.target.name === 'email'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.target.value.trim())
      : e.target.value !== '';
    if (ok) { field.classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false'); }
  }
}));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  statusEl.className = 'form-status';
  statusEl.textContent = '';
  if (!validate()) return;

  const f = form.elements;
  const to = f.toimipiste.value;
  const place = f.toimipiste.selectedOptions[0].textContent;
  const reg = f.rekisteri.value.trim().toUpperCase();
  const lines = [
    'Hei,', '', 'haluaisin tarjouksen DPF-pesusta.', '',
    `Kalusto: ${f.kalusto.value}`,
    `Rekisteri- tai VIN-numero: ${reg || '–'}`,
    `Toimipiste: ${place}`, '',
    f.viesti.value.trim() ? `${f.viesti.value.trim()}\n` : null,
    `Nimi: ${f.nimi.value.trim() || '–'}`,
    `Puhelin: ${f.puhelin.value.trim() || '–'}`,
    `Sähköposti: ${f.email.value.trim()}`,
  ].filter((l) => l !== null);
  const subject = `Tarjouspyyntö DPF-pesusta${reg ? ' – ' + reg : ''}`;
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;

  statusEl.classList.add('is-ok');
  statusEl.innerHTML = '';
  statusEl.append(
    'Sähköpostiohjelmasi avautui valmiiksi täytetyllä viestillä – lähetä se sieltä. Jos mitään ei avautunut, kirjoita osoitteeseen ',
    Object.assign(document.createElement('a'), { href: `mailto:${to}`, textContent: to }),
    '.',
  );
});

/* ---------- Footer year ---------- */
$('[data-year]').textContent = new Date().getFullYear();
