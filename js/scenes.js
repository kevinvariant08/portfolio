/* 3D: the object cluster above the hero portrait, and the honours cabinet. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './../vendor/addons/RoundedBoxGeometry.js';
import { RoomEnvironment } from './../vendor/addons/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = s => document.querySelector(s);
const C = { navy: 0x141C33, gold: 0xD4AF4F, velvet: 0x8A1730, cyan: 0x6CC4DC, paper: 0xF3F1EC, wood: 0x8B5A33, silver: 0xC9CED6 };
try { await document.fonts.ready; } catch (e) {}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function faceDisc(tex, r, z) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshStandardMaterial({ map: tex, metalness: .75, roughness: .32 })); m.position.z = z; return m;
}
function makeRenderer(canvas) {
  let r;
  try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2)); r.setClearColor(0x000000, 0);
  return r;
}
const gold = () => new THREE.MeshStandardMaterial({ color: C.gold, metalness: .9, roughness: .28 });

/* ======================= HERO ======================= */
function hero() {
  const heroEl = $('#hero'), canvas = $('#heroScene'), sticker = $('#sticker'), labelEl = $('#objLabel');
  const renderer = makeRenderer(canvas); if (!renderer) return;
  const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100); camera.position.set(0, 0, 20);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xC9A54A, 1.2); rim.position.set(6, 3, -6); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xF3F1EC, 0x141C33, .55));

  const objects = [];
  const add = (mesh, o) => { const g = new THREE.Group(); g.add(mesh); g.userData = { ...o, phase: Math.random() * 6, s: 0 }; g.scale.setScalar(.0001); scene.add(g); objects.push(g); return g; };

  // 1. the book, with its real cover
  const coverTex = new THREE.TextureLoader().load('media/book-front.webp', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x0f1830, roughness: .6 });
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xF4EFE4, roughness: .9 });
  const book = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.6, .26, 3, .04), [pageMat, navyMat, pageMat, pageMat, new THREE.MeshStandardMaterial({ map: coverTex, roughness: .5 }), navyMat]);
  add(book, { label: 'The book', href: '#book', ox: -1.35, oy: -.1, rot: [.1, .45, .12], size: 1 });

  // 2. a gold coin from the 12-coin problem
  const face = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#D9B24F'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8E6A14'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); g.fillStyle = '#6b4f0c'; g.font = '700 130px "Bodoni Moda", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7', 128, 138); });
  const coin = new THREE.Group(); const coinBody = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 48), gold()); coinBody.rotation.x = Math.PI / 2; coin.add(coinBody, faceDisc(face, .55, .061));
  add(coin, { label: 'The 12-coin problem', href: '#writing', ox: 1.4, oy: -.05, rot: [.2, -.5, 0], size: .9 });

  // 3. the trefoil knot (Kevinvariant's icon)
  class Trefoil extends THREE.Curve { getPoint(t, v = new THREE.Vector3()) { const a = t * Math.PI * 2; return v.set(Math.sin(a) + 2 * Math.sin(2 * a), Math.cos(a) - 2 * Math.cos(2 * a), -Math.sin(3 * a)).multiplyScalar(.2); } }
  const knot = new THREE.Mesh(new THREE.TubeGeometry(new Trefoil(), 220, .085, 16, true), new THREE.MeshStandardMaterial({ color: C.velvet, metalness: .35, roughness: .3 }));
  add(knot, { label: 'Kevinvariant', href: '#kevinvariant', ox: -.72, oy: .5, rot: [.3, 0, 0], size: 1 });

  // 4. a medal on a ribbon
  const medal = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .08, 48), gold()); disc.rotation.x = Math.PI / 2; medal.add(disc);
  const star = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .1, 5), new THREE.MeshStandardMaterial({ color: 0xF7E3A2, metalness: .6, roughness: .3 })); star.rotation.x = Math.PI / 2; star.position.z = .03; medal.add(star);
  const rib = new THREE.MeshStandardMaterial({ color: C.velvet, roughness: .7 }), rib2 = new THREE.MeshStandardMaterial({ color: C.navy, roughness: .7 });
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(.22, .8, .02), rib); r1.position.set(-.17, .7, -.02); r1.rotation.z = -.35; medal.add(r1);
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(.22, .8, .02), rib2); r2.position.set(.17, .7, -.03); r2.rotation.z = .35; medal.add(r2);
  add(medal, { label: 'Honours', href: '#honours', ox: 1.25, oy: -.75, rot: [0, -.35, .1], size: .85 });

  // 5. a metronome (piano)
  const met = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .5, 1.25, 4, 1), new THREE.MeshStandardMaterial({ color: 0x5b2a1a, roughness: .45, metalness: .1 })); body.rotation.y = Math.PI / 4; met.add(body);
  const arm = new THREE.Group(); arm.position.y = -.45; const rod = new THREE.Mesh(new THREE.BoxGeometry(.035, 1.15, .035), gold()); rod.position.y = .55; arm.add(rod);
  const weight = new THREE.Mesh(new THREE.BoxGeometry(.13, .13, .06), gold()); weight.position.y = .8; arm.add(weight); arm.position.z = .2; met.add(arm); met.userData.arm = arm;
  add(met, { label: 'Piano', href: '#piano', ox: -1.3, oy: -.95, rot: [.05, .35, 0], size: .95 });

  // 6. a Gibbs ringing curve (research)
  class Ring extends THREE.Curve { getPoint(t, v = new THREE.Vector3()) { const x = (t - .5) * 2 * Math.PI; let s = 0; for (let k = 1; k <= 15; k += 2) s += Math.sin(k * x) / k; return v.set(x * .3, 4 / Math.PI * s * .32, 0); } }
  const wave = new THREE.Mesh(new THREE.TubeGeometry(new Ring(), 300, .045, 10, false), new THREE.MeshStandardMaterial({ color: C.cyan, metalness: .3, roughness: .25, emissive: 0x0b3b4a }));
  add(wave, { label: 'Research', href: '#research', ox: .85, oy: .55, rot: [.2, -.3, -.15], size: 1 });

  let W = 1, H = 1, unit = 1, anchor = new THREE.Vector3(), visible = true, hovered = null, px = 0, py = 0, t0 = performance.now(), last = t0;
  const toWorld = (sx, sy) => { const v = new THREE.Vector3(sx / W * 2 - 1, -(sy / H) * 2 + 1, .5).unproject(camera); const d = v.sub(camera.position).normalize(); return camera.position.clone().add(d.multiplyScalar(-camera.position.z / d.z)); };
  function layout() {
    const r = heroEl.getBoundingClientRect(); W = r.width; H = r.height; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    const s = sticker.getBoundingClientRect();
    const head = toWorld(s.left - r.left + s.width * .5, s.top - r.top + s.height * .14);
    const edge = toWorld(s.left - r.left + s.width, s.top - r.top + s.height * .14);
    anchor.copy(head); unit = Math.abs(edge.x - head.x) * (innerWidth < 760 ? .82 : .9);
  }
  new ResizeObserver(layout).observe(heroEl); layout();
  addEventListener('load', layout);

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = (cx, cy) => { const r = heroEl.getBoundingClientRect(); ndc.set((cx - r.left) / W * 2 - 1, -((cy - r.top) / H) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(objects, true)[0]; if (!hit) return null; let o = hit.object; while (o.parent && !objects.includes(o)) o = o.parent; return o; };
  const cur = $('#cur'), lbl = cur && cur.querySelector('.lbl');
  heroEl.addEventListener('pointermove', e => {
    const r = heroEl.getBoundingClientRect(); px = (e.clientX - r.left) / W - .5; py = (e.clientY - r.top) / H - .5;
    if (e.pointerType !== 'mouse') return;
    const h = pick(e.clientX, e.clientY);
    if (h !== hovered) { hovered = h; heroEl.style.cursor = h ? 'pointer' : '';
      if (cur) { if (h) { cur.classList.add('label'); lbl.textContent = 'Open'; } else { cur.classList.remove('label'); lbl.textContent = ''; } } }
  });
  heroEl.addEventListener('pointerleave', () => { hovered = null; });
  heroEl.addEventListener('click', e => { if (e.target.closest('a, button')) return; const h = pick(e.clientX, e.clientY); if (h) window.goTo ? window.goTo(h.userData.href) : (location.hash = h.userData.href); });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(heroEl);

  const v = new THREE.Vector3();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
    let labelShown = false;
    objects.forEach((o, i) => {
      const u = o.userData, intro = reduce ? 1 : Math.min(1, Math.max(0, (t - 1.1 - i * .12) / .7));
      const pop = intro < 1 ? 1 - Math.pow(1 - intro, 3) * Math.cos(intro * 5) : 1;
      const target = u.size * unit * .62 * (o === hovered ? 1.18 : 1) * pop;
      u.s += (target - u.s) * (1 - Math.exp(-12 * dt)); o.scale.setScalar(Math.max(u.s, .0001));
      const bob = reduce ? 0 : Math.sin(t * 1.1 + u.phase) * .08 * unit;
      const nx = innerWidth < 760 ? u.ox * .78 : u.ox, ny = innerWidth < 760 ? u.oy * .9 - .05 : u.oy;
      o.position.set(anchor.x + nx * unit + px * .25 * unit, anchor.y + ny * unit + bob - py * .2 * unit, 0);
      o.rotation.set(u.rot[0] + py * .3, u.rot[1] + px * .6 + (reduce ? 0 : Math.sin(t * .5 + u.phase) * .15), u.rot[2]);
      if (o.children[0] === knot) knot.rotation.z = reduce ? 0 : t * .35;
      if (o === hovered) { v.copy(o.position).add(new THREE.Vector3(0, u.size * unit * .55, 0)).project(camera); labelEl.style.left = ((v.x + 1) / 2 * W) + 'px'; labelEl.style.top = ((1 - v.y) / 2 * H) + 'px'; labelEl.textContent = u.label; labelShown = true; }
    });
    if (met.userData.arm && !reduce) met.userData.arm.rotation.z = Math.sin(t * 3.2) * .38;
    labelEl.classList.toggle('on', labelShown);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}

/* ======================= CABINET ======================= */
function cabinet() {
  const items = window.CABINET || [], wrap = $('#cabinet'), canvas = $('#cabScene');
  if (reduce || !window.ScrollTrigger || !items.length) { window.cabinetFallback && window.cabinetFallback(); return; }
  const renderer = makeRenderer(canvas); if (!renderer) { window.cabinetFallback && window.cabinetFallback(); return; }
  const small = innerWidth < 760; renderer.shadowMap.enabled = !small; if (small) renderer.setPixelRatio(1.25); renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b5a4a, .6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60; sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10; scene.add(sun, sun.target);

  const GAP = 4.2, n = items.length, len = GAP * (n + 1);
  const x0 = -GAP;
  // the cabinet: back wall, shelf, plinths, glass, frame
  const wallTex = canvasTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3E5A7E'); gr.addColorStop(1, '#6E8FAE'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const cx = (i + .5) * w / 6, rg = g.createRadialGradient(cx, 40, 10, cx, 120, 260); rg.addColorStop(0, 'rgba(255,255,240,.55)'); rg.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); } });
  wallTex.wrapS = THREE.RepeatWrapping; wallTex.repeat.set(n / 6 + .5, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(len + 20, 9), new THREE.MeshStandardMaterial({ map: wallTex, roughness: .9 })); wall.position.set(x0 + len / 2, 2.6, -2.2); wall.receiveShadow = true; scene.add(wall);
  const woodTex = canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#8B5A33'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(60,30,10,${.08 + Math.random() * .12})`; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 6, w * .6, y - 6, w, y + 3); g.stroke(); } });
  woodTex.wrapS = THREE.RepeatWrapping; woodTex.repeat.set(12, 1);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(len + 20, .35, 4.6), new THREE.MeshStandardMaterial({ map: woodTex, roughness: .55 })); shelf.position.set(x0 + len / 2, -.18, 0); shelf.receiveShadow = true; scene.add(shelf);
  const top = new THREE.Mesh(new THREE.BoxGeometry(len + 20, .3, 4.6), new THREE.MeshStandardMaterial({ map: woodTex, roughness: .55 })); top.position.set(x0 + len / 2, 5.6, 0); scene.add(top);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(len + 20, 5.8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .07, roughness: .05, metalness: 0, clearcoat: 1 })); glass.position.set(x0 + len / 2, 2.7, 2.3); scene.add(glass);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xF6F4EF, roughness: .35 });

  const plate = (text) => canvasTex(512, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#E9CF7E'); gr.addColorStop(1, '#B98F2C'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a10'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3d2c06'; g.font = '700 54px "Instrument Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4); });
  const shadow = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
  const medalMesh = (metal, text) => {
    const g = new THREE.Group(), col = metal === 'silver' ? C.silver : C.gold;
    const faceTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = metal === 'silver' ? '#D7DCE3' : '#DDB656'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 100, 0, 7); c.stroke(); c.fillStyle = 'rgba(40,30,10,.8)'; c.font = `700 ${text.length > 2 ? 64 : 110}px "Bodoni Moda", serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 128, 136); });
    const d = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .1, 64), new THREE.MeshStandardMaterial({ color: col, metalness: .9, roughness: .25 })); d.rotation.x = Math.PI / 2; g.add(d, faceDisc(faceTex, .62, .051));
    const stripes = canvasTex(64, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#F3F1EC' : '#1F3B63'; c.fillRect(i * 8, 0, 8, h); } });
    const rm = new THREE.MeshStandardMaterial({ map: stripes, roughness: .8 });
    const a = new THREE.Mesh(new THREE.BoxGeometry(.34, 1.3, .02), rm); a.position.set(-.24, 1.05, -.05); a.rotation.z = -.32; g.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.34, 1.3, .02), rm); b.position.set(.24, 1.05, -.06); b.rotation.z = .32; g.add(b);
    return g;
  };
  const stand = (w = 2.2) => { const s = new THREE.Group(); const wm = new THREE.MeshStandardMaterial({ color: 0x6a4126, roughness: .5 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, .08, .08), wm); bar.position.y = 2.75; s.add(bar);
    const post = new THREE.Mesh(new THREE.BoxGeometry(.1, 2.75, .1), wm); post.position.y = 1.4; s.add(post); return s; };
  const build = {
    medals(it) { const g = new THREE.Group(); g.add(stand(2.6)); for (let i = 0; i < 6; i++) { const m = medalMesh('gold', String(i + 1)); m.scale.setScalar(.48); m.position.set(-1.1 + i * .44, 1.95 - (i % 2) * .12, .12 + i * .01); g.add(m); } return g; },
    medal(it) { const g = new THREE.Group(); g.add(stand(1.2)); const m = medalMesh(it.metal, it.text); m.position.set(0, 1.55, .1); g.add(m); return g; },
    plaque(it) { const g = new THREE.Group(); const tex = canvasTex(768, 512, (c, w, h) => { c.fillStyle = '#16233D'; c.fillRect(0, 0, w, h); c.strokeStyle = '#C9A54A'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = '#F3F1EC'; c.font = '700 160px "Instrument Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.text, w / 2, h * .44); c.font = '600 34px "JetBrains Mono", monospace'; c.fillStyle = '#C9D6E8'; c.fillText(it.sub, w / 2, h * .8); });
      const side = new THREE.MeshStandardMaterial({ color: 0x16233D, roughness: .4 });
      const p = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.47, .14), [side, side, side, side, new THREE.MeshStandardMaterial({ map: tex, roughness: .35 }), side]); p.position.y = 1.1; p.rotation.x = -.08; g.add(p);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.5, .35, .5), new THREE.MeshStandardMaterial({ color: 0xC9A54A, metalness: .8, roughness: .3 })); leg.position.y = .2; g.add(leg); return g; },
    frame(it) { const g = new THREE.Group(); const tex = canvasTex(600, 760, (c, w, h) => { c.fillStyle = '#FBF7EC'; c.fillRect(0, 0, w, h); c.strokeStyle = '#C9A54A'; c.lineWidth = 6; c.strokeRect(30, 30, w - 60, h - 60); c.fillStyle = '#7A5A10'; c.font = 'italic 44px "Bodoni Moda", serif'; c.textAlign = 'center'; c.fillText('Certificate', w / 2, 150); c.fillStyle = '#141C33'; c.font = '700 110px "Instrument Sans", sans-serif'; c.fillText(it.text, w / 2, 400); c.font = '600 30px "JetBrains Mono", monospace'; c.fillText(it.sub, w / 2, 520); c.fillStyle = '#C9A54A'; c.beginPath(); c.arc(w / 2, 630, 40, 0, 7); c.fill(); });
      const fr = new THREE.MeshStandardMaterial({ color: C.gold, metalness: .85, roughness: .3 });
      const f = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.2, .12), [fr, fr, fr, fr, new THREE.MeshStandardMaterial({ map: tex, roughness: .7 }), fr]); f.position.y = 1.25; f.rotation.x = -.1; g.add(f);
      const easel = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.9, .08), new THREE.MeshStandardMaterial({ color: 0x6a4126 })); easel.position.set(0, .9, -.45); easel.rotation.x = .35; g.add(easel); return g; },
    trophy(it) { const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector2(.12 + .62 * Math.pow(Math.sin(t * Math.PI * .5), 1.4), t * 1.25)); }
      const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), new THREE.MeshStandardMaterial({ color: C.gold, metalness: .95, roughness: .2, side: THREE.DoubleSide })); cup.position.y = 1.35; g.add(cup);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.1, .2, .7, 32), gold()); stem.position.y = 1.0; g.add(stem);
      [-1, 1].forEach(s => { const h = new THREE.Mesh(new THREE.TorusGeometry(.32, .05, 12, 40, Math.PI), gold()); h.position.set(s * .72, 2.0, 0); h.rotation.z = s * -Math.PI / 2; g.add(h); });
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, .55, .9), new THREE.MeshStandardMaterial({ color: 0x5b3a22, roughness: .5 })); base.position.y = .45; g.add(base);
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(.8, .3), new THREE.MeshStandardMaterial({ map: plate(it.text), metalness: .5, roughness: .4 })); lab.position.set(0, .45, .46); g.add(lab); return g; }
  };
  const anchors = [];
  items.forEach((it, i) => {
    const x = i * GAP, g = new THREE.Group(); g.position.set(x, 0, 0);
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(2.6, .6, 2, 3, .06), plinthMat); plinth.position.y = .3; g.add(plinth);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .38), new THREE.MeshStandardMaterial({ map: plate(it.stat), metalness: .5, roughness: .35 })); pl.position.set(0, .3, 1.01); g.add(pl);
    const obj = build[it.obj](it); obj.position.y = .6; g.add(obj); g.userData.obj = obj;
    shadow(g); scene.add(g); anchors.push(g);
    if (i < n - 1) { const post = new THREE.Mesh(new THREE.BoxGeometry(.08, 5.6, .08), gold()); post.position.set(x + GAP / 2, 2.7, 2.25); scene.add(post); }
  });

  // copy and dots
  const dots = $('#cabDots'); dots.innerHTML = items.map(() => '<i></i>').join('');
  const di = [...dots.children], copy = $('#cabCopy');
  let index = -1;
  const show = i => { if (i === index) return; index = i; const it = items[i];
    copy.style.opacity = 0;
    setTimeout(() => { $('#cabCat').textContent = it.cat; $('#cabNum').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'); $('#cabStat').textContent = it.stat; $('#cabTitle').textContent = it.title; $('#cabDesc').textContent = it.desc; $('#cabTag').textContent = it.tag; copy.style.opacity = 1; }, 180);
    di.forEach((d, k) => d.classList.toggle('on', k === i)); };
  show(0);

  let W = 1, H = 1, prog = 0, camX = 0, visible = false, last = performance.now();
  const narrow = () => innerWidth < 760;
  function layout() { const r = wrap.getBoundingClientRect(); W = r.width; H = r.height; renderer.setSize(W, H, false); camera.aspect = W / H; camera.fov = W / H < 1 ? 46 : 32; camera.updateProjectionMatrix(); }
  new ResizeObserver(layout).observe(wrap); layout();
  window.ScrollTrigger.create({ trigger: wrap, start: 'top top', end: () => '+=' + (n - 1) * innerHeight * .55, pin: true, scrub: true, onUpdate: s => { prog = s.progress; } });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(wrap);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
    const target = prog * (n - 1) * GAP;
    camX += (target - camX) * (1 - Math.exp(-6 * dt)); show(Math.min(n - 1, Math.max(0, Math.round(camX / GAP))));
    const offset = narrow() ? 0 : -2.6;
    camera.position.set(camX + offset, 2.6, narrow() ? 10.5 : 9.5); camera.lookAt(camX + offset + (narrow() ? 0 : -.2), 1.7, 0);
    anchors.forEach((g, i) => { const near = Math.max(0, 1 - Math.abs(i * GAP - camX) / GAP); g.userData.obj.rotation.y = Math.sin(t * .6 + i) * .25 * near; });
    sun.position.set(camX + 2, 8, 6); sun.target.position.set(camX, 0, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  addEventListener('load', () => window.ScrollTrigger.refresh());
}

try { hero(); } catch (e) { console.warn('hero scene', e); }
try { cabinet(); } catch (e) { console.warn('cabinet', e); window.cabinetFallback && window.cabinetFallback(); }
