/* Kaiyang Hu portfolio: page behaviour. No tracking, no network calls beyond the page's own files. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------- honours shown in the 3D cabinet (shared with scenes.js) ---------- */
  window.CABINET = [
    { cat: 'Maths', stat: 'Gold ×6', title: 'UKMT Mathematical Challenges', desc: 'Gold six times, with olympiad qualification. Highest in school three times.', tag: 'UKMT', obj: 'medals' },
    { cat: 'Maths', stat: '135/135', title: 'Intermediate Mathematical Challenge', desc: 'A perfect score.', tag: 'UKMT', obj: 'plaque', text: '135/135', sub: 'INTERMEDIATE MATHS CHALLENGE' },
    { cat: 'Maths', stat: '125/125 ×2', title: 'Senior Mathematical Challenge', desc: 'Perfect scores in 2024 and 2025.', tag: 'UKMT, 2024 and 2025', obj: 'plaque', text: '125/125', sub: 'SENIOR MATHS CHALLENGE ×2' },
    { cat: 'Maths', stat: 'Gold', title: 'UKMT Maclaurin Olympiad', desc: 'Global top 20.', tag: '2025', obj: 'medal', metal: 'gold', text: 'M' },
    { cat: 'Maths', stat: 'Silver', title: 'British Mathematical Olympiad, Round 1', desc: 'Highest in school, global top 40.', tag: '2025', obj: 'medal', metal: 'silver', text: 'BMO' },
    { cat: 'Maths', stat: 'Merit', title: 'British Mathematical Olympiad, Round 2', desc: 'Highest in year, global top 50.', tag: '2026', obj: 'frame', text: 'Merit', sub: 'BMO ROUND 2' },
    { cat: 'Maths', stat: '11/15', title: 'AIME II', desc: 'Top 8%, after the AMC 12B Honor Roll of Distinction.', tag: '2026', obj: 'plaque', text: '11/15', sub: 'AIME II' },
    { cat: 'Maths', stat: 'Top ×3', title: 'Highest in school', desc: 'The school\'s top UKMT score three times.', tag: 'Dubai College', obj: 'trophy', text: '×3' },
    { cat: 'Piano', stat: '1st', title: 'Steinway Piano Competition GCC', desc: '1st prize at the first edition, in Dubai.', tag: '2025', obj: 'trophy', text: '1st' },
    { cat: 'Piano', stat: '49/50', title: 'ABRSM ARSM Performance Diploma', desc: 'Distinction: pieces 29/30, performance 20/20.', tag: '2019', obj: 'frame', text: '49/50', sub: 'ARSM, DISTINCTION' }
  ];

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
    window.lenis = lenis;
    if (G) { lenis.on('scroll', () => ST && ST.update()); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const goTo = target => {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -8 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  window.goTo = goTo;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); closeMenu(false); goTo(id === '#top' ? '#top' : id);
    history.pushState(null, '', id);
  });

  /* ---------- torn paper edges ---------- */
  const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function drawTorn(el) {
    const w = Math.max(320, el.clientWidth), h = el.clientHeight || 80, r = rnd(+el.dataset.seed * 997 + 13);
    const top = el.dataset.top, bot = el.dataset.bot, mid = h * (.35 + r() * .25), tilt = (r() - .5) * h * .5;
    const pts = []; let x = 0;
    while (x <= w + 8) { const t = x / w; pts.push([x, mid + tilt * (t - .5) + (r() - .5) * h * .22 + Math.sin(t * 9 + r()) * h * .05]); x += 4 + r() * 10; }
    const line = pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    const fibre = pts.map(([px, py]) => `${px.toFixed(1)},${(py + 4 + r() * 7).toFixed(1)}`).join(' ');
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><rect width="${w}" height="${h}" fill="${bot}"/>` +
      `<polygon points="0,0 ${w},0 ${w},${h} ${fibre.split(' ').reverse().join(' ')} 0,${h}" fill="${bot}"/>` +
      `<polygon points="0,0 ${w},0 ${fibre.split(' ').reverse().join(' ')}" fill="#FAF8F3"/>` +
      `<polygon points="0,0 ${w},0 ${line.split(' ').reverse().join(' ')}" fill="${top}"/></svg>`;
  }
  const torns = $$('.torn');
  const redrawTorn = () => torns.forEach(drawTorn);
  redrawTorn();
  let tw = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - tw) > 40) { tw = innerWidth; redrawTorn(); } });

  /* ---------- entrance reveals (content stays visible if this never runs) ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('pre');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.pop').forEach(el => io.observe(el));
    setTimeout(() => $$('.pop').forEach(el => el.classList.add('in')), 9000);
  }
  if (G && !reduce) {
    G.from('#sticker', { y: 160, rotate: -4, duration: 1.2, ease: 'power3.out', delay: .1 });
    G.from('.hero-name h1', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' });
    G.from('#hiBubble', { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2)', delay: 1.3 });
  }

  /* hero bubble sits beside the head */
  const sticker = $('#sticker'), hi = $('#hiBubble'), hero = $('#hero');
  const placeHi = () => {
    if (!sticker || !hi) return;
    const s = sticker.getBoundingClientRect(), h = hero.getBoundingClientRect();
    hi.style.left = Math.min(h.width - 180, s.left - h.left + s.width * .78) + 'px';
    hi.style.top = (s.top - h.top + (innerWidth < 760 ? -30 : s.height * .1)) + 'px';
  };
  addEventListener('resize', placeHi); addEventListener('load', placeHi); placeHi();

  /* ---------- nav: scroll-spy with a sliding highlight ---------- */
  const seg = $('.seg'), blob = $('.seg .blob'), spyLinks = $$('.seg a');
  const spyTargets = { research: ['#research', '#epq', '#pisa', '#xlab'], book: ['#book', '#writing'], projects: ['#projects', '#kevinvariant', '#cevian', '#fingerflow', '#more-projects'], honours: ['#honours'], piano: ['#piano'] };
  const setActive = key => {
    spyLinks.forEach(a => a.classList.toggle('on', a.dataset.spy === key));
    const a = spyLinks.find(l => l.dataset.spy === key);
    if (!a) { blob.style.opacity = 0; return; }
    blob.style.opacity = 1; blob.style.width = a.offsetWidth + 'px'; blob.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const spy = () => {
    const y = innerHeight * .4; let found = null;
    for (const [key, sels] of Object.entries(spyTargets)) for (const s of sels) { const el = $(s); if (!el) continue; const r = el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) found = key; }
    setActive(found);
  };
  addEventListener('scroll', spy, { passive: true }); spy();

  /* ---------- menu ---------- */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  function openMenu() { menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); lenis?.stop(); root.style.overflow = 'hidden'; $('#menuClose').focus();
    if (G && !reduce) G.fromTo('.menu ol li', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .5, ease: 'power3.out' }); }
  function closeMenu(focus = true) { if (menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); lenis?.start(); root.style.overflow = ''; if (focus) menuBtn.focus(); }
  menuBtn.addEventListener('click', openMenu);
  $('#menuClose').addEventListener('click', () => closeMenu());
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- audio: one player for the nav toggle and the composition list ---------- */
  const tracks = $$('.track');
  const playlist = ['lullaby-in-ab', 'drift', 'berceuse-in-d', 'impromptu-in-eb', 'allegro-in-bb'].map(n => tracks.find(t => t.dataset.src.includes(n))).filter(Boolean);
  const audio = new Audio(); audio.preload = 'none';
  let current = null;
  const icon = on => on ? '<svg viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>' : '<svg viewBox="0 0 14 14"><path d="M3 1 L13 7 L3 13 Z"/></svg>';
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  const snd = $('#sndBtn'), np = $('#np');
  const sync = () => {
    tracks.forEach(t => { const on = t === current && !audio.paused; const b = $('.play', t); b.innerHTML = icon(on); b.setAttribute('aria-pressed', String(on)); });
    const on = !audio.paused && !!current; snd.setAttribute('aria-pressed', String(on)); np.hidden = !on;
    if (current) $('#npTitle').textContent = $('.t b', current).textContent;
  };
  function playTrack(li) {
    if (current !== li) { if (current) { $('.tbar i', current).style.width = '0'; $('time', current).textContent = '0:00'; } current = li; audio.src = li.dataset.src; }
    $$('video').forEach(v => v.pause());
    audio.play().catch(() => {});
  }
  tracks.forEach(li => {
    $('.play', li).innerHTML = icon(false);
    $('.play', li).addEventListener('click', () => { if (current === li && !audio.paused) audio.pause(); else playTrack(li); });
    $('.tbar', li).addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(), f = (e.clientX - r.left) / r.width; if (current !== li) playTrack(li); const go = () => { audio.currentTime = f * audio.duration; }; audio.duration ? go() : audio.addEventListener('loadedmetadata', go, { once: true }); });
  });
  audio.addEventListener('timeupdate', () => { if (!current) return; $('.tbar i', current).style.width = (audio.currentTime / (audio.duration || 1) * 100) + '%'; $('time', current).textContent = fmt(audio.currentTime); });
  audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
  audio.addEventListener('ended', () => { const i = playlist.indexOf(current); if (i >= 0) playTrack(playlist[(i + 1) % playlist.length]); else sync(); });
  snd.addEventListener('click', () => { if (!audio.paused) audio.pause(); else playTrack(current || playlist[0]); });
  $('#npNext').addEventListener('click', () => { const i = playlist.indexOf(current); playTrack(playlist[(i + 1) % playlist.length]); });
  document.addEventListener('play', e => { if (e.target.tagName === 'VIDEO') { audio.pause(); $$('video').forEach(v => { if (v !== e.target) v.pause(); }); } }, true);

  /* ---------- copy buttons ---------- */
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    const label = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; } catch { b.textContent = b.dataset.copy; }
    setTimeout(() => { b.textContent = label; }, 1600);
  }));

  /* ---------- image viewer ---------- */
  const viewer = $('#viewer'); let back = null;
  $$('.zoom').forEach(z => z.addEventListener('click', () => { const img = $('img', z); back = z; $('img', viewer).src = img.currentSrc || img.src; $('img', viewer).alt = img.alt; viewer.showModal(); lenis?.stop(); }));
  $('button', viewer).addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => { lenis?.start(); back?.focus(); });

  /* ---------- lens: the proof under the sentence ---------- */
  const lens = $('#lens'), lensBtn = $('#lensBtn');
  lensBtn.addEventListener('click', () => { const on = !lens.classList.contains('revealed'); lens.classList.toggle('revealed', on); lensBtn.setAttribute('aria-expanded', String(on)); lensBtn.textContent = on ? 'Hide the proof' : 'Show the proof'; $('.under', lens).setAttribute('aria-hidden', String(!on)); });
  if (fine) {
    let x = 0, y = 0, tx = 0, ty = 0, rr = 0, tr = 0, last = 0, raf = 0;
    const step = now => { const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; const k = reduce ? 1 : 1 - Math.exp(-18 * dt); x += (tx - x) * k; y += (ty - y) * k; rr += (tr - rr) * k;
      lens.style.setProperty('--rx', x + 'px'); lens.style.setProperty('--ry', y + 'px'); lens.style.setProperty('--rr', rr + 'px');
      raf = (Math.abs(tr - rr) > .3 || Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) ? requestAnimationFrame(step) : 0; };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    lens.addEventListener('pointerenter', e => { const r = lens.getBoundingClientRect(); x = tx = e.clientX - r.left; y = ty = e.clientY - r.top; tr = 120; kick(); });
    lens.addEventListener('pointermove', e => { const r = lens.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; kick(); });
    lens.addEventListener('pointerleave', () => { tr = 0; kick(); });
  }

  /* ---------- cursor (mouse only) ---------- */
  if (fine && !reduce) {
    const cur = $('#cur'), dot = $('.dot', cur), lbl = $('.lbl', cur);
    let mx = -100, my = -100, cx = -100, cy = -100, vx = 0, last = performance.now(), shown = false;
    const show = on => { shown = on; cur.classList.toggle('on', on); root.classList.toggle('cur-hide', on); };
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY; if (!shown) { cx = mx; cy = my; show(true); } });
    document.addEventListener('pointerleave', () => show(false));
    addEventListener('blur', () => show(false));
    document.addEventListener('visibilitychange', () => { if (document.hidden) show(false); });
    const state = t => {
      cur.classList.remove('link', 'label', 'lens'); lbl.textContent = '';
      if (!t) return;
      const c = t.closest('[data-cur]');
      if (c && c.id === 'lens') { cur.classList.add('lens'); return; }
      if (c) { cur.classList.add('label'); lbl.textContent = c.dataset.cur; return; }
      if (t.closest('a, button, input, summary, video, label')) cur.classList.add('link');
    };
    document.addEventListener('pointerover', e => state(e.target));
    const tick = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-22 * dt); const nx = cx + (mx - cx) * k; vx = (nx - cx) / Math.max(dt, .001); cx = nx; cy += (my - cy) * k;
      const s = Math.min(.35, Math.abs(vx) / 4000);
      cur.style.transform = `translate(${cx}px, ${cy}px)`; dot.style.transform = `scale(${1 + s}, ${1 - s * .6})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    /* magnetic buttons */
    $$('.mag').forEach(m => {
      m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      m.addEventListener('pointerleave', () => { m.style.transform = ''; });
    });
  }

  /* ---------- FingerFlow keyboard ---------- */
  (() => {
    const svg = $('#kbd'); if (!svg) return;
    const names = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'], fingers = [1, 2, 3, 1, 2, 3, 4, 5], kw = 56, top = 60; let h = '';
    for (let i = 0; i < 10; i++) h += `<rect class="w${i < 8 ? ' hit' : ''}" x="${i * kw + .75}" y="${top}" width="${kw - 1.5}" height="132" rx="3"/>`;
    [0, 1, 3, 4, 5, 7, 8].forEach(i => { h += `<rect class="b" x="${(i + 1) * kw - kw * .3}" y="${top}" width="${kw * .6}" height="82" rx="2"/>`; });
    names.forEach((n, i) => { h += `<text x="${i * kw + kw / 2}" y="${top + 120}">${n}</text><text class="fing" x="${i * kw + kw / 2}" y="${top - 18}">${fingers[i]}</text>`; });
    h += `<path class="arc" d="M ${2 * kw + kw * .7} ${top - 40} q ${kw * .3} -16 ${kw * .6} 0"/>`;
    svg.innerHTML = h;
  })();

  /* ---------- Gibbs phenomenon ---------- */
  (() => {
    const cvs = $('#gibbs'); if (!cvs) return;
    const g = cvs.getContext('2d'), nIn = $('#gN'), nOut = $('#gNo'); let win = 'rect';
    const weight = (j, N) => { const x = j / (N + 1); if (win === 'rect') return 1; if (win === 'hann') return .5 * (1 + Math.cos(Math.PI * x)); return Math.sin(Math.PI * x) / (Math.PI * x); };
    const S = (x, N) => { let s = 0; for (let j = 1; j <= N; j++) { const k = 2 * j - 1; s += weight(j, N) * Math.sin(k * x) / k; } return 4 / Math.PI * s; };
    function render() {
      const N = +nIn.value; nOut.textContent = N;
      const d = Math.min(devicePixelRatio || 1, 2), w = cvs.clientWidth || 800, h = w * 9 / 16;
      cvs.width = Math.round(w * d); cvs.height = Math.round(h * d); g.setTransform(d, 0, 0, d, 0, 0);
      const padX = 22, padY = h * .14, X = x => padX + (x + Math.PI) / (2 * Math.PI) * (w - padX - 8), Y = y => h / 2 - y * (h / 2 - padY) / 1.25;
      g.clearRect(0, 0, w, h);
      g.strokeStyle = '#E6F1F7'; g.globalAlpha = .25; g.lineWidth = 1;
      [-1, 0, 1].forEach(v => { g.beginPath(); g.moveTo(padX, Y(v)); g.lineTo(w - 8, Y(v)); g.stroke(); });
      g.globalAlpha = .6; g.lineWidth = 1.5; g.setLineDash([5, 5]); g.beginPath();
      g.moveTo(X(-Math.PI), Y(-1)); g.lineTo(X(0), Y(-1)); g.lineTo(X(0), Y(1)); g.lineTo(X(Math.PI), Y(1)); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 1; g.strokeStyle = '#F2D58A'; g.lineWidth = 2.4; g.beginPath();
      for (let p = 0; p <= 600; p++) { const x = -Math.PI + p / 600 * 2 * Math.PI, y = S(x, N); p ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)); }
      g.stroke();
      g.fillStyle = '#E6F1F7'; g.globalAlpha = .75; g.font = 'italic 13px "STIX Two Text", serif'; g.fillText('1', 4, Y(1) + 4); g.fillText('−1', 2, Y(-1) + 4); g.globalAlpha = 1;
      let mx = -9, lo = null, hi = null;
      for (let p = 1; p <= 4000; p++) { const x = p / 4000 * Math.PI / 2, y = S(x, N); if (y > mx) mx = y; if (hi === null && y >= .8) hi = x; }
      for (let p = 1; p <= 4000; p++) { const x = -p / 4000 * Math.PI / 2; if (S(x, N) <= -.8) { lo = x; break; } }
      const over = Math.max(0, (mx - 1) / 2 * 100);
      $('#gOver').textContent = over.toFixed(over < .1 ? 2 : 1) + '%';
      $('#gRise').textContent = (hi !== null && lo !== null) ? ((hi - lo) / Math.PI).toFixed(3) + 'π' : 'not reached';
    }
    nIn.addEventListener('input', render);
    $$('.gibbs .tabs button').forEach(b => b.addEventListener('click', () => { win = b.dataset.w; $$('.gibbs .tabs button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(); }));
    new ResizeObserver(render).observe(cvs); render();
  })();

  /* ---------- 12-coin weighing matrix ---------- */
  (() => {
    const M = [[0, 0, 0, 0, 1, 1, 1, 1, -1, -1, -1, -1], [0, 1, -1, -1, 0, 0, 0, 1, -1, -1, 1, 1], [1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, -1]];
    let fake = 6, kind = 1;
    const coinsEl = $('#coins'), scalesEl = $('#scales'), table = $('#matrix'), verdict = $('#verdict'), noFake = $('#noFake'), kindBtns = $$('#lab .tabs button');
    for (let j = 0; j < 12; j++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'coin'; b.textContent = j + 1; b.setAttribute('aria-label', 'Coin ' + (j + 1)); b.addEventListener('click', () => { fake = j; update(); }); coinsEl.appendChild(b); }
    kindBtns.forEach(b => b.addEventListener('click', () => { kind = +b.dataset.k; if (fake < 0) fake = 6; update(); }));
    noFake.addEventListener('click', () => { fake = -1; update(); });
    const pan = (cx, list) => `<path class="st" d="M${cx} 40 L${cx - 30} 66 M${cx} 40 L${cx + 30} 66" style="stroke-width:1.2"/><path class="pan" d="M${cx - 34} 66 h68 l-8 10 h-52 z"/>` +
      list.map((j, n) => { const x = cx - 22 + (n % 4) * 14.7, y = 57 - Math.floor(n / 4) * 14; return `<g data-coin="${j}"><circle class="c" cx="${x}" cy="${y}" r="6.6"/><text x="${x}" y="${y + .5}">${j + 1}</text></g>`; }).join('');
    scalesEl.innerHTML = M.map(row => { const L = [], R = []; row.forEach((v, j) => v < 0 ? L.push(j) : v > 0 ? R.push(j) : 0);
      return `<figure><svg viewBox="0 0 240 145" aria-hidden="true"><path class="st" d="M120 40 V130 M90 132 H150"/><path class="st beam" d="M44 40 H196"/><g class="bp pl">${pan(44, L)}</g><g class="bp pr">${pan(196, R)}</g><circle cx="120" cy="40" r="4.5" fill="#E6F1F7"/></svg><figcaption></figcaption></figure>`; }).join('');
    const figs = $$('figure', scalesEl), f1 = v => v === -1 ? '−1' : String(v);
    function update() {
      [...coinsEl.children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === fake)));
      kindBtns.forEach(b => b.setAttribute('aria-pressed', String(fake >= 0 && +b.dataset.k === kind)));
      noFake.setAttribute('aria-pressed', String(fake < 0));
      const res = M.map(row => fake < 0 ? 0 : row[fake] * kind);
      figs.forEach((f, i) => {
        const th = res[i] * 9 * Math.PI / 180, dx = 76 - 76 * Math.cos(th), dy = 76 * Math.sin(th);
        $('.beam', f).style.transform = `rotate(${res[i] * 9}deg)`; $('.pl', f).style.transform = `translate(${dx}px, ${-dy}px)`; $('.pr', f).style.transform = `translate(${-dx}px, ${dy}px)`;
        $$('[data-coin]', f).forEach(c => $('circle', c).setAttribute('class', +c.dataset.coin === fake ? 'c cf' : 'c'));
        $('figcaption', f).innerHTML = `<i>r</i><sub>${i + 1}</sub> = ${f1(res[i])}`;
      });
      let html = '<tr><th></th><th></th>' + M[0].map((_, j) => `<th scope="col">${j + 1}</th>`).join('') + '<th></th><th></th><th scope="col"><i>r</i></th></tr>';
      M.forEach((row, i) => { html += `<tr><th scope="row">W${i + 1}</th><td class="lb"></td>` + row.map((v, j) => `<td class="${j === fake ? 'hit' : ''}">${f1(v)}</td>`).join('') + `<td class="rb"></td><td></td><td><b>${f1(res[i])}</b></td></tr>`; });
      table.innerHTML = html;
      if (fake < 0) verdict.innerHTML = 'Every weighing balances: <i>r</i> = (0, 0, 0) matches no column, so <em>all twelve coins are real</em>.';
      else { const v = '(' + res.map(f1).join(', ') + ')'; verdict.innerHTML = kind > 0 ? `<i>r</i> = ${v} is column ${fake + 1}, so <em>coin ${fake + 1} is heavier</em>.` : `<i>r</i> = ${v} is minus column ${fake + 1}, so <em>coin ${fake + 1} is lighter</em>.`; }
    }
    update();
  })();

  /* ---------- cabinet fallback (no WebGL, reduced motion) ---------- */
  window.cabinetFallback = () => {
    root.classList.add('no-cabinet');
    $('#cabFallback').innerHTML = window.CABINET.map(c => `<div class="note" style="max-width:none;--r:0deg"><span class="mono" style="color:var(--velvet)">${c.cat}</span><b>${c.stat}</b><span><strong>${c.title}</strong><br>${c.desc}</span></div>`).join('');
  };
  if (reduce) window.cabinetFallback();
})();
