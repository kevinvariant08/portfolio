/* 3D: the object cluster around the hero portrait. */
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
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); r.setClearColor(0x000000, 0);
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
  add(medal, { label: 'Olympiads', href: '#olympiads', ox: 1.25, oy: -.75, rot: [0, -.35, .1], size: .85 });

  // 5. a metronome (piano)
  const met = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .5, 1.25, 4, 1), new THREE.MeshStandardMaterial({ color: 0x5b2a1a, roughness: .45, metalness: .1 })); body.rotation.y = Math.PI / 4; met.add(body);
  const arm = new THREE.Group(); arm.position.y = -.45; const rod = new THREE.Mesh(new THREE.BoxGeometry(.035, 1.15, .035), gold()); rod.position.y = .55; arm.add(rod);
  const weight = new THREE.Mesh(new THREE.BoxGeometry(.13, .13, .06), gold()); weight.position.y = .8; arm.add(weight); arm.position.z = .2; met.add(arm); met.userData.arm = arm;
  add(met, { label: 'Piano', href: '#piano', ox: -1.3, oy: -.95, rot: [.05, .35, 0], size: .95 });

  // 6. a Gibbs ringing curve (research)
  class Ring extends THREE.Curve { getPoint(t, v = new THREE.Vector3()) { const x = (t - .5) * 2 * Math.PI; let s = 0; for (let k = 1; k <= 15; k += 2) s += Math.sin(k * x) / k; return v.set(x * .3, 4 / Math.PI * s * .32, 0); } }
  const wave = new THREE.Mesh(new THREE.TubeGeometry(new Ring(), 300, .045, 10, false), new THREE.MeshStandardMaterial({ color: C.cyan, metalness: .3, roughness: .25, emissive: 0x0b3b4a }));
  add(wave, { label: 'Research', href: '#epq', ox: .85, oy: .55, rot: [.2, -.3, -.15], size: 1 });

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

try { hero(); } catch (e) { console.warn('hero scene', e); }
