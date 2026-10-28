/* Thème : auto (réglage de l'appareil) → clair → sombre */

(function () {
    var CLE = "dukani_theme";
    var ORDRE = ["auto", "clair", "sombre"];
    var ICONES = { auto: "🌓", clair: "☀️", sombre: "🌙" };
    var NOMS = { auto: "Thème automatique", clair: "Thème clair", sombre: "Thème sombre" };

    function lire() {
        try {
            var m = localStorage.getItem(CLE);
            return ORDRE.indexOf(m) >= 0 ? m : "auto";
        } catch (e) {
            return "auto";
        }
    }

    function appliquer(mode) {
        var r = document.documentElement;
        if (mode === "clair") r.setAttribute("data-theme", "light");
        else if (mode === "sombre") r.setAttribute("data-theme", "dark");
        else r.removeAttribute("data-theme");

        var bouton = document.getElementById("bouton-theme");
        if (bouton) {
            bouton.textContent = ICONES[mode];
            bouton.title = NOMS[mode];
            bouton.setAttribute("aria-label", NOMS[mode] + " (toucher pour changer)");
        }
    }

    window.changerTheme = function () {
        var suivant = ORDRE[(ORDRE.indexOf(lire()) + 1) % ORDRE.length];
        try { localStorage.setItem(CLE, suivant); } catch (e) {}
        appliquer(suivant);
    };

    appliquer(lire());
    document.addEventListener("DOMContentLoaded", function () { appliquer(lire()); });
})();
