/* =====================================
   DUKANI — Cabine d'essayage 3D
   GLB + photo + mensurations (étape 2)
===================================== */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const params = new URLSearchParams(location.search);
const CLE_MENSURATIONS = "dukani-essayage-mensurations";
const CLE_PHOTO = "dukani-essayage-photo";

const produit = {
  id: params.get("id") || "demo",
  nom: params.get("nom") || "T-shirt Premium",
  prix: params.get("prix") || "25000",
  devise: params.get("devise") || "FC",
  boutique: params.get("boutique") || "Boutique démo",
  retour: params.get("retour") || "index.html",
  modele:
    params.get("modele") ||
    "https://cdn.jsdelivr.net/gh/Starklord17/threejs-t-shirt@main/public/shirt_baked.glb"
};

let taille = "M";
let couleur = "#7c3aed";
let shirtRoot = null;
let shirtMaterials = [];
let photoDataUrl = null;

const mensurations = {
  hauteur: "",
  poitrine: "",
  tourTaille: "",
  hanches: ""
};

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

const champs = {
  hauteur: document.getElementById("m-taille"),
  poitrine: document.getElementById("m-poitrine"),
  tourTaille: document.getElementById("m-taille-tour"),
  hanches: document.getElementById("m-hanches")
};

try {
  const sauve = JSON.parse(localStorage.getItem(CLE_MENSURATIONS) || "null");
  if (sauve && typeof sauve === "object") {
    Object.keys(mensurations).forEach((k) => {
      if (sauve[k] != null && sauve[k] !== "") {
        mensurations[k] = String(sauve[k]);
        if (champs[k]) champs[k].value = mensurations[k];
      }
    });
  }
} catch (e) {}

function lireMensurations() {
  Object.keys(champs).forEach((k) => {
    mensurations[k] = champs[k] ? champs[k].value.trim() : "";
  });
  try {
    localStorage.setItem(CLE_MENSURATIONS, JSON.stringify(mensurations));
  } catch (e) {}
  appliquerEchelle();
  suggererTailleVetement();
}

Object.values(champs).forEach((el) => {
  if (!el) return;
  el.addEventListener("change", lireMensurations);
  el.addEventListener("blur", lireMensurations);
});

function suggererTailleVetement() {
  const p = Number(mensurations.poitrine);
  if (!Number.isFinite(p) || p < 60) return;
  let t = "M";
  if (p < 84) t = "XS";
  else if (p < 90) t = "S";
  else if (p < 98) t = "M";
  else if (p < 106) t = "L";
  else t = "XL";

  const zone = document.getElementById("choix-tailles");
  if (!zone) return;
  const btn = zone.querySelector(`button[data-taille="${t}"]`);
  if (!btn || btn.classList.contains("actif")) return;
  taille = t;
  zone.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("actif", b === btn);
  });
}

const inputPhoto = document.getElementById("input-photo");
const apercu = document.getElementById("photo-apercu");
const btnEffacer = document.getElementById("btn-effacer-photo");

function afficherPhoto(dataUrl) {
  photoDataUrl = dataUrl;
  if (!apercu) return;
  if (dataUrl) {
    apercu.src = dataUrl;
    apercu.classList.add("visible");
    if (btnEffacer) btnEffacer.hidden = false;
  } else {
    apercu.removeAttribute("src");
    apercu.classList.remove("visible");
    if (btnEffacer) btnEffacer.hidden = true;
  }
}

try {
  const photoSauvee = localStorage.getItem(CLE_PHOTO);
  if (photoSauvee && photoSauvee.startsWith("data:image")) {
    afficherPhoto(photoSauvee);
  }
} catch (e) {}

if (inputPhoto) {
  inputPhoto.addEventListener("change", () => {
    const fichier = inputPhoto.files && inputPhoto.files[0];
    if (!fichier) return;
    if (fichier.size > 4 * 1024 * 1024) {
      alert("Photo trop lourde (max 4 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const max = 720;
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          const r = Math.min(max / w, max / h);
          w = Math.round(w * r);
          h = Math.round(h * r);
        }
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const compact = c.toDataURL("image/jpeg", 0.82);
        afficherPhoto(compact);
        try {
          localStorage.setItem(CLE_PHOTO, compact);
        } catch (e) {}
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(fichier);
  });
}

if (btnEffacer) {
  btnEffacer.addEventListener("click", () => {
    afficherPhoto(null);
    if (inputPhoto) inputPhoto.value = "";
    try {
      localStorage.removeItem(CLE_PHOTO);
    } catch (e) {}
  });
}

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
  lireMensurations();
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
      mensurations: { ...mensurations },
      photo: photoDataUrl ? true : false,
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
  let s = echelles[taille] || 1;

  const h = Number(mensurations.hauteur);
  const p = Number(mensurations.poitrine);
  if (Number.isFinite(h) && h >= 120 && h <= 220) {
    s *= h / 170;
  }
  if (Number.isFinite(p) && p >= 60 && p <= 160) {
    s *= 0.85 + 0.15 * (p / 92);
  }

  const base = shirtRoot.userData.baseScale || 1;
  shirtRoot.scale.setScalar(s * base);
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
