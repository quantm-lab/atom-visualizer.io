import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";

/* ================= CONSTANTS ================= */

const SHELL_CAPACITY = [2, 8, 18, 32];

/* ================= HELPERS ================= */

function getShellDistribution(Z) {
  let remaining = Z;
  const shells = [];

  for (let cap of SHELL_CAPACITY) {
    if (remaining <= 0) break;
    const used = Math.min(cap, remaining);
    shells.push(used);
    remaining -= used;
  }
  return shells;
}

function createOrbit(radius) {
  return new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
  );
}

/* ================= ELECTRONS ================= */

export function createElectrons(protonNumber, nucleusRadius, isNobleGas) {
  const group = new THREE.Group();
  const electrons = [];

  const shells = getShellDistribution(protonNumber);
  const valenceShellIndex = isNobleGas ? -1 : shells.length - 1;

  shells.forEach((count, shellIndex) => {
    const radius = nucleusRadius + 0.9 + shellIndex * 1.1;
    const isValenceShell = shellIndex === valenceShellIndex;

    // Orbit ring
    const orbit = createOrbit(radius);
    group.add(orbit);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;

      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 32, 32),
        new THREE.MeshStandardMaterial({
          color: isValenceShell ? 0xffd700 : 0x00aaff,
          emissive: isValenceShell ? 0xffaa00 : 0x003366,
          emissiveIntensity: isValenceShell ? 0.8 : 0.4,
          transparent: true,
          opacity: isValenceShell ? 1.0 : 0.8,
        })
      );

      group.add(electron);

      electrons.push({
        mesh: electron,
        radius,
        angle,
        speed: isValenceShell
          ? 0.0125 / (shellIndex + 1) // slightly more active
          : 0.012 / (shellIndex + 1),
      });
    }
  });

  /* ================= ANIMATION ================= */

  function update() {
    electrons.forEach((e) => {
      e.angle += e.speed;
      e.mesh.position.set(
        Math.cos(e.angle) * e.radius,
        Math.sin(e.angle) * e.radius,
        0
      );
    });
  }

  return { group, update };
}
