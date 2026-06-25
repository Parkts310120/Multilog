verificarLogin();

let logsAuditoria = [];
let logsFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 10;
let logSelecionado = null;

carregarLogs();

setInterval(() => {
    carregarLogs(false);
}, 60000);

async function carregarLogs(mostrarErro = true) {
    try {
        const resultado = await apiGet("/api/admin/auditoria");

        logsAuditoria = resultado.logs || [];
        logsFiltrados = logsAuditoria;
        paginaAtual = 1;

        preencherFiltrosAuditoria();
        atualizarCardsAuditoria();
        aplicarFiltrosAuditoria();

    } catch (erro) {
        console.error(erro);

        if (mostrarErro) {
            Toast.error("Erro ao carregar auditoria");
        }
    }
}

function atualizarCardsAuditoria() {
    document.getElementById("card-total").innerText = logsAuditoria.length;

    document.getElementById("card-login").innerText =
        logsAuditoria.filter(log => (log.acao || "").includes("LOGIN")).length;

    document.getElementById("card-cadastro").innerText =
        logsAuditoria.filter(log => (log.acao || "").includes("CADASTRAR")).length;

    document.getElementById("card-atividade").innerText =
        logsAuditoria.filter(log => (log.acao || "").includes("ATIVIDADE")).length;

    document.getElementById("card-ocultar").innerText =
        logsAuditoria.filter(log => (log.acao || "").includes("OCULTAR")).length;
}

function preencherFiltrosAuditoria() {
    const filtroUsuario = document.getElementById("filtro-usuario");
    const filtroAcao = document.getElementById("filtro-acao");
    const filtroTabela = document.getElementById("filtro-tabela");

    if (!filtroUsuario || !filtroAcao || !filtroTabela) return;

    const usuarioAtual = filtroUsuario.value;
    const acaoAtual = filtroAcao.value;
    const tabelaAtual = filtroTabela.value;

    const usuarios = [...new Set(logsAuditoria.map(log => log.usuario).filter(Boolean))];
    const acoes = [...new Set(logsAuditoria.map(log => log.acao).filter(Boolean))];
    const tabelas = [...new Set(logsAuditoria.map(log => log.tabela).filter(Boolean))];

    filtroUsuario.innerHTML = '<option value="">Todos</option>';
    filtroAcao.innerHTML = '<option value="">Todas</option>';
    filtroTabela.innerHTML = '<option value="">Todas</option>';

    usuarios.forEach(usuario => {
        filtroUsuario.innerHTML += `<option value="${usuario}">${usuario}</option>`;
    });

    acoes.forEach(acao => {
        filtroAcao.innerHTML += `<option value="${acao}">${acao}</option>`;
    });

    tabelas.forEach(tabela => {
        filtroTabela.innerHTML += `<option value="${tabela}">${tabela}</option>`;
    });

    filtroUsuario.value = usuarioAtual;
    filtroAcao.value = acaoAtual;
    filtroTabela.value = tabelaAtual;
}

function aplicarFiltrosAuditoria() {
    const texto = document.getElementById("filtro-texto").value.toLowerCase();
    const periodo = document.getElementById("filtro-periodo").value;
    const usuario = document.getElementById("filtro-usuario").value;
    const acao = document.getElementById("filtro-acao").value;
    const tabela = document.getElementById("filtro-tabela").value;

    logsFiltrados = logsAuditoria.filter(log => {
        const textoLog = `
            ${log.usuario || ""}
            ${log.acao || ""}
            ${log.tabela || ""}
            ${log.registro_id || ""}
            ${JSON.stringify(log.antes || {})}
            ${JSON.stringify(log.depois || {})}
        `.toLowerCase();

        const passaTexto = !texto || textoLog.includes(texto);
        const passaUsuario = !usuario || log.usuario === usuario;
        const passaAcao = !acao || log.acao === acao;
        const passaTabela = !tabela || log.tabela === tabela;
        const passaPeriodo = filtrarPorPeriodo(log.criado_em, periodo);

        return passaTexto && passaUsuario && passaAcao && passaTabela && passaPeriodo;
    });

    paginaAtual = 1;
    renderizarLogsAuditoria();
}

function filtrarPorPeriodo(dataLog, periodo) {
    if (!periodo) return true;

    const data = new Date(dataLog);
    const agora = new Date();

    if (periodo === "hoje") {
        return data.toDateString() === agora.toDateString();
    }

    const dias = Number(periodo);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);

    return data >= limite;
}

function renderizarLogsAuditoria() {
    const tbody = document.getElementById("tbody-auditoria");
    const contador = document.getElementById("contador-auditoria");
    const infoPaginacao = document.getElementById("info-paginacao");

    tbody.innerHTML = "";

    contador.innerText = `${logsFiltrados.length} log(s) encontrado(s)`;

    if (logsFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Nenhum log encontrado.</td>
            </tr>
        `;

        infoPaginacao.innerText = "Página 0 de 0";
        return;
    }

    const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const logsPagina = logsFiltrados.slice(inicio, fim);

    logsPagina.forEach(log => {
        const indexOriginal = logsAuditoria.indexOf(log);

        tbody.innerHTML += `
            <tr style="border-left:6px solid ${corAcao(log.acao)};">
                <td>${new Date(log.criado_em).toLocaleString()}</td>
                <td>${log.usuario || ""}</td>
                <td>${badgeAcao(log.acao)}</td>
                <td>${log.tabela || ""}</td>
                <td>${log.registro_id || ""}</td>
                <td>
                    <button class="btn-primary" onclick="verDetalhesLog(${indexOriginal})">
                        👁 Ver
                    </button>
                </td>
            </tr>
        `;
    });

    infoPaginacao.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
}

function corAcao(acao) {
    const texto = acao || "";

    if (texto.includes("LOGIN")) return "#22c55e";
    if (texto.includes("CADASTRAR")) return "#3b82f6";
    if (texto.includes("SALVAR")) return "#06b6d4";
    if (texto.includes("OCULTAR")) return "#f97316";
    if (texto.includes("EXCLUIR") || texto.includes("DELETE")) return "#ef4444";

    return "#64748b";
}

function badgeAcao(acao) {
    const texto = acao || "";

    return `
        <span style="background:${corAcao(texto)};color:white;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:bold;white-space:nowrap;">
            ${texto}
        </span>
    `;
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarLogsAuditoria();
    }
}

function proximaPagina() {
    const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);

    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarLogsAuditoria();
    }
}

function limparFiltrosAuditoria() {
    document.getElementById("filtro-texto").value = "";
    document.getElementById("filtro-periodo").value = "";
    document.getElementById("filtro-usuario").value = "";
    document.getElementById("filtro-acao").value = "";
    document.getElementById("filtro-tabela").value = "";

    aplicarFiltrosAuditoria();
}

function verDetalhesLog(index) {
    const log = logsAuditoria[index];

    if (!log) {
        Toast.warning("Log não encontrado.");
        return;
    }

    logSelecionado = log;

    document.getElementById("modal-auditoria-resumo").innerHTML = `
        <div class="card"><strong>Data</strong><br>${new Date(log.criado_em).toLocaleString()}</div>
        <div class="card"><strong>Usuário</strong><br>${log.usuario || "-"}</div>
        <div class="card"><strong>Ação</strong><br>${badgeAcao(log.acao)}</div>
        <div class="card"><strong>Tabela</strong><br>${log.tabela || "-"}</div>
        <div class="card"><strong>Registro</strong><br>${log.registro_id || "-"}</div>
    `;

    document.getElementById("modal-alteracoes").innerHTML =
        gerarResumoAlteracoes(log.antes, log.depois);

    document.getElementById("modal-auditoria-antes").innerText =
        JSON.stringify(log.antes || {}, null, 2);

    document.getElementById("modal-auditoria-depois").innerText =
        JSON.stringify(log.depois || {}, null, 2);

    document.getElementById("modal-auditoria").style.display = "flex";
}

function gerarResumoAlteracoes(antes, depois) {
    if (!antes && !depois) {
        return "";
    }

    const antesObj = antes || {};
    const depoisObj = depois || {};

    const chaves = [...new Set([
        ...Object.keys(antesObj),
        ...Object.keys(depoisObj)
    ])];

    const alteracoes = chaves.filter(chave => {
        return JSON.stringify(antesObj[chave]) !== JSON.stringify(depoisObj[chave]);
    });

    if (alteracoes.length === 0) {
        return `
            <div class="card">
                <h3>Resumo</h3>
                <p>Nenhuma alteração comparável encontrada.</p>
            </div>
        `;
    }

    let html = `
        <div class="card">
            <h3>Alterações detectadas</h3>
            <div style="display:grid;gap:12px;">
    `;

    alteracoes.forEach(chave => {
        html += `
            <div style="background:#020617;border:1px solid #334155;border-radius:12px;padding:12px;">
                <strong>${chave}</strong>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
                    <div>
                        <small>Antes</small>
                        <pre style="white-space:pre-wrap;">${JSON.stringify(antesObj[chave] ?? null, null, 2)}</pre>
                    </div>
                    <div>
                        <small>Depois</small>
                        <pre style="white-space:pre-wrap;">${JSON.stringify(depoisObj[chave] ?? null, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

function fecharModalAuditoria() {
    document.getElementById("modal-auditoria").style.display = "none";
}

async function copiarJSONAuditoria() {
    if (!logSelecionado) return;

    const texto = JSON.stringify(logSelecionado, null, 2);

    try {
        await navigator.clipboard.writeText(texto);
        Toast.success("JSON copiado.");
    } catch {
        Toast.error("Não foi possível copiar.");
    }
}

async function copiarDepoisAuditoria() {
    if (!logSelecionado) return;

    const texto = JSON.stringify(logSelecionado.depois || {}, null, 2);

    try {
        await navigator.clipboard.writeText(texto);
        Toast.success("JSON do campo Depois copiado.");
    } catch {
        Toast.error("Não foi possível copiar.");
    }
}

function exportarCSV() {
    if (logsFiltrados.length === 0) {
        Toast.warning("Nenhum log para exportar.");
        return;
    }

    const linhas = [
        ["Data", "Usuário", "Ação", "Tabela", "Registro"]
    ];

    logsFiltrados.forEach(log => {
        linhas.push([
            new Date(log.criado_em).toLocaleString(),
            log.usuario || "",
            log.acao || "",
            log.tabela || "",
            log.registro_id || ""
        ]);
    });

    const csv = linhas
        .map(linha => linha.map(campo => `"${String(campo).replaceAll('"', '""')}"`).join(";"))
        .join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `auditoria_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
}