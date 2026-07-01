/* viewer3d.js — Three.js r160+ con ES Modules */
import * as THREE from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('modelViewer');
const loadingEl = document.getElementById('modelLoading');
const errorEl   = document.getElementById('modelError');

if (!container) throw new Error('No se encontró #modelViewer');

/* ── Escena ── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141414);

/* ── Cámara ── */
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.01,
  1000
);
camera.position.set(3, 2, 5);

/* ── Renderer ── */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

/* ── Iluminación ── */
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.4);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const fill = new THREE.DirectionalLight(0xc9e0ff, 0.35);
fill.position.set(-4, 3, -5);
scene.add(fill);

/* ── OrbitControls ── */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.07;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.6;
controls.maxPolarAngle   = Math.PI / 1.7;

renderer.domElement.addEventListener('pointerdown', () => {
  controls.autoRotate = false;
});

/* ── Cargar GLB ── */
const loader = new GLTFLoader();
loader.load(
  'https://octaviovr5.github.io/Casa_IGO/assets/models/casa-igo.glb',

  (gltf) => {
    const model = gltf.scene;

    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    model.position.sub(center);

    const maxDim  = Math.max(size.x, size.y, size.z);
    const fovRad  = (camera.fov * Math.PI) / 180;
    const dist    = Math.abs(maxDim / (2 * Math.tan(fovRad / 2))) * 2.2;

    camera.position.set(dist * 0.7, dist * 0.4, dist);
    camera.near = maxDim / 100;
    camera.far  = maxDim * 100;
    camera.updateProjectionMatrix();

    controls.minDistance = maxDim * 0.2;
    controls.maxDistance = maxDim * 6;
    controls.update();

    model.traverse(n => {
      if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; }
    });

    scene.add(model);
    loadingEl.style.display = 'none';
  },

  (xhr) => {
    if (xhr.total) {
      const pct  = Math.round((xhr.loaded / xhr.total) * 100);
      const span = loadingEl.querySelector('span');
      if (span) span.textContent = `Cargando modelo… ${pct}%`;
    }
  },

  () => {
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'flex';
  }
);

/* ── Loop ── */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ── Resize ── */
new ResizeObserver(() => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}).observe(container);
