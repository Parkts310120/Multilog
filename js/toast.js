const Toast = (() => {
    let container;

    function getContainer() {
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        return container;
    }

    function show(message, type = "info", duration = 3500) {
        const toast = document.createElement("div");

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
        `;

        getContainer().appendChild(toast);

        setTimeout(() => {

            toast.classList.add("saindo");

            toast.addEventListener("animationend", () => {
                toast.remove();
            });

        }, duration);

        return toast;
    }

    return {
        success(message, duration) {
            return show(message, "sucesso", duration);
        },

        error(message, duration) {
            return show(message, "erro", duration);
        },

        warning(message, duration) {
            return show(message, "aviso", duration);
        },

        info(message, duration) {
            return show(message, "info", duration);
        }
    };

})();

window.Toast = Toast;
