async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("multilog_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let resposta;

    try {
        resposta = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers
        });
    } catch (erro) {
        throw new Error("API indisponível");
    }

    let resultado = {};

    try {
        resultado = await resposta.json();
    } catch {
        resultado = {};
    }

    if (!resposta.ok) {
        throw new Error(resultado.mensagem || "Erro na API");
    }

    return resultado;
}

function apiGet(path) {
    return apiFetch(path, {
        method: "GET"
    });
}

function apiPost(path, body) {
    return apiFetch(path, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

function apiPatch(path, body = {}) {
    return apiFetch(path, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

function apiDelete(path) {
    return apiFetch(path, {
        method: "DELETE"
    });
}

async function verificarStatusAPI() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/api/status`);

        if (!resposta.ok) {
            return false;
        }

        return true;
    } catch (erro) {
        return false;
    }
}
