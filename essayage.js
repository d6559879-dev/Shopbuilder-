/* =====================================
   DUKANI — Cabine d'essayage 3D (étape 1)
   Viewer Three.js + taille / couleur
===================================== */

(function () {
    "use strict";

    const params = new URLSearchParams(location.search);

    const produit = {
        id: params.get("id") || "demo",
        nom: params.get("nom") || "T-shirt Premium",
        prix: params.get("prix") || "25000",
        devise: params.get("devise") || "FC",
        boutique: params.get("boutique") || "Boutique démo",
        retour: params.get("retour") || "index.html"
    };

    let taille = "M";
    let couleur = "#7c3aed";

    const elNom = document.getElementById("nom-produit");
    const elPrix = document.getElementById("prix-produit");
    const elBoutique = document.getElementById("nom-boutique");

    if (elNom) elNom.textContent = produit.nom;
    if (elPrix) {
        const n = Number(produit.prix);
        elPrix.textContent = (Number.isFinite(n) ? n.toLocaleString("fr-FR") : produit.prix) + " " + produit.devise;
    }
    if (elBoutique) elBoutique.textContent = produit.boutique;

    document.getElementById("btn-retour").addEventListener("click", function () {
        if (history.length > 1) history.back();
        else location.href = produit.retour;
    });

    document.getElementById("choix-tailles").addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-taille]");
        if (!btn) return;
        taille = btn.getAttribute("data-taille");
        this.querySelectorAll("button").forEach(function (b) {
            b.classList.toggle("actif", b === btn);
        });
        ajusterTaille3D();
    });

    document.getElementById("choix-couleurs").addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-couleur]");
        if (!btn) return;
        couleur = btn.getAttribute("data-couleur");
        this.querySelectorAll("button").forEach(function (b) {
            b.classList.toggle("actif", b === btn);
        });
        if (vetementMat) {
            vetementMat.color.set(couleur);
        }
    });

    document.getElementById("btn-panier").addEventListener("click", function () {
        if (window.afficherToast) {
            window.afficherToast("✅ " + produit.nom + " (" + taille + ") — prêt pour la commande");
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
                taille: taille,
                couleur: couleur,
                at: Date.now()
            };
            const liste = JSON.parse(localStorage.getItem("dukani-essayage-panier") || "[]");
            liste.push(selection);
            localStorage.setItem("dukani-essayage-panier", JSON.stringify(liste));
        } catch (err) { /* ignore */ }
    });

    if (typeof THREE === "undefined") {
        console.error("[Dukani Essayage] Three.js non chargé");
        return;
    }

    const canvas = document.getElementById("canvas-3d");
    const viewer = canvas.parentElement;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.9, 3.2);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambiant = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambiant);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0xa78bfa, 0.35);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    const groupe = new THREE.Group();
    scene.add(groupe);

    const peauMat = new THREE.MeshStandardMaterial({
        color: 0xc4a574,
        roughness: 0.7,
        metalness: 0.05
    });

    function capsuleApprox(rayon, hauteur, seg) {
        const geo = new THREE.CapsuleGeometry(rayon, Math.max(0.01, hauteur - rayon * 2), 4, seg || 12);
        return new THREE.Mesh(geo, peauMat);
    }

    const torse = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.7, 16),
        peauMat
    );
    torse.position.y = 1.05;
    groupe.add(torse);

    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), peauMat);
    tete.position.y = 1.58;
    groupe.add(tete);

    const brasG = capsuleApprox(0.07, 0.65, 10);
    brasG.position.set(-0.42, 1.05, 0);
    brasG.rotation.z = 0.25;
    groupe.add(brasG);

    const brasD = capsuleApprox(0.07, 0.65, 10);
    brasD.position.set(0.42, 1.05, 0);
    brasD.rotation.z = -0.25;
    groupe.add(brasD);

    const jambeG = capsuleApprox(0.09, 0.85, 10);
    jambeG.position.set(-0.14, 0.35, 0);
    groupe.add(jambeG);

    const jambeD = capsuleApprox(0.09, 0.85, 10);
    jambeD.position.set(0.14, 0.35, 0);
    groupe.add(jambeD);

    let vetementMat = new THREE.MeshStandardMaterial({
        color: couleur,
        roughness: 0.55,
        metalness: 0.08
    });

    const vetement = new THREE.Mesh(
        new THREE.CylinderGeometry(0.30, 0.34, 0.55, 20),
        vetementMat
    );
    vetement.position.y = 1.12;
    groupe.add(vetement);

    const mancheG = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12),
        vetementMat
    );
    mancheG.position.set(-0.38, 1.22, 0);
    mancheG.rotation.z = Math.PI / 2.4;
    groupe.add(mancheG);

    const mancheD = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12),
        vetementMat
    );
    mancheD.position.set(0.38, 1.22, 0);
    mancheD.rotation.z = -Math.PI / 2.4;
    groupe.add(mancheD);

    const sol = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 48),
        new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.9,
            metalness: 0
        })
    );
    sol.rotation.x = -Math.PI / 2;
    sol.position.y = 0;
    scene.add(sol);

    function ajusterTaille3D() {
        const echelles = { XS: 0.88, S: 0.94, M: 1, L: 1.06, XL: 1.12 };
        const s = echelles[taille] || 1;
        vetement.scale.set(s, s, s);
        mancheG.scale.set(s, 1, s);
        mancheD.scale.set(s, 1, s);
    }

    let pointerDown = false;
    let lastX = 0;
    let lastY = 0;
    let rotY = 0.35;
    let rotX = 0.1;

    function onPointerDown(e) {
        pointerDown = true;
        lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        lastY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    }

    function onPointerMove(e) {
        if (!pointerDown) return;
        const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        const dx = x - lastX;
        const dy = y - lastY;
        lastX = x;
        lastY = y;
        rotY += dx * 0.008;
        rotX += dy * 0.005;
        rotX = Math.max(-0.4, Math.min(0.5, rotX));
    }

    function onPointerUp() {
        pointerDown = false;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("touchstart", function (e) {
        if (e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: true });
    canvas.addEventListener("touchmove", function (e) {
        if (e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
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
        if (!pointerDown) {
            rotY += 0.004;
        }
        groupe.rotation.y = rotY;
        groupe.rotation.x = rotX;
        renderer.render(scene, camera);
    }

    ajusterTaille3D();
    animer();
})();
