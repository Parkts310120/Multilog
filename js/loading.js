const Loading = (() => {
    let overlay;
    let textoElemento;

    function criarOverlay() {
        overlay = document.createElement("div");
        overlay.className = "loading-overlay";

        overlay.innerHTML = `
            <div class="loading-box">
                <div class="loading-spinner"></div>
                <span>Carregando...</span>
            </div>
        `;

        textoElemento = overlay.querySelector("span");
        document.body.appendChild(overlay);
    }

    function show(texto = "Carregando...") {
        if (!overlay) {
            criarOverlay();
        }

        textoElemento.textContent = texto;
        overlay.classList.add("ativo");
    }

    function hide() {
        if (!overlay) return;

        overlay.classList.remove("ativo");
    }

    return {
        show,
        hide
    };
})();

window.Loading = Loading;
