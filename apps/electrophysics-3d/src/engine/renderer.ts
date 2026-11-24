import * as THREE from 'three';
import { frameStore } from './solverFrame.mjs';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { mountStudioEnvironment } from './studioEnv.js';

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
 *  - procedural softbox PMREM and a bounded studio cyclorama
 *  - subtle selective bloom (UnrealBloomPass, half resolution, low strength)
 *  - automatic quality degradation: pixel ratio → bloom → shadow maps
 */
export function createRenderer(container: HTMLElement): RendererBundle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const maxPixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(maxPixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.userData.toneMapping = renderer.toneMapping;
  const disposeStudio = mountStudioEnvironment(THREE, renderer, scene);

  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    140
  );
  camera.position.set(0, 5.2, 16);
  camera.lookAt(0, 1.2, 0);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth * 0.5, container.clientHeight * 0.5),
    0.28, // low strength — HUD text is DOM, 3D labels stay crisp
    0.45,
    0.85
  );
  composer.addPass(bloomPass);
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

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
    composer.setPixelRatio(renderer.getPixelRatio());
    // WP-1.5: publish the automatic iGPU quality-governor state on the frame
    // surface so acceptance tests can verify it stays live and automatic.
    frameStore.setQuality(level, renderer.getPixelRatio());
  }

  function render(delta: number): void {
    const view = useOrtho ? orthoCamera : camera;
    if (bloomPass.enabled) {
      renderPass.camera = view;
      composer.render(delta);
    } else {
      renderer.render(scene, view);
    }
  }

  function resize(): void {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const orthoAspect = w / h;
    orthoCamera.left = (-orthoHeight * orthoAspect) / 2;
    orthoCamera.right = (orthoHeight * orthoAspect) / 2;
    orthoCamera.updateProjectionMatrix();
  }

  function dispose(): void {
    sizeObserver.disconnect();
    disposeStudio();
    bloomPass.dispose();
    outputPass.dispose();
    composer.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  }

  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(container);
  frameStore.setQuality(quality, renderer.getPixelRatio());

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
      if (fps < 55) {
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
