import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";

export function addProtons({
  nucleus,
  count,
  nucleusRadius
}) {
  const PROTON_RADIUS = 0;
  const BIAS = 2;

  const protonMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.3,
    metalness: 0.15
  });

  if (count === 1) {
    const proton = new THREE.Mesh(
      new THREE.SphereGeometry(PROTON_RADIUS, 16, 16),
      protonMaterial
    );
    nucleus.add(proton);
    return;
  }

  for (let i = 0; i < count; i++) {
    const proton = new THREE.Mesh(
      new THREE.SphereGeometry(PROTON_RADIUS, 16, 16),
      protonMaterial
    );

    const dir = new THREE.Vector3().randomDirection();
    const maxR = nucleusRadius - PROTON_RADIUS;
    const r = Math.pow(Math.random(), BIAS) * maxR;

    proton.position.copy(dir.multiplyScalar(r));
    nucleus.add(proton);
  }
}