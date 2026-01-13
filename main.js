import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";

import { createNucleusShell } from "./nucleus.js";
import { addProtons } from "./protons.js";
import { addNeutrons } from "./neutrons.js";
import { createElectrons } from "./electrons.js";
import { buildPeriodicTableUI } from "./periodicTable.js";

/* ================= SCENE ================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(4, 4, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// IMPORTANT: keep canvas behind UI
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "0";

document.body.appendChild(renderer.domElement);

/* ================= CONTROLS ================= */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

/* ================= LIGHTING ================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(5, 5, 5);
scene.add(light);

/* ================= STATE ================= */

let periodicTable = {};
let nucleusMesh = null;
let updateElectrons = null;

/* ================= LOAD DATA ================= */

async function loadPeriodicTable() {
  const res = await fetch("./data/periodicTable.json");
  if (!res.ok) {
    throw new Error("Failed to load periodicTable.json");
  }
  periodicTable = await res.json();
}

/* ================= CLEAR ATOM ================= */

function clearAtom() {
  scene.children
    .filter(obj => obj.userData.atomPart)
    .forEach(obj => scene.remove(obj));

  nucleusMesh = null;
  updateElectrons = null;
}

/* ================= CREATE ATOM ================= */

function createAtom(Z, N, isNobleGas = false) {

  clearAtom();

  /* ---- NUCLEUS ---- */

  const { nucleus, nucleusRadius } = createNucleusShell(Z);
  nucleus.userData.atomPart = true;
  scene.add(nucleus);
  nucleusMesh = nucleus;

  addProtons({
    nucleus,
    count: Z,
    nucleusRadius
  });

  addNeutrons({
    nucleus,
    count: N,
    nucleusRadius
  });

  /* ---- ELECTRONS ---- */

  const electronsResult = createElectrons(
    Z,
    nucleusRadius,
    isNobleGas
  );

  electronsResult.group.userData.atomPart = true;
  scene.add(electronsResult.group);

  updateElectrons = electronsResult.update;
}

/* ================= INFO PANEL ================= */

function formatElectronConfig(config) {
  return config.replace(/([spdf])(\d+)/g, "$1<sup>$2</sup>");
}

function updateElementInfo(element) {
  const panel = document.getElementById("element-info");
  if (!panel) return;

  const massNumber = element.atomicNumber + element.neutrons;

  panel.innerHTML = `
    <div class="title">${element.name} (${element.symbol})</div>
    <div class="subtitle">Atomic Number (Z): ${element.atomicNumber}</div>

    <div class="row"><span class="label">Neutrons:</span> <span class="value">${element.neutrons}</span></div>
    <div class="row"><span class="label">Mass Number (A):</span> <span class="value">${massNumber}</span></div>
    <div class="row"><span class="label">Block:</span> <span class="value">${element.block}</span></div>
    <div class="row"><span class="label">Period:</span> <span class="value">${element.period}</span></div>
    <div class="row"><span class="label">Group:</span> <span class="value">${element.group}</span></div>
    <div class="row"><span class="label">Valency:</span> <span class="value">${element.valency}</span></div>
    <div class="row">
      <span class="label">Electronic Config:</span>
      <span class="value">${formatElectronConfig(element.configuration)}</span>
    </div>
  `;
}

/* ================= INIT ================= */

async function init() {
  try {
    await loadPeriodicTable();
  } catch (err) {
    console.error(err);
    alert("Failed to load periodic table data.");
    return;
  }

  buildPeriodicTableUI({
    data: periodicTable,
    containerId: "periodic-table",
    onSelect: (element) => {
      createAtom(
        element.atomicNumber,
        element.neutrons,
        element.group === 18 // noble gas flag
      );
      updateElementInfo(element);
    }
  });

  // Default → Hydrogen
  const hydrogen = periodicTable["1"];

  createAtom(
    hydrogen.atomicNumber,
    hydrogen.neutrons,
    hydrogen.group === 18
  );

  updateElementInfo(hydrogen);

  document.querySelector(".element")?.classList.add("active");
}

init();

/* ================= ANIMATION ================= */

function animate() {
  requestAnimationFrame(animate);

  if (updateElectrons) updateElectrons();

  // Subtle nucleus motion (not a spin)
  if (nucleusMesh) {
    nucleusMesh.rotation.y = Math.sin(performance.now() * 0.0003) * 0.05;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

/* ================= RESIZE ================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});