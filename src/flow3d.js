// PRIME FLOW — "the main flow", flat top-down edition.
// An orthographic drone view, locked 1:1 to page scroll (1 world unit = 60 CSS px).
// Left margin: the cargo route — truck on a steppe highway → (clouds) → cargo jet above
// tiny fields → (clouds) → container ship → docks in port on its own and gets unloaded.
// Right margin: a dark band with a neural river flowing top → bottom.
import * as THREE from '/vendor/three.module.min.js';

const canvas = document.getElementById('flow');
if (canvas) init();

function init() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.remove(); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const U = 60;                                                     // CSS px per world unit
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 200);
  camera.position.z = 100;
  const BLUE = new THREE.Color('#0078d0'), CYAN = new THREE.Color('#5cc8f7'), ICE = new THREE.Color('#eef8ff');
  const rand = mulberry32(11);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const loadTex = (url, wrap = THREE.RepeatWrapping) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = wrap; t.anisotropy = maxAniso; return t; };
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; };
  const flat = (tex, opts = {}) => new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, ...opts }));
  const at = (o, z) => { o.position.z = z; scene.add(o); return o; };

  // sprites --------------------------------------------------------------------------
  const dot = ctex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, '#fff'); r.addColorStop(.25, 'rgba(255,255,255,.85)'); r.addColorStop(.6, 'rgba(255,255,255,.15)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  // fluffy clouds from fractal value noise with a soft round falloff
  function cloudTex(seed) {
    const N = 256, rr = mulberry32(seed * 97 + 7), G = 64, grid = new Float32Array((G + 1) * (G + 1)).map(() => rr());
    const vn = (x, y) => { const xi = Math.floor(x) % G, yi = Math.floor(y) % G, xf = x - Math.floor(x), yf = y - Math.floor(y); const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const g = (a, b) => grid[(b % G) * (G + 1) + (a % G)]; return (g(xi, yi) * (1 - u) + g(xi + 1, yi) * u) * (1 - v) + (g(xi, yi + 1) * (1 - u) + g(xi + 1, yi + 1) * u) * v; };
    return ctex(N, N, (g) => {
      const img = g.createImageData(N, N);
      const blobs = Array.from({ length: 5 }, () => [N * (.3 + rr() * .4), N * (.3 + rr() * .4), N * (.18 + rr() * .14)]);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let f = 0, amp = .5, fr = 4 / N; for (let o = 0; o < 5; o++) { f += vn(x * fr + seed * 13, y * fr) * amp; amp *= .5; fr *= 2; }
        let m = 0; for (const [bx, by, br] of blobs) m = Math.max(m, 1 - Math.hypot(x - bx, y - by) / br);
        const d = Math.min(1, Math.max(0, (m * 1.25 + f - .78) * 2.4));
        const shade = 236 + Math.round(19 * f);
        const k = (y * N + x) * 4; img.data[k] = shade; img.data[k + 1] = shade + 2; img.data[k + 2] = 255; img.data[k + 3] = Math.round(d * 245);
      }
      g.putImageData(img, 0, 0);
    });
  }
  const puffs = [0, 1, 2, 3].map(cloudTex);


  // photo cutout with a soft drop shadow (top-down, flat)
  function photo(url, w, h, shadow = [.18, -.12, .4]) {
    const t = loadTex(url, THREE.ClampToEdgeWrapping);
    const g = new THREE.Group();
    const sh = flat(t, { color: 0x0a1424, opacity: shadow[2] }); sh.scale.set(w, h, 1); sh.position.set(shadow[0], shadow[1], -.01);
    const body = flat(t); body.scale.set(w, h, 1);
    g.add(sh, body); g.userData = { sh, body }; return g;
  }

  // ===== zone 1: steppe highway ========================================================
  const ROAD_W = 2.4, ROAD_FR = .175, TILE_W = ROAD_W / ROAD_FR, TILE_H = TILE_W * 1376 / 768, LANE = ROAD_W * .25;
  const roadTex = loadTex('/img/road.webp', THREE.MirroredRepeatWrapping); roadTex.wrapS = THREE.ClampToEdgeWrapping;
  const steppeTex = loadTex('/img/steppe.webp', THREE.MirroredRepeatWrapping);
  const steppe = at(flat(steppeTex, { transparent: false, depthWrite: true }), 0);
  const road = at(flat(roadTex, { transparent: false, depthWrite: true }), .01);
  const TRUCK = ['/img/truck.webp', 3.2 * 271 / 1058, 3.2];
  const truck = photo(...TRUCK);
  const traffic = [0, 1, 2].map((i) => { const t = photo(...TRUCK); t.rotation.z = Math.PI; t.userData.body.material.color.set(['#ffffff', '#ffe5d6', '#e2ecf6'][i]); at(t, .3); return { o: t, k: i / 3 }; });
  const convoy = photo(...TRUCK); convoy.userData.body.material.color.set('#eef3f8'); at(convoy, .3);

  // ===== zone 2: flight over tiny fields ===============================================
  const landTex = loadTex('/img/land.webp', THREE.MirroredRepeatWrapping);
  const land = at(flat(landTex, { transparent: false, depthWrite: true }), -.2);
  const MINI_W = .55;                                                       // tiny highway seen from cruising altitude
  const miniTex = loadTex('/img/road.webp', THREE.MirroredRepeatWrapping); miniTex.wrapS = THREE.ClampToEdgeWrapping;
  const miniRoad = at(flat(miniTex, { transparent: false, depthWrite: true, color: '#e9eef3' }), -.19);
  // soft white bands that hide the seam between zones inside the clouds
  const bandTex = ctex(4, 256, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, 'rgba(246,249,252,0)'); l.addColorStop(.3, 'rgba(246,249,252,.97)'); l.addColorStop(.7, 'rgba(246,249,252,.97)'); l.addColorStop(1, 'rgba(246,249,252,0)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  const bands = [0, 1].map(() => at(flat(bandTex), 1.9));
  const plane = photo('/img/plane.webp', 4.6, 4.6 * 874 / 844, [0, 0, 0]);
  const planeShadow = flat(plane.userData.body.material.map, { color: 0x0a1424, opacity: .25 }); planeShadow.scale.set(1.9, 1.9 * 874 / 844, 1); at(planeShadow, .02);
  const lowClouds = Array.from({ length: 22 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffs[i % 3], transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(5 + rand() * 6); at(s, .05); return { s, x: rand(), k: rand() }; });

  // ===== zone 3: sea, wake and port =====================================================
  const OCEAN_TILE = 1024 / U;
  const oceanTex = loadTex('/img/ocean.webp', THREE.MirroredRepeatWrapping);
  const ocean = at(flat(oceanTex, { transparent: false, depthWrite: true }), -.03);
  const SHIP_L = 5.8, SHIP_W = SHIP_L * 235 / 1187;
  const ship = photo('/img/ship.webp', SHIP_W, SHIP_L, [.16, -.1, .35]);

  const WAKE = 600, wakePos = new Float32Array(WAKE * 3), wakeSize = new Float32Array(WAKE), wakeAlpha = new Float32Array(WAKE);
  const wakeP = Array.from({ length: WAKE }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, s: 1 }));
  const wakeGeo = new THREE.BufferGeometry();
  wakeGeo.setAttribute('position', new THREE.BufferAttribute(wakePos, 3));
  wakeGeo.setAttribute('size', new THREE.BufferAttribute(wakeSize, 1));
  wakeGeo.setAttribute('alpha', new THREE.BufferAttribute(wakeAlpha, 1));
  const wakeMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: dot }, px: { value: U } }, transparent: true, depthWrite: false,
    vertexShader: 'attribute float size; attribute float alpha; varying float vA; uniform float px; void main(){ vA = alpha; gl_PointSize = size * px; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform sampler2D map; varying float vA; void main(){ vec4 c = texture2D(map, gl_PointCoord); gl_FragColor = vec4(1.,1.,1., c.a * vA); }',
  });
  { const wp = new THREE.Points(wakeGeo, wakeMat); wp.frustumCulled = false; at(wp, .04); }
  let wakeNext = 0;

  // port (drawn flat from above): quay, container yard, three gantry cranes
  const PAL = ['#0078d0', '#5cc8f7', '#e46d4c', '#e9eff7', '#1f4e8c', '#8a96a6', '#2f9e6e'];
  const concrete = ctex(256, 512, (g, w, h) => {
    g.fillStyle = '#b9c0c7'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '40,50,60'},${Math.random() * .06})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(245,200,60,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(w - 40, 0); g.lineTo(w - 40, h); g.stroke();
    g.beginPath(); g.moveTo(w - 150, 0); g.lineTo(w - 150, h); g.stroke();
  });
  concrete.wrapS = concrete.wrapT = THREE.RepeatWrapping;
  const containerTex = (color) => ctex(64, 140, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let y = 6; y < h; y += 7) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  });
  const boxTex = PAL.map(containerTex);
  const CW = .42, CL = .95;
  const realBox = [0, 1, 2, 3].map((i) => loadTex(`/img/c${i}.webp`, THREE.ClampToEdgeWrapping));
  const realBlk = [[1, 88, 66], [2, 60, 66], [3, 88, 75], [4, 88, 72], [5, 60, 72]].map(([n, w, h]) => ({ t: loadTex(`/img/blk${n}.webp`, THREE.ClampToEdgeWrapping), w: w / U, h: h / U }));
  const container = (i) => { const m = flat(realBox[i % realBox.length]); m.scale.set(14 / U * 1.15, 66 / U * 1.15, 1); return m; };
  const block = (i) => { const b = realBlk[i % realBlk.length]; const g = new THREE.Group(); const sh = flat(b.t, { color: 0x0a1424, opacity: .35 }); sh.scale.set(b.w, b.h, 1); sh.position.set(.06, -.05, -.005); const m = flat(b.t); m.scale.set(b.w, b.h, 1); g.add(sh, m); g.userData.w = b.w; return g; };
  const port = new THREE.Group(); scene.add(port);
  const quay = flat(concrete, { transparent: false }); port.add(quay);
  const yard = new THREE.Group(); port.add(yard);
  const cranes = [];
  const boomTex = ctex(512, 48, (g, w, h) => {
    g.fillStyle = '#0a6fc2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#0078d0'; g.fillRect(0, 8, w, h - 16);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 10, w, 3); g.fillRect(0, h - 13, w, 3);
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 4, h);
  });
  for (let i = 0; i < 3; i++) {
    const cr = new THREE.Group();
    const shadow = flat(boomTex, { color: 0x0a1424, opacity: .28 }); shadow.scale.set(3.4, .3, 1); shadow.position.set(.3, -.28, .01); cr.add(shadow);
    const legs = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), new THREE.MeshBasicMaterial({ color: '#0a5fa8', transparent: true, opacity: .9, depthWrite: false })); legs.position.set(-1.05, 0, .02); cr.add(legs);
    const legsHole = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .8), new THREE.MeshBasicMaterial({ color: '#b9c0c7', depthWrite: false })); legsHole.position.set(-1.05, 0, .03); cr.add(legsHole);
    const boom = flat(boomTex); boom.scale.set(3.4, .3, 1); boom.position.set(-.1, 0, .05); cr.add(boom);
    const house = new THREE.Mesh(new THREE.PlaneGeometry(.7, .55), new THREE.MeshBasicMaterial({ color: '#f2f5f8', depthWrite: false })); house.position.set(-1.55, 0, .06); cr.add(house);
    const trolley = new THREE.Mesh(new THREE.PlaneGeometry(.42, .46), new THREE.MeshBasicMaterial({ color: '#f4f6f8', depthWrite: false })); trolley.position.z = .08; cr.add(trolley);
    const load = container(i); load.position.z = .07; load.visible = false; cr.add(load);
    port.add(cr); cranes.push({ cr, trolley, load, phase: i * .31, placed: 0, armed: true });
  }

  // ===== transition clouds ===============================================================
  const junction = [[], []];
  junction.forEach((arr) => { for (let i = 0; i < 140; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffs[i % 4], transparent: true, opacity: .95, depthWrite: false }));
    const near = i < 105; s.scale.setScalar(near ? 5 + rand() * 5 : 7 + rand() * 6); at(s, 2 + rand());
    arr.push({ s, near, u: rand() * 2 - 1, dy: (rand() + rand() - 1) * (near ? 3.2 : 2.4), op: near ? .97 : .55 });
  } });

  // ===== dark band + neural river (right margin) =========================================
  const nightTex = ctex(256, 4, (g, w) => { const l = g.createLinearGradient(0, 0, w, 0); l.addColorStop(0, 'rgba(5,6,15,0)'); l.addColorStop(.35, 'rgba(5,6,15,.92)'); l.addColorStop(1, 'rgba(5,6,15,1)'); g.fillStyle = l; g.fillRect(0, 0, w, 4); });
  const night = at(flat(nightTex), .5);
  // a river = layered neural stream. parallax < 1 → further away (slower, softer, larger dots)
  const flashGeoOf = (n) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(n), 1)); g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1)); return g; };
  const glowMat = (color) => new THREE.ShaderMaterial({
    uniforms: { map: { value: dot }, color: { value: new THREE.Color(color) }, dpr: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float size; attribute float alpha; varying float vA; uniform float dpr; void main(){ vA = alpha; gl_PointSize = size * dpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform sampler2D map; uniform vec3 color; varying float vA; void main(){ vec4 c = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color * c.a * vA, c.a * vA); }',
  });
  const rivers = [];
  function makeRiver(o) {
    const group = new THREE.Group(); group.position.z = o.z; scene.add(group);
    const r = { ...o, group, nodes: [], edges: [], out: [], pulses: [], pulseGeo: null, flashes: [], flashGeo: null, flashMat: glowMat(o.flashColor || '#bfeaff') };
    rivers.push(r); return r;
  }
  function buildRiver(r, top, bottom, spread) {
    r.group.clear(); const nodes = [], edges = [];
    const n = Math.floor((top - bottom) * r.density);
    for (let i = 0; i < n; i++) nodes.push(new THREE.Vector3((rand() + rand() + rand() - 1.5) * spread * 1.3, top - (i / n) * (top - bottom) + (rand() - .5) * .5, 0));
    nodes.sort((p, q) => q.y - p.y);
    const out = nodes.map(() => []);
    nodes.forEach((p, i) => {
      const cand = []; for (let j = i + 1; j < Math.min(nodes.length, i + 12); j++) if (nodes[j].y < p.y - .12) cand.push(j);
      cand.sort((x, y) => p.distanceTo(nodes[x]) - p.distanceTo(nodes[y])).slice(0, 2 + (rand() < .35)).forEach((j) => { out[i].push(edges.length); edges.push([i, j]); });
    });
    const ng = new THREE.BufferGeometry().setFromPoints(nodes);
    const col = new Float32Array(nodes.length * 3); nodes.forEach((_, i) => BLUE.clone().lerp(CYAN, rand()).toArray(col, i * 3));
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const lp = new Float32Array(edges.length * 6); edges.forEach(([x, y], i) => { nodes[x].toArray(lp, i * 6); nodes[y].toArray(lp, i * 6 + 3); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    r.pulseGeo = new THREE.BufferGeometry(); r.pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(r.pulsesN * 3), 3));
    r.flashGeo = flashGeoOf(r.flashN);
    r.group.add(
      new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: r.lineOp, depthWrite: false, blending: THREE.AdditiveBlending })),
      new THREE.Points(ng, new THREE.PointsMaterial({ size: r.dotPx, sizeAttenuation: false, map: dot, vertexColors: true, transparent: true, opacity: r.dotOp, depthWrite: false, blending: THREE.AdditiveBlending })),
      new THREE.Points(r.pulseGeo, new THREE.PointsMaterial({ size: r.dotPx * .9, sizeAttenuation: false, map: dot, color: ICE, transparent: true, opacity: r.dotOp, depthWrite: false, blending: THREE.AdditiveBlending })),
      new THREE.Points(r.flashGeo, r.flashMat));
    r.group.children.forEach((c) => { c.frustumCulled = false; });
    r.flashMat.uniforms.dpr.value = renderer.getPixelRatio();
    Object.assign(r, { nodes, edges, out });
    r.pulses = Array.from({ length: r.pulsesN }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: .7 + rand() * .7 }));
    r.flashes = Array.from({ length: r.flashN }, () => ({ life: 0, x: 0, y: 0, s: 1 }));
  }
  const nearestIn = (nodes, y) => { let lo = 0, hi = nodes.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (nodes[m].y > y) lo = m + 1; else hi = m; } return lo; };
  const farB = makeRiver({ z: .52, parallax: .35, density: 1.4, dotPx: 26, dotOp: .22, lineOp: .05, pulsesN: 40, flashN: 12, speed: .5, flashChance: .15 });
  const farA = makeRiver({ z: .55, parallax: .6, density: 1.8, dotPx: 17, dotOp: .35, lineOp: .09, pulsesN: 60, flashN: 18, speed: .75, flashChance: .2 });
  const main = makeRiver({ z: .6, parallax: 1, density: 2.6, dotPx: 9, dotOp: 1, lineOp: .2, pulsesN: 150, flashN: 50, speed: 1.3, flashChance: .35 });

  // data links: main river → the cargo (trailer, plane, ship's container rows)
  const LINKS = 2;
  const linkGeo = new THREE.BufferGeometry(); linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINKS * 2 * 3 * 16), 3));
  const linkMat = new THREE.LineBasicMaterial({ color: '#0078d0', transparent: true, opacity: .6, depthWrite: false });
  const linkLines = new THREE.LineSegments(linkGeo, linkMat); linkLines.frustumCulled = false; at(linkLines, .7);
  const DATA = 40, dataGeo = flashGeoOf(DATA), dataMat = glowMat('#1a8fff'); dataMat.blending = THREE.NormalBlending;
  const dataPts = new THREE.Points(dataGeo, dataMat); dataPts.frustumCulled = false; at(dataPts, .72);
  const data = Array.from({ length: DATA }, (_, i) => ({ link: i % LINKS, dir: (i >> 1) % 2 ? -1 : 1, t: rand(), v: .22 + rand() * .2 }));

  const cargo = new THREE.Group(); cargo.add(truck, plane, ship); at(cargo, .3);

  // ===== layout =============================================================================
  let visH = 15, halfW = 12, laneX = -9, riverX = 9, margin = 4, J1 = -30, J2 = -60, camEnd = -100, narrow = false;
  const worldY = (docY) => -(docY - innerHeight * .5) / U;
  function layout() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    visH = h / U; halfW = w / U / 2;
    camera.left = -halfW; camera.right = halfW; camera.top = visH / 2; camera.bottom = -visH / 2; camera.updateProjectionMatrix();
    margin = Math.max(0, (w - 1000) / 2) / U;
    narrow = margin < 2.2;
    laneX = narrow ? -halfW * .55 : -halfW + margin * .5;
    riverX = narrow ? halfW * .55 : halfW - margin * .5;
    const docH = document.documentElement.scrollHeight;
    const q = (sel, fb) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : fb; };
    J1 = worldY(q('#ai', docH * .3)); J2 = worldY(q('#contact', docH * .75));
    camEnd = -(docH - h) / U;
    const top = visH, gW = halfW * 2 + 4;
    const gBot = J1;
    road.scale.set(TILE_W * .5, top - gBot, 1); road.position.set(laneX, (top + gBot) / 2, .01);
    roadTex.repeat.set(.5, (top - gBot) / TILE_H); roadTex.offset.x = .25;
    steppe.scale.set(gW, top - gBot, 1); steppe.position.set(0, (top + gBot) / 2, 0);
    steppeTex.repeat.set(gW / (TILE_W * .76), (top - gBot) / TILE_H);
    land.scale.set(gW, J1 - J2, 1); land.position.set(0, (J1 + J2) / 2, -.2);
    landTex.repeat.set(gW / 24, (J1 - J2) / 24);
    miniRoad.scale.set(MINI_W * 1.12, J1 - J2, 1); miniRoad.position.set(laneX, (J1 + J2) / 2, -.19);
    miniTex.repeat.set(ROAD_FR * 1.12, (J1 - J2) / (MINI_W / ROAD_FR * 1376 / 768)); miniTex.offset.x = .503 - ROAD_FR * .56;
    bands.forEach((bd, k) => { bd.scale.set(gW, 4.2, 1); bd.position.set(0, k ? J2 : J1, 1.9); });
    const oTop = J2 + 4, oBot = camEnd - visH;
    ocean.scale.set(gW, oTop - oBot, 1); ocean.position.set(0, (oTop + oBot) / 2, -.03);
    oceanTex.repeat.set(gW / OCEAN_TILE, (oTop - oBot) / OCEAN_TILE);
    const berthY = camEnd - visH * .12, quayEdge = laneX - SHIP_W / 2 - .12, quayW = quayEdge + halfW + 2;
    port.position.set(0, berthY, 0);
    quay.scale.set(quayW, 13, 1); quay.position.set(quayEdge - quayW / 2, 0, .08);
    concrete.repeat.set(quayW / 4.3, 13 / 8.6);
    yard.clear();
    const yr = mulberry32(5);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 8; r++) {
      if (yr() < .15) continue;
      const b = block(c * 8 + r); b.position.set(quayEdge - 2.05 - c * 1.6, -5.2 + r * 1.35, .1); yard.add(b);
    }
    cranes.forEach((c, i) => { c.cr.position.set(quayEdge + .25, -1.9 + i * 1.9, .12); c.quayX = -.75; c.shipX = SHIP_W / 2 + .18; c.placed = 0; });
    port.userData = { berthY, quayEdge };
    const spread = narrow ? halfW * .25 : Math.min(1.6, margin * .32);
    [[main, 0], [farA, -.28], [farB, .3]].forEach(([r, dx]) => {
      r.group.position.x = riverX + dx * Math.max(margin, 2);
      buildRiver(r, visH, camEnd * r.parallax - visH, spread * (r === main ? 1 : 1.4));
    });
    dataMat.uniforms.dpr.value = renderer.getPixelRatio();
    night.visible = !narrow;
    night.scale.set(margin + 2.4, visH + 2, 1);
    cargo.scale.setScalar(narrow ? .7 : 1);
    wakeMat.uniforms.px.value = U * renderer.getPixelRatio();
  }

  // ===== frame ================================================================================
  const tmp = new THREE.Vector3(); let time = 0, dockT = 0;
  const DRIVE = 2.4;
  function frame(dt) {
    time += dt;
    const camY = -scrollY / U;
    camera.position.set(0, camY, 100); camera.lookAt(0, camY, 0);
    night.position.set(halfW - (margin + 2.4) / 2 + .01, camY, .5);

    const vy = camY + visH * .04;
    const a = sm(J1 - 1.8, J1 + 1.8, vy), b = sm(J2 - 1.8, J2 + 1.8, vy);
    const sTruck = a, sPlane = (1 - a) * b, sShip = 1 - b;
    truck.visible = sTruck > .5; plane.visible = sPlane > .5; ship.visible = sShip > .5;     // the swap happens inside the clouds

    // docking: once the last screen is reached the ship sails on by itself and berths
    const atEnd = camY < camEnd + visH * .35;
    dockT = Math.min(1, Math.max(0, dockT + (atEnd ? dt / 4.5 : -dt / 2.5)));
    const ease = 1 - Math.pow(1 - dockT, 3);
    const berthY = port.userData.berthY;
    const sy = ship.visible ? vy + (berthY - vy) * ease : vy;
    cargo.position.set(laneX - (truck.visible ? LANE : 0), sy, .3);

    // highway
    roadTex.offset.y = -(time * DRIVE) / TILE_H; steppeTex.offset.y = roadTex.offset.y;
    traffic.forEach((t) => {
      if (t.y === undefined || t.y > camY + visH * .8 || t.y < camY - visH * 1.6) t.y = camY - visH * (.75 + t.k * .9);
      t.y += dt * (DRIVE + .9);                                                     // oncoming: steady speed up the right lane
      t.o.position.set(laneX + LANE, t.y, .3); t.o.visible = t.y > J1 + 2.5;
    });
    if (convoy.userData.y === undefined || convoy.userData.y > camY + visH * .8 || convoy.userData.y < camY - visH * 1.6) convoy.userData.y = camY - visH * .45;
    convoy.userData.y += dt * (DRIVE - 2.1);                                       // a slower truck ahead in our lane
    convoy.position.set(laneX - LANE, convoy.userData.y, .3); convoy.visible = convoy.userData.y > J1 + 2.5 && convoy.userData.y < vy - 3.8;

    // flight: miniature fields slide slower than the page (parallax), plane shadow far below
    land.visible = miniRoad.visible = camY < J1 + visH && camY > J2 - visH;
    landTex.offset.y = (-camY * .65 + time * .25) / 24;                       // fields lag behind the page: far below
    miniTex.offset.y = (-camY * .65 + time * .25) / (MINI_W / ROAD_FR * 1376 / 768);
    planeShadow.visible = plane.visible; planeShadow.position.set(laneX + 2.2, vy - 1.8, .02);
    lowClouds.forEach((c) => {
      const y = camY + visH * .6 - ((c.k * visH * 1.4 + time * .9) % (visH * 1.4));
      c.s.position.set(-halfW + c.x * halfW * 2, y, .05); c.s.material.opacity = .75 * (1 - a) * b;
    });

    // sea
    oceanTex.offset.y += -dt * .03 * (1 - Math.min(1, ease * 4)); oceanTex.offset.x = Math.sin(time * .08) * .015;
    if (ship.visible && ease < .97) {
      wakeNext -= dt;
      while (wakeNext < 0) {
        wakeNext += .01;
        const p = wakeP.find((q) => q.life <= 0); if (!p) break;
        const side = rand() < .5 ? -1 : 1, bow = rand() < .3;
        p.x = laneX + side * (SHIP_W * .45 + rand() * .08); p.y = sy + (bow ? -SHIP_L * .44 : SHIP_L * (.3 + rand() * .2));
        p.vx = side * (bow ? .45 : .28) * (.6 + rand() * .6) * (1 - ease); p.vy = (1.1 + rand() * .4) * (1 - ease) + .05;
        p.life = p.max = 3 + rand() * 2.5; p.s = (bow ? .22 : .3) + rand() * .2;
      }
    }
    wakeP.forEach((p, i) => {
      if (p.life > 0) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      const k = Math.max(0, p.life / p.max);
      wakePos[i * 3] = p.x; wakePos[i * 3 + 1] = p.y; wakePos[i * 3 + 2] = 0;
      wakeSize[i] = p.s * (2.4 - 1.4 * k); wakeAlpha[i] = p.life > 0 && ship.visible ? Math.min(1, k * 1.3) * .7 : 0;
    });
    wakeGeo.attributes.position.needsUpdate = true; wakeGeo.attributes.size.needsUpdate = true; wakeGeo.attributes.alpha.needsUpdate = true;

    // unloading once moored: trolley runs ship → quay carrying a container, drops it in the yard
    port.visible = camY < camEnd + visH * 1.6;
    const moored = ease > .985;
    cranes.forEach((c, ci) => {
      const t = (time * .2 + c.phase) % 1;
      let x, carry;
      if (t < .3) { x = c.shipX; carry = t > .14; }
      else if (t < .55) { x = c.shipX + (c.quayX - c.shipX) * sm(.3, .55, t); carry = true; }
      else if (t < .7) { x = c.quayX; carry = t < .64; }
      else { x = c.quayX + (c.shipX - c.quayX) * sm(.7, 1, t); carry = false; }
      if (!moored) { x = -.75; carry = false; }
      c.trolley.position.set(x, 0, .08); c.load.visible = carry; c.load.position.set(x, 0, .07);
      if (moored && t > .64 && c.armed) {
        c.armed = false;
        if (c.placed < 6) {
          const nb = container(c.placed + ci * 3);
          nb.position.set(port.userData.quayEdge - .45 - (c.placed % 3) * .26, c.cr.position.y + (c.placed > 2 ? .62 : -.62), .13);
          yard.add(nb); c.placed++;
        }
      }
      if (t < .5) c.armed = true;
    });

    // junction clouds: dense over the cargo lane, thinner across the page
    [J1, J2].forEach((J, k) => junction[k].forEach((c) => {
      const x = c.near ? laneX + c.u * (narrow ? 2.4 : Math.max(2.6, margin * .7)) : c.u * (halfW + 3);
      c.s.position.set(x, J + c.dy, 2); c.s.material.opacity = c.op;
    }));

    // neural rivers: pulses flow downward; a node flashes when a pulse reaches it
    rivers.forEach((r) => {
      if (!r.pulseGeo) return;
      r.group.position.y = camY * (1 - r.parallax);
      const ly = camY * r.parallax, arr = r.pulseGeo.attributes.position.array, { nodes, edges, out } = r;
      r.pulses.forEach((p, i) => {
        p.t += dt * p.v * r.speed;
        if (p.t >= 1) {
          const end = edges[p.e][1];
          if (rand() < r.flashChance) { const f = r.flashes.find((q) => q.life <= 0); if (f) { f.life = .55; f.x = nodes[end].x; f.y = nodes[end].y; f.s = .8 + rand() * .6; } }
          p.e = out[end].length ? out[end][Math.floor(rand() * out[end].length)] : p.e; p.t = 0;
        }
        let [a1, b1] = edges[p.e];
        if (nodes[a1].y < ly - visH || nodes[a1].y > ly + visH) { const n = nearestIn(nodes, ly + visH * .6 - rand() * visH * 1.2); if (out[n] && out[n].length) { p.e = out[n][0]; p.t = rand(); [a1, b1] = edges[p.e]; } }
        tmp.lerpVectors(nodes[a1], nodes[b1], p.t).toArray(arr, i * 3);
      });
      r.pulseGeo.attributes.position.needsUpdate = true;
      const fp = r.flashGeo.attributes.position.array, fs = r.flashGeo.attributes.size.array, fa = r.flashGeo.attributes.alpha.array;
      r.flashes.forEach((f, i) => {
        if (f.life > 0) f.life -= dt;
        const k = Math.max(0, f.life / .55);                       // 1 → 0
        fp[i * 3] = f.x; fp[i * 3 + 1] = f.y; fp[i * 3 + 2] = .01;
        fs[i] = r.dotPx * (1.6 + 4.2 * (1 - k)) * f.s;             // quick ring-like bloom
        fa[i] = f.life > 0 ? Math.pow(k, 1.6) * (r === main ? .85 : .45) : 0;
      });
      r.flashGeo.attributes.position.needsUpdate = true; r.flashGeo.attributes.size.needsUpdate = true; r.flashGeo.attributes.alpha.needsUpdate = true;
    });

    // data links from the main river to the cargo
    {
      const targets = [];
      const cx = cargo.position.x, cy = cargo.position.y, cs = cargo.scale.x;
      if (truck.visible) targets.push([cx, cy + .9 * cs], [cx, cy + .1 * cs]);
      else if (plane.visible) targets.push([cx, cy + .5 * cs], [cx, cy - .4 * cs]);
      else targets.push([cx, cy + 1.2 * cs], [cx, cy - 1.0 * cs]);
      const lp = linkGeo.attributes.position.array; let k = 0;
      const curves = targets.map(([tx, ty], li) => {
        const n = main.nodes[nearestIn(main.nodes, ty + (li - .5) * 1.2)] || new THREE.Vector3();
        const sx = main.group.position.x + n.x, sy2 = n.y;
        const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(sx, sy2, 0), new THREE.Vector3((sx + tx) / 2, Math.max(sy2, ty) + 1.4 + li * .25, 0), new THREE.Vector3(tx, ty, 0));
        const pts = c.getPoints(16);
        for (let q = 0; q < 16; q++) { pts[q].toArray(lp, k); pts[q + 1].toArray(lp, k + 3); k += 6; }
        return c;
      });
      linkGeo.attributes.position.needsUpdate = true;
      linkMat.opacity = .5 + .2 * Math.sin(time * 2.2);
      const dp = dataGeo.attributes.position.array, ds = dataGeo.attributes.size.array, da = dataGeo.attributes.alpha.array;
      data.forEach((d, i) => {
        d.t = (d.t + dt * d.v) % 1;
        curves[d.link].getPoint(d.dir > 0 ? d.t : 1 - d.t, tmp).toArray(dp, i * 3);
        ds[i] = 12 + 8 * Math.sin(d.t * Math.PI); da[i] = Math.min(1, Math.sin(d.t * Math.PI) * 1.4);
      });
      dataGeo.attributes.position.needsUpdate = true; dataGeo.attributes.size.needsUpdate = true; dataGeo.attributes.alpha.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  layout();
  addEventListener('resize', () => { layout(); frame(0); });
  addEventListener('load', () => { layout(); frame(0); });
  if (document.fonts) document.fonts.ready.then(() => { layout(); frame(0); });
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => layout()));

  if (reduce) { dockT = 1; addEventListener('scroll', () => frame(.016), { passive: true }); frame(0); }
  else { const clock = new THREE.Clock(); const tick = () => { frame(Math.min(clock.getDelta(), .05)); requestAnimationFrame(tick); }; tick(); }
  canvas.classList.add('ready');
}

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
