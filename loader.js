
(function () {
    var KEY = "zakatmate_loader_seen";
    var MIN_TIME = 1800;   

    try {
        if (sessionStorage.getItem(KEY)) return;
        sessionStorage.setItem(KEY, "1");
    } catch (e) {   }

    var start = Date.now();
    var done = false;

    var overlay = document.createElement("div");
    overlay.id = "pageLoader";
    overlay.setAttribute("role", "status");
    overlay.innerHTML =
        '<div class="loader-glow"></div>' +
        '<div class="loader-moon">🌙</div>' +
        '<div class="loader-logo">ZakatMate</div>' +
        '<p class="loader-text">Lagi nyiapin halaman buat kamu...</p>' +
        '<div class="loader-bar"><span></span></div>';

    document.documentElement.appendChild(overlay);
    document.documentElement.classList.add("is-loading");

    function finish() {
        if (done) return;
        done = true;
        var wait = Math.max(0, MIN_TIME - (Date.now() - start));
        setTimeout(function () {
            overlay.classList.add("hide");
            document.documentElement.classList.remove("is-loading");
            setTimeout(function () { overlay.remove(); }, 600);
        }, wait);
    }

    if (document.readyState === "complete") {
        finish();
    } else {
        window.addEventListener("load", finish);
        setTimeout(finish, 6000); 
    }
})();
