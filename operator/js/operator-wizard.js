const OperatorWizard = (() => {
    const etapas = [
        { titulo: "DEPOSITANTE", campo: "depositor-name" },
        { titulo: "SERVIÇO", campo: "activity-name" },
        { titulo: "ÁREA", campo: "area-name" },
        { titulo: "LOTE / NF / OS", campo: "lote" },
        { titulo: "TEM QUANTIDADE?", campo: "tem-quantidade-esperada" },
        { titulo: "QUANTIDADE ESPERADA", campo: "quantidade-esperada" },
        { titulo: "UNIDADE", campo: "unidade" }
    ];

    let etapaAtual = 0;
    let enterTravado = false;

    function campoVisivel(campo) {
        return campo && !campo.disabled && campo.offsetParent !== null;
    }

    function limparDestaques() {
        etapas.forEach(etapa => {
            const campo = document.getElementById(etapa.campo);
            if (campo) {
                campo.classList.remove("operator-field-active");
            }
        });
    }

    function atualizarPainel() {
        const etapa = etapas[etapaAtual];
        if (!etapa) return;

        const stepEl = document.getElementById("operator-wizard-step");
        const titleEl = document.getElementById("operator-wizard-title");
        const helpEl = document.getElementById("operator-wizard-help");

        if (stepEl) stepEl.textContent = `PASSO ${etapaAtual + 1} / ${etapas.length}`;
        if (titleEl) titleEl.textContent = etapa.titulo;
        if (helpEl) helpEl.textContent = "ENTER PARA AVANÇAR";
    }

    function focarCampo(index) {
        if (index >= etapas.length) {
            limparDestaques();
            atualizarPainel();

            const botaoIniciar = document.getElementById("btn-start");
            if (botaoIniciar && !botaoIniciar.disabled) {
                botaoIniciar.focus();
            }
            return;
        }

        const campo = document.getElementById(etapas[index].campo);

        if (!campoVisivel(campo)) {
            etapaAtual = index;
            focarCampo(index + 1);
            return;
        }

        etapaAtual = index;

        limparDestaques();
        campo.classList.add("operator-field-active");
        atualizarPainel();

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
                limparDestaques();
                campo.classList.add("operator-field-active");
                atualizarPainel();
            });

            campo.addEventListener("click", () => {
                etapaAtual = index;
                limparDestaques();
                campo.classList.add("operator-field-active");
                atualizarPainel();
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
