import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";

export function createNucleusShell(protonNumber) {
  const nucleusRadius = 0.35 + Math.cbrt(protonNumber) * 0.15;

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(nucleusRadius, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 100,
      depthWrite: false,
      hardness: 0.1,
      metalness: 0.2,
      emissive: 0x220000,
      emissiveIntensity: 0.6
    })
  );

  return { nucleus, nucleusRadius };
}