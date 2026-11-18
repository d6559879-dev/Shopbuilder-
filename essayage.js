/* =====================================
   DUKANI — Cabine d'essayage 3D
   Modèle GLB gratuit + taille / couleur
===================================== */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const params = new URLSearchParams(location.search);

const produit = {
  id: params.get("id") || "demo",
  nom: params.get("nom") || "T-shirt Premium",
  prix: params.get("prix") || "25000",
  devise: params.get("devise") || "FC",
  boutique: params.get("boutique") || "Boutique démo",
  retour: params.get("retour") || "index.html",
  modele: params.get("modele") || "https://cdn.jsdelivr.net/gh/Starklord17/threejs-t-shirt@main/public/shirt_baked.glb"
};

let taille = "M";
let couleur = "#7c3aed";
let shirtRoot = null;
let shirtMaterials = [];

const elNom = document.getElementById("nom-produit");
const elPrix = document.getElementById("prix-produit");
const elBoutique = document.getElementById("nom-boutique");

if (elNom) elNom.textContent = produit.nom;
if (elPrix) {
  const n = Number(produit.prix);
  elPrix.textContent =
    (Number.isFinite(n) ? n.toLocaleString("fr-FR") : produit.prix) +
    " " +
    produit.devise;
}
if (elBoutique) elBoutique.textContent = produit.boutique;

document.getElementById("btn-retour").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else location.href = produit.retour;
});

document.getElementById("choix-tailles").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-taille]");
  if (!btn) return;
  taille = btn.getAttribute("data-taille");
  e.currentTarget.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("actif", b === btn);
  });
  appliquerEchelle();
});

document.getElementById("choix-couleurs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-couleur]");
  if (!btn) return;
  couleur = btn.getAttribute("data-couleur");
  e.currentTarget.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("actif", b === btn);
  });
  appliquerCouleur();
});

document.getElementById("btn-panier").addEventListener("click", () => {
  if (window.afficherToast) {
    window.afficherToast(
      "✅ " + produit.nom + " (" + taille + ") — prêt pour la commande"
    );
  } else {
    alert("✅ Ajouté : " + produit.nom + " — Taille " + taille);
  }

  try {
    const selection = {
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      devise: produit.devise,
      boutique: produit.boutique,
      taille,
      couleur,
      at: Date.now()
    };
    const liste = JSON.parse(
      localStorage.getItem("dukani-essayage-panier") || "[]"
    );
    liste.push(selection);
    localStorage.setItem("dukani-essayage-panier", JSON.stringify(liste));
  } catch (err) {}
});

const canvas = document.getElementById("canvas-3d");
const viewer = canvas.parentElement;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.15, 2.4);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.AmbientLight(0xffffff, 0.75));

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(2.5, 4, 3);
scene.add(dir);

const fill = new THREE.DirectionalLight(0xa78bfa, 0.4);
fill.position.set(-2, 1.5, -2);
scene.add(fill);

const groupe = new THREE.Group();
scene.add(groupe);

const sol = new THREE.Mesh(
  new THREE.CircleGeometry(1.4, 48),
  new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.95,
    metalness: 0
  })
);
sol.rotation.x = -Math.PI / 2;
sol.position.y = -0.85;
scene.add(sol);

function appliquerCouleur() {
  const c = new THREE.Color(couleur);
  shirtMaterials.forEach((m) => {
    if (m.color) m.color.copy(c);
    m.needsUpdate = true;
  });
}

function appliquerEchelle() {
  if (!shirtRoot) return;
  const echelles = { XS: 0.9, S: 0.95, M: 1, L: 1.06, XL: 1.12 };
  const s = echelles[taille] || 1;
  shirtRoot.scale.setScalar(s * (shirtRoot.userData.baseScale || 1));
}

const loader = new GLTFLoader();
const statut = document.querySelector(".essayage-hint");
if (statut) statut.textContent = "Chargement du modèle…";

loader.load(
  produit.modele,
  (gltf) => {
    while (groupe.children.length) groupe.remove(groupe.children[0]);
    shirtMaterials = [];

    shirtRoot = gltf.scene;
    shirtRoot.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => {
            m.color = new THREE.Color(couleur);
            m.roughness = m.roughness != null ? m.roughness : 0.65;
            m.metalness = m.metalness != null ? m.metalness : 0.05;
            m.needsUpdate = true;
            shirtMaterials.push(m);
          });
        }
      }
    });

    const box = new THREE.Box3().setFromObject(shirtRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    shirtRoot.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const baseScale = 1.6 / maxDim;
    shirtRoot.userData.baseScale = baseScale;
    shirtRoot.scale.setScalar(baseScale);
    shirtRoot.position.y += 0.05;

    groupe.add(shirtRoot);
    appliquerEchelle();
    appliquerCouleur();
    if (statut) statut.textContent = "Tournez avec le doigt";
  },
  undefined,
  (err) => {
    console.error("[Dukani Essayage] Échec chargement GLB", err);
    if (statut) statut.textContent = "Modèle indisponible — forme simplifiée";
    const mat = new THREE.MeshStandardMaterial({
      color: couleur,
      roughness: 0.55,
      metalness: 0.08
    });
    shirtMaterials = [mat];
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.7, 24),
      mat
    );
    shirtRoot = mesh;
    shirtRoot.userData.baseScale = 1;
    groupe.add(mesh);
  }
);

let pointerDown = false;
let lastX = 0;
let lastY = 0;
let rotY = 0.4;
let rotX = 0.05;

function onPointerDown(e) {
  pointerDown = true;
  lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
}

function onPointerMove(e) {
  if (!pointerDown) return;
  const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  rotY += (x - lastX) * 0.008;
  rotX += (y - lastY) * 0.005;
  rotX = Math.max(-0.45, Math.min(0.45, rotX));
  lastX = x;
  lastY = y;
}

function onPointerUp() {
  pointerDown = false;
}

canvas.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
canvas.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches[0]) onPointerDown(e.touches[0]);
  },
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches[0]) onPointerMove(e.touches[0]);
  },
  { passive: true }
);
canvas.addEventListener("touchend", onPointerUp);

function redimensionner() {
  const w = viewer.clientWidth;
  const h = viewer.clientHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", redimensionner);
redimensionner();

function animer() {
  requestAnimationFrame(animer);
  if (!pointerDown) rotY += 0.004;
  groupe.rotation.y = rotY;
  groupe.rotation.x = rotX;
  renderer.render(scene, camera);
}

animer();
