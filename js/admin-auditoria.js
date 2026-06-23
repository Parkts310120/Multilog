verificarLogin();

carregarLogs();

async function carregarLogs() {

    try {

        const resultado = await apiGet("/api/admin/auditoria");

        const tbody = document.getElementById("tbody-auditoria");

        tbody.innerHTML = "";

        resultado.logs.forEach(log => {

            tbody.innerHTML += `
                <tr>
                    <td>${new Date(log.criado_em).toLocaleString()}</td>
                    <td>${log.usuario || ""}</td>
                    <td>${log.acao || ""}</td>
                    <td>${log.tabela || ""}</td>
                    <td>${log.registro_id || ""}</td>

                    <td>
                        <button class="btn-primary"
                        onclick='verDetalhes(${JSON.stringify(JSON.stringify(log.depois || log.antes || {}))})'>
                            Ver
                        </button>
                    </td>
                </tr>
            `;

        });

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar auditoria");

    }

}

function verDetalhes(json) {

    try {

        const objeto = JSON.parse(json);

        alert(JSON.stringify(objeto, null, 2));

    } catch {

        alert(json);

    }

}