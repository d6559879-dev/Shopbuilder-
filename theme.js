/* Apparence : automatique (réglage de l'appareil) / clair / sombre.
   Le choix de l'utilisateur remplace toujours celui de son téléphone.
   Ce fichier fournit aussi la fenêtre « Paramètres » des vitrines et de l'espace vendeur. */

(function () {
    var CLE = "dukani_theme";
    var CHOIX = [
        { mode: "auto", icone: "contrast", nom: "Automatique" },
        { mode: "clair", icone: "sun", nom: "Clair" },
        { mode: "sombre", icone: "moon", nom: "Sombre" }
    ];
    var NS = "http://www.w3.org/2000/svg";

    function lire() {
        try {
            var m = localStorage.getItem(CLE);
            for (var i = 0; i < CHOIX.length; i++) if (CHOIX[i].mode === m) return m;
        } catch (e) {}
        return "auto";
    }

    function marquer(mode) {
        var boutons = document.querySelectorAll(".choix-theme button");
        for (var i = 0; i < boutons.length; i++) {
            var actif = boutons[i].getAttribute("data-mode") === mode;
            boutons[i].classList.toggle("actif", actif);
            boutons[i].setAttribute("aria-pressed", actif ? "true" : "false");
        }
    }

    function appliquer(mode) {
        var r = document.documentElement;
        if (mode === "clair") r.setAttribute("data-theme", "light");
        else if (mode === "sombre") r.setAttribute("data-theme", "dark");
        else r.removeAttribute("data-theme");
        marquer(mode);
    }

    window.choisirTheme = function (mode) {
        try { localStorage.setItem(CLE, mode); } catch (e) {}
        appliquer(mode);
    };

    function iconeSvg(nom) {
        var svg = document.createElementNS(NS, "svg");
        var use = document.createElementNS(NS, "use");
        svg.setAttribute("class", "ic");
        svg.setAttribute("aria-hidden", "true");
        use.setAttribute("href", "#ic-" + nom);
        svg.appendChild(use);
        return svg;
    }

    window.creerChoixTheme = function () {
        var groupe = document.createElement("div");
        groupe.className = "choix-theme";

        CHOIX.forEach(function (c) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("data-mode", c.mode);

            var ic = document.createElement("span");
            ic.className = "choix-icone";
            ic.appendChild(iconeSvg(c.icone));

            var tx = document.createElement("span");
            tx.textContent = c.nom;

            b.appendChild(ic);
            b.appendChild(tx);
            b.addEventListener("click", function () { window.choisirTheme(c.mode); });
            groupe.appendChild(b);
        });

        return groupe;
    };

    window.marquerTheme = function () { marquer(lire()); };

    /* ---------- Langue (FR / EN) — système simple sans modules ES ---------- */

    var CLE_LANGUE = "dukani-locale";

    var TRADUCTIONS = {
        fr: {
            "nav.home": "Accueil",
            "nav.shops": "Boutiques",
            "nav.messages": "Messages",
            "nav.orders": "Commandes",
            "nav.account": "Compte",
            "home.forYou": "Pour vous",
            "home.following": "Suivis",
            "shops.becomeSeller": "Vous vendez ?",
            "shops.createShopDesc": "Créez votre boutique gratuitement et touchez de nouveaux clients.",
            "shops.createShop": "Ouvrir ma boutique",
            "menu.shortcuts": "Vos raccourcis",
            "menu.myShop": "Ma boutique",
            "menu.publish": "Publier",
            "menu.arrivals": "Arrivages",
            "menu.messages": "Messages",
            "menu.shops": "Boutiques",
            "menu.orders": "Commandes",
            "menu.sellerDashboard": "Tableau de bord vendeur",
            "menu.marketplace": "Place de marché",
            "menu.allShops": "Toutes les boutiques",
            "menu.settings": "Paramètres et confidentialité",
            "menu.appearance": "Apparence",
            "menu.language": "Langue / Language",
            "menu.chooseLanguage": "Choisissez la langue de l'application.",
            "menu.privacy": "Confidentialité",
            "menu.about": "À propos de Dukani",
            "menu.logout": "Déconnexion",
            "menu.login": "Se connecter",
            "menu.loginHint": "Connectez-vous ou créez un compte",
            "menu.help": "Aide et assistance",
            "common.themeAuto": "Automatique suit le réglage de votre téléphone. Clair et Sombre le remplacent."
        },
        en: {
            "nav.home": "Home",
            "nav.shops": "Shops",
            "nav.messages": "Messages",
            "nav.orders": "Orders",
            "nav.account": "Account",
            "home.forYou": "For you",
            "home.following": "Following",
            "shops.becomeSeller": "Are you a seller?",
            "shops.createShopDesc": "Create your shop for free and reach new customers.",
            "shops.createShop": "Open my shop",
            "menu.shortcuts": "Your shortcuts",
            "menu.myShop": "My shop",
            "menu.publish": "Publish",
            "menu.arrivals": "New arrivals",
            "menu.messages": "Messages",
            "menu.shops": "Shops",
            "menu.orders": "Orders",
            "menu.sellerDashboard": "Seller dashboard",
            "menu.marketplace": "Marketplace",
            "menu.allShops": "All shops",
            "menu.settings": "Settings & privacy",
            "menu.appearance": "Appearance",
            "menu.language": "Language",
            "menu.chooseLanguage": "Choose the app language.",
            "menu.privacy": "Privacy",
            "menu.about": "About Dukani",
            "menu.logout": "Log out",
            "menu.login": "Log in",
            "menu.loginHint": "Log in or create an account",
            "menu.help": "Help & support",
            "common.themeAuto": "Automatic follows your phone setting. Light and Dark override it."
        }
    };

    function lireLangue() {
        try {
            var l = localStorage.getItem(CLE_LANGUE);
            if (l === "fr" || l === "en") return l;
        } catch (e) {}
        return "fr";
    }

    window.t = function (cle) {
        var lang = lireLangue();
        var dict = TRADUCTIONS[lang] || TRADUCTIONS.fr;
        return dict[cle] || (TRADUCTIONS.fr[cle] || cle);
    };

    function appliquerTraductionsDom() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var cle = el.getAttribute("data-i18n");
            if (cle) el.textContent = window.t(cle);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var cle = el.getAttribute("data-i18n-placeholder");
            if (cle) el.placeholder = window.t(cle);
        });
    }

    function marquerLangue(code) {
        var boutons = document.querySelectorAll(".choix-langue button");
        for (var i = 0; i < boutons.length; i++) {
            var actif = boutons[i].getAttribute("data-locale") === code;
            boutons[i].classList.toggle("actif", actif);
            boutons[i].setAttribute("aria-pressed", actif ? "true" : "false");
        }
    }

    window.creerChoixLangue = function () {
        var groupe = document.createElement("div");
        groupe.className = "choix-theme choix-langue";

        var langues = [
            { code: "fr", nom: "Français" },
            { code: "en", nom: "English" }
        ];
        var actuelle = lireLangue();

        langues.forEach(function (l) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("data-locale", l.code);
            b.textContent = l.nom;
            if (l.code === actuelle) {
                b.classList.add("actif");
                b.setAttribute("aria-pressed", "true");
            } else {
                b.setAttribute("aria-pressed", "false");
            }
            b.addEventListener("click", function () {
                try { localStorage.setItem(CLE_LANGUE, l.code); } catch (e) {}
                document.documentElement.lang = l.code;
                marquerLangue(l.code);
                appliquerTraductionsDom();

                if (window.Dukani && window.Dukani.setLocale) {
                    try { window.Dukani.setLocale(l.code); } catch (e) {}
                }

                if (typeof construireMenu === "function") {
                    construireMenu();
                }
            });
            groupe.appendChild(b);
        });

        return groupe;
    };

    function creerFenetre() {
        if (document.getElementById("parametres")) return;

        var fenetre = document.createElement("div");
        fenetre.id = "parametres";
        fenetre.className = "fenetre";
        fenetre.addEventListener("click", function (e) {
            if (e.target === fenetre) window.fermerParametres();
        });

        var boite = document.createElement("div");
        boite.className = "creation-box";

        var fermer = document.createElement("button");
        fermer.className = "fermer";
        fermer.type = "button";
        fermer.textContent = "✕";
        fermer.setAttribute("aria-label", "Fermer");
        fermer.addEventListener("click", function () { window.fermerParametres(); });

        var titre = document.createElement("h2");
        titre.textContent = "Paramètres";

        var compte = document.createElement("div");
        compte.id = "parametres-compte";

        var sousTitre = document.createElement("label");
        sousTitre.textContent = "Apparence";

        var aide = document.createElement("p");
        aide.className = "sous-titre";
        aide.textContent = "Automatique suit le réglage de votre téléphone. " +
            "Clair et Sombre le remplacent.";

        boite.appendChild(fermer);
        boite.appendChild(titre);
        boite.appendChild(compte);
        boite.appendChild(sousTitre);
        boite.appendChild(window.creerChoixTheme());
        boite.appendChild(aide);
        fenetre.appendChild(boite);
        document.body.appendChild(fenetre);

        marquer(lire());
    }

    window.ouvrirParametres = function () {
        creerFenetre();
        marquer(lire());

        var zone = document.getElementById("parametres-compte");
        zone.textContent = "";
        if (window.remplirParametresCompte) window.remplirParametresCompte(zone);

        document.getElementById("parametres").classList.add("active");
    };

    window.fermerParametres = function () {
        var f = document.getElementById("parametres");
        if (f) f.classList.remove("active");
    };

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") window.fermerParametres();
    });

    var conteneurToast = null;

    function creerConteneurToast() {
        if (conteneurToast && conteneurToast.isConnected) return conteneurToast;
        conteneurToast = document.createElement("div");
        conteneurToast.id = "dukani-toasts";
        conteneurToast.className = "dukani-toasts";
        conteneurToast.setAttribute("role", "status");
        conteneurToast.setAttribute("aria-live", "polite");
        document.body.appendChild(conteneurToast);
        return conteneurToast;
    }

    window.afficherToast = function (message, type, duree) {
        if (!message) return;
        var texte = String(message).trim();
        var icone = "ℹ️";

        if (/^✅/.test(texte)) {
            icone = "✅";
            texte = texte.replace(/^✅\s*/, "");
            if (!type) type = "succes";
        } else if (/^⚠️/.test(texte)) {
            icone = "⚠️";
            texte = texte.replace(/^⚠️\s*/, "");
            if (!type) type = "attention";
        } else if (/^❌/.test(texte)) {
            icone = "❌";
            texte = texte.replace(/^❌\s*/, "");
            if (!type) type = "erreur";
        } else if (/^📋/.test(texte)) {
            icone = "📋";
            texte = texte.replace(/^📋\s*/, "");
            if (!type) type = "copie";
        } else if (/^🗑️/.test(texte)) {
            icone = "🗑️";
            texte = texte.replace(/^🗑️\s*/, "");
            if (!type) type = "danger";
        }

        var conteneur = creerConteneurToast();

        var toast = document.createElement("div");
        toast.className = "dukani-toast" + (type ? " toast-" + type : "");
        toast.setAttribute("role", "alert");

        var ic = document.createElement("span");
        ic.className = "toast-icone";
        ic.textContent = icone;

        var corps = document.createElement("div");
        corps.className = "toast-texte";
        corps.textContent = texte;

        var barre = document.createElement("div");
        barre.className = "toast-barre";

        var tempsMs = typeof duree === "number" ? duree : 3500;
        barre.style.animationDuration = tempsMs + "ms";

        toast.appendChild(ic);
        toast.appendChild(corps);
        toast.appendChild(barre);

        var ferme = false;
        function fermerToast() {
            if (ferme) return;
            ferme = true;
            toast.classList.add("toast-sortie");
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 250);
        }

        toast.addEventListener("click", fermerToast);
        var timer = setTimeout(fermerToast, tempsMs);

        toast.addEventListener("mouseenter", function () {
            clearTimeout(timer);
            barre.style.animationPlayState = "paused";
        });
        toast.addEventListener("mouseleave", function () {
            timer = setTimeout(fermerToast, 1500);
            barre.style.animationPlayState = "running";
        });

        conteneur.appendChild(toast);

        while (conteneur.children.length > 3) {
            conteneur.removeChild(conteneur.firstChild);
        }
    };

    var alertOriginal = window.alert;
    window.alert = function (msg) {
        if (document.body) {
            window.afficherToast(msg);
        } else {
            alertOriginal(msg);
        }
    };

    appliquer(lire());
    document.addEventListener("DOMContentLoaded", function () {
        creerFenetre();
        appliquer(lire());
        document.documentElement.lang = lireLangue();
        appliquerTraductionsDom();
    });
})();
