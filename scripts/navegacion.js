// Navegación automática a partir de la estructura de carpetas.
// Se usa desde los *.11tydata.js de cada sección (ramos, referencia, archivo).
//
// - key:    URL de la página (única por construcción).
// - parent: URL del index.md más cercano en una carpeta superior.
// - title:  título de la página.
// Cualquier valor puesto en el front matter (eleventyNavigation) tiene prioridad.
// Para sacar una página del menú: `eleventyNavigation: false`.
//
// También fija el layout hlp_pagina.liquid (LibDoc + ejecutor de PHP) y la fecha
// de cada página: la del último commit que modificó el archivo. LibDoc la muestra
// como "Última modificación".
import { existsSync } from "node:fs";
import path from "node:path";

function indiceSuperior(inputPath) {
    let dir = path.dirname(inputPath);
    if (path.basename(inputPath, path.extname(inputPath)) === "index") {
        dir = path.dirname(dir);
    }
    while (dir !== "." && dir !== path.dirname(dir)) {
        if (existsSync(path.join(dir, "index.md"))) {
            return "/" + path.relative(".", dir).split(path.sep).join("/") + "/";
        }
        dir = path.dirname(dir);
    }
    return undefined;
}

export default {
    layout: "hlp_pagina.liquid",
    date: "git Last Modified",
    eleventyComputed: {
        eleventyNavigation: (data) => {
            if (data.eleventyNavigation === false || !data.page.url) return data.eleventyNavigation;
            return {
                key: data.page.url,
                parent: indiceSuperior(data.page.inputPath),
                title: data.title,
                ...data.eleventyNavigation
            };
        }
    }
};
