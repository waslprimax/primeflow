// PRIME FLOW — "the main flow" (daylight edition).
// Scroll-driven background: a river of neurons runs top→bottom through the whole page;
// beside it the cargo travels: truck on a steppe highway → (clouds) → cargo jet high above
// miniature fields → (clouds) → container ship at sea → docks in port and is unloaded.
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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  const BLUE = new THREE.Color('#0078d0'), DEEP = new THREE.Color('#0b3d73'), SKY = new THREE.Color('#5cc8f7');
  const rand = mulberry32(11);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const loader = new THREE.TextureLoader();
  const loadTex = (url, wrap = THREE.MirroredRepeatWrapping) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = wrap; t.anisotropy = 8; return t; };

  scene.add(new THREE.HemisphereLight('#ffffff', '#8a9bb0', 2.2));
  const sun = new THREE.DirectionalLight('#ffffff', 2.4); scene.add(sun, sun.target);

  // canvas textures --------------------------------------------------------------
  const ctex = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const dot = ctex((g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, '#fff'); r.addColorStop(.35, 'rgba(255,255,255,.9)'); r.addColorStop(.7, 'rgba(255,255,255,.25)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const puffs = [0, 1, 2].map((seed) => ctex((g) => {
    const rr = mulberry32(seed + 3);
    for (let i = 0; i < 14; i++) {
      const x = 28 + rr() * 72, y = 34 + rr() * 60, R = 16 + rr() * 30;
      const r = g.createRadialGradient(x, y, 0, x, y, R);
      r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.55, 'rgba(244,248,252,.6)'); r.addColorStop(1, 'rgba(235,242,250,0)');
      g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    }
  }));

  // photo cutouts — tilted to face the camera so they are not foreshortened -------------
  function photo(url, w, h, shadowOff = .25, shadowOpacity = .4) {
    const t = loadTex(url, THREE.ClampToEdgeWrapping);
    const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h);
    const sh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, color: 0x0a1424, transparent: true, opacity: shadowOpacity, depthWrite: false }));
    sh.position.set(shadowOff, -shadowOff * .5, -.6);
    const body = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    const tilt = new THREE.Group(); tilt.add(body);
    g.add(sh, tilt); g.userData = { sh, body, tilt }; return g;
  }
  const TRUCK = ['/img/truck.webp', 1.13, 4.4];
  const truck = photo(...TRUCK, .22, .45);
  const plane = photo('/img/plane.webp', 6.4, 6.6, 0, 0);             // its shadow is cast on the far ground instead
  const ship = photo('/img/ship.webp', 1.6, 8.1, .22, .35);
  const cargo = new THREE.Group(); cargo.add(truck, plane, ship); scene.add(cargo);

  // zone 1: steppe highway ---------------------------------------------------------
  const ROAD_TILE_W = 24, ROAD_TILE_H = 24 * 685 / 383;           // tile in world units; road = 17.5% of tile width
  const roadTex = loadTex('/img/road.webp');
  roadTex.wrapS = THREE.ClampToEdgeWrapping;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: roadTex }));
  const steppeTex = loadTex('/img/steppe.webp');
  const steppe = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: steppeTex }));
  scene.add(steppe, ground);

  const traffic = [];
  const tints = ['#ffffff', '#ffe7da', '#e3edf7'];
  for (let i = 0; i < 3; i++) { const t = photo(...TRUCK, .22, .45); t.userData.body.material.color.set(tints[i]); t.rotation.z = Math.PI; scene.add(t); traffic.push({ o: t, k: i / 3 }); }
  const convoy = photo(...TRUCK, .22, .45); convoy.userData.body.material.color.set('#eef3f8'); scene.add(convoy);

  // zone 2: far-below landscape + plane shadow ----------------------------------------
  const FAR_Z = -34;
  const landTex = loadTex('/img/land.webp');
  const land = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: landTex, color: '#dbe6f0' }));
  scene.add(land);
  const planeShadow = new THREE.Mesh(new THREE.PlaneGeometry(6.4 * 1.6, 6.6 * 1.6), new THREE.MeshBasicMaterial({ map: plane.userData.body.material.map, color: 0x0a1424, transparent: true, opacity: .22, depthWrite: false }));
  scene.add(planeShadow);
  const lowClouds = [];
  for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffs[i % 3], transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(5 + rand() * 7); scene.add(s); lowClouds.push({ s, x: rand() * 2 - 1, k: rand(), z: -6 - rand() * 14 }); }

  // zone 3: ocean + port ----------------------------------------------------------------
  const OCEAN_TILE = 16;
  const oceanTex = loadTex('/img/ocean.webp');
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: oceanTex }));
  scene.add(ocean);

  // wake: foam particles emitted at the stern and bow, drifting back in a V
  const WAKE = 700, wakePos = new Float32Array(WAKE * 3), wakeSize = new Float32Array(WAKE), wakeAlpha = new Float32Array(WAKE);
  const wakeP = Array.from({ length: WAKE }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, s: 1 }));
  const wakeGeo = new THREE.BufferGeometry();
  wakeGeo.setAttribute('position', new THREE.BufferAttribute(wakePos, 3));
  wakeGeo.setAttribute('size', new THREE.BufferAttribute(wakeSize, 1));
  wakeGeo.setAttribute('alpha', new THREE.BufferAttribute(wakeAlpha, 1));
  const wakeMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: dot }, scale: { value: 300 } }, transparent: true, depthWrite: false,
    vertexShader: 'attribute float size; attribute float alpha; varying float vA; uniform float scale; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform sampler2D map; varying float vA; void main(){ vec4 c = texture2D(map, gl_PointCoord); gl_FragColor = vec4(1.,1.,1., c.a * vA); }',
  });
  { const wp = new THREE.Points(wakeGeo, wakeMat); wp.frustumCulled = false; scene.add(wp); }
  let wakeNext = 0;

  // port: quay, container yard, three gantry cranes
  const port = new THREE.Group(); scene.add(port);
  const std = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: .6, metalness: .1 });
  const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(c));
  const quay = box(16, 22, .5, '#a9b2bc'); quay.position.set(-8, 0, .05); port.add(quay);
  const quayEdge = box(.22, 22, .55, '#d9dee3'); quayEdge.position.set(-.12, 0, .08); port.add(quayEdge);
  const PAL = ['#0078d0', '#5cc8f7', '#e46d4c', '#e9eff7', '#1f4e8c', '#8a96a6'];
  const yard = new THREE.Group(); port.add(yard);
  const C = [.62, 1.35, .5];                                                     // container: width, length, height
  for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
    const hgt = 1 + Math.floor(rand() * 3);
    for (let h = 0; h < hgt; h++) { const c = box(C[0], C[1], C[2], PAL[Math.floor(rand() * PAL.length)]); c.position.set(-4.4 - col * .78, -8.5 + row * 1.6, .3 + C[2] / 2 + h * C[2]); yard.add(c); }
  }
  const drop = [];                                                               // slots where unloaded boxes land
  for (let i = 0; i < 12; i++) drop.push(new THREE.Vector3(-2.2 - (i % 2) * .8, -6 + Math.floor(i / 2) * 2.2, .3 + C[2] / 2));
  const cranes = [];
  for (let i = 0; i < 3; i++) {
    const cr = new THREE.Group(); cr.position.y = -4.2 + i * 4.2;
    for (const y of [-.7, .7]) for (const x of [-1.6, -.3]) { const leg = box(.16, .16, 3.4, '#0078d0'); leg.position.set(x, y, .3 + 1.7); cr.add(leg); }
    const beam = box(5.2, .26, .26, '#0078d0'); beam.position.set(.5, 0, 3.6); cr.add(beam);       // boom over the water
    const house = box(.9, 1.0, .6, '#eef2f6'); house.position.set(-1.4, 0, 4.0); cr.add(house);
    const trolley = box(.5, .5, .25, '#f4f6f8'); trolley.position.set(1.6, 0, 3.35); cr.add(trolley);
    const load = box(C[0] * .95, C[1] * .95, C[2], PAL[i]); load.visible = false; cr.add(load);
    port.add(cr); cranes.push({ cr, trolley, load, phase: i * .33, placed: 0, justPlaced: false });
  }

  // transition clouds (dense over the cargo lane, lighter towards the text) -----------
  const junction = [[], []];
  junction.forEach((arr) => { for (let i = 0; i < 150; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffs[i % 3], transparent: true, opacity: .9, depthWrite: false }));
    const nearLane = i < 95;
    s.scale.setScalar(nearLane ? 4 + rand() * 5 : 6 + rand() * 7); scene.add(s);
    arr.push({ s, nearLane, u: rand() * 2 - 1, dy: (rand() * 2 - 1) * (nearLane ? 3.2 : 2.4), z: nearLane ? 4.6 + rand() * 4 : 1 + rand() * 4, op: nearLane ? .95 : .5 });
  } });

  // neuron river ------------------------------------------------------------------------
  const river = new THREE.Group(); scene.add(river);
  let nodes = [], edges = [], out = [], pulses = [], pulseGeo;
  const PULSES = 170;
  function buildRiver(top, bottom, spread) {
    river.clear(); nodes = []; edges = [];
    const n = Math.floor((top - bottom) * 3.2);
    for (let i = 0; i < n; i++) nodes.push(new THREE.Vector3((rand() + rand() + rand() - 1.5) * spread * 1.3, top - (i / n) * (top - bottom) + (rand() - .5) * .5, (rand() - .5) * 2.4 + 1.2));
    nodes.sort((a, b) => b.y - a.y);
    out = nodes.map(() => []);
    nodes.forEach((p, i) => {
      const cand = []; for (let j = i + 1; j < Math.min(nodes.length, i + 14); j++) if (nodes[j].y < p.y - .15) cand.push(j);
      cand.sort((a, b) => p.distanceTo(nodes[a]) - p.distanceTo(nodes[b])).slice(0, 2 + (rand() < .35)).forEach((j) => { out[i].push(edges.length); edges.push([i, j]); });
    });
    const ng = new THREE.BufferGeometry().setFromPoints(nodes);
    const col = new Float32Array(nodes.length * 3); nodes.forEach((_, i) => DEEP.clone().lerp(BLUE, rand()).toArray(col, i * 3));
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const lp = new Float32Array(edges.length * 6); edges.forEach(([a, b], i) => { nodes[a].toArray(lp, i * 6); nodes[b].toArray(lp, i * 6 + 3); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    pulseGeo = new THREE.BufferGeometry(); pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PULSES * 3), 3));
    river.add(
      new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: .42, depthWrite: false })),
      new THREE.Points(ng, new THREE.PointsMaterial({ size: .5, map: dot, vertexColors: true, transparent: true, depthWrite: false })),
      new THREE.Points(pulseGeo, new THREE.PointsMaterial({ size: .62, map: dot, color: SKY, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    river.children.forEach((o) => { o.frustumCulled = false; });
    pulses = Array.from({ length: PULSES }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: .7 + rand() * .7 }));
  }
  const nearestNode = (y) => { let lo = 0, hi = nodes.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (nodes[m].y > y) lo = m + 1; else hi = m; } return lo; };
  const beamGeo = new THREE.BufferGeometry(); beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const beamMat = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: .4, depthWrite: false });
  { const bl = new THREE.LineSegments(beamGeo, beamMat); bl.frustumCulled = false; scene.add(bl); }

  // layout --------------------------------------------------------------------------------
  let visH = 14, halfW = 12, laneX = -7, riverX = 7, J1 = -30, J2 = -60, END = -120, camEnd = -100, narrow = false, vs = .72;
  const CAM_BACK = 7, CAM_Z = 21, TILT = Math.atan2(CAM_BACK, CAM_Z);
  const worldY = (docY) => -(docY - innerHeight * .5) / innerHeight * visH;
  function layout() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    visH = 2 * Math.hypot(CAM_BACK, CAM_Z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); halfW = visH * camera.aspect / 2;
    narrow = camera.aspect < .85; vs = narrow ? .55 : .72;
    const pxU = h / visH, margin = Math.max(0, (w - 1000) / 2) / pxU;            // world units of free space beside the 1000px column
    laneX = narrow || margin < 2.2 ? -halfW * .58 : -halfW + margin * .5;
    riverX = narrow || margin < 2.2 ? halfW * .55 : halfW - margin * .5;
    const docH = document.documentElement.scrollHeight;
    const q = (sel, fb) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : fb; };
    J1 = worldY(q('#ai', docH * .3)); J2 = worldY(q('#contact', docH * .75));
    camEnd = -(docH - h) / h * visH; END = camEnd - visH;
    const gTop = 14, gBot = J1 - 4, gW = halfW * 2 + 40;
    ground.scale.set(ROAD_TILE_W * .62, gTop - gBot, 1); ground.position.set(laneX, (gTop + gBot) / 2, -.02);
    roadTex.repeat.set(.62, (gTop - gBot) / ROAD_TILE_H); roadTex.offset.x = .503 - .31;
    steppe.scale.set(gW, gTop - gBot, 1); steppe.position.set(0, (gTop + gBot) / 2, -.025);
    steppeTex.repeat.set(gW / (ROAD_TILE_W * .74), (gTop - gBot) / ROAD_TILE_H);
    const lTop = J1 + 30, lBot = J2 - 30, lW = halfW * 6 + 80;
    land.scale.set(lW, lTop - lBot, 1); land.position.set(0, (lTop + lBot) / 2, FAR_Z);
    landTex.repeat.set(lW / 46, (lTop - lBot) / 46);
    const oTop = J2 + 4, oBot = END - 10, oW = halfW * 2 + 40;
    ocean.scale.set(oW, oTop - oBot, 1); ocean.position.set(0, (oTop + oBot) / 2, -.03);
    oceanTex.repeat.set(oW / OCEAN_TILE, (oTop - oBot) / OCEAN_TILE);
    port.position.set(laneX - .95 * vs, camEnd - visH * .02, 0); port.scale.setScalar(narrow ? .5 : .62);
    river.position.x = riverX;
    buildRiver(14, END - 10, narrow ? halfW * .3 : Math.min(2.6, Math.max(1.4, (halfW - riverX) * .55)));
    cargo.scale.setScalar(vs);
    wakeMat.uniforms.scale.value = h * .9;
  }

  // frame -----------------------------------------------------------------------------------
  const tmp = new THREE.Vector3(); let time = 0;
  const DRIVE = 2.6;                                                   // our truck's speed over the road
  function frame(dt) {
    time += dt;
    const camY = -scrollY / innerHeight * visH;
    camera.position.set(0, camY - CAM_BACK, CAM_Z); camera.lookAt(0, camY, 0);
    sun.position.set(-8, camY + 10, 18); sun.target.position.set(laneX, camY, 0);

    const vy = camY - visH * .02;
    const a = sm(J1 - 1.6, J1 + 1.6, vy), b = sm(J2 - 1.6, J2 + 1.6, vy);
    const sTruck = a, sPlane = (1 - a) * b, sShip = 1 - b;
    truck.visible = sTruck > .01; plane.visible = sPlane > .01; ship.visible = sShip > .01;
    truck.scale.setScalar(Math.max(.001, sTruck)); plane.scale.setScalar(Math.max(.001, sPlane)); ship.scale.setScalar(Math.max(.001, sShip));
    for (const v of [truck, ship, convoy]) v.userData.tilt.rotation.x = TILT;
    traffic.forEach((t) => { t.o.userData.tilt.rotation.x = -TILT; });
    plane.userData.tilt.rotation.x = TILT * .6;

    // docking at the very end of the page
    const dock = sm(camEnd + visH * .9, camEnd, camY);
    const laneOff = -1.05 * vs * sTruck + (1.0 * vs * (1 - dock) - .1 * dock) * sShip;
    const z = .7 * sTruck + 4.2 * sPlane + 1.05 * sShip;
    cargo.position.set(laneX + laneOff + Math.sin(time * .6) * .03 * sPlane, vy, z);
    plane.rotation.y = Math.sin(time * .7) * .08;

    // highway: markings slide up past our truck; oncoming trucks climb the right lane, slowly
    roadTex.offset.y = -(time * DRIVE) / ROAD_TILE_H; steppeTex.offset.y = roadTex.offset.y;
    traffic.forEach((t) => {
      const span = 34, y = vy - 16 + ((t.k * span + time * (DRIVE + 1.4)) % span);
      t.o.position.set(laneX + 1.05 * vs, y, .7); t.o.scale.setScalar(vs); t.o.visible = y > J1 + 2 && y < 13;
    });
    { const y = vy - 6.5 - ((time * .3) % 3); convoy.position.set(laneX - 1.05 * vs, y, .7); convoy.scale.setScalar(vs); convoy.visible = y > J1 + 2; }

    // flight: far ground, low clouds, plane shadow
    const flight = sm(J1 + 2, J1 - 2, camY) * sm(J2 - 2, J2 + 2, camY);
    planeShadow.position.set(cargo.position.x + 6, vy - 9, FAR_Z + .1); planeShadow.visible = sPlane > .3; planeShadow.material.opacity = .2 * sPlane;
    landTex.offset.y = -time * .015;
    lowClouds.forEach((c) => {
      const y = camY + 16 - ((c.k * 32 + time * 1.4) % 32);
      c.s.position.set(c.x * (halfW + 8), y, c.z); c.s.material.opacity = .85 * flight;
    });

    // sea: water drifts past the ship; wake particles
    oceanTex.offset.y = -time * .05 * (1 - dock); oceanTex.offset.x = Math.sin(time * .1) * .02;
    const sail = sShip * (1 - dock * .95);
    if (sail > .05) {
      wakeNext -= dt;
      while (wakeNext < 0) {
        wakeNext += .006;
        const p = wakeP.find((q) => q.life <= 0); if (!p) break;
        const side = rand() < .5 ? -1 : 1, bow = rand() < .35;
        p.x = cargo.position.x + side * (.55 + rand() * .2) * vs; p.y = vy + (bow ? -3.0 : 2.4 + rand() * 1.4) * vs;
        p.vx = side * (bow ? .55 : .35) * (0.6 + rand() * .6); p.vy = 2.2 + rand() * .8;
        p.life = p.max = 3 + rand() * 2.5; p.s = (bow ? .35 : .5) + rand() * .35;
      }
    }
    wakeP.forEach((p, i) => {
      if (p.life > 0) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt * (1 - dock); }
      const k = Math.max(0, p.life / p.max);
      wakePos[i * 3] = p.x; wakePos[i * 3 + 1] = p.y; wakePos[i * 3 + 2] = .1;
      wakeSize[i] = p.s * (2.2 - 1.2 * k) * .55; wakeAlpha[i] = p.life > 0 ? Math.min(1, k * 1.4) * .55 * sShip : 0;
    });
    wakeGeo.attributes.position.needsUpdate = true; wakeGeo.attributes.size.needsUpdate = true; wakeGeo.attributes.alpha.needsUpdate = true;

    // unloading: cranes swing containers from the deck to the quay once docked
    port.visible = camY < camEnd + visH * 2.2;
    cranes.forEach((c, ci) => {
      const working = dock > .92;
      const t = ((time * .22 + c.phase) % 1);
      const shipSide = 1.55, quaySide = -2.0;
      let x, carry;
      if (t < .35) { x = shipSide; carry = t > .15; }
      else if (t < .6) { x = shipSide + (quaySide - shipSide) * sm(.35, .6, t); carry = true; }
      else if (t < .75) { x = quaySide; carry = t < .7; }
      else { x = quaySide + (shipSide - quaySide) * sm(.75, 1, t); carry = false; }
      c.trolley.position.x = working ? x : shipSide;
      c.load.visible = working && carry;
      c.load.position.set(c.trolley.position.x, 0, 2.2);
      if (working && t > .7 && !c.justPlaced) {
        c.justPlaced = true;
        const slot = drop[(c.placed * 3 + ci) % drop.length];
        const nb = box(C[0], C[1], C[2], PAL[(c.placed + ci) % PAL.length]);
        nb.position.set(slot.x, c.cr.position.y + (slot.y * .15), slot.z + (Math.floor(c.placed / 4) % 3) * C[2]);
        yard.add(nb); c.placed++;
        if (yard.children.length > 160) yard.remove(yard.children[120]);
      }
      if (t < .7) c.justPlaced = false;
    });

    // transition clouds
    [J1, J2].forEach((J, k) => junction[k].forEach((c) => {
      const x = c.nearLane ? laneX + c.u * (narrow ? 3 : 5) : c.u * (halfW + 4);
      c.s.position.set(x, J + c.dy, c.z); c.s.material.opacity = c.op;
    }));

    // neuron river
    if (pulseGeo) {
      const arr = pulseGeo.attributes.position.array;
      pulses.forEach((p, i) => {
        p.t += dt * p.v * 1.4;
        if (p.t >= 1) { const end = edges[p.e][1]; p.e = out[end].length ? out[end][Math.floor(rand() * out[end].length)] : p.e; p.t = 0; }
        let [s, e] = edges[p.e];
        if (nodes[s].y < camY - visH || nodes[s].y > camY + visH) { const n = nearestNode(camY + visH * .6 - rand() * visH * 1.2); if (out[n] && out[n].length) { p.e = out[n][0]; p.t = rand(); [s, e] = edges[p.e]; } }
        tmp.lerpVectors(nodes[s], nodes[e], p.t).toArray(arr, i * 3);
      });
      pulseGeo.attributes.position.needsUpdate = true;
      const n = nodes[nearestNode(vy)];
      if (n) { const bp = beamGeo.attributes.position.array; tmp.set(riverX + n.x, n.y, n.z).toArray(bp, 0); tmp.set(cargo.position.x, vy, z + .6).toArray(bp, 3); beamGeo.attributes.position.needsUpdate = true; beamMat.opacity = .18 + .2 * (.5 + .5 * Math.sin(time * 2.4)); }
    }
    renderer.render(scene, camera);
  }

  layout();
  addEventListener('resize', () => { layout(); frame(0); });
  addEventListener('load', () => { layout(); frame(0); });
  if (document.fonts) document.fonts.ready.then(() => { layout(); frame(0); });
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => layout()));

  if (reduce) { addEventListener('scroll', () => frame(.016), { passive: true }); frame(0); }
  else { const clock = new THREE.Clock(); const tick = () => { frame(Math.min(clock.getDelta(), .05)); requestAnimationFrame(tick); }; tick(); }
  canvas.classList.add('ready');
}

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
