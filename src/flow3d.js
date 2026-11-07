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
  const truck = new THREE.Group();
  truck.add(at(part(new THREE.BoxGeometry(1.15, 3.2, 1.2), WHITE, .22), 0, .55, .7));
  truck.add(at(part(new THREE.BoxGeometry(1.17, 3.0, .12), BLUE, .3), 0, .55, 1.0));          // trailer
  truck.add(at(part(new THREE.BoxGeometry(1.05, 1.0, 1.0), BLUE, .3), 0, -1.6, .6));           // cab
  truck.add(at(part(new THREE.BoxGeometry(.9, .12, .45), '#8fd3ff', .5), 0, -2.12, .75));            // windshield
  for (const y of [-1.6, -.2, .5, 1.7]) for (const x of [-.6, .6]) truck.add(at(part(new THREE.CylinderGeometry(.24, .24, .18, 10), TYRE, .4, .3), x, y, .2, 0, 0, Math.PI / 2));

  const plane = new THREE.Group();
  plane.add(part(new THREE.CylinderGeometry(.42, .34, 4.4, 14), WHITE, .25));                    // fuselage along y
  plane.add(at(part(new THREE.ConeGeometry(.42, .9, 14), WHITE, .3), 0, -2.65, 0, 0, 0, Math.PI)); // nose
  plane.add(at(part(new THREE.BoxGeometry(5.6, .95, .1), '#d6e0ec', .22), 0, .1, 0));               // wings
  plane.add(at(part(new THREE.BoxGeometry(2.0, .5, .08), '#d6e0ec', .22), 0, 1.9, 0));              // stabiliser
  plane.add(at(part(new THREE.BoxGeometry(.08, .6, .9), BLUE, .22), 0, 1.95, .45));            // fin
  for (const x of [-1.5, 1.5]) plane.add(at(part(new THREE.CylinderGeometry(.2, .2, .8, 10), STEEL, .3), x, -.35, -.25));

  const ship = new THREE.Group();
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-.9, 2.6); hullShape.lineTo(.9, 2.6); hullShape.lineTo(.9, -1.8); hullShape.quadraticCurveTo(.85, -2.9, 0, -3.3); hullShape.quadraticCurveTo(-.85, -2.9, -.9, -1.8); hullShape.closePath();
  ship.add(part(new THREE.ExtrudeGeometry(hullShape, { depth: .55, bevelEnabled: false }), '#12304d', .28));
  ship.add(at(part(new THREE.BoxGeometry(1.5, .7, 1.1), WHITE, .3), 0, 2.1, .9));               // bridge
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) for (let h = 0; h < (r % 2 ? 2 : 1); h++)
    ship.add(at(part(new THREE.BoxGeometry(.72, .62, .42), ['#0078d0', '#5cc8f7', '#e46d4c', '#e9eff7', '#1f4e8c'][(r * 3 + c * 2 + h) % 5], .32, .5), c ? .38 : -.38, -1.6 + r * .62, .78 + h * .44));
  const wakeMat = new THREE.LineBasicMaterial({ color: ICE, transparent: true, opacity: .35 });
  const wake = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-.8, 2.6, .05), new THREE.Vector3(-3.2, 9, .05), new THREE.Vector3(.8, 2.6, .05), new THREE.Vector3(3.2, 9, .05),
    new THREE.Vector3(-.4, 2.6, .05), new THREE.Vector3(-1.3, 7, .05), new THREE.Vector3(.4, 2.6, .05), new THREE.Vector3(1.3, 7, .05)]), wakeMat);
  ship.add(wake);

  const cargo = new THREE.Group(); cargo.add(truck, plane, ship); scene.add(cargo);

  // lanes: road → sky → sea ---------------------------------------------------
  const lane = new THREE.Group(); scene.add(lane);
  const road = new THREE.Group(); lane.add(road);
  const roadMat = new THREE.MeshBasicMaterial({ color: '#0b1226', transparent: true, opacity: .85, depthWrite: false });
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1), roadMat); road.add(roadPlane);
  const edgeMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: .5 });
  const dashMat = new THREE.LineDashedMaterial({ color: ICE, transparent: true, opacity: .55, dashSize: .9, gapSize: .9 });
  let roadEdges, roadDash;
  // oncoming traffic
  const traffic = [];
  for (let i = 0; i < 3; i++) { const t = truck.clone(); t.scale.setScalar(.7); t.rotation.z = Math.PI; road.add(t); traffic.push({ o: t, k: i / 3 }); }

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
    laneX = -halfW * (narrow ? .6 : .66); riverX = halfW * (narrow ? .55 : .64);
    const docH = document.documentElement.scrollHeight;
    const q = (sel, fb) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : fb; };
    J1 = worldY(q('#lines', docH * .35)); J2 = worldY(q('#rules', docH * .7)); END = worldY(docH + h);
    lane.position.x = laneX;
    roadPlane.scale.y = (12 - (J1 - 2)); roadPlane.position.y = (12 + J1 - 2) / 2;
    if (roadEdges) road.remove(roadEdges, roadDash);
    const top = 12, bot = J1 - 2;
    roadEdges = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.1, top, .01), new THREE.Vector3(-2.1, bot, .01), new THREE.Vector3(2.1, top, .01), new THREE.Vector3(2.1, bot, .01)]), edgeMat);
    roadDash = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, top, .02), new THREE.Vector3(0, bot, .02)]), dashMat); roadDash.computeLineDistances();
    road.add(roadEdges, roadDash);
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
    const vy = camY - visH * .16;
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
    dashMat.dashOffset = -time * 2.2;
    traffic.forEach((t) => { const span = 26; const y = camY + 12 - ((t.k * span + time * 3.5) % span); t.o.position.set(1.05, y, .3); t.o.visible = y > J1 + 1.5; });

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
