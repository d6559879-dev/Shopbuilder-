/* =====================================
   DUKANI — vitrine publique
===================================== */

const SUPABASE_URL = "https://aowfjpaclhrmmhpuxauq.supabase.co";
const SUPABASE_CLE = "sb_publishable_bHKXQAMowU0qoVOp5RqlmA_Qm_LrKC6";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_CLE);
const $ = id => document.getElementById(id);

const slug = new URLSearchParams(location.search).get("b");

let boutique = null;
let choisi = null;

function prix(n) {
    const monnaie = boutique && boutique.devise === "USD" ? "$" : "FC";
    return Number(n).toLocaleString("fr-FR") + " " + monnaie;
}

function urlPhoto(chemin) {
    return SUPABASE_URL + "/storage/v1/object/public/produits/" +
        chemin.split("/").map(encodeURIComponent).join("/");
}

function ligne(parent, tag, texte) {
    const el = document.createElement(tag);
    el.textContent = texte;
    parent.appendChild(el);
    return el;
}

function introuvable() {
    $("v-nom").textContent = "Boutique introuvable";
    $("v-description").textContent = "Vérifiez le lien que vous avez reçu.";
    $("v-produits").innerHTML = "";
}

async function charger() {
    if (!slug || !/^[a-z0-9-]{3,60}$/.test(slug)) { introuvable(); return; }

    const { data, error } = await sb.rpc("vitrine", { p_slug: slug });

    if (error || !data) { introuvable(); return; }

    boutique = data;
    afficher();
}

/* Numéro au format international (chiffres seuls) pour wa.me.
   Un numéro local congolais (08…, 09…) devient 2438…, 2439… */

function numeroWhatsApp(brut) {
    let chiffres = String(brut).replace(/[^0-9]/g, "");

    if (String(brut).trim().startsWith("+")) {
        /* déjà international */
    } else if (chiffres.startsWith("00")) {
        chiffres = chiffres.slice(2);
    } else if (chiffres.startsWith("0")) {
        chiffres = "243" + chiffres.slice(1);
    } else if (chiffres.length === 9) {
        chiffres = "243" + chiffres;
    }

    return chiffres.length >= 9 && chiffres.length <= 15 ? chiffres : "";
}

function afficher() {
    document.title = boutique.nom;
    $("v-logo").textContent = boutique.nom;
    $("v-nom").textContent = boutique.nom;
    $("v-description").textContent = boutique.description || "";

    if (boutique.image_path) {
        let photo = $("v-photo");

        /* Si la page n'a pas encore l'emplacement de la photo, on le crée */
        if (!photo) {
            photo = document.createElement("img");
            photo.id = "v-photo";
            photo.className = "photo-hero";
            const entete = $("v-nom").parentElement;
            entete.insertBefore(photo, entete.firstChild);
        }

        photo.src = urlPhoto(boutique.image_path);
        photo.alt = boutique.nom;
        photo.hidden = false;
    }

    if (boutique.telephone) {
        const lien = $("v-tel");
        lien.hidden = false;
        lien.href = "tel:" + boutique.telephone.replace(/[^0-9+]/g, "");

        /* Même numéro pour WhatsApp */
        const numeroWa = numeroWhatsApp(boutique.telephone);

        if (numeroWa && $("v-whatsapp")) {
            const wa = $("v-whatsapp");
            const message = "Bonjour, je vous contacte depuis votre boutique « " +
                boutique.nom + " » sur Dukani.";
            wa.hidden = false;
            wa.href = "https://wa.me/" + numeroWa + "?text=" + encodeURIComponent(message);
        }
    }

    const zone = $("v-produits");
    zone.innerHTML = "";

    if (boutique.produits.length === 0) {
        const vide = ligne(zone, "p", "Aucun produit pour le moment.");
        vide.style.color = "var(--encre-douce)";
        return;
    }

    boutique.produits.forEach(p => {
        const carte = document.createElement("div");
        carte.className = "produit-item";

        if (p.image_path) {
            const photo = document.createElement("img");
            photo.src = urlPhoto(p.image_path);
            photo.alt = p.nom;
            photo.className = "photo-vitrine";
            photo.loading = "lazy";
            carte.appendChild(photo);
        }

        ligne(carte, "h3", p.nom);
        ligne(carte, "p", "📂 " + p.categorie);
        ligne(carte, "strong", prix(p.prix)).className = "produit-prix";

        const dispo = p.stock > 0;
        ligne(carte, "p", dispo ? "✅ En stock" : "❌ Rupture de stock");

        const bt = ligne(carte, "button", "🛒 Commander");
        bt.type = "button";
        bt.className = "creer";
        bt.disabled = !dispo;
        bt.addEventListener("click", () => ouvrirCommande(p));

        zone.appendChild(carte);
    });
}

async function ouvrirCommande(p) {
    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
        location.href = "index.html?connexion=1&retour=" +
            encodeURIComponent("vitrine.html?b=" + slug);
        return;
    }

    const { data: profil } = await sb.from("profils").select("role,nom").maybeSingle();

    if (!profil || profil.role !== "acheteur") {
        alert("⚠️ Seuls les comptes acheteurs peuvent commander. Connectez-vous avec un compte acheteur.");
        return;
    }

    ouvrirFormulaire(p, profil.nom);
}

function ouvrirFormulaire(p, nom) {
    choisi = p;
    $("c-client").value = nom || "";
    $("c-produit").textContent = p.nom + " — " + prix(p.prix);
    $("c-quantite").value = "1";
    $("c-quantite").max = Math.min(p.stock, 20);

    /* Modes de paiement proposés par la boutique */
    const choix = $("c-paiement");
    choix.innerHTML = "";

    const livraison = document.createElement("option");
    livraison.value = "livraison";
    livraison.textContent = "💵 Payer à la livraison";
    choix.appendChild(livraison);

    if (boutique.paiement_mobile) {
        const mobile = document.createElement("option");
        mobile.value = "mobile_money";
        mobile.textContent = "📱 Mobile money (" + boutique.paiement_operateur + ")";
        choix.appendChild(mobile);
    }

    $("c-paiement-bloc").hidden = !boutique.paiement_mobile;

    $("commande").classList.add("active");
}

function fermerCommande() {
    $("commande").classList.remove("active");
}

async function envoyerCommande() {
    const quantite = Number($("c-quantite").value);
    const client = $("c-client").value.trim();
    const telephone = $("c-telephone").value.trim();

    if (!Number.isInteger(quantite) || quantite < 1 || quantite > Math.min(choisi.stock, 20)) {
        alert("⚠️ Quantité invalide (maximum " + Math.min(choisi.stock, 20) + ").");
        return;
    }

    if (client === "") { alert("⚠️ Entrez votre nom."); return; }

    if (telephone.length < 6) { alert("⚠️ Entrez un numéro de téléphone valide."); return; }

    const bt = $("c-bouton");
    bt.disabled = true;

    const mode = $("c-paiement").value || "livraison";

    const { data: idCommande, error } = await sb.rpc("commander_vitrine", {
        p_slug: slug,
        p_produit: choisi.id,
        p_quantite: quantite,
        p_client: client,
        p_telephone: telephone,
        p_mode: mode
    });

    bt.disabled = false;

    if (error) { alert("⚠️ " + error.message); return; }

    $("c-client").value = "";
    $("c-telephone").value = "";
    fermerCommande();

    /* Mobile money : on passe directement aux instructions de paiement */
    if (mode === "mobile_money" && idCommande) {
        location.href = "index.html?payer=" + encodeURIComponent(idCommande);
        return;
    }

    alert("✅ Commande envoyée ! Vous paierez à la livraison. " +
        "Retrouvez-la dans Mon compte, sur la page d'accueil.");

    charger();
}

charger();
