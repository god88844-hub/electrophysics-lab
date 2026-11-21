import * as THREE from 'three';
import { frameStore } from './solverFrame.mjs';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type QualityLevel = 'high' | 'medium' | 'low';

export interface RendererBundle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  orthoCamera: THREE.OrthographicCamera;
  useOrtho: boolean;
  activeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  setQuality: (level: QualityLevel) => void;
  quality: QualityLevel;
  render: (delta: number) => void;
  resize: () => void;
  dispose: () => void;
}

/**
 * Studio-grade PBR renderer tuned for Intel integrated graphics:
 *  - procedural room environment via PMREMGenerator (no network fetch)
 *  - subtle selective bloom (UnrealBloomPass, half resolution, low strength)
 *  - automatic quality degradation: pixel ratio → bloom → shadow maps
 */
export function createRenderer(container: HTMLElement): RendererBundle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const maxPixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(maxPixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0e11);
  scene.fog = new THREE.Fog(0x0c0e11, 26, 70);

  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    140
  );
  camera.position.set(0, 5.2, 16);
  camera.lookAt(0, 1.2, 0);

  // Procedural studio environment → PMREM → scene.environment (PBR reflections).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.42;
  pmrem.dispose();

  // Lighting: one shadowed key, cool fill, warm rim — all cheap.
  const ambient = new THREE.AmbientLight(0xdfe3ea, 0.5);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xf6f7f4, 2.1); // neutral 5600 K studio key
  keyLight.position.set(7, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -14;
  keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 14;
  keyLight.shadow.camera.bottom = -14;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xdde4ee, 0.45); // soft neutral fill
  fillLight.position.set(-8, 4, 6);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xcfd6e0, 0.3);
  rimLight.position.set(-4, 6, -9);
  scene.add(rimLight);

  const composer = new EffectComposer(renderer);
  composer.setSize(container.clientWidth, container.clientHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth * 0.5, container.clientHeight * 0.5),
    0.28, // low strength — HUD text is DOM, 3D labels stay crisp
    0.45,
    0.85
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Orthographic camera for CAD ortho views (O key toggle).
  const aspect = container.clientWidth / container.clientHeight;
  const orthoHeight = 14;
  const orthoCamera = new THREE.OrthographicCamera(
    (-orthoHeight * aspect) / 2, (orthoHeight * aspect) / 2,
    orthoHeight / 2, -orthoHeight / 2, 0.1, 140
  );
  orthoCamera.position.set(0, 5.2, 16);
  orthoCamera.lookAt(0, 1.2, 0);
  let useOrtho = false;

  let quality: QualityLevel = 'high';

  function applyQuality(level: QualityLevel): void {
    quality = level;
    if (level === 'high') {
      renderer.setPixelRatio(maxPixelRatio);
      bloomPass.enabled = true;
      renderer.shadowMap.enabled = true;
    } else if (level === 'medium') {
      renderer.setPixelRatio(1);
      bloomPass.enabled = true;
      renderer.shadowMap.enabled = false;
    } else {
      renderer.setPixelRatio(1);
      bloomPass.enabled = false;
      renderer.shadowMap.enabled = false;
    }
    renderer.shadowMap.needsUpdate = true;
    // WP-1.5: publish the automatic iGPU quality-governor state on the frame
    // surface so acceptance tests can verify it stays live and automatic.
    frameStore.setQuality(level, renderer.getPixelRatio());
  }

  function render(delta: number): void {
    composer.render(delta);
  }

  const bundleRef: { bundle?: RendererBundle } = {};

  function resize(): void {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(Math.max(1, w * 0.5), Math.max(1, h * 0.5));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const orthoAspect = w / h;
    orthoCamera.left = (-orthoHeight * orthoAspect) / 2;
    orthoCamera.right = (orthoHeight * orthoAspect) / 2;
    orthoCamera.updateProjectionMatrix();
  }

  function dispose(): void {
    window.removeEventListener('resize', resize);
    renderer.dispose();
    envTexture.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  }

  window.addEventListener('resize', resize);

  const bundle: RendererBundle = {
    renderer,
    scene,
    camera,
    orthoCamera,
    get useOrtho() {
      return useOrtho;
    },
    set useOrtho(v: boolean) {
      useOrtho = v;
    },
    get activeCamera() {
      return useOrtho ? orthoCamera : camera;
    },
    composer,
    bloomPass,
    get quality() {
      return quality;
    },
    setQuality: applyQuality,
    render,
    resize,
    dispose,
  };
  bundleRef.bundle = bundle;
  return bundle;
}

/**
 * FPS watchdog for integrated GPUs: if average FPS drops below thresholds for
 * a sustained window, step quality down (never back up, to avoid oscillation).
 */
export function createQualityGovernor(bundle: RendererBundle): (deltaMs: number) => void {
  let windowStart = performance.now();
  let frames = 0;
  let degradedOnce = false;
  return (deltaMs: number) => {
    void deltaMs;
    frames++;
    const now = performance.now();
    if (now - windowStart >= 2000) {
      const fps = (frames * 1000) / (now - windowStart);
      frames = 0;
      windowStart = now;
      if (fps < 42) {
        if (bundle.quality === 'high') {
          bundle.setQuality('medium');
        } else if (bundle.quality === 'medium' && !degradedOnce) {
          degradedOnce = true;
          bundle.setQuality('low');
        } else if (bundle.quality === 'low' && !degradedOnce) {
          degradedOnce = true;
        }
      }
    }
  };
}
