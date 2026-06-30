function mostrarTelaOperador(telaId) {
    const telas = [
        "login-screen",
        "menu-screen",
        "app-screen"
    ];

    telas.forEach(id => {
        const tela = document.getElementById(id);
        if (tela) {
            tela.style.display = id === telaId ? "block" : "none";
        }
    });
}

function abrirMenuOperacional() {
    mostrarTelaOperador("menu-screen");
}

function abrirNovaAtividade() {
    mostrarTelaOperador("app-screen");
}
