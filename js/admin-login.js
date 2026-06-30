async function handleAdminLogin() {
    const usuario = document.getElementById("admin-username").value.trim();
    const senha = document.getElementById("admin-password").value.trim();

    if (!usuario || !senha) {
        Toast.warning("Informe usuário e senha.");
        return;
    }

    try {
        const resultado = await apiPost("/api/login", {
            usuario,
            senha
        });

        if (!resultado.usuario || resultado.usuario.tipo !== "admin") {
            Toast.error("Acesso permitido apenas para administradores.");
            return;
        }

        localStorage.setItem("multilog_token", resultado.token);
        localStorage.setItem("multilog_usuario", JSON.stringify(resultado.usuario));

        window.location.href = "admin-dashboard.html";

    } catch (erro) {
        Toast.error(erro.message || "Erro ao fazer login.");
    }
}
