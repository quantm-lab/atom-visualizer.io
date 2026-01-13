import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";

export function addNeutrons({
  nucleus,
  count,
  nucleusRadius
}) {
  if (count <= 0) return;

  const NEUTRON_RADIUS = 0;
  const BIAS = 2;

  const neutronMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.4,
    metalness: 0.05,
    transparent: true,
    opacity: 0.8
  });

  for (let i = 0; i < count; i++) {
    const neutron = new THREE.Mesh(
      new THREE.SphereGeometry(NEUTRON_RADIUS, 16, 16),
      neutronMaterial
    );

    const dir = new THREE.Vector3().randomDirection();
    const maxR = nucleusRadius - NEUTRON_RADIUS;
    let r;

    if (Math.random() < 0.65) {
      // inner dense core
      r = Math.pow(Math.random(), 2.5) * maxR * 0.6;
    } else {
      // outer fill region
      r = (0.6 + Math.random() * 0.4) * maxR;
    }

    neutron.position.copy(dir.multiplyScalar(r));
    nucleus.add(neutron);
  }
}