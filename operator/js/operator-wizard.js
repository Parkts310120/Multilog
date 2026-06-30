const OperatorWizard = (() => {
    const etapas = [
        { campo: "depositor-name" },
        { campo: "activity-name" },
        { campo: "area-name" },
        { campo: "lote" },
        { campo: "tem-quantidade-esperada" },
        { campo: "quantidade-esperada" },
        { campo: "unidade" }
    ];

    let etapaAtual = 0;
    let enterTravado = false;

    function campoVisivel(campo) {
        return campo && !campo.disabled && campo.offsetParent !== null;
    }

    function focarCampo(index) {
        if (index >= etapas.length) {
            const botaoIniciar = document.getElementById("btn-start");
            if (botaoIniciar && !botaoIniciar.disabled) botaoIniciar.focus();
            return;
        }

        const campo = document.getElementById(etapas[index].campo);

        if (!campoVisivel(campo)) {
            etapaAtual = index;
            focarCampo(index + 1);
            return;
        }

        etapaAtual = index;
        campo.focus();

        if (campo.tagName !== "SELECT" && campo.select) {
            campo.select();
        }
    }

    function proximaEtapa() {
        focarCampo(etapaAtual + 1);
    }

    function iniciar() {
        focarCampo(0);
    }

    function configurarEventos() {
        etapas.forEach((etapa, index) => {
            const campo = document.getElementById(etapa.campo);
            if (!campo) return;

            campo.addEventListener("focus", () => {
                etapaAtual = index;
            });

            campo.addEventListener("click", () => {
                etapaAtual = index;
            });

            campo.addEventListener("keydown", event => {
                if (event.key !== "Enter") return;

                event.preventDefault();

                if (enterTravado) return;

                enterTravado = true;
                etapaAtual = index;
                proximaEtapa();

                setTimeout(() => {
                    enterTravado = false;
                }, 180);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", configurarEventos);

    return {
        iniciar,
        proximaEtapa
    };
})();

window.OperatorWizard = OperatorWizard;
