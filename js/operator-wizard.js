const OperatorWizard = (() => {
const etapas = [
    { nome: "Depositante", campo: "depositor-name" },
    { nome: "Serviço", campo: "activity-name" },
    { nome: "Área", campo: "area-name" },
    { nome: "Lote / NF / OS", campo: "lote" },
    { nome: "Tem quantidade esperada?", campo: "tem-quantidade-esperada" },
    { nome: "Quantidade esperada", campo: "quantidade-esperada" },
    { nome: "Unidade", campo: "unidade" }
];

    let etapaAtual = 0;

    function getCampoAtual() {
        const etapa = etapas[etapaAtual];
        if (!etapa) return null;

        return document.getElementById(etapa.campo);
    }

    function focarEtapaAtual() {
        const campo = getCampoAtual();

        if (campo) {
            campo.focus();
        }
    }

    function proximaEtapa() {
        if (etapaAtual < etapas.length - 1) {
            etapaAtual++;
            focarEtapaAtual();
            return;
        }

        const botaoIniciar = document.getElementById("btn-start");

        if (botaoIniciar && !botaoIniciar.disabled) {
            botaoIniciar.focus();
        }
    }

    function etapaAnterior() {
        if (etapaAtual > 0) {
            etapaAtual--;
            focarEtapaAtual();
        }
    }

    function configurarEnter() {
        etapas.forEach(etapa => {
            const campo = document.getElementById(etapa.campo);

            if (!campo) return;

            campo.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    proximaEtapa();
                }
            });
        });
    }

    function iniciar() {
        etapaAtual = 0;
        focarEtapaAtual();
    }

    document.addEventListener("DOMContentLoaded", configurarEnter);

    return {
        iniciar,
        proximaEtapa,
        etapaAnterior
    };
})();

window.OperatorWizard = OperatorWizard;
