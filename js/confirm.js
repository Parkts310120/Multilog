const Confirm = (() => {

    let overlay;

    function criar() {

        overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

        overlay.innerHTML = `
            <div class="confirm-modal">

                <div class="confirm-title"></div>

                <div class="confirm-message"></div>

                <div class="confirm-actions">
                    <button class="confirm-btn confirm-cancel">
                        Cancelar
                    </button>

                    <button class="confirm-btn confirm-ok">
                        Confirmar
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

    }

    function open({
        title = "Confirmação",
        message = "",
        confirmText = "Confirmar",
        cancelText = "Cancelar",
        danger = false
    } = {}) {

        if (!overlay) criar();

        overlay.querySelector(".confirm-title").textContent = title;
        overlay.querySelector(".confirm-message").textContent = message;

        const cancelar = overlay.querySelector(".confirm-cancel");
        const confirmar = overlay.querySelector(".confirm-ok");

        cancelar.textContent = cancelText;
        confirmar.textContent = confirmText;

        confirmar.classList.toggle("confirm-danger", danger);

        overlay.classList.add("ativo");

        return new Promise(resolve => {

            cancelar.onclick = () => {
                overlay.classList.remove("ativo");
                resolve(false);
            };

            confirmar.onclick = () => {
                overlay.classList.remove("ativo");
                resolve(true);
            };

        });

    }

    return { open };

})();

window.Confirm = Confirm;
