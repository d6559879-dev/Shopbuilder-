/* =====================================
   DUKANI — place de marché
   (accueil public + espace acheteur)
===================================== */

const SUPABASE_URL = "https://aowfjpaclhrmmhpuxauq.supabase.co";
const SUPABASE_CLE = "sb_publishable_bHKXQAMowU0qoVOp5RqlmA_Qm_LrKC6";

/* Arrivée depuis le lien de confirmation d'un email ? (à lire avant que Supabase efface l'adresse) */
const viensDeConfirmation = /type=(signup|email)/.test(location.hash);

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_CLE);

const $ = id => document.getElementById(id);
const ouvrir = id => $(id).classList.add("active");
const fermer = id => $(id).classList.remove("active");
const params = new URLSearchParams(location.search);

let utilisateur = null;
let role = null;
let nomProfil = "";
let modeInscription = false;
let minuteurRecherche = null;
let categorieActive = "";


/* ---------- Outils ---------- */

function ligne(parent, tag, texte) {
    const el = document.createElement(tag);
    el.textContent = texte;
    parent.appendChild(el);
    return el;
}

function urlPhoto(chemin) {
    return SUPABASE_URL + "/storage/v1/object/public/produits/" +
        chemin.split("/").map(encodeURIComponent).join("/");
}


/* ---------- Boutiques ---------- */

/* ---------- Onglets et barre du bas ---------- */

function afficherOnglet(nom) {
    $("onglet-accueil").hidden = nom !== "accueil";
    $("onglet-boutiques").hidden = nom !== "boutiques";

    document.querySelectorAll(".fb-barre button[data-onglet]").forEach(b => {
        b.classList.toggle("actif", b.getAttribute("data-onglet") === nom);
    });

    window.scrollTo(0, 0);
}

function ouvrirRecherche() {
    afficherOnglet("boutiques");
    $("recherche").focus();
}

function ouvrirMessages() {
    alert("💬 La messagerie entre vendeurs et acheteurs arrive bientôt.");
}

function ouvrirCommandesOnglet() {
    if (!utilisateur) { ouvrirAuth(); return; }

    if (role === "vendeur") {
        location.href = "vendeur.html";
        return;
    }

    ouvrirMesCommandes();
}

/* Ce qui dépend du type de compte (bouton ＋ et carte « Créer un statut » pour les vendeurs) */

function majInterfaceRole() {
    $("btn-creer").hidden = role !== "vendeur";
    afficherRangeeStatuts();
    afficherFil();
}


/* ---------- Publications des boutiques (fil d'actualité) ---------- */

const REACTIONS_PUB = [
    { cle: "coeur", emoji: "❤️" },
    { cle: "pouce", emoji: "👍" },
    { cle: "feu", emoji: "🔥" },
    { cle: "amour", emoji: "😍" }
];

let publications = [];
let chargementFil = false;
let filComplet = false;
let filEnErreur = false;

function tempsEcoule(iso) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return "il y a " + minutes + " min";
    if (minutes < 1440) return "il y a " + Math.floor(minutes / 60) + " h";
    return "il y a " + Math.floor(minutes / 1440) + " j";
}

async function chargerFil(suite) {
    if (chargementFil) return;
    chargementFil = true;

    const avant = suite && publications.length
        ? publications[publications.length - 1].created_at : null;

    const { data, error } = await sb.rpc("fil_publications", {
        p_avant: avant,
        p_limite: 10
    });

    chargementFil = false;
    filEnErreur = !!error || !Array.isArray(data);

    if (!filEnErreur) {
        if (!suite) publications = [];
        publications = publications.concat(data);
        filComplet = data.length < 10;
    }

    afficherFil();
}

function afficherFil() {
    const liste = $("liste-fil");
    liste.textContent = "";

    if (filEnErreur && publications.length === 0) {
        ligne(liste, "p", "⚠️ Impossible de charger les publications.").className = "fil-vide";
    } else if (publications.length === 0) {
        ligne(liste, "p", "Aucune publication pour le moment. Les boutiques partageront bientôt leurs nouveautés.").className = "fil-vide";
    }

    publications.forEach(p => liste.appendChild(creerCartePublication(p)));

    $("plus-fil").hidden = filComplet || publications.length === 0;
}

function remplacerCarte(p) {
    const ancienne = document.getElementById("pub-" + p.id);
    if (ancienne) ancienne.replaceWith(creerCartePublication(p));
}

function creerCartePublication(p) {
    const carte = document.createElement("article");
    carte.className = "publication";
    carte.id = "pub-" + p.id;

    const allerBoutique = () => { location.href = "vitrine.html?b=" + encodeURIComponent(p.slug); };

    /* En-tête : boutique et date */

    const tete = document.createElement("div");
    tete.className = "pub-tete";

    const avatar = document.createElement("button");
    avatar.type = "button";
    avatar.className = "pub-avatar";
    avatar.setAttribute("aria-label", "Voir la boutique " + p.nom);
    avatar.addEventListener("click", allerBoutique);

    if (p.logo) {
        const logo = document.createElement("img");
        logo.src = urlPhoto(p.logo);
        logo.alt = "";
        avatar.appendChild(logo);
    } else {
        avatar.textContent = "🏪";
    }

    const qui = document.createElement("div");
    qui.className = "pub-qui";

    const nom = document.createElement("button");
    nom.type = "button";
    nom.textContent = p.nom;
    nom.addEventListener("click", allerBoutique);

    const date = document.createElement("small");
    date.textContent = tempsEcoule(p.created_at);

    qui.appendChild(nom);
    qui.appendChild(date);
    tete.appendChild(avatar);
    tete.appendChild(qui);
    carte.appendChild(tete);

    /* Texte */

    if (p.texte) {
        const texte = document.createElement("p");
        texte.className = "pub-texte";
        texte.textContent = p.texte;
        carte.appendChild(texte);
    }

    /* Photos */

    if (Array.isArray(p.images) && p.images.length) {
        const grille = document.createElement("div");
        grille.className = "pub-images g" + p.images.length;

        p.images.forEach(chemin => {
            const img = document.createElement("img");
            img.src = urlPhoto(chemin);
            img.alt = "Photo de " + p.nom;
            img.loading = "lazy";
            grille.appendChild(img);
        });

        carte.appendChild(grille);
    }

    /* Réactions */

    const barre = document.createElement("div");
    barre.className = "pub-reactions";

    REACTIONS_PUB.forEach(r => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pub-reaction" + (p.ma_reaction === r.cle ? " actif" : "");
        b.setAttribute("aria-label", "Réagir " + r.emoji);
        b.textContent = r.emoji + " " + ((p.reactions && p.reactions[r.cle]) || 0);
        b.addEventListener("click", () => reagirPublication(p, r.cle));
        barre.appendChild(b);
    });

    carte.appendChild(barre);

    /* Actions */

    const actions = document.createElement("div");
    actions.className = "pub-actions";

    const commenter = document.createElement("button");
    commenter.type = "button";
    commenter.textContent = "💬 Commenter (" + (p.nb_commentaires || 0) + ")";
    commenter.addEventListener("click", () => ouvrirCommentairesPub(p));

    const voir = document.createElement("button");
    voir.type = "button";
    voir.textContent = "🏪 Voir la boutique";
    voir.addEventListener("click", allerBoutique);

    actions.appendChild(commenter);
    actions.appendChild(voir);
    carte.appendChild(actions);

    return carte;
}

async function reagirPublication(p, cle) {
    if (!utilisateur) { ouvrirAuth(); return; }

    const avant = { reactions: Object.assign({}, p.reactions), ma: p.ma_reaction };

    /* Mise à jour immédiate, annulée en cas d'erreur */

    p.reactions = Object.assign({}, p.reactions);

    if (p.ma_reaction) {
        p.reactions[p.ma_reaction] = Math.max(0, (p.reactions[p.ma_reaction] || 0) - 1);
    }

    if (p.ma_reaction === cle) {
        p.ma_reaction = null;
    } else {
        p.reactions[cle] = (p.reactions[cle] || 0) + 1;
        p.ma_reaction = cle;
    }

    remplacerCarte(p);

    const { error } = await sb.rpc("reagir_publication", {
        p_publication: p.id,
        p_reaction: cle
    });

    if (error) {
        p.reactions = avant.reactions;
        p.ma_reaction = avant.ma;
        remplacerCarte(p);
        alert("⚠️ " + error.message);
    }
}


/* ---------- Commentaires d'une publication ---------- */

let publicationOuverte = null;

async function ouvrirCommentairesPub(p) {
    publicationOuverte = p;
    $("champ-commentaire-pub").value = "";
    ouvrir("commentaires-pub");
    await chargerCommentairesPub();
}

async function chargerCommentairesPub() {
    const liste = $("liste-commentaires-pub");
    const p = publicationOuverte;
    if (!p) return;

    const { data, error } = await sb.rpc("publication_commentaires", {
        p_publication: p.id
    });

    liste.textContent = "";

    if (error || !Array.isArray(data)) {
        ligne(liste, "p", "⚠️ Impossible de charger les commentaires.").className = "fil-vide";
        return;
    }

    if (data.length === 0) {
        ligne(liste, "p", "Aucun commentaire. Soyez le premier !").className = "fil-vide";
    }

    data.forEach(c => {
        const ligneCommentaire = document.createElement("div");
        ligneCommentaire.className = "commentaire-pub";

        const haut = document.createElement("div");
        haut.className = "commentaire-haut";

        const auteur = document.createElement("strong");
        auteur.textContent = c.auteur;
        haut.appendChild(auteur);

        if (c.par_boutique) {
            const etiquette = document.createElement("span");
            etiquette.className = "etiquette-boutique";
            etiquette.textContent = "🏪 Boutique";
            haut.appendChild(etiquette);
        }

        const quand = document.createElement("small");
        quand.textContent = tempsEcoule(c.created_at);
        haut.appendChild(quand);

        if (c.peut_supprimer) {
            const sup = document.createElement("button");
            sup.type = "button";
            sup.textContent = "🗑️";
            sup.setAttribute("aria-label", "Supprimer ce commentaire");
            sup.addEventListener("click", () => supprimerCommentairePub(c.id));
            haut.appendChild(sup);
        }

        const texte = document.createElement("p");
        texte.textContent = c.texte;

        ligneCommentaire.appendChild(haut);
        ligneCommentaire.appendChild(texte);
        liste.appendChild(ligneCommentaire);
    });

    if (data.length < 50) p.nb_commentaires = data.length;
    remplacerCarte(p);

    liste.scrollTop = liste.scrollHeight;
}

async function envoyerCommentairePub() {
    if (!utilisateur) {
        fermer("commentaires-pub");
        ouvrirAuth();
        return;
    }

    const champ = $("champ-commentaire-pub");
    const texte = champ.value.trim();

    if (!texte || !publicationOuverte) return;

    const { error } = await sb.rpc("commenter_publication", {
        p_publication: publicationOuverte.id,
        p_texte: texte
    });

    if (error) { alert("⚠️ " + error.message); return; }

    champ.value = "";
    await chargerCommentairesPub();
}

async function supprimerCommentairePub(id) {
    if (!confirm("Supprimer ce commentaire ?")) return;

    const { error } = await sb.rpc("supprimer_commentaire_publication", { p_id: id });

    if (error) { alert("⚠️ " + error.message); return; }

    await chargerCommentairesPub();
}

$("champ-commentaire-pub").addEventListener("keydown", function (e) {
    if (e.key === "Enter") envoyerCommentairePub();
});


/* ---------- Nouveaux arrivages (statuts) ---------- */

let groupesStatuts = [];

function afficherRangeeStatuts() {
    const zone = $("zone-statuts");
    const rangee = $("rangee-statuts");
    const vendeur = role === "vendeur";

    rangee.textContent = "";

    if (!vendeur && groupesStatuts.length === 0) {
        zone.hidden = true;
        return;
    }

    /* Première carte : créer un statut (vendeurs) */

    if (vendeur) {
        const creer = document.createElement("button");
        creer.type = "button";
        creer.className = "story-carte story-creer";
        creer.setAttribute("aria-label", "Créer un statut");

        const haut = document.createElement("div");
        haut.className = "story-haut";
        haut.textContent = "🏪";

        const plus = document.createElement("div");
        plus.className = "story-plus";
        plus.textContent = "+";

        const texte = document.createElement("span");
        texte.className = "story-texte";
        texte.textContent = "Créer un statut";

        creer.appendChild(haut);
        creer.appendChild(plus);
        creer.appendChild(texte);
        creer.addEventListener("click", () => { location.href = "vendeur.html?statut=1"; });

        rangee.appendChild(creer);
    }

    groupesStatuts.forEach((groupe, n) => {
        const carte = document.createElement("button");
        carte.type = "button";
        carte.className = "story-carte";
        carte.setAttribute("aria-label", "Nouveaux arrivages de " + groupe.nom);

        if (window.statutsToutVus && window.statutsToutVus(groupe)) {
            carte.classList.add("vu");
        }

        const fond = document.createElement("img");
        fond.className = "story-fond";
        fond.src = urlPhoto(groupe.statuts[groupe.statuts.length - 1].image_path);
        fond.alt = "";
        fond.loading = "lazy";

        const avatar = document.createElement("div");
        avatar.className = "story-avatar";

        if (groupe.logo) {
            const logo = document.createElement("img");
            logo.src = urlPhoto(groupe.logo);
            logo.alt = "";
            avatar.appendChild(logo);
        } else {
            avatar.textContent = "🏪";
        }

        const nom = document.createElement("span");
        nom.className = "story-nom";
        nom.textContent = groupe.nom;

        carte.appendChild(fond);
        carte.appendChild(avatar);
        carte.appendChild(nom);

        carte.addEventListener("click", () => {
            window.ouvrirStatuts(groupesStatuts, n, {
                urlPhoto: urlPhoto,
                voirBoutique: true,
                quandFerme: afficherRangeeStatuts,
                rpc: (nomFonction, args) => sb.rpc(nomFonction, args),
                connecte: () => !!utilisateur,
                demanderConnexion: ouvrirAuth
            });
        });

        rangee.appendChild(carte);
    });

    zone.hidden = false;
}

async function chargerStatuts() {
    const { data, error } = await sb.rpc("marche_statuts");

    groupesStatuts = !error && Array.isArray(data) ? data : [];
    afficherRangeeStatuts();
}


async function chargerBoutiques() {
    const terme = $("recherche").value.trim().slice(0, 60);
    const zone = $("liste-boutiques");

    const { data, error } = await sb.rpc("marche_boutiques", {
        p_recherche: terme || null,
        p_categorie: categorieActive || null
    });

    zone.innerHTML = "";

    if (error) {
        ligne(zone, "p", "⚠️ Impossible de charger les boutiques. Réessayez.");
        return;
    }

    if (!data || data.length === 0) {
        const filtre = terme || categorieActive;
        ligne(zone, "p", filtre ? "Aucune boutique trouvée pour cette recherche." : "Aucune boutique pour le moment.");
        return;
    }

    data.forEach(b => {
        const carte = document.createElement("a");
        carte.className = "produit-item carte-boutique";
        carte.href = "vitrine.html?b=" + encodeURIComponent(b.slug);

        const cheminPhoto = b.logo || b.apercu;

        if (cheminPhoto) {
            const photo = document.createElement("img");
            photo.src = urlPhoto(cheminPhoto);
            photo.alt = b.nom;
            photo.className = "photo-boutique";
            photo.loading = "lazy";
            carte.appendChild(photo);
        } else {
            ligne(carte, "div", "🏪").className = "sans-photo";
        }

        ligne(carte, "h3", b.nom);
        if (b.description) ligne(carte, "p", b.description);
        ligne(carte, "p", "📦 " + b.nb + (b.nb > 1 ? " produits" : " produit"));
        if (Array.isArray(b.categories) && b.categories.length) {
            ligne(carte, "p", "🏷️ " + b.categories.join(" · ")).className = "categories-boutique";
        }

        zone.appendChild(carte);
    });
}

/* Filtres par catégorie */

$("filtres").addEventListener("click", function (e) {
    const bouton = e.target.closest(".filtre");
    if (!bouton) return;

    categorieActive = bouton.getAttribute("data-cat") || "";

    this.querySelectorAll(".filtre").forEach(b => {
        const actif = b === bouton;
        b.classList.toggle("actif", actif);
        b.setAttribute("aria-pressed", actif ? "true" : "false");
    });

    chargerBoutiques();
});

$("recherche").addEventListener("input", function () {
    clearTimeout(minuteurRecherche);
    minuteurRecherche = setTimeout(chargerBoutiques, 300);
});


/* ---------- Connexion acheteur ---------- */

function erreurAuth(message, succes) {
    const zone = $("a-erreur");
    zone.textContent = message || "";
    zone.style.color = succes ? "var(--succes)" : "";
}

function ouvrirAuth() { ouvrir("auth"); }

function basculerAuth() {
    modeInscription = !modeInscription;

    $("a-champ-nom").hidden = !modeInscription;
    $("a-champ-confirm").hidden = !modeInscription;

    $("a-titre").textContent = modeInscription ? "Créer un compte acheteur" : "Connexion acheteur";
    $("a-sous").textContent = modeInscription
        ? "Quelques infos pour commander facilement."
        : "Connectez-vous pour commander.";
    $("a-bouton").textContent = modeInscription ? "Créer mon compte" : "Se connecter";
    $("a-bascule").textContent = modeInscription ? "J'ai déjà un compte" : "Créer un compte acheteur";
    $("a-mdp").autocomplete = modeInscription ? "new-password" : "current-password";

    erreurAuth("");
}

function motDePasseFort(m) {
    return m.length >= 8 && /[A-Za-z]/.test(m) && /\d/.test(m);
}

function traduire(e) {
    const m = (e && e.message) || "";

    if (/invalid login/i.test(m)) return "Email ou mot de passe incorrect.";
    if (/not confirmed/i.test(m)) return "Confirmez d'abord votre email (vérifiez votre boîte de réception).";
    if (e && (e.status === 429 || /rate limit/i.test(m))) return "Trop de tentatives. Réessayez dans quelques minutes.";
    if (/password/i.test(m)) return "Mot de passe refusé : choisissez-en un plus solide.";

    return "Une erreur est survenue. Réessayez.";
}

async function validerAuth() {
    const email = $("a-email").value.trim().toLowerCase();
    const mdp = $("a-mdp").value;
    const nom = $("a-nom").value.trim();

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120) {
        erreurAuth("Entrez une adresse email valide.");
        return;
    }

    if (mdp.length > 200) { erreurAuth("Mot de passe trop long."); return; }

    if (modeInscription) {
        if (nom === "" || nom.length > 60) {
            erreurAuth("Entrez votre nom (60 caractères maximum).");
            return;
        }

        if (!motDePasseFort(mdp)) {
            erreurAuth("Le mot de passe doit avoir 8 caractères minimum, avec au moins une lettre et un chiffre.");
            return;
        }

        if (mdp !== $("a-confirm").value) {
            erreurAuth("Les deux mots de passe ne sont pas identiques.");
            return;
        }
    }

    const bt = $("a-bouton");
    bt.disabled = true;

    try {
        if (modeInscription) {
            const { data, error } = await sb.auth.signUp({
                email: email,
                password: mdp,
                options: {
                    data: { nom: nom, role: "acheteur" },
                    emailRedirectTo: location.origin + location.pathname + location.search
                }
            });

            if (error) { erreurAuth(traduire(error)); return; }

            if (!data.session) {
                basculerAuth();
                erreurAuth("✅ Compte créé. Confirmez votre email, puis connectez-vous.", true);
            }
        } else {
            const { error } = await sb.auth.signInWithPassword({
                email: email,
                password: mdp
            });

            if (error) erreurAuth(traduire(error));
        }
    } finally {
        bt.disabled = false;
    }
}


/* ---------- Session ---------- */

async function ouvrirSession(user) {
    utilisateur = user;

    const { data: profil } = await sb.from("profils")
        .select("role,nom").maybeSingle();

    role = profil ? profil.role : "acheteur";
    nomProfil = profil ? profil.nom : "";
    majInterfaceRole();

    ["a-nom", "a-email", "a-mdp", "a-confirm"].forEach(id => { $(id).value = ""; });
    erreurAuth("");
    if (modeInscription) basculerAuth();
    fermer("auth");

    /* Retour vers la boutique où l'achat a commencé */

    /* Vendeur qui vient de confirmer son email → son espace */

    if (role === "vendeur" && viensDeConfirmation) {
        location.replace("vendeur.html");
        return;
    }

    /* Arrivée depuis une vitrine après une commande en mobile money */

    const aPayer = params.get("payer");

    if (role === "acheteur" && aPayer && /^[0-9a-f-]{36}$/i.test(aPayer)) {
        history.replaceState(null, "", location.pathname);
        ouvrirPaiement(aPayer);
        return;
    }

    const retour = params.get("retour");

    if (role === "acheteur" && retour &&
        /^vitrine\.html\?b=[a-z0-9-]{3,60}$/.test(retour)) {
        location.href = retour;
    }
}

function ouvrirCompte() {
    if (!utilisateur) { ouvrirAuth(); return; }

    $("c-nom").textContent = nomProfil || "-";
    $("c-email").textContent = utilisateur.email || "-";
    $("c-acheteur").hidden = role === "vendeur";
    $("c-vendeur").hidden = role !== "vendeur";

    ouvrir("compte");
}

async function deconnexion() {
    await sb.auth.signOut();

    utilisateur = null;
    role = null;
    nomProfil = "";
    majInterfaceRole();

    ["compte", "mes-commandes"].forEach(fermer);
    $("liste-mes-commandes").innerHTML = "";
}

sb.auth.onAuthStateChange(function (evenement, session) {
    if (session && (!utilisateur || utilisateur.id !== session.user.id)) {
        setTimeout(() => ouvrirSession(session.user), 0);
    } else if (!session && utilisateur) {
        utilisateur = null;
        role = null;
        majInterfaceRole();
    }
});


/* ---------- Paiement mobile money ---------- */

function montant(n, devise) {
    return Number(n).toLocaleString("fr-FR") + " " + (devise === "USD" ? "$" : "FC");
}

function textePaiement(c) {
    if (c.mode_paiement === "mobile_money") {
        if (c.statut_paiement === "paye") return "✅ Payé par mobile money";
        if (c.statut_paiement === "verification") {
            return "🔎 Paiement envoyé, en cours de vérification par le vendeur";
        }
        return "💳 Mobile money : à payer";
    }

    return c.statut_paiement === "paye" ? "✅ Payé" : "💵 À payer à la livraison";
}

let commandeAPayer = null;

async function ouvrirPaiement(id) {
    const { data, error } = await sb.rpc("infos_paiement", { p_commande: id });

    if (error || !data) {
        alert("⚠️ Instructions de paiement indisponibles pour cette commande.");
        return;
    }

    commandeAPayer = id;

    $("p-boutique").textContent = "Commande chez " + (data.boutique || "la boutique");
    $("p-montant").textContent = montant(data.montant, data.devise);
    $("p-operateur").textContent = "par " + data.operateur + " au numéro :";
    $("p-numero").textContent = data.numero;
    $("p-reference").value = data.reference || "";

    fermer("mes-commandes");
    ouvrir("paiement");
}

async function copierNumeroPaiement() {
    try {
        await navigator.clipboard.writeText($("p-numero").textContent);
        alert("📋 Numéro copié.");
    } catch (e) {
        alert("Copiez le numéro affiché à l'écran.");
    }
}

async function declarerPaiement() {
    const reference = $("p-reference").value.trim();

    if (reference.length < 3) {
        alert("⚠️ Entrez la référence de la transaction (au moins 3 caractères).");
        return;
    }

    const { error } = await sb.rpc("declarer_paiement", {
        p_commande: commandeAPayer,
        p_reference: reference
    });

    if (error) { alert("⚠️ " + error.message); return; }

    fermer("paiement");
    alert("✅ Merci ! Le vendeur va vérifier votre paiement.");
    ouvrirMesCommandes();
}


/* ---------- Mes commandes ---------- */

async function ouvrirMesCommandes() {
    const liste = $("liste-mes-commandes");
    const icones = { "en attente": "⏳", "livrée": "✅", "annulée": "❌" };

    const { data, error } = await sb.from("commandes")
        .select("*").order("created_at", { ascending: false });

    liste.innerHTML = "";

    if (error) {
        ligne(liste, "p", "⚠️ Impossible de charger vos commandes.");
    } else if (!data || data.length === 0) {
        ligne(liste, "p", "Aucune commande pour le moment.").style.color = "var(--encre-douce)";
    } else {
        data.forEach(c => {
            const carte = document.createElement("div");
            carte.className = "produit-item";

            ligne(carte, "h3", c.quantite + " × " + c.nom_produit);
            ligne(carte, "p", "🏪 " + (c.boutique_nom || "Boutique") + " · " +
                new Date(c.created_at).toLocaleDateString("fr-FR"));
            ligne(carte, "p", icones[c.statut] + " " + c.statut);
            ligne(carte, "p", textePaiement(c));
            ligne(carte, "strong", montant(c.total, c.devise)).className = "produit-prix";

            if (c.mode_paiement === "mobile_money" && c.statut === "en attente" &&
                c.statut_paiement !== "paye") {
                const actions = document.createElement("div");
                actions.className = "actions-produit";

                const bt = document.createElement("button");
                bt.type = "button";
                bt.textContent = c.statut_paiement === "verification"
                    ? "✏️ Corriger la référence" : "💳 Payer maintenant";
                bt.addEventListener("click", () => ouvrirPaiement(c.id));

                actions.appendChild(bt);
                carte.appendChild(actions);
            }

            liste.appendChild(carte);
        });
    }

    fermer("compte");
    ouvrir("mes-commandes");
}

["a-nom", "a-email", "a-mdp", "a-confirm"].forEach(id => {
    $(id).addEventListener("keydown", e => {
        if (e.key === "Enter") validerAuth();
    });
});


/* ---------- Démarrage ---------- */

chargerBoutiques();
chargerStatuts();
chargerFil(false);

sb.auth.getSession().then(({ data }) => {
    if (!data.session && params.get("connexion")) ouvrirAuth();
});
