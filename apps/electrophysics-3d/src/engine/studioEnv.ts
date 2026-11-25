// @ts-nocheck
// Dependency injection keeps the studio's resource lifecycle testable in Node.
// The renderer supplies the workbench's installed Three.js namespace.

const softboxes = [
  { position: [7, 10, 8], size: [6, 4], color: 0xfff3e3, radiance: 5 },
  { position: [-8, 4, 6], size: [5, 5], color: 0xd9e8ff, radiance: 2.4 },
  { position: [-4, 7, -9], size: [3, 7], color: 0xe4efff, radiance: 4 },
  { position: [1, 9, -1], size: [8, 2], color: 0xf5f2eb, radiance: 3 },
];

const cycloramaVertex = `
  varying vec3 worldPosition;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    worldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const cycloramaFragment = `
  uniform vec3 horizon;
  uniform vec3 zenith;
  uniform vec3 floorColor;
  varying vec3 worldPosition;

  void main() {
  #ifdef STUDIO_FLOOR
    vec2 ground = worldPosition.xz;
    float nearGround = 1.0 - smoothstep(8.0, 42.0, length(ground - cameraPosition.xz));
    vec2 cell = abs(fract(ground + 0.5) - 0.5);
    vec2 aa = max(fwidth(ground), vec2(0.0001));
    vec2 line = 1.0 - smoothstep(vec2(0.0), aa, cell);
    float grid = max(line.x, line.y) * (1.0 - smoothstep(0.08, 0.3, max(aa.x, aa.y)));
    // A soft studio contact shadow anchored to the work surface at the rig origin.
    vec2 footprint = ground / vec2(5.5, 3.8);
    float contact = 1.0 - smoothstep(0.08, 1.0, dot(footprint, footprint));
    vec3 floorShade = floorColor * (1.0 + 0.11 * grid - 0.29 * contact);
    vec3 color = mix(horizon, floorShade, nearGround);
  #else
    float elevation = normalize(worldPosition - cameraPosition).y;
    vec3 color = mix(horizon, zenith, smoothstep(0.02, 0.8, elevation));
  #endif
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Bake the light dome once and mount the workbench's shared backdrop and lights. */
export function mountStudioEnvironment(THREE, renderer, scene) {
  const horizon = new THREE.Color(0x3b414a);
  const dome = new THREE.Scene();
  dome.background = new THREE.Color(0x30343b);
  const panelGeometry = new THREE.PlaneGeometry(1, 1);
  const panels = softboxes.map(({ position, size, color, radiance }) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(radiance),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const panel = new THREE.Mesh(panelGeometry, material);
    panel.position.set(...position);
    panel.scale.set(size[0], size[1], 1);
    panel.lookAt(0, 0, 0);
    dome.add(panel);
    return panel;
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  let target;
  try {
    target = pmrem.fromScene(dome, 0.015);
  } finally {
    pmrem.dispose();
    panelGeometry.dispose();
    for (const panel of panels) panel.material.dispose();
  }
  target.texture.name = 'studio-softbox-pmrem';
  scene.environment = target.texture;
  scene.environmentIntensity = 0.68;
  scene.background = horizon;

  const studio = new THREE.Group();
  studio.name = 'studio-cyclorama';
  const uniforms = {
    horizon: { value: horizon },
    zenith: { value: new THREE.Color(0x1b2029) },
    floorColor: { value: new THREE.Color(0x343941) },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(95, 24, 12),
    new THREE.ShaderMaterial({
      uniforms, vertexShader: cycloramaVertex, fragmentShader: cycloramaFragment,
      side: THREE.BackSide, depthWrite: false,
    }),
  );
  sky.name = 'studio-sky';
  sky.renderOrder = -20;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.ShaderMaterial({
      uniforms, vertexShader: cycloramaVertex, fragmentShader: cycloramaFragment,
      defines: { STUDIO_FLOOR: 1 },
    }),
  );
  floor.name = 'studio-floor';
  floor.renderOrder = -10;
  floor.rotation.x = -Math.PI / 2;
  studio.add(sky, floor);

  const key = new THREE.DirectionalLight(0xfff3e3, 2.1);
  key.position.set(7, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  const fill = new THREE.DirectionalLight(0xd9e8ff, 0.65);
  fill.position.set(-8, 4, 6);
  const rim = new THREE.DirectionalLight(0xe4efff, 0.55);
  rim.position.set(-4, 7, -9);
  studio.add(key, fill, rim, new THREE.HemisphereLight(0xf5f2eb, 0x383b44, 0.8));
  scene.add(studio);

  return () => {
    scene.remove(studio);
    scene.environment = null;
    target.dispose();
    key.shadow.dispose();
    for (const mesh of [sky, floor]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  };
}
