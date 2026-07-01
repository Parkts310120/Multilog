function getToken() {
    return localStorage.getItem("multilog_token");
}

function getUsuario() {
    const usuario = localStorage.getItem("multilog_usuario");

    if (!usuario) return null;

    try {
        return JSON.parse(usuario);
    } catch {
        return null;
    }
}

function isAdmin() {
    const usuario = getUsuario();

    if (!usuario) return false;

    return usuario.tipo === "admin";
}

function verificarLogin() {
    if (!getToken()) {
        Toast.warning("Sessão expirada.");
        window.location.href = "index.html";
        return false;
    }

    return true;
}

function logout() {

    localStorage.removeItem("multilog_token");
    localStorage.removeItem("multilog_usuario");

    window.location.href = "index.html";
}

function preencherUsuarioHeader() {
    const usuario = getUsuario();
    const el = document.getElementById("admin-usuario-logado");

    if (usuario && el) {
        el.textContent = usuario.nome || usuario.usuario || "Admin";
    }
}

document.addEventListener("DOMContentLoaded", preencherUsuarioHeader);
