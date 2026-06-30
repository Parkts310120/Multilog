const fs = require("fs");

const arquivos = [
    "index.html",
    "admin-dashboard.html",
    "admin-historico.html",
    "admin-cadastros.html",
    "admin-auditoria.html"
];

let alterados = 0;

for (const arquivo of arquivos) {

    if (!fs.existsSync(arquivo))
        continue;

    let html = fs.readFileSync(arquivo, "utf8");

    const original = html;

    html = html.replace(
        /<button(?![^>]*class=)/g,
        '<button class="btn btn-primary"'
    );

    if (html !== original) {
        alterados++;
        fs.writeFileSync(arquivo, html);
        console.log("✔ Atualizado:", arquivo);
    } else {
        console.log("• Sem alterações:", arquivo);
    }
}

console.log("");
console.log("==========================");
console.log("Arquivos alterados:", alterados);
console.log("==========================");
