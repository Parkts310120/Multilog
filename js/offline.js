const DB_NAME = "multilog_offline";
const STORE_ATIVIDADES = "fila_atividades";
const STORE_CADASTROS = "cache_cadastros";

let sincronizacaoEmAndamento = false;

function abrirBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);

        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_ATIVIDADES)) {
                db.createObjectStore(STORE_ATIVIDADES, {
                    keyPath: "id_local"
                });
            }

            if (!db.objectStoreNames.contains(STORE_CADASTROS)) {
                db.createObjectStore(STORE_CADASTROS, {
                    keyPath: "tipo"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function salvarOffline(atividade) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ATIVIDADES, "readwrite");

        tx.objectStore(STORE_ATIVIDADES).put(atividade);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

async function listarOffline() {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ATIVIDADES, "readonly");
        const req = tx.objectStore(STORE_ATIVIDADES).getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function removerOffline(idLocal) {
    const db = await abrirBanco();
    const tx = db.transaction(STORE_ATIVIDADES, "readwrite");
    tx.objectStore(STORE_ATIVIDADES).delete(idLocal);
}

async function contarOffline() {
    const pendentes = await listarOffline();
    return pendentes.length;
}

async function sincronizarPendentes() {

    if (sincronizacaoEmAndamento) return;
    if (!navigator.onLine) return;

    sincronizacaoEmAndamento = true;

    try {

        const pendentes = await listarOffline();

        for (const atividade of pendentes) {

            try {

                await apiPost('/api/atividades', atividade);

                await removerOffline(atividade.id_local);

                console.log("Sincronizado:", atividade.id_local);

                if (typeof atualizarIndicadorOffline === "function") {
                    await atualizarIndicadorOffline();
                }

            } catch (erro) {

                console.log("Ainda offline");

                break;

            }

        }

    } finally {

        sincronizacaoEmAndamento = false;

        if (typeof atualizarIndicadorOffline === "function") {
            await atualizarIndicadorOffline();
        }

    }

}

async function salvarCadastrosOffline(tipo, dados) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CADASTROS, "readwrite");

        tx.objectStore(STORE_CADASTROS).put({
            tipo,
            dados,
            atualizado_em: new Date().toISOString()
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

async function carregarCadastrosOffline(tipo) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CADASTROS, "readonly");
        const req = tx.objectStore(STORE_CADASTROS).get(tipo);

        req.onsuccess = () => {
            if(req.result){
                resolve(req.result.dados);
            }else{
                resolve([]);
            }
        };

        req.onerror = () => reject(req.error);
    });
}

window.addEventListener("online", sincronizarPendentes);

setInterval(() => {
    sincronizarPendentes();
}, 30000);