/* ===== Creainspo script ===== */
'use strict';

/* ---------- 1. CONFIG: replace these before publishing ---------- */
const CONFIG = {
  email: 'YOUR_EMAIL@example.com',
  phone: 'YOUR_PHONE_NUMBER'
};

/* ---------- 2. PRODUCT DATA: edit freely ----------
   image: set to a file name (e.g. 'tote-bag.jpg') to replace the CSS placeholder with your photo.
   categories: the design options shown in the panel. */
const PRODUCTS = [
  { id: 'tote', name: 'Tote Bags', art: 'tote', color: '#CDBFEF', image: '', alt: 'Customized tote bag',
    desc: 'Carry your idea everywhere with a tote made around your design, artwork, or words.',
    categories: ['Custom Design', 'Artwork or Illustration', 'Text or Quote', 'Other Idea'] },
  { id: 'pencil', name: 'Pencil Cases', art: 'pencil', color: '#F6C1D3', image: '', alt: 'Customized pencil case',
    desc: 'A pencil case that looks like it belongs to you and nobody else.',
    categories: ['Custom Design', 'Artwork or Illustration', 'Text or Quote', 'Other Idea'] },
  { id: 'keychain', name: 'Keychains', art: 'keychain', color: '#9FB6DE', image: '', alt: 'Customized keychain',
    desc: 'Small keepsakes with a lot of personality.',
    categories: ['Design', 'Portrait', 'Other'] },
  { id: 'charm', name: 'Phone Charms', art: 'charm', color: '#F6C1D3', image: '', alt: 'Customized phone charm',
    desc: 'Dress up your phone with a charm in your colors and theme.',
    categories: ['Custom Design', 'Color or Theme', 'Personalized Idea', 'Other'] },
  { id: 'art', name: 'Art Commissions', art: 'frame', color: '#CDBFEF', image: '', alt: 'Custom art commission',
    desc: 'Original artwork made from your idea, character, or story.',
    categories: ['Character Art', 'Portrait', 'Original Artwork', 'Other Commission'] },
  { id: 'bottle', name: 'Water Bottles — Customer-Supplied', short: 'Water Bottles', art: 'bottle', color: '#9FB6DE', image: '', alt: 'Customized water bottle',
    badge: 'Bring your own bottle',
    desc: 'A customization service for a bottle you already own.',
    note: 'Water bottles are a customer-supplied customization option. Please contact us first to confirm whether your bottle can be customized.',
    categories: ['Custom Design', 'Name or Text', 'Artwork or Illustration', 'Other'] }
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
const label = p => p.short || p.name;

/* ---------- 3. Contact details ---------- */
function initContact() {
  const mail = 'mailto:' + CONFIG.email, tel = 'tel:' + CONFIG.phone;
  $$('#mailBtn,#emailText,.fmail').forEach(a => { a.href = mail; if (a.id === 'emailText' || a.classList.contains('fmail')) a.textContent = CONFIG.email; });
  $$('#callBtn,#phoneText,.fphone').forEach(a => { a.href = tel; if (a.id === 'phoneText' || a.classList.contains('fphone')) a.textContent = CONFIG.phone; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
}

/* ---------- 4. Navigation ---------- */
function initNav() {
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  if (!nav || !burger || !menu) return;
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('[data-nav]').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    $('#toTop')?.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Highlight the section in view
  const links = $$('.menu a');
  const secs = ['home', 'about', 'products', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) links.forEach(l => {
      const on = l.getAttribute('href') === '#' + en.target.id;
      l.classList.toggle('active', on);
      on ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));

  $('#toTop')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
}

/* ---------- 5. Hero: mouse-responsive shapes + cursor ---------- */
function initHero() {
  const hero = $('.hero'); if (!hero || reduceMotion) return;
  const items = $$('[data-depth]', hero);
  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    items.forEach(el => { const d = +el.dataset.depth; el.style.transform = `translate(${x * d}px,${y * d}px)`; });
  });
}
function initCursor() {
  const c = $('.cursor'); if (!c || reduceMotion || !matchMedia('(pointer:fine)').matches) return;
  addEventListener('pointermove', e => { c.classList.add('on'); c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  document.addEventListener('pointerover', e => c.classList.toggle('big', !!e.target.closest('a,button,select,.card')));
  document.addEventListener('mouseleave', () => c.classList.remove('on'));
}

/* ---------- 6. About doodle ---------- */
function initDoodle() {
  const bag = $('#doodleBag'); if (!bag) return;
  $$('.dots button').forEach(b => b.addEventListener('click', () => {
    bag.setAttribute('fill', b.dataset.c);
    $$('.dots button').forEach(o => o.setAttribute('aria-pressed', o === b));
  }));
}

/* ---------- 7. Products + panel ---------- */
let current = null, selectedCat = null, lastFocus = null;

function buildCards() {
  const grid = $('#productGrid'); if (!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card reveal';
    const media = document.createElement('div');
    media.className = 'media';
    media.style.background = p.color + '66';
    if (p.image) {
      const img = document.createElement('img');
      img.src = p.image; img.alt = p.alt || label(p); img.loading = 'lazy';
      media.appendChild(img);
    } else {
      /* ADD YOUR OWN IMAGE: set the `image` field for this product in PRODUCTS (top of this file),
         e.g. image: 'tote-bag.jpg'. Until then this CSS drawing is shown (it is not a photo). */
      const art = document.createElement('div');
      art.className = 'art art--' + p.art; art.style.setProperty('--a', p.color);
      art.setAttribute('aria-hidden', 'true');
      media.appendChild(art);
    }
    const body = document.createElement('div');
    body.className = 'card__body';
    body.innerHTML = (p.badge ? `<span class="badge">${p.badge}</span>` : '') + `<h3>${p.name}</h3><p>${p.desc}</p>`;
    const btn = document.createElement('button');
    btn.className = 'btn btn--dark'; btn.type = 'button';
    btn.textContent = 'Explore Designs';
    btn.setAttribute('aria-label', 'Explore designs for ' + label(p));
    btn.addEventListener('click', () => openPanel(p.id));
    body.appendChild(btn);
    card.append(media, body);
    // Clicking anywhere on the card also opens the panel
    card.addEventListener('click', e => { if (!e.target.closest('button')) openPanel(p.id); });
    grid.appendChild(card);
  });
  // Fill the form's product dropdown from the same data
  const sel = $('#fProduct');
  if (sel) PRODUCTS.forEach(p => sel.add(new Option(label(p), label(p))));
}

function openPanel(id) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  current = p; selectedCat = null; lastFocus = document.activeElement;
  $('#mTitle').textContent = p.name;
  $('#mDesc').textContent = p.desc;
  const note = $('#mNote'); note.hidden = !p.note; note.textContent = p.note || '';
  const wrap = $('#mCats'); wrap.innerHTML = '';
  p.categories.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cat'; b.textContent = c; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => selectCat(c, b));
    wrap.appendChild(b);
  });
  $('#mSel').textContent = 'Pick a design category to continue.';
  $('#mContact').disabled = true;
  const m = $('#modal'); m.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal__box', m).focus();
}
function selectCat(c, btn) {
  selectedCat = c;
  $$('.cat').forEach(b => b.setAttribute('aria-pressed', b === btn));
  $('#mSel').textContent = `Selected: ${label(current)} → ${c}`;
  $('#mContact').disabled = false;
}
function closePanel() {
  const m = $('#modal'); if (!m || m.hidden) return;
  m.hidden = true; document.body.style.overflow = '';
  lastFocus?.focus?.();
}
function initModal() {
  const m = $('#modal'); if (!m) return;
  $$('[data-close]', m).forEach(el => el.addEventListener('click', closePanel));
  document.addEventListener('keydown', e => {
    if (m.hidden) return;
    if (e.key === 'Escape') closePanel();
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('button:not([disabled])', $('.modal__box', m));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $('#mContact')?.addEventListener('click', () => {
    if (!current || !selectedCat) return;
    const name = label(current), cat = selectedCat;
    closePanel();
    $('#fType').value = 'Custom Order';
    $('#fProduct').value = name;
    const msg = $('#fMsg');
    msg.value = `Hi Creainspo! I'm interested in: ${name} — ${cat}.\n\nHere's my idea:\n`;
    updateCount();
    $('#contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => { msg.focus(); msg.setSelectionRange(msg.value.length, msg.value.length); }, reduceMotion ? 0 : 600);
  });
}

/* ---------- 8. Contact form (front-end only) ---------- */
function updateCount() {
  const m = $('#fMsg'), c = $('#count'); if (m && c) c.textContent = `${m.value.length} / ${m.maxLength}`;
}
function setErr(input, errId, text) {
  $('#' + errId).textContent = text;
  text ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
  return !text;
}
function validate() {
  const n = $('#fName'), e = $('#fEmail'), m = $('#fMsg');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value.trim());
  const r = [
    setErr(n, 'eName', n.value.trim() ? '' : 'Please enter your name.'),
    setErr(e, 'eEmail', !e.value.trim() ? 'Please enter your email address.' : emailOk ? '' : 'Enter a valid email, like name@example.com.'),
    setErr(m, 'eMsg', m.value.trim().length >= 10 ? '' : 'Please write at least 10 characters.')
  ];
  if (!r[0]) n.focus(); else if (!r[1]) e.focus(); else if (!r[2]) m.focus();
  return r.every(Boolean);
}
function setStatus(text, kind) {
  const s = $('#status'); s.className = 'status ' + kind; s.textContent = text;
}
function initForm() {
  const f = $('#feedbackForm'); if (!f) return;
  $('#fMsg').addEventListener('input', updateCount);
  ['fName', 'fEmail', 'fMsg'].forEach(id => $('#' + id).addEventListener('input', e => e.target.removeAttribute('aria-invalid')));
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) { setStatus('Please fix the highlighted fields and try again.', 'bad'); return; }
    const type = $('#fType').value, product = $('#fProduct').value;
    const subject = `[Creainspo] ${type}${product ? ' – ' + product : ''}`;
    const body = `Name: ${$('#fName').value.trim()}\nEmail: ${$('#fEmail').value.trim()}\nType: ${type}\nRelated product: ${product || 'None'}\n\nMessage:\n${$('#fMsg').value.trim()}`;
    const href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Your entries stay in the form so you can try again if the email app does not open.
    window.location.href = href;
    setStatus('Email draft prepared. This is not sent yet: please review it and press Send in your email app. If nothing opened, your entries are still here, so you can try again or email us directly.', 'ok');
  });
  $('#resetBtn').addEventListener('click', () => {
    f.reset();
    $$('[aria-invalid]', f).forEach(i => i.removeAttribute('aria-invalid'));
    $$('.err', f).forEach(x => x.textContent = '');
    updateCount();
    setStatus('Form cleared.', 'ok');
    $('#fName').focus();
  });
  // "Request a Custom Order" scrolls to the form and presets the type
  $('#customOrderBtn')?.addEventListener('click', e => {
    e.preventDefault();
    $('#fType').value = 'Custom Order';
    f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => $('#fName').focus({ preventScroll: true }), reduceMotion ? 0 : 600);
  });
  updateCount();
}

/* ---------- 9. Scroll reveal ---------- */
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  els.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initContact(); initNav(); initHero(); initCursor(); initDoodle();
  buildCards(); initModal(); initForm(); initReveal();
});
