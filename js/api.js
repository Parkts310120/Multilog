async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("multilog_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const resultado = await resposta.json();

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
