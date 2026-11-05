/* Essência — visualizador 3D com medidas (espaco-3d.html)
   Unidade: metro. Medidas do plano de negócios, da pesquisa de preços e da ABNT NBR 9050.
   O desenho da loja é uma proposta ilustrativa. */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const $ = (id) => document.getElementById(id);
const stage = $("stage"), canvas = $("v3d"), labelsBox = $("labels"), info = $("info");
const calmo = () => document.body.classList.contains("focus-mode") || matchMedia("(prefers-reduced-motion: reduce)").matches;

const COR = {
  verde: 0x1d7247, verdeEsc: 0x10372a, azul: 0x0b5fb0, vermelho: 0xc8402f, amarelo: 0xf2b632,
  roxo: 0x744a91, creme: 0xf4ecd9, parede: 0xfbf6ea, inox: 0xb9c2c0, kraft: 0xc99a63, madeira: 0xd7b98a
};
const hex = (n) => "#" + n.toString(16).padStart(6, "0");

// ---------- Renderizadores ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  $("loading").hidden = true;
  $("fallback").hidden = false;
}
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.inset = "0";
labelsBox.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
let controls;

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.autoRotateSpeed = 0.6;

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8c7a5b, 1.1));
  var sol = new THREE.DirectionalLight(0xffffff, 1.7);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.bias = -0.0004;
  sol.shadow.radius = 4;
  scene.add(sol, sol.target);
}

// ---------- Ajudantes de geometria ----------
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.02, ...extra });
function bloco(w, h, d, color, x, z, y = 0, r = null) {
  const raio = r ?? Math.min(w, h, d) * 0.12;
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, raio), mat(color));
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
// caixa a partir dos limites [x1,x2] e [z1,z2]
const caixaXZ = (x1, x2, z1, z2, h, color, y = 0, r) => bloco(x2 - x1, h, z2 - z1, color, (x1 + x2) / 2, (z1 + z2) / 2, y, r);

function rotulo(texto, classe, pos, grupo) {
  const el = document.createElement("div");
  el.className = "lbl " + classe;
  el.textContent = texto;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  grupo.add(o);
  return o;
}

const linhaMat = new THREE.LineBasicMaterial({ color: COR.verdeEsc });
function cota(a, b, texto, grupo, { tique = 0.08, azul = false } = {}) {
  const g = new THREE.Group();
  g.userData.dim = true;
  const pts = [a, b];
  const dir = new THREE.Vector3().subVectors(b, a).normalize();
  const perp = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const t = perp.multiplyScalar(tique / 2);
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), linhaMat));
  [a, b].forEach((p) => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().sub(t), p.clone().add(t)]), linhaMat)));
  rotulo(texto, "dim" + (azul ? " blue" : ""), a.clone().add(b).multiplyScalar(0.5), g);
  grupo.add(g);
  return g;
}
const nota = (texto, pos, grupo) => { const o = rotulo(texto, "note", pos, grupo); o.userData.dim = true; return o; };

function texturaPiso(c1, c2, n = 8) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const x = cv.getContext("2d"), s = 256 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? c1 : c2; x.fillRect(i * s, j * s, s, s); }
  x.strokeStyle = "rgba(0,0,0,0.06)"; x.lineWidth = 2;
  for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, 256); x.moveTo(0, i * s); x.lineTo(256, i * s); x.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function piso(x1, x2, z1, z2, tex, rep) {
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set((x2 - x1) / rep, (z2 - z1) / rep);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x2 - x1, z2 - z1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
  m.rotation.x = -Math.PI / 2; m.position.set((x1 + x2) / 2, 0.002, (z1 + z2) / 2); m.receiveShadow = true;
  return m;
}
function chao(tam) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), new THREE.ShadowMaterial({ opacity: 0.18 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
// parede de (x1,z1) a (x2,z2) com aberturas [inicio, fim] medidas ao longo da parede
function parede(grupo, x1, z1, x2, z2, aberturas = [], h = 1.0, e = 0.12) {
  const L = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / L, uz = (z2 - z1) / L;
  const cortes = [0, ...aberturas.flat(), L];
  for (let i = 0; i < cortes.length; i += 2) {
    const a = cortes[i], b = cortes[i + 1];
    if (b - a < 0.01) continue;
    const meio = (a + b) / 2;
    const m = bloco(Math.abs(ux) > 0.5 ? b - a + e : e, h, Math.abs(ux) > 0.5 ? e : b - a + e, COR.parede, x1 + ux * meio, z1 + uz * meio, 0, 0.02);
    grupo.add(m);
  }
}
function pessoa(grupo, x, z, cor = 0x5d7f9b) {
  const g = new THREE.Group(); g.userData.person = true;
  const m = mat(cor, { transparent: true, opacity: 0.85 });
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 1.05, 6, 16), m); corpo.position.y = 0.17 + 0.525 + 0.05;
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), m); cab.position.y = 1.58;
  [corpo, cab].forEach((o) => { o.castShadow = true; g.add(o); });
  g.position.set(x, 0, z);
  rotulo("pessoa de 1,70 m", "note", new THREE.Vector3(0, 1.85, 0), g).userData.dim = true;
  grupo.add(g);
  return g;
}
function cadeirante(grupo, x, z, rotY = 0) {
  const g = new THREE.Group(); g.userData.person = true;
  const m = mat(0x5d7f9b, { transparent: true, opacity: 0.9 }), aro = mat(0x2f3b40);
  const assento = bloco(0.45, 0.06, 0.45, 0x2f3b40, 0, 0, 0.48); g.add(assento);
  const enc = bloco(0.45, 0.45, 0.05, 0x2f3b40, 0, -0.2, 0.5); g.add(enc);
  [-0.28, 0.28].forEach((dx) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 10, 32), aro); r.rotation.y = Math.PI / 2; r.position.set(dx, 0.32, -0.02); r.castShadow = true; g.add(r); });
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 6, 16), m); corpo.position.set(0, 0.88, -0.08); corpo.castShadow = true; g.add(corpo);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), m); cab.position.set(0, 1.27, -0.06); g.add(cab);
  const pernas = bloco(0.36, 0.1, 0.4, 0x5d7f9b, 0, 0.25, 0.52); g.add(pernas);
  g.position.set(x, 0, z); g.rotation.y = rotY;
  grupo.add(g);
  return g;
}
function mesa(grupo, x, z, cadeiras = ["n", "s"]) {
  const g = new THREE.Group();
  g.add(bloco(0.8, 0.04, 0.8, COR.madeira, 0, 0, 0.71, 0.01));
  const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.71, 12), mat(0x3a3a3a)); perna.position.y = 0.355; perna.castShadow = true; g.add(perna);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), mat(0x3a3a3a)); base.position.y = 0.01; g.add(base);
  const pos = { n: [0, -0.6], s: [0, 0.6], l: [-0.6, 0], o: [0.6, 0] };
  cadeiras.forEach((c) => {
    const [dx, dz] = pos[c];
    const cad = new THREE.Group();
    cad.add(bloco(0.42, 0.05, 0.42, COR.verde, 0, 0, 0.44, 0.02));
    const enc = bloco(0.42, 0.42, 0.05, COR.verde, 0, 0.19, 0.46, 0.02); cad.add(enc);
    [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([a, b]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 8), mat(0x3a3a3a)); p.position.set(a, 0.22, b); cad.add(p); });
    cad.position.set(dx, 0, dz);
    cad.rotation.y = Math.atan2(dx, dz);
    g.add(cad);
  });
  g.position.set(x, 0, z);
  grupo.add(g);
  return g;
}

// ---------- Pizza ----------
function setor(r0, r1, a0, a1) {
  const s = new THREE.Shape();
  if (r0 === 0) { s.moveTo(0, 0); s.absarc(0, 0, r1, a0, a1, false); s.lineTo(0, 0); }
  else { s.absarc(0, 0, r1, a0, a1, false); s.absarc(0, 0, r0, a1, a0, true); }
  return s;
}
function extrudir(shape, depth, color, bevel = 0.0015) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 20 });
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat(color, { roughness: 0.8 }));
  m.castShadow = m.receiveShadow = true;
  return m;
}
function coracao(tam) {
  const s = new THREE.Shape(), k = tam;
  s.moveTo(0, -0.9 * k);
  s.bezierCurveTo(-1.2 * k, -0.1 * k, -0.8 * k, 0.9 * k, 0, 0.35 * k);
  s.bezierCurveTo(0.8 * k, 0.9 * k, 1.2 * k, -0.1 * k, 0, -0.9 * k);
  return s;
}
function fazerPizza() {
  const R = 0.175, N = 8, grupo = new THREE.Group(), fatias = [];
  const molho = 0xc8402f, queijo = 0xf6c25a, massa = 0xd9a05b, peperoni = 0xa8322a;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2 + 0.006, a1 = ((i + 1) / N) * Math.PI * 2 - 0.006, meio = (a0 + a1) / 2;
    const f = new THREE.Group();
    f.add(extrudir(setor(0, R, a0, a1), 0.008, massa));
    const borda = extrudir(setor(R - 0.02, R, a0, a1), 0.016, 0xc98b46, 0.004); f.add(borda);
    const mo = extrudir(setor(0, R - 0.02, a0, a1), 0.002, molho, 0.001); mo.position.y = 0.0095; f.add(mo);
    const qj = extrudir(setor(0, R - 0.026, a0 + 0.01, a1 - 0.01), 0.002, queijo, 0.002); qj.position.y = 0.0115; f.add(qj);
    [[0.06, 0], [0.115, -0.11], [0.125, 0.12]].forEach(([r, da], k) => {
      const ang = meio + da;
      let p;
      if (i === 0 && k === 0) {
        p = extrudir(coracao(0.018), 0.003, peperoni, 0.0008);
        p.rotation.y = -ang + Math.PI / 2 + Math.PI;
      } else {
        p = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.003, 20), mat(peperoni)); p.castShadow = true;
      }
      p.position.set(Math.cos(ang) * r, 0.0145, -Math.sin(ang) * r);
      f.add(p);
    });
    const folha = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), mat(0x2f7a3a)); folha.scale.set(1.4, 0.15, 0.7);
    folha.position.set(Math.cos(meio + 0.05) * 0.09, 0.0145, -Math.sin(meio + 0.05) * 0.09); f.add(folha);
    f.userData.dir = new THREE.Vector3(Math.cos(meio), 0, -Math.sin(meio));
    grupo.add(f); fatias.push(f);
  }
  grupo.userData.fatias = fatias;
  return grupo;
}

// ---------- Texturas da caixa ----------
function texturaTampa() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 512;
  const x = cv.getContext("2d");
  x.fillStyle = "#cd9e67"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 512; i += 6) { x.fillStyle = "rgba(0,0,0,0.03)"; x.fillRect(i, 0, 3, 512); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const escrever = () => {
    x.fillStyle = "#174b38"; x.textAlign = "center";
    x.font = "700 30px 'Atkinson Hyperlegible', Verdana, sans-serif";
    x.fillText("Feita com cuidado,", 256, 412); x.fillText("servida com propósito.", 256, 450);
    t.needsUpdate = true;
  };
  const img = new Image();
  img.onload = () => { const w = 360, h = w * (img.naturalHeight / img.naturalWidth || 0.45); x.drawImage(img, 256 - w / 2, 190 - h / 2, w, h); escrever(); };
  img.onerror = () => { x.fillStyle = "#174b38"; x.font = "700 64px Verdana"; x.textAlign = "center"; x.fillText("Essência", 256, 220); escrever(); };
  img.src = "assets/logo-essencia.svg";
  return t;
}
function texturaEtiqueta() {
  const cv = document.createElement("canvas"); cv.width = 360; cv.height = 240;
  const x = cv.getContext("2d");
  x.fillStyle = "#c8402f"; x.beginPath(); x.roundRect(0, 0, 360, 240, 26); x.fill();
  x.fillStyle = "#ffffff"; x.textAlign = "center";
  x.font = "700 46px Verdana, sans-serif"; x.fillText("CALABRESA", 180, 62);
  // "pizza" em Braille (pontos 1-6)
  const letras = [[1, 2, 3, 4], [2, 4], [1, 3, 5, 6], [1, 3, 5, 6], [1]];
  letras.forEach((pts, i) => {
    const cx = 72 + i * 54;
    pts.forEach((p) => { const col = p > 3 ? 1 : 0, lin = (p - 1) % 3; x.beginPath(); x.arc(cx + col * 18, 100 + lin * 22, 7, 0, Math.PI * 2); x.fill(); });
  });
  x.font = "26px Verdana, sans-serif"; x.fillText("contém: glúten", 180, 210);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- Cenas ----------
const FONTE = { plano: "Plano de negócios", nbr: "ABNT NBR 9050", preco: "Pesquisa de preços (26/10/2026)", prop: "Proposta do layout", calc: "Cálculo", menu: "Cardápio do site" };

function cenaCozinha(fase2 = false) {
  const g = new THREE.Group(), itens = [];
  g.add(chao(30));
  const ladrilho = texturaPiso("#f3eee2", "#e6dcc6", 8);
  g.add(piso(-2, 2, -1.75, 1.75, ladrilho, 1.2));
  // paredes da cozinha (cortadas a 1 m)
  parede(g, -2, -1.75, 2, -1.75);
  parede(g, -2, 1.75, 2, 1.75);
  parede(g, -2, -1.75, -2, 1.75, [[2.5, 3.4]]);              // porta de serviço no lado esquerdo
  parede(g, 2, -1.75, 2, 1.75, [[2.5, 3.4]]);                // saída das entregas / balcão

  const item = (n, nome, medida, desc, fonte, cor, obj, extra = {}) => {
    obj.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.userData.item = n; } });
    g.add(obj);
    const caixa = new THREE.Box3().setFromObject(obj);
    const topo = new THREE.Vector3((caixa.min.x + caixa.max.x) / 2, caixa.max.y + 0.18, (caixa.min.z + caixa.max.z) / 2);
    rotulo(String(n), "num", topo, g).userData.num = n;
    itens.push({ n, nome, medida, desc, fonte, cor, obj, centro: caixa.getCenter(new THREE.Vector3()), ...extra });
  };
  const um = (o) => { const gg = new THREE.Group(); gg.add(o); return gg; };

  item(1, "Recebimento e higienização", "pia de 0,80 × 0,60 m", "Os insumos entram pela porta de serviço e são lavados aqui antes de ir para o estoque.", FONTE.prop, COR.azul,
    (() => { const o = um(caixaXZ(-2, -1.4, -0.25, 0.55, 0.9, COR.inox)); const cuba = caixaXZ(-1.88, -1.52, -0.05, 0.35, 0.02, 0x7d8a88, 0.9, 0.01); o.add(cuba); return o; })());
  item(2, "Freezer e estoque seco", "freezer ≈ 1,00 × 0,60 m (299 L)", "Freezer horizontal de 299 L, o modelo pesquisado (R$ 1.799,00 a R$ 1.979,91), e prateleira de secos. Estoque pelo método PEPS: o que entra primeiro sai primeiro.", FONTE.preco, COR.azul,
    (() => { const o = um(caixaXZ(-2, -1.4, -1.75, -0.75, 0.85, 0xeef3f6)); o.add(caixaXZ(-1.98, -1.42, -1.73, -0.77, 0.02, COR.azul, 0.85, 0.01)); return o; })());
  item(3, "Preparo da massa", "bancada de 1,20 × 0,70 m", "A massa é feita à tarde. A amassadeira ainda é decisão do grupo: a pesquisada custa de R$ 4.373,63 a R$ 7.107,52.", FONTE.prop, COR.verde,
    (() => { const o = um(caixaXZ(-1.3, -0.1, -1.75, -1.05, 0.9, COR.inox)); o.add(bloco(0.32, 0.38, 0.3, 0xdfe5e4, -0.95, -1.45, 0.9)); return o; })());
  item(6, "Bancada de montagem", "bancada de 1,10 × 0,70 m", "Montagem com utensílios separados por cor. Cada pedido segue um checklist de restrições.", FONTE.prop, COR.verde,
    um(caixaXZ(0, 1.1, -1.75, -1.05, 0.9, COR.inox)));
  item(4, "Forno a gás e exaustão", "forno 45 × 60 cm · 4 pizzas por fornada", "Forno a gás refratário para 4 pizzas (modelo MR Fogões pesquisado, R$ 1.338,52 a R$ 1.408,97). De 8 a 10 minutos por fornada: cerca de 15 pizzas por hora na prática.", FONTE.preco, COR.vermelho,
    (() => { const o = new THREE.Group(); o.add(caixaXZ(1.22, 1.88, -1.75, -1.2, 0.8, 0x3b4446, 0, 0.02)); o.add(caixaXZ(1.25, 1.85, -1.72, -1.27, 0.42, COR.vermelho, 0.8)); o.add(caixaXZ(1.33, 1.77, -1.28, -1.25, 0.18, 0x222222, 0.9, 0.005)); return o; })());
  item(5, "Bancada sem alérgenos", "bancada de 1,00 × 0,60 m", "Só para pedidos com restrição alimentar, com utensílios de outra cor e conferência por uma segunda pessoa.", FONTE.prop, COR.amarelo,
    um(caixaXZ(1.4, 2, -0.95, 0.05, 0.9, COR.amarelo)));
  item(7, "Expedição e embalagem", "bancada de 1,20 × 0,60 m", "A pizza vai para a caixa com a etiqueta em Braille e o lacre. Aqui fica a pilha de caixas.", FONTE.prop, COR.verdeEsc,
    (() => { const o = um(caixaXZ(0, 1.2, 1.15, 1.75, 0.9, COR.verdeEsc)); for (let k = 0; k < 4; k++) o.add(bloco(0.37, 0.045, 0.37, COR.kraft, 0.35, 1.45, 0.9 + k * 0.047, 0.005)); return o; })());

  // porta de serviço e pia de mãos (sem número no plano)
  g.add(caixaXZ(-1.9, -1.45, 1.35, 1.75, 0.85, COR.inox));
  g.add(caixaXZ(-1.3, -0.5, 1.35, 1.75, 1.6, 0xc8b48c, 0, 0.02));
  if (!fase2) {
    rotulo("pia das mãos", "note", new THREE.Vector3(-1.67, 1.05, 1.55), g).userData.dim = true;
    rotulo("secos", "note", new THREE.Vector3(-0.9, 1.75, 1.55), g).userData.dim = true;
    rotulo("entrada de serviço · 0,90 m", "note", new THREE.Vector3(-2.9, 0.1, 1.2), g).userData.dim = true;
  }

  // medidas gerais
  cota(new THREE.Vector3(-2, 0.02, 2.15), new THREE.Vector3(2, 0.02, 2.15), "4,00 m", g);
  cota(new THREE.Vector3(-2.4, 0.02, -1.75), new THREE.Vector3(-2.4, 0.02, 1.75), "3,50 m", g);
  if (!fase2) cota(new THREE.Vector3(-0.75, 0.03, -1.05), new THREE.Vector3(-0.75, 0.03, 1.35), "2,20 m livres", g, { azul: true });
  nota("cozinha · 14 m²", new THREE.Vector3(fase2 ? 0 : 1.0, 0.05, fase2 ? 0.2 : 0.45), g);

  if (!fase2) {
    // saída das entregas
    const saida = caixaXZ(2, 2.7, 0.75, 1.65, 0.01, COR.verdeEsc, 0.001, 0.005);
    item(8, "Saída das entregas", "porta de 0,90 m", "Na Fase 1 a pizza sai por aqui para o delivery. O cliente recebe aviso por mensagem, sem campainha. Na Fase 2 este vão vira o balcão de retirada.", FONTE.nbr + " (vão livre mínimo 0,80 m)", COR.verdeEsc, um(saida));
    cota(new THREE.Vector3(2.85, 0.02, 0.75), new THREE.Vector3(2.85, 0.02, 1.65), "0,90 m", g);

    // fluxo em sentido único
    const caminho = new THREE.CatmullRomCurve3([
      [-2.7, 1.2], [-1.15, 0.2], [-1.1, -1.0], [-0.6, -0.8], [0.6, -0.8], [1.5, -0.9], [0.9, 0.2], [0.6, 0.85], [1.7, 1.2], [2.8, 1.2]
    ].map(([x, z]) => new THREE.Vector3(x, 0.03, z)), false, "catmullrom", 0.3);
    const fluxo = new THREE.Group(); fluxo.userData.flow = true;
    const tubo = new THREE.Mesh(new THREE.TubeGeometry(caminho, 160, 0.018, 8), new THREE.MeshStandardMaterial({ color: COR.amarelo, emissive: 0x3a2a00, transparent: true, opacity: 0.9 }));
    fluxo.add(tubo);
    for (let k = 1; k < 6; k++) {
      const t = k / 6, p = caminho.getPointAt(t), tg = caminho.getTangentAt(t);
      const seta = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 16), mat(COR.amarelo, { emissive: 0x3a2a00 }));
      seta.position.copy(p); seta.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg); fluxo.add(seta);
    }
    const bolinhas = [];
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(COR.vermelho, { emissive: 0x330000 })); fluxo.add(b); bolinhas.push(b); }
    fluxo.userData.anim = (t) => bolinhas.forEach((b, k) => b.position.copy(caminho.getPointAt(((t * 0.06) + k / 5) % 1)).setY(0.06));
    if (calmo()) fluxo.userData.anim(0), (fluxo.userData.anim = null);
    g.add(fluxo);
    pessoa(g, -1.05, 0.95);
  }

  if (fase2) {
    // salão de 6,00 × 4,00 m ao lado da cozinha
    const X1 = 2, X2 = 8, Z1 = -1.75, Z2 = 2.25;
    g.add(piso(X1, X2, Z1, Z2, texturaPiso("#ead6ad", "#e2cb9c", 6), 1.5));
    parede(g, X1, Z1, X2, Z1);
    parede(g, X2, Z1, X2, Z2);
    parede(g, X1, Z2, X2, Z2, [[2.2, 3.1]]);                 // porta de entrada 0,90 m
    parede(g, X1, 1.75, X1, Z2);
    item(8, "Balcão de retirada", "1,20 m, com parte rebaixada de 0,75–0,85 m", "O vão da saída das entregas vira balcão. Uma parte fica mais baixa para quem usa cadeira de rodas, com pelo menos 0,90 m de largura.", FONTE.nbr, COR.verdeEsc,
      (() => { const o = new THREE.Group(); o.add(caixaXZ(2.06, 2.56, 0.55, 1.05, 1.05, COR.verdeEsc)); o.add(caixaXZ(2.06, 2.56, 1.05, 1.95, 0.8, COR.verde)); return o; })());
    

    item(9, "Mesa livre para cadeira de rodas", "mesa de 0,80 × 0,80 m · altura 0,75 m", "Um lado da mesa fica sem cadeira. Embaixo, altura livre de pelo menos 0,73 m para as pernas. Na frente, espaço do módulo de referência (0,80 × 1,20 m) e giro de 1,50 m.", FONTE.nbr, COR.verde,
      (() => { const o = new THREE.Group(); mesa(o, 3.1, -0.95, ["l", "o"]); return o; })());
    cadeirante(g, 3.1, -0.15, Math.PI);
    const modulo = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), new THREE.MeshBasicMaterial({ color: COR.azul, transparent: true, opacity: 0.18 }));
    modulo.rotation.x = -Math.PI / 2; modulo.position.set(3.1, 0.006, -0.0); modulo.userData.dim = true; g.add(modulo);
    nota("módulo 0,80 × 1,20 m", new THREE.Vector3(3.1, 0.1, 0.8), g);
    const giro = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.75, 64), new THREE.MeshBasicMaterial({ color: COR.azul }));
    giro.rotation.x = -Math.PI / 2; giro.position.set(4.6, 0.008, 1.35); giro.userData.dim = true; g.add(giro);
    cota(new THREE.Vector3(3.85, 0.02, 1.35), new THREE.Vector3(5.35, 0.02, 1.35), "giro Ø 1,50 m", g, { azul: true });

    const mesas = new THREE.Group();
    mesa(mesas, 4.75, -1.0, ["l", "o"]); mesa(mesas, 4.35, 0.2, ["l", "o"]); mesa(mesas, 6.0, 0.4, ["n", "s"]);
    g.add(mesas);
    nota("mesas: altura 0,75 m", new THREE.Vector3(4.75, 1.0, -1.0), g);

    item(10, "Banheiro acessível", "1,50 × 1,70 m", "Medida mínima da norma, com barras de apoio e porta de 0,80 m que abre para fora.", FONTE.nbr, COR.azul,
      (() => { const o = new THREE.Group(); parede(o, 6.5, -1.75, 6.5, -0.05, [[0.85, 1.65]], 1.0, 0.08); parede(o, 6.5, -0.05, 8, -0.05, [], 1.0, 0.08); o.add(caixaXZ(7.45, 7.9, -1.7, -1.25, 0.45, 0xffffff)); o.add(caixaXZ(6.6, 7.1, -1.7, -1.35, 0.8, 0xffffff)); o.add(caixaXZ(6.54, 7.96, -1.74, -0.09, 0.01, COR.azul, 0.002, 0.004)); return o; })());
    cota(new THREE.Vector3(6.5, 1.15, -1.75), new THREE.Vector3(8, 1.15, -1.75), "1,50 m", g);
    cota(new THREE.Vector3(8.15, 1.15, -1.75), new THREE.Vector3(8.15, 1.15, -0.05), "1,70 m", g);

    item(11, "Cantinho de descompressão sensorial", "1,40 × 1,40 m", "Canto com luz baixa, almofadas e pouco barulho, para quem precisa de uma pausa durante a refeição.", FONTE.prop, COR.roxo,
      (() => { const o = new THREE.Group(); o.add(caixaXZ(6.6, 8, 0.85, 2.25, 0.02, COR.roxo, 0.002, 0.005)); o.add(bloco(0.9, 0.35, 0.5, 0x9a78b5, 7.4, 1.9, 0)); o.add(bloco(0.45, 0.3, 0.45, 0xb79ad0, 6.95, 1.2, 0, 0.12)); parede(o, 6.6, 0.85, 6.6, 1.5, [], 1.0, 0.06); return o; })());

    item(12, "Rampa e piso tátil", "rampa com inclinação até 8,33%", "Entrada pela rampa, com piso tátil de alerta no começo e no fim. Porta de entrada com 0,90 m livres.", FONTE.nbr, COR.amarelo,
      (() => { const o = new THREE.Group();
        const rampa = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.4), mat(0xbfb6a3)); rampa.position.set(4.65, 0.06, 3.0); rampa.rotation.x = -0.083; rampa.castShadow = rampa.receiveShadow = true; o.add(rampa);
        o.add(caixaXZ(4.05, 5.25, 2.27, 2.5, 0.012, COR.amarelo, 0.11, 0.004)); o.add(caixaXZ(4.05, 5.25, 3.6, 3.85, 0.012, COR.amarelo, 0.0, 0.004)); return o; })());
    cota(new THREE.Vector3(2, 0.02, 4.2), new THREE.Vector3(8, 0.02, 4.2), "salão 6,00 m", g);
    cota(new THREE.Vector3(8.5, 0.02, -1.75), new THREE.Vector3(8.5, 0.02, 2.25), "4,00 m", g);
    nota("salão · 24 m²", new THREE.Vector3(5.6, 0.05, -0.45), g);
  }
  return { g, itens };
}

function cenaCaixa() {
  const g = new THREE.Group(), itens = [];
  g.add(chao(4));
  const L = 0.36, H = 0.045, e = 0.003, kraft = COR.kraft;
  const base = new THREE.Group();
  base.add(bloco(L + 2 * e, e, L + 2 * e, kraft, 0, 0, 0, 0.001));
  base.add(bloco(L + 2 * e, H, e, kraft, 0, -L / 2 - e / 2, e, 0.001));
  base.add(bloco(L + 2 * e, H, e, kraft, 0, L / 2 + e / 2, e, 0.001));
  base.add(bloco(e, H, L, kraft, -L / 2 - e / 2, 0, e, 0.001));
  base.add(bloco(e, H, L, kraft, L / 2 + e / 2, 0, e, 0.001));
  base.traverse((o) => { if (o.isMesh) o.userData.item = 1; });
  g.add(base);
  const pizza = fazerPizza(); pizza.position.y = e + 0.001; pizza.traverse((o) => { if (o.isMesh) o.userData.item = 2; }); g.add(pizza);

  const pivo = new THREE.Group(); pivo.position.set(0, H + e, -L / 2 - e);
  const topo = new THREE.Mesh(new THREE.BoxGeometry(L + 4 * e, e, L + 4 * e), [mat(kraft), mat(kraft), new THREE.MeshStandardMaterial({ map: texturaTampa(), roughness: 0.85 }), mat(kraft), mat(kraft), mat(kraft)]);
  topo.position.set(0, e / 2, L / 2 + e); topo.castShadow = true; pivo.add(topo);
  const aba = bloco(L + 4 * e, 0.03, e, kraft, 0, L + 3 * e, -0.03 + e, 0.001); pivo.add(aba);
  const etq = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.06), new THREE.MeshStandardMaterial({ map: texturaEtiqueta(), roughness: 0.6 }));
  etq.rotation.x = -Math.PI / 2; etq.position.set(L / 2 - 0.06, e + 0.0008, L - 0.03); etq.userData.item = 3; pivo.add(etq);
  const lacre = bloco(0.05, 0.02, 0.002, COR.amarelo, 0, L + 4 * e, -0.025 + e, 0.0005); lacre.userData.item = 4; pivo.add(lacre);
  pivo.traverse((o) => { if (o.isMesh && !o.userData.item) o.userData.item = 1; });
  g.add(pivo);
  g.userData.pivo = pivo;

  itens.push({ n: 1, nome: "Caixa de pizza", medida: "36 × 36 cm por dentro · 4,5 cm de altura", desc: "Papelão kraft micro-ondulado (onda E, cerca de 1,5 mm), uma peça só, com corte e vinco, sem cola. Logo e slogan em uma cor, tinta à base de água.", fonte: FONTE.plano + " (ficha técnica da embalagem)", cor: COR.kraft, obj: base, centro: new THREE.Vector3(0, 0.03, 0) });
  itens.push({ n: 2, nome: "Pizza grande", medida: "35 cm · 8 fatias", desc: "Sobra 0,5 cm de folga de cada lado dentro da caixa, para a pizza não encostar na parede.", fonte: FONTE.plano, cor: 0xf6c25a, obj: pizza, centro: new THREE.Vector3(0, 0.02, 0) });
  itens.push({ n: 3, nome: "Etiqueta acessível", medida: "9 cm", desc: "Colorida, com o nome do sabor em letra grande, Braille em relevo, pictograma e alérgenos.", fonte: FONTE.plano, cor: COR.vermelho, obj: etq, centro: new THREE.Vector3(L / 2 - 0.06, H + 0.01, L / 2 - 0.03) });
  itens.push({ n: 4, nome: "Lacre", medida: "adesivo de papel", desc: "Fica na frente da caixa e mostra se ela foi aberta antes de chegar ao cliente.", fonte: FONTE.plano, cor: COR.amarelo, obj: lacre, centro: new THREE.Vector3(0, 0.03, L / 2) });

  cota(new THREE.Vector3(-L / 2, 0.002, L / 2 + 0.05), new THREE.Vector3(L / 2, 0.002, L / 2 + 0.05), "36 cm", g, { tique: 0.015 });
  cota(new THREE.Vector3(L / 2 + 0.05, 0.002, -L / 2), new THREE.Vector3(L / 2 + 0.05, 0.002, L / 2), "36 cm", g, { tique: 0.015 });
  cota(new THREE.Vector3(-L / 2 - 0.04, 0, L / 2), new THREE.Vector3(-L / 2 - 0.04, H, L / 2), "4,5 cm", g, { tique: 0.015 });
  const dp = cota(new THREE.Vector3(-0.175, 0.03, -0.02), new THREE.Vector3(0.175, 0.03, -0.02), "pizza Ø 35 cm", g, { tique: 0.015, azul: true });
  dp.userData.soAberta = true;
  return { g, itens };
}

function cenaPizza() {
  const g = new THREE.Group(), itens = [];
  g.add(chao(3));
  const tabua = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 64), mat(COR.madeira)); tabua.position.y = 0.0075; tabua.receiveShadow = tabua.castShadow = true; g.add(tabua);
  const pizza = fazerPizza(); pizza.position.y = 0.016; g.add(pizza);
  pizza.traverse((o) => { if (o.isMesh) o.userData.item = 1; });
  pizza.userData.fatias[0].traverse((o) => { if (o.isMesh) o.userData.item = 2; });
  g.userData.pizza = pizza;
  itens.push({ n: 1, nome: "Pizza grande", medida: "Ø 35 cm · cerca de 962 cm²", desc: "Tamanho único da Fase 1. Muçarela: 180 g em vários sabores do cardápio; cada sabor mostra ingredientes, quantidades e alérgenos.", fonte: FONTE.plano + " e " + FONTE.menu, cor: 0xf6c25a, obj: pizza, centro: new THREE.Vector3(0, 0.02, 0) });
  itens.push({ n: 2, nome: "Uma fatia", medida: "1 de 8 · 45° · borda ≈ 13,7 cm", desc: "A borda de cada fatia mede π × 35 ÷ 8 ≈ 13,7 cm. O pepperoni em forma de coração é o mesmo do logo.", fonte: FONTE.calc, cor: COR.vermelho, obj: pizza.userData.fatias[0], centro: new THREE.Vector3(0.09, 0.03, -0.04) });
  cota(new THREE.Vector3(-0.175, 0.05, 0.23), new THREE.Vector3(0.175, 0.05, 0.23), "Ø 35 cm", g, { tique: 0.015 });
  nota("8 fatias de 45°", new THREE.Vector3(-0.08, 0.06, -0.12), g);
  return { g, itens };
}

// ---------- Dados de cada vista ----------
const VISTAS = {
  cozinha: {
    titulo: "Peças da cozinha", rotuloCanvas: "Maquete 3D da cozinha da Fase 1, de 4,00 por 3,50 metros, com 8 áreas numeradas em sentido único, do recebimento até a saída das entregas.",
    casa: { pos: [3.4, 6.2, 5.2], alvo: [0, 0.2, 0.15] }, dist: [2.5, 14], sombra: 5, ferramentas: ["btnFlow", "btnPerson"],
    medidas: [["Cozinha", "4,00 × 3,50 m = 14 m²", "Plano (cerca de 14 m²) · lados: proposta"], ["Circulação livre", "2,20 m entre as bancadas", "Proposta · NBR 9050 pede ≥ 0,90 m"], ["Portas", "0,90 m livres", "NBR 9050 (mínimo 0,80 m)"], ["Forno a gás", "45 × 60 cm · 4 pizzas", "Pesquisa de preços"], ["Freezer horizontal", "299 L (≈ 1,00 × 0,60 m)", "Pesquisa de preços"], ["Bancadas", "0,60 a 0,70 m de fundo · 0,90 m de altura", "Proposta"]],
    notaTabela: "O plano define a cozinha de cerca de 14 m². A posição das peças e os lados de 4,00 × 3,50 m são uma proposta ilustrativa do grupo. As paredes aparecem cortadas a 1 m para dar para ver dentro."
  },
  loja: {
    titulo: "Peças da loja (Fase 2)", rotuloCanvas: "Maquete 3D da Fase 2: a cozinha de 14 metros quadrados ao lado de um salão de 6 por 4 metros, com balcão de retirada rebaixado, 4 mesas, uma delas livre para cadeira de rodas, banheiro acessível de 1,50 por 1,70 metro, cantinho de descompressão e rampa com piso tátil.",
    casa: { pos: [7.5, 10.5, 10.5], alvo: [3, 0.2, 0.5] }, dist: [4, 24], sombra: 8, ferramentas: ["btnPerson"],
    medidas: [["Salão", "6,00 × 4,00 m = 24 m²", "Proposta"], ["Mesas", "4 mesas · 0,80 × 0,80 m · altura 0,75 m", "Plano (4 a 6 mesas) · NBR 9050 (0,75 a 0,85 m)"], ["Altura livre sob a mesa", "≥ 0,73 m", "NBR 9050"], ["Módulo de referência", "0,80 × 1,20 m", "NBR 9050"], ["Giro da cadeira de rodas", "Ø 1,50 m", "NBR 9050"], ["Balcão de retirada", "parte rebaixada 0,75–0,85 m · ≥ 0,90 m de largura", "NBR 9050"], ["Banheiro acessível", "1,50 × 1,70 m", "NBR 9050 (mínimo)"], ["Rampa", "inclinação até 8,33%", "NBR 9050"], ["Cantinho de descompressão", "1,40 × 1,40 m", "Proposta"]],
    notaTabela: "A Fase 2 começa depois de 12 meses, paga com o lucro da Fase 1. Medidas da norma: ABNT NBR 9050:2020. O tamanho do salão e a posição dos móveis são uma proposta ilustrativa."
  },
  caixa: {
    titulo: "Partes da caixa", rotuloCanvas: "Caixa de pizza em 3D: 36 por 36 centímetros por dentro e 4,5 centímetros de altura, de papelão kraft, com o logo na tampa, a etiqueta acessível de 9 centímetros e o lacre na frente. Dentro, a pizza de 35 centímetros.",
    casa: { pos: [0.5, 0.42, 0.6], alvo: [0, 0.03, 0] }, dist: [0.3, 2], sombra: 0.6, ferramentas: ["btnLid"],
    medidas: [["Medida interna", "36 × 36 cm", "Plano (ficha técnica da embalagem)"], ["Altura", "4,5 cm", "Plano"], ["Pizza", "35 cm · 8 fatias", "Plano"], ["Folga", "0,5 cm de cada lado", "Cálculo (36 − 35) ÷ 2"], ["Material", "kraft micro-ondulado, onda E ≈ 1,5 mm", "Plano"], ["Etiqueta", "9 cm, com Braille e alérgenos", "Plano"], ["Impressão", "1 cor (verde), tinta à base de água", "Plano"]],
    notaTabela: "Proposta da embalagem. Medidas, material e preço ainda precisam ser confirmados com fornecedores."
  },
  pizza: {
    titulo: "A pizza", rotuloCanvas: "Pizza em 3D de 35 centímetros, cortada em 8 fatias de 45 graus, com um pepperoni em forma de coração. Uma fatia pode ser servida.",
    casa: { pos: [0.34, 0.36, 0.44], alvo: [0, 0.02, 0] }, dist: [0.22, 1.6], sombra: 0.5, ferramentas: ["btnSlice"],
    medidas: [["Diâmetro", "35 cm", "Plano"], ["Área", "≈ 962 cm²", "Cálculo π × 17,5²"], ["Fatias", "8, de 45° cada", "Plano"], ["Borda de cada fatia", "≈ 13,7 cm", "Cálculo π × 35 ÷ 8"], ["Preço médio", "R$ 73,64 (21 sabores)", "Cardápio do site"]],
    notaTabela: "A espessura é ilustrativa. Ingredientes e gramas de cada sabor estão na ficha técnica do plano de negócios."
  }
};

// ---------- Estado e interface ----------
let atual = null, montado = null, girar = !calmo(), vistaDeCima = false, tampaAberta = false, fatiaServida = false;
const botoes = { top: $("btnTop"), med: $("btnMeasures"), flow: $("btnFlow"), pes: $("btnPerson"), lid: $("btnLid"), slice: $("btnSlice"), spin: $("btnSpin"), reset: $("btnReset") };
botoes.spin.setAttribute("aria-pressed", String(girar));
let tweens = [];
const tween = (dur, passo, fim) => { if (calmo() || dur === 0) { passo(1); fim && fim(); return; } tweens.push({ t0: performance.now(), dur, passo, fim }); };
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function moverCamera(pos, alvo, dur = 900) {
  const p0 = camera.position.clone(), a0 = controls.target.clone();
  tween(dur, (k) => { const e = suave(k); camera.position.lerpVectors(p0, pos, e); controls.target.lerpVectors(a0, alvo, e); });
}
function casa(dur = 900) {
  const v = VISTAS[atual];
  vistaDeCima = false; botoes.top.setAttribute("aria-pressed", "false"); botoes.top.lastChild.textContent = " Ver de cima";
  moverCamera(new THREE.Vector3(...v.casa.pos), new THREE.Vector3(...v.casa.alvo), dur);
}

function limparCena() {
  if (!montado) return;
  scene.remove(montado.g);
  montado.g.traverse((o) => {
    if (o.isCSS2DObject && o.element) o.element.remove();
    if (o.geometry) o.geometry.dispose();
    if (o.material) [].concat(o.material).forEach((m) => { m.map && m.map.dispose(); m.dispose(); });
  });
  montado = null;
}

function montar(nome, primeira = false) {
  if (!renderer) return;
  limparCena();
  atual = nome;
  const v = VISTAS[nome];
  montado = nome === "cozinha" ? cenaCozinha(false) : nome === "loja" ? cenaCozinha(true) : nome === "caixa" ? cenaCaixa() : cenaPizza();
  scene.add(montado.g);
  tampaAberta = false; fatiaServida = false;
  if (nome === "caixa") { montado.g.userData.pivo.rotation.x = -1.15; tampaAberta = true; }

  // luz e sombra na escala da cena
  const s = v.sombra;
  sol.position.set(s * 0.9 + v.casa.alvo[0], s * 1.6, s * 0.7 + v.casa.alvo[2]);
  sol.target.position.set(...v.casa.alvo);
  Object.assign(sol.shadow.camera, { left: -s * 1.4, right: s * 1.4, top: s * 1.4, bottom: -s * 1.4, near: 0.01, far: s * 6 });
  sol.shadow.camera.updateProjectionMatrix();
  controls.minDistance = v.dist[0]; controls.maxDistance = v.dist[1];

  // interface
  document.querySelectorAll(".v3d-tabs [role=tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === nome)));
  $("v3d-panel").setAttribute("aria-labelledby", "tab-" + nome);
  canvas.setAttribute("aria-label", v.rotuloCanvas);
  ["btnFlow", "btnPerson", "btnLid", "btnSlice"].forEach((id) => { $(id).hidden = !v.ferramentas.includes(id); });
  botoes.flow.setAttribute("aria-pressed", "true"); botoes.pes.setAttribute("aria-pressed", "true");
  botoes.lid.setAttribute("aria-pressed", String(tampaAberta)); botoes.lid.lastChild.textContent = tampaAberta ? " Fechar a tampa" : " Abrir a tampa";
  botoes.slice.setAttribute("aria-pressed", "false"); botoes.slice.lastChild.textContent = " Servir uma fatia";
  aplicarMedidas();
  $("legendTitle").textContent = v.titulo;
  $("legendList").innerHTML = montado.itens.map((it) => `<li><button type="button" data-n="${it.n}" aria-pressed="false"><b>${it.n}</b><i style="background:${hex(it.cor)}"></i><span>${it.nome}</span></button></li>`).join("");
  $("legendList").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => selecionar(Number(b.dataset.n), true)));
  $("measureBody").innerHTML = v.medidas.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join("");
  $("tableNote").textContent = v.notaTabela;
  info.hidden = true;
  if (primeira) { camera.position.set(...v.casa.pos).multiplyScalar(1.35); controls.target.set(...v.casa.alvo); }
  casa(primeira ? 1400 : 700);
  history.replaceState(null, "", "#" + nome);
}

function aplicarMedidas() {
  const on = botoes.med.getAttribute("aria-pressed") === "true";
  labelsBox.classList.toggle("no-dims", !on);
  montado.g.traverse((o) => { if (o.userData.dim && !o.isCSS2DObject) o.visible = on; });
  montado.g.traverse((o) => { if (o.userData.soAberta) o.traverse((c) => { c.visible = on && tampaAberta; }); });
}

let selecionado = null;
function selecionar(n, mover = false) {
  const it = montado.itens.find((i) => i.n === n);
  if (!it) {
    montado.g.traverse((o) => { if (o.isMesh && o.userData.item !== undefined && o.material.emissive) o.material.emissive.setHex(0x000000); });
    labelsBox.querySelectorAll(".lbl.num").forEach((el) => el.classList.remove("hl"));
    $("legendList").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
    selecionado = null;
    return;
  }
  montado.g.traverse((o) => { if (o.isMesh && o.userData.item !== undefined && o.material.emissive) o.material.emissive.setHex(o.userData.item === n ? 0x3d2a00 : 0x000000); });
  labelsBox.querySelectorAll(".lbl.num").forEach((el) => el.classList.toggle("hl", el.textContent === String(n)));
  $("legendList").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.n) === n)));
  info.style.borderLeftColor = hex(it.cor);
  info.innerHTML = `<strong>${it.n}. ${it.nome}</strong><span class="size">${it.medida}</span><p>${it.desc}</p><p><small>Fonte: ${it.fonte}</small></p>`;
  info.hidden = false;
  selecionado = n;
  if (mover) {
    const c = it.centro, v = VISTAS[atual], esc = v.sombra / 5;
    const dir = camera.position.clone().sub(controls.target).normalize();
    moverCamera(c.clone().add(dir.multiplyScalar(Math.max(v.dist[0] * 1.2, 2.6 * esc))), c, 800);
    girar = false; botoes.spin.setAttribute("aria-pressed", "false");
  }
}

// toque / clique numa peça
const ray = new THREE.Raycaster(), ponteiro = new THREE.Vector2();
let down = null;
canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; $("hint").classList.add("gone"); });
canvas.addEventListener("pointerup", (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const r = canvas.getBoundingClientRect();
  ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ponteiro, camera);
  const hit = ray.intersectObject(montado.g, true).find((h) => h.object.userData.item !== undefined && h.object.visible);
  if (hit) selecionar(hit.object.userData.item);
  else { info.hidden = true; selecionar(-1); }
});

// botões
document.querySelectorAll(".v3d-tabs [role=tab]").forEach((b, i, todos) => {
  b.addEventListener("click", () => montar(b.dataset.view));
  b.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const prox = todos[(i + (e.key === "ArrowRight" ? 1 : todos.length - 1)) % todos.length];
    prox.focus(); prox.click();
  });
});
botoes.top.addEventListener("click", () => {
  vistaDeCima = !vistaDeCima;
  botoes.top.setAttribute("aria-pressed", String(vistaDeCima));
  botoes.top.lastChild.textContent = vistaDeCima ? " Ver em 3D" : " Ver de cima";
  if (vistaDeCima) {
    const v = VISTAS[atual], a = new THREE.Vector3(...v.casa.alvo), d = new THREE.Vector3(...v.casa.pos).distanceTo(a);
    moverCamera(a.clone().add(new THREE.Vector3(0, d, 0.001)), a);
    girar = false; botoes.spin.setAttribute("aria-pressed", "false");
  } else casa();
});
botoes.med.addEventListener("click", () => { botoes.med.setAttribute("aria-pressed", String(botoes.med.getAttribute("aria-pressed") !== "true")); aplicarMedidas(); });
botoes.flow.addEventListener("click", () => {
  const on = botoes.flow.getAttribute("aria-pressed") !== "true";
  botoes.flow.setAttribute("aria-pressed", String(on));
  montado.g.traverse((o) => { if (o.userData.flow) o.visible = on; });
});
botoes.pes.addEventListener("click", () => {
  const on = botoes.pes.getAttribute("aria-pressed") !== "true";
  botoes.pes.setAttribute("aria-pressed", String(on));
  montado.g.traverse((o) => { if (o.userData.person) o.traverse((c) => { c.visible = on; }); });
});
botoes.lid.addEventListener("click", () => {
  tampaAberta = !tampaAberta;
  const pivo = montado.g.userData.pivo, de = pivo.rotation.x, para = tampaAberta ? -1.9 : 0;
  tween(800, (k) => { pivo.rotation.x = de + (para - de) * suave(k); });
  botoes.lid.setAttribute("aria-pressed", String(tampaAberta));
  botoes.lid.lastChild.textContent = tampaAberta ? " Fechar a tampa" : " Abrir a tampa";
  aplicarMedidas();
});
botoes.slice.addEventListener("click", () => {
  fatiaServida = !fatiaServida;
  const f = montado.g.userData.pizza.userData.fatias[0], de = f.position.clone();
  const para = fatiaServida ? f.userData.dir.clone().multiplyScalar(0.08).setY(0.025) : new THREE.Vector3();
  tween(700, (k) => f.position.lerpVectors(de, para, suave(k)));
  botoes.slice.setAttribute("aria-pressed", String(fatiaServida));
  botoes.slice.lastChild.textContent = fatiaServida ? " Devolver a fatia" : " Servir uma fatia";
  if (fatiaServida) selecionar(2);
});
botoes.spin.addEventListener("click", () => { girar = !girar; botoes.spin.setAttribute("aria-pressed", String(girar)); });
botoes.reset.addEventListener("click", () => { selecionar(-1); info.hidden = true; casa(); });
if (controls) controls.addEventListener("start", () => { if (girar) { girar = false; botoes.spin.setAttribute("aria-pressed", "false"); } tweens = []; });

// ---------- Tamanho e laço de desenho ----------
function tamanho() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h || !renderer) return;
  renderer.setSize(w, h, false);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w < 560 ? 52 : 40;
  camera.updateProjectionMatrix();
}
let visivel = true;
new IntersectionObserver((e) => { visivel = e[0].isIntersecting; }).observe(stage);
function quadro(t) {
  requestAnimationFrame(quadro);
  if (!visivel || document.hidden || !montado) return;
  const agora = performance.now();
  tweens = tweens.filter((tw) => { const k = Math.min(1, (agora - tw.t0) / tw.dur); tw.passo(k); if (k >= 1) { tw.fim && tw.fim(); return false; } return true; });
  controls.autoRotate = girar && !calmo() && !vistaDeCima;
  controls.update();
  montado.g.traverse((o) => { if (o.userData.anim) o.userData.anim(t / 1000); });
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

if (renderer) {
  new ResizeObserver(tamanho).observe(stage);
  tamanho();
  const inicial = (location.hash || "").slice(1);
  montar(VISTAS[inicial] ? inicial : "cozinha", true);
  $("loading").hidden = true;
  requestAnimationFrame(quadro);
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VISTAS[h] && h !== atual) montar(h); });
}
