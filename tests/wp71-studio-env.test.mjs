import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../apps/electrophysics-3d/src/engine/studioEnv.ts', import.meta.url));
const { mountStudioEnvironment } = await import('data:text/javascript;base64,' + raw.toString('base64'));

function studioFixture({ failBake = false } = {}) {
  const resources = [];
  const targets = [];
  const bakes = [];
  class Resource {
    constructor(...args) {
      this.args = args;
      this.disposals = 0;
      resources.push(this);
    }
    dispose() { this.disposals++; }
  }
  class Node {
    children = [];
    position = { set: (...args) => { this.xyz = args; } };
    scale = { set: (...args) => { this.size = args; } };
    rotation = {};
    add(...children) { this.children.push(...children); }
    remove(child) { this.children.splice(this.children.indexOf(child), 1); }
  }
  class DirectionalLight extends Node {
    shadow = Object.assign(new Resource(), { mapSize: { set() {} }, camera: {} });
  }
  class Mesh extends Node {
    constructor(geometry, material) {
      super();
      Object.assign(this, { geometry, material });
    }
    lookAt(...xyz) { this.target = xyz; }
  }
  class Color {
    constructor(hex) { this.hex = hex; }
    multiplyScalar(radiance) { this.radiance = radiance; return this; }
  }
  class PMREMGenerator extends Resource {
    fromScene(dome, sigma) {
      bakes.push({ dome, sigma });
      if (failBake) throw Error('bake failed');
      const target = Object.assign(new Resource(), { texture: {} });
      targets.push(target);
      return target;
    }
  }
  const three = {
    Color, PMREMGenerator, Mesh, DirectionalLight,
    Scene: Node, Group: Node, HemisphereLight: Node,
    PlaneGeometry: Resource, SphereGeometry: Resource, ShaderMaterial: Resource,
    MeshBasicMaterial: Resource, DoubleSide: 2, BackSide: 1,
  };
  return { three, resources, targets, bakes, scene: new Node(), renderer: {} };
}

test('WP-7.1 bakes four distinct procedural HDR softboxes into one environment target', () => {
  const { three, scene, renderer, resources, targets, bakes } = studioFixture();
  const dispose = mountStudioEnvironment(three, renderer, scene);
  assert.equal(bakes.length, 1);
  const { dome, sigma } = bakes[0];
  assert.ok(sigma > 0 && sigma < 0.05);
  assert.equal(dome.children.length, 4);
  assert.equal(new Set(dome.children.map(({ xyz }) => xyz.join(','))).size, 4);
  for (const panel of dome.children) {
    assert.ok(panel.xyz[1] > 0);
    assert.deepEqual(panel.target, [0, 0, 0]);
    assert.ok(panel.size.every((dimension) => dimension > 0));
    assert.ok(panel.material.args[0].color.radiance > 1);
    assert.equal(panel.material.args[0].toneMapped, false);
    assert.equal(panel.material.disposals, 1);
  }
  assert.equal(dome.children[0].geometry.disposals, 1, 'shared bake geometry is disposed once');
  assert.equal(scene.environment, targets[0].texture);
  assert.equal(scene.environment.name, 'studio-softbox-pmrem');
  assert.equal(targets[0].disposals, 0);
  assert.deepEqual(resources.filter((r) => r instanceof three.PMREMGenerator).map((r) => r.disposals), [1]);
  dispose();
});

test('WP-7.1 cyclorama shares its horizon and releases every GPU resource on unmount', () => {
  const { three, scene, renderer, resources } = studioFixture();
  const dispose = mountStudioEnvironment(three, renderer, scene);
  assert.equal(scene.children.length, 1);
  const [studio] = scene.children;
  const [sky, ground, key, fill, rim] = studio.children;
  assert.equal(studio.name, 'studio-cyclorama');
  assert.equal(sky.material.args[0].uniforms.horizon.value, scene.background);
  assert.equal(ground.material.args[0].uniforms, sky.material.args[0].uniforms);
  assert.equal(ground.material.args[0].defines.STUDIO_FLOOR, 1);
  assert.match(ground.material.args[0].fragmentShader, /fwidth\(ground\)/);
  assert.match(ground.material.args[0].fragmentShader, /mix\(horizon, floorShade, nearGround\)/);
  assert.equal(sky.material.args[0].depthWrite, false);
  assert.equal(key.castShadow, true);
  dispose();
  assert.equal(scene.environment, null);
  assert.deepEqual(scene.children, []);
  const gpuResources = resources.filter((r) => r !== fill.shadow && r !== rim.shadow);
  assert.ok(gpuResources.every((r) => r.disposals === 1));
  assert.equal(fill.castShadow, undefined);
  assert.equal(rim.castShadow, undefined);
});

test('WP-7.1 releases the temporary light dome on a failed bake', () => {
  const { three, scene, renderer, resources } = studioFixture({ failBake: true });
  assert.throws(() => mountStudioEnvironment(three, renderer, scene), /bake failed/);
  assert.ok(resources.length > 0 && resources.every((r) => r.disposals === 1));
  assert.equal(scene.environment, undefined);
  assert.deepEqual(scene.children, []);
});
