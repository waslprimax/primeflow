// PRIME FLOW — "the main flow".
// A fixed background scene driven by page scroll: a river of neurons runs top→bottom
// through the whole page; beside it the cargo travels: truck on a road → (clouds) →
// plane in the sky → (clouds) → container ship at sea. The AI stream guides the cargo.
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

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05060f, 18, 40);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  const veil = document.querySelector('.veil');

  const BLUE = new THREE.Color('#0078d0'), CYAN = new THREE.Color('#5cc8f7'), ICE = new THREE.Color('#eef8ff');
  const rand = mulberry32(11);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // textures -----------------------------------------------------------------
  const tex = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const dot = tex((g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, '#fff'); r.addColorStop(.22, 'rgba(255,255,255,.8)'); r.addColorStop(.55, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const puff = tex((g) => { for (let i = 0; i < 9; i++) { const x = 30 + Math.random() * 68, y = 38 + Math.random() * 52, rr = 18 + Math.random() * 26; const r = g.createRadialGradient(x, y, 0, x, y, rr); r.addColorStop(0, 'rgba(190,220,250,.5)'); r.addColorStop(1, 'rgba(190,220,250,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); } });

  // helpers for glowing wire models
  // solid, lit models with a faint cyan edge — "real" vehicles in the brand light
  function part(geo, color, _fill, line = .9) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: .45, metalness: .15 })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: line * .28 })));
    return g;
  }
  scene.add(new THREE.HemisphereLight('#cfe8ff', '#0a1430', 1.6));
  const sun = new THREE.DirectionalLight('#ffffff', 2.2); sun.position.set(-6, 8, 14); scene.add(sun); scene.add(sun.target);
  const WHITE = '#e9eff7', STEEL = '#9fb0c4', TYRE = '#161c28';
  const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };

  // vehicles (all point "down" the page: nose toward −y) -----------------------
  // photoreal top-down cutouts (nose toward −y), each with a soft drop shadow
  const loader = new THREE.TextureLoader();
  function photo(url, w, h, shadowOff = .25, shadowOpacity = .45) {
    const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h);
    const sh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, color: 0x000000, transparent: true, opacity: shadowOpacity, depthWrite: false }));
    sh.position.set(shadowOff, -shadowOff * .6, -.05); sh.scale.setScalar(1.02); sh.renderOrder = 1;
    const body = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    body.renderOrder = 2; g.add(sh, body); g.userData = { sh, body }; return g;
  }
  const TRUCK = ['/img/truck.webp', 1.13, 4.4];
  const truck = photo(...TRUCK, .18, .5);
  const plane = photo('/img/plane.webp', 6.4, 6.6, 1.6, .28);          // shadow falls far below
  const ship = photo('/img/ship.webp', 1.6, 8.1, .22, .5);
  const wakeMat = new THREE.LineBasicMaterial({ color: ICE, transparent: true, opacity: .35 });
  const wake = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-.6, 3.9, -.1), new THREE.Vector3(-3.6, 12, -.1), new THREE.Vector3(.6, 3.9, -.1), new THREE.Vector3(3.6, 12, -.1),
    new THREE.Vector3(-.35, 3.9, -.1), new THREE.Vector3(-1.5, 10, -.1), new THREE.Vector3(.35, 3.9, -.1), new THREE.Vector3(1.5, 10, -.1)]), wakeMat);
  ship.add(wake);
  const foam = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: ICE, transparent: true, opacity: .55, depthWrite: false }));
  foam.position.set(0, -4.1, -.05); foam.scale.set(1.8, 1.1, 1); ship.add(foam);
  const cargo = new THREE.Group(); cargo.add(truck, plane, ship); scene.add(cargo);

  // lanes: road → sky → sea ---------------------------------------------------
  const lane = new THREE.Group(); scene.add(lane);
  const road = new THREE.Group(); lane.add(road);
  const roadMat = new THREE.MeshBasicMaterial({ color: '#1a1f2b', transparent: true, opacity: .92, depthWrite: false });
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1), roadMat); road.add(roadPlane);
  const edgeMat = new THREE.LineBasicMaterial({ color: '#dfe6ee', transparent: true, opacity: .7 });
  const dashMat = new THREE.LineDashedMaterial({ color: ICE, transparent: true, opacity: .55, dashSize: .9, gapSize: .9 });
  let roadEdges, roadDash;
  const dashGeo = new THREE.PlaneGeometry(.14, 1.1), dashMesh = new THREE.MeshBasicMaterial({ color: '#e8edf3', transparent: true, opacity: .8, depthWrite: false });
  const dashes = Array.from({ length: 16 }, () => { const m = new THREE.Mesh(dashGeo, dashMesh); m.position.z = .02; road.add(m); return m; });
  // traffic: oncoming trucks face us (nose up) in the right lane; ours and a convoy drive down the left lane
  const traffic = [];
  const tints = ['#ffffff', '#ffe2d2', '#dfe8f2'];
  for (let i = 0; i < 3; i++) { const t = photo(...TRUCK, .18, .5); t.userData.body.material.color.set(tints[i]); t.rotation.z = Math.PI; road.add(t); traffic.push({ o: t, k: i / 3 }); }
  const convoy = photo(...TRUCK, .18, .5); convoy.userData.body.material.color.set('#e8eef6'); road.add(convoy);

  const skyClouds = [];
  for (let i = 0; i < 22; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, transparent: true, opacity: .0, depthWrite: false })); s.scale.setScalar(2.5 + rand() * 3); scene.add(s); skyClouds.push({ s, x: rand(), k: rand(), z: -2 - rand() * 2 }); }

  const water = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#042a52', transparent: true, opacity: 0, depthWrite: false }));
  water.position.z = -.4; scene.add(water);
  const waves = [], WAVES = 30, WSEG = 48;
  for (let i = 0; i < WAVES; i++) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WSEG * 3), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: i % 3 ? BLUE : CYAN, transparent: true, opacity: 0 })); scene.add(l); waves.push(l);
  }

  // transition clouds at section junctions
  const junctionClouds = [[], []];
  junctionClouds.forEach((arr) => { for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, transparent: true, opacity: .34, depthWrite: false })); s.scale.setScalar(3 + rand() * 5); scene.add(s); const x = rand() * 2 - 1; arr.push({ s, x: Math.sign(x) * Math.pow(Math.abs(x), .6), dy: (rand() * 2 - 1) * 2.6, z: rand() * 6 }); } });

  // neuron river --------------------------------------------------------------
  const river = new THREE.Group(); scene.add(river);
  let nodes = [], edges = [], out = [], pulses = [], pulseGeo, nodePts, lineSeg;
  const PULSES = 170;
  function buildRiver(top, bottom, spread) {
    river.clear(); nodes = []; edges = [];
    const n = Math.floor((top - bottom) * 3.4);
    for (let i = 0; i < n; i++) {
      const y = top - (i / n) * (top - bottom) + (rand() - .5) * .5;
      nodes.push(new THREE.Vector3((rand() + rand() + rand() - 1.5) * spread * 1.3, y, (rand() - .5) * 2.6));
    }
    nodes.sort((a, b) => b.y - a.y);
    out = nodes.map(() => []);
    nodes.forEach((p, i) => {
      const cand = []; for (let j = i + 1; j < Math.min(nodes.length, i + 14); j++) if (nodes[j].y < p.y - .15) cand.push(j);
      cand.sort((a, b) => p.distanceTo(nodes[a]) - p.distanceTo(nodes[b])).slice(0, 2 + (rand() < .35)).forEach((j) => { out[i].push(edges.length); edges.push([i, j]); });
    });
    const ng = new THREE.BufferGeometry().setFromPoints(nodes);
    const col = new Float32Array(nodes.length * 3); nodes.forEach((_, i) => BLUE.clone().lerp(CYAN, rand()).toArray(col, i * 3));
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    nodePts = new THREE.Points(ng, new THREE.PointsMaterial({ size: .62, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const lp = new Float32Array(edges.length * 6); edges.forEach(([a, b], i) => { nodes[a].toArray(lp, i * 6); nodes[b].toArray(lp, i * 6 + 3); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    lineSeg = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: .26, depthWrite: false, blending: THREE.AdditiveBlending }));
    pulseGeo = new THREE.BufferGeometry(); pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PULSES * 3), 3));
    river.add(lineSeg, nodePts, new THREE.Points(pulseGeo, new THREE.PointsMaterial({ size: .55, map: dot, color: ICE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    pulses = Array.from({ length: PULSES }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: .7 + rand() * .7 }));
  }
  const nearestNode = (y) => { let lo = 0, hi = nodes.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (nodes[m].y > y) lo = m + 1; else hi = m; } return lo; };

  // guidance beam: river → cargo
  const beamGeo = new THREE.BufferGeometry(); beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
  const beamMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.LineSegments(beamGeo, beamMat));

  // layout --------------------------------------------------------------------
  let visH = 14, halfW = 12, laneX = -7, riverX = 7, J1 = -30, J2 = -60, END = -120;
  const CAM_BACK = 7, CAM_Z = 21;
  const worldY = (docY) => -(docY - innerHeight * .5) / innerHeight * visH;
  function layout() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const dist = Math.hypot(CAM_BACK, CAM_Z);
    visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); halfW = visH * camera.aspect / 2;
    const narrow = camera.aspect < .85;
    laneX = -halfW * (narrow ? .6 : .76); riverX = halfW * (narrow ? .55 : .64);
    const docH = document.documentElement.scrollHeight;
    const q = (sel, fb) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : fb; };
    J1 = worldY(q('#lines', docH * .35)); J2 = worldY(q('#rules', docH * .7)); END = worldY(docH + h);
    lane.position.x = laneX;
    roadPlane.scale.y = (12 - (J1 - 2)); roadPlane.position.y = (12 + J1 - 2) / 2;
    if (roadEdges) road.remove(roadEdges);
    const top = 12, bot = J1 - 2;
    roadEdges = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.1, top, .01), new THREE.Vector3(-2.1, bot, .01), new THREE.Vector3(2.1, top, .01), new THREE.Vector3(2.1, bot, .01)]), edgeMat);
    road.add(roadEdges);
    river.position.x = riverX;
    buildRiver(14, END - 10, narrow ? halfW * .3 : Math.min(3.6, halfW * .24));
    const vs = narrow ? .5 : .72; cargo.scale.setScalar(vs);
  }

  // frame ----------------------------------------------------------------------
  const tmp = new THREE.Vector3(); let time = 0;
  function frame(dt) {
    time += dt;
    const camY = -scrollY / innerHeight * visH;
    camera.position.set(0, camY - CAM_BACK, CAM_Z); camera.lookAt(0, camY, 0);
    sun.position.set(-6, camY + 8, 14); sun.target.position.set(laneX, camY, 0);
    if (veil) veil.style.opacity = Math.min(1, scrollY / (innerHeight * .8)).toFixed(3);

    // cargo position & morph
    const vy = camY - visH * .02;
    const a = sm(J1 - 1.4, J1 + 1.4, vy);            // 1 = still on the road
    const b = sm(J2 - 1.4, J2 + 1.4, vy);            // 1 = still in the air
    const sTruck = a, sPlane = (1 - a) * b, sShip = 1 - b;
    truck.scale.setScalar(Math.max(.001, sTruck)); plane.scale.setScalar(Math.max(.001, sPlane)); ship.scale.setScalar(Math.max(.001, sShip));
    truck.visible = sTruck > .01; plane.visible = sPlane > .01; ship.visible = sShip > .01;
    const z = .4 * sTruck + 3.2 * sPlane + .1 * sShip;
    cargo.position.set(laneX - 1.05 * sTruck * cargo.scale.x / .72 + Math.sin(time * .6) * .06, vy, z);
    plane.rotation.y = Math.sin(time * .9) * .12;
    ship.rotation.y = Math.sin(time * .8) * .04; wakeMat.opacity = .25 + .1 * Math.sin(time * 2);

    // road dashes flow & oncoming traffic
    // our truck drives forward (down): markings slide up past it
    const DRIVE = 4.2, P = 2.4;
    dashes.forEach((d, i) => { const y = Math.floor((camY + 10) / P) * P - i * P + ((time * DRIVE) % P); d.position.set(0, y, .02); d.visible = y < 12 && y > J1 - 2; });
    // oncoming trucks: relative speed = theirs + ours, they come up the right lane facing us
    traffic.forEach((t) => { const span = 30, s2 = vy + 16 - ((t.k * span + time * DRIVE * 1.8) % span); t.o.position.set(1.05, s2, .25); t.o.visible = s2 > J1 + 1.5 && s2 < 12; });
    // convoy truck ahead of us in our lane, slowly pulling away
    { const y = vy - 7 - ((time * .35) % 4); convoy.position.set(-1.05, y, .25); convoy.scale.setScalar(.72); convoy.visible = y > J1 + 1.5; }

    // sky clouds beneath the plane
    skyClouds.forEach((c) => {
      const y = camY + 10 - ((c.k * 22 + time * .8) % 22);
      c.s.position.set(-halfW + c.x * halfW * 2, y, c.z);
      c.s.material.opacity = .22 * sm(J1 + 1, J1 - 2, y) * sm(J2 - 1, J2 + 2, y);
    });

    // sea waves (recycled lines that stay around the camera)
    waves.forEach((l, i) => {
      const y = Math.floor((camY + 9) / .9) * .9 - i * .9;
      const p = l.geometry.attributes.position.array;
      for (let s = 0; s < WSEG; s++) { const x = -halfW - 2 + (s / (WSEG - 1)) * (halfW * 2 + 4); p[s * 3] = x; p[s * 3 + 1] = y + Math.sin(x * .5 + time * 1.4 + i) * .12; p[s * 3 + 2] = Math.sin(x * .9 - time * 1.1 + i * .7) * .15 - .2; }
      l.geometry.attributes.position.needsUpdate = true;
      l.material.opacity = .5 * sm(J2 + .5, J2 - 1.5, y);
    });

    water.scale.set(halfW * 2 + 8, visH * 2.4, 1);
    water.position.set(0, Math.min(J2 - .5 - visH * 1.2, camY), -.4);
    water.material.opacity = .55 * sm(J2 + 2, J2 - 2, camY);
    // junction clouds
    [J1, J2].forEach((J, k) => junctionClouds[k].forEach((c) => { c.s.position.set(c.x * (halfW + 3), J + c.dy, c.z); }));

    // neuron river: pulses always flow downward
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
      if (n) { const bp = beamGeo.attributes.position.array; tmp.set(riverX + n.x, n.y, n.z).toArray(bp, 0); tmp.set(cargo.position.x, vy, z + .8).toArray(bp, 3); tmp.set(riverX + n.x, n.y, n.z).toArray(bp, 6); tmp.set(cargo.position.x, vy - 1.2 * cargo.scale.x, z + .8).toArray(bp, 9); beamGeo.attributes.position.needsUpdate = true; beamMat.opacity = .12 + .14 * (.5 + .5 * Math.sin(time * 2.4)); }
    }
    renderer.render(scene, camera);
  }

  layout();
  addEventListener('resize', () => { layout(); frame(0); });
  addEventListener('load', () => { layout(); frame(0); });
  if (document.fonts) document.fonts.ready.then(() => { layout(); frame(0); });

  if (reduce) { addEventListener('scroll', () => frame(0), { passive: true }); frame(0); }
  else { const clock = new THREE.Clock(); const tick = () => { frame(Math.min(clock.getDelta(), .05)); requestAnimationFrame(tick); }; tick(); }
  canvas.classList.add('ready');
}

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
