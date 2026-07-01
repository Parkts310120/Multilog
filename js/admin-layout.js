function renderAdminLayout(titulo, paginaAtiva) {

    const sidebar = `
    <aside class="ml-sidebar">

        <h2>Multilog</h2>

        <a href="admin-dashboard.html" ${paginaAtiva==="dashboard"?"class='active'":""}>
            📊 Dashboard
        </a>

        <a href="admin-historico.html" ${paginaAtiva==="historico"?"class='active'":""}>
            📋 Histórico
        </a>

        <a href="admin-cadastros.html" ${paginaAtiva==="cadastros"?"class='active'":""}>
            ⚙️ Cadastros
        </a>

        <a href="admin-auditoria.html" ${paginaAtiva==="auditoria"?"class='active'":""}>
            🧾 Auditoria
        </a>

        <a href="index.html">
            🏠 Portal
        </a>

    </aside>
    `;

    const header = `
    <header class="ml-header">

        <div>

            <strong>Multilog</strong>

            <span style="margin-left:8px;color:#64748b;">
                ${titulo}
            </span>

        </div>

    </header>
    `;

    return `
    <div class="ml-layout">

        ${header}

        ${sidebar}

        <main class="ml-main" id="admin-content"></main>

    </div>
    `;
}