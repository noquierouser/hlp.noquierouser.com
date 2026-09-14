// Plugin propio de Eleventy para el sitio. Lo carga .eleventy.js (la línea la agrega
// scripts/ajustar-libdoc.mjs, porque .eleventy.js es parte de LibDoc).
//
// Diagramas: los bloques ```mermaid se convierten en SVG al compilar, con
// beautiful-mermaid. No se carga JavaScript en el navegador.
//
//   ```mermaid Título opcional del diagrama
//   flowchart LR
//       A --> B
//   ```
//
// Tipos soportados: flowchart, stateDiagram-v2, sequenceDiagram, classDiagram,
// erDiagram y xychart-beta. Los colores usan las variables de LibDoc, así que
// siguen el modo claro u oscuro.
import { renderMermaidSVG } from "beautiful-mermaid";

const COLORES = {
    bg: "var(--ita-colors-neutral-100)",
    fg: "var(--ita-colors-neutral-900)",
    accent: "var(--ita-colors-primary-500)",
    transparent: true,
};

const escapar = (texto) =>
    texto.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

let contador = 0;

function diagrama(codigo, titulo, origen) {
    let svg;
    try {
        svg = renderMermaidSVG(codigo, COLORES);
    } catch (error) {
        throw new Error(`Diagrama Mermaid inválido en ${origen}: ${error.message}`);
    }

    const prefijo = `diagrama-${++contador}-`;
    svg = svg
        // Usar la fuente del sitio, sin pedir fuentes a Google
        .replace(/@import url\([^)]*\);\s*/, "")
        .replace(/text \{ font-family: [^}]*\}/, "text { font-family: var(--libdoc-font-family, sans-serif); }")
        // Ids únicos, por si hay varios diagramas en la misma página
        .replace(/id="([^"]+)"/g, `id="${prefijo}$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${prefijo}$1)`)
        // Que se achique en pantallas angostas. Sin role="img", para que los lectores
        // de pantalla puedan leer el texto de los nodos; el figcaption nombra la figura.
        // (el SVG ya trae un style con los colores: se agrega ahí, no en un atributo nuevo)
        .replace(/<svg ([^>]*?)style="([^"]*)"/, '<svg $1style="$2;max-width:100%;height:auto"');

    const leyenda = titulo ? `<figcaption>${escapar(titulo)}</figcaption>` : "";
    return `<figure class="diagrama">${svg}${leyenda}</figure>\n`;
}

export default function (eleventyConfig) {
    eleventyConfig.amendLibrary("md", (md) => {
        const fenceOriginal = md.renderer.rules.fence;
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const [lenguaje, ...resto] = token.info.trim().split(/\s+/);
            if (lenguaje !== "mermaid") {
                return fenceOriginal(tokens, idx, options, env, self);
            }
            return diagrama(token.content, resto.join(" "), env?.page?.inputPath ?? "un archivo");
        };
    });
}
