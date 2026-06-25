async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("multilog_token");
    const usarLoading = options.loading !== false;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (usarLoading && window.Loading) {
        Loading.show("Carregando...");
    }

    let resposta;

    try {
        resposta = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers
        });
    } catch (erro) {
        throw new Error("API indisponível");
    } finally {
        if (usarLoading && window.Loading) {
            Loading.hide();
        }
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

function apiGet(path, options = {}) {
    return apiFetch(path, {
        ...options,
        method: "GET"
    });
}

function apiPost(path, body, options = {}) {
    return apiFetch(path, {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
    });
}

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("multilog_token");
    const usarLoading = options.loading !== false;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let loadingTimer;

    if (usarLoading && window.Loading) {
        loadingTimer = setTimeout(() => {
            Loading.show("Carregando...");
        }, 300);
    }

    let resposta;

    try {
        resposta = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers
        });
    } catch (erro) {
        throw new Error("API indisponível");
    } finally {
        if (usarLoading && window.Loading) {
            clearTimeout(loadingTimer);
            Loading.hide();
        }
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

function apiDelete(path, options = {}) {
    return apiFetch(path, {
        ...options,
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
