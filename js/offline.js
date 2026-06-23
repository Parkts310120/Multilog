const DB_NAME = "multilog_offline";
const STORE_NAME = "fila_atividades";

function abrirBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id_local"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function salvarOffline(atividade) {
    const db = await abrirBanco();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(atividade);
}

async function listarOffline() {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function removerOffline(idLocal) {
    const db = await abrirBanco();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(idLocal);
}

async function contarOffline() {
    const pendentes = await listarOffline();
    return pendentes.length;
}

async function sincronizarPendentes() {

    if (!navigator.onLine) return;

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

    if (typeof atualizarIndicadorOffline === "function") {
        await atualizarIndicadorOffline();
    }

}

window.addEventListener("online", sincronizarPendentes);

setInterval(() => {
    sincronizarPendentes();
}, 30000);