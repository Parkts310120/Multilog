import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    rmSync
} from "node:fs";

import {
    join
} from "node:path";

const raiz = process.cwd();
const dist = join(raiz, "dist");

function copiarArquivo(nome) {
    const origem = join(raiz, nome);
    const destino = join(dist, nome);

    if (!existsSync(origem)) {
        throw new Error(
            `Arquivo obrigatório não encontrado: ${nome}`
        );
    }

    cpSync(origem, destino);
    console.log(`Copiado: ${nome}`);
}

function copiarPasta(nome) {
    const origem = join(raiz, nome);
    const destino = join(dist, nome);

    if (!existsSync(origem)) {
        throw new Error(
            `Pasta obrigatória não encontrada: ${nome}`
        );
    }

    cpSync(
        origem,
        destino,
        {
            recursive: true
        }
    );

    console.log(`Copiada: ${nome}/`);
}

rmSync(
    dist,
    {
        recursive: true,
        force: true
    }
);

mkdirSync(
    dist,
    {
        recursive: true
    }
);

copiarArquivo("index.html");
copiarArquivo("manifest.json");
copiarArquivo("service-worker.js");

const paginasAdmin = readdirSync(raiz)
    .filter(nome =>
        /^admin-.*\.html$/i.test(nome)
    );

for (const pagina of paginasAdmin) {
    copiarArquivo(pagina);
}

copiarPasta("css");
copiarPasta("js");
copiarPasta("operator");

console.log("");
console.log("Build concluído em dist/");
