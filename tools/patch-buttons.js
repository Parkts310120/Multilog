const fs = require("fs");

const arquivos = [
    "index.html",
    "admin-dashboard.html",
    "admin-historico.html",
    "admin-cadastros.html",
    "admin-auditoria.html"
];

for (const arquivo of arquivos) {

    if (!fs.existsSync(arquivo)) continue;

    let html = fs.readFileSync(arquivo, "utf8");

    if (!html.includes("buttons.css")) {

        html = html.replace(
            /(<link rel="stylesheet" href="css\/loading\.css">)/,
            `$1
<link rel="stylesheet" href="css/buttons.css">`
        );

    }

    fs.writeFileSync(arquivo, html);
    console.log("✔", arquivo);

}

console.log("\nPatch concluído.");
