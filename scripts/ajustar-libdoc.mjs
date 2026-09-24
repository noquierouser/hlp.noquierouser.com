// Ajustes propios sobre archivos de LibDoc. Volver a ejecutar después de actualizar la plantilla:
//   node scripts/ajustar-libdoc.mjs
// Es idempotente: se puede ejecutar varias veces sin duplicar cambios.
import { readFileSync, writeFileSync } from "node:fs";

const ruta = (relativa) => new URL(`../${relativa}`, import.meta.url);

// 1. Traducción al español de la interfaz (LibDoc no incluye "es").
const rutaMensajes = ruta("_data/libdocMessages.json");
const mensajes = JSON.parse(readFileSync(rutaMensajes, "utf8"));
const es = JSON.parse(readFileSync(ruta("scripts/libdoc-es.json"), "utf8"));

const faltantes = [];
for (const [clave, textos] of Object.entries(mensajes)) {
    if (!(clave in es)) faltantes.push(clave);
    textos.es = es[clave] ?? textos.en;
}
writeFileSync(rutaMensajes, JSON.stringify(mensajes, null, "\t") + "\n");

if (faltantes.length > 0) {
    console.warn(`Claves sin traducción (quedan en inglés): ${faltantes.join(", ")}`);
}
console.log("Traducción al español aplicada.");

// 2. Migas de pan con el título de navegación en vez de la key.
//    scripts/navegacion.js usa la URL como key, así que mostrar la key no sirve.
const rutaMigas = ruta("_includes/libdoc_breadcrumb.liquid");
const migas = readFileSync(rutaMigas, "utf8");
if (migas.includes("{{ item.title }}")) {
    console.log("Migas de pan: ya usan el título.");
} else if (migas.includes("{{ item.key }}")) {
    writeFileSync(rutaMigas, migas.replaceAll("{{ item.key }}", "{{ item.title }}"));
    console.log("Migas de pan: ahora usan el título.");
} else {
    console.warn("Migas de pan: no se encontró {{ item.key }}; revisar _includes/libdoc_breadcrumb.liquid a mano.");
}

// 3. Cargar el plugin propio del sitio (scripts/eleventy-hlp.js) desde .eleventy.js.
const rutaConfig = ruta(".eleventy.js");
let config = readFileSync(rutaConfig, "utf8");
if (config.includes("scripts/eleventy-hlp.js")) {
    console.log("Plugin del sitio: ya está cargado en .eleventy.js.");
} else if (config.includes("// END LibDoc imports") && config.includes("// END PLUGINS")) {
    config = config
        .replace("// END LibDoc imports", 'import hlp                                  from "./scripts/eleventy-hlp.js";\n// END LibDoc imports')
        .replace("    // END PLUGINS", "    eleventyConfig.addPlugin(hlp);\n    // END PLUGINS");
    writeFileSync(rutaConfig, config);
    console.log("Plugin del sitio: agregado a .eleventy.js.");
} else {
    console.warn("Plugin del sitio: no se encontraron las marcas de .eleventy.js; agregar a mano el import y addPlugin(hlp).");
}

// 4. Dependencias propias del sitio en package.json.
const DEPENDENCIAS = { "beautiful-mermaid": "^1.1.3" };
const rutaPaquete = ruta("package.json");
const paquete = JSON.parse(readFileSync(rutaPaquete, "utf8"));
const faltanDependencias = Object.keys(DEPENDENCIAS).filter((nombre) => !paquete.dependencies?.[nombre]);
if (faltanDependencias.length === 0) {
    console.log("Dependencias del sitio: ya están en package.json.");
} else {
    paquete.dependencies = { ...paquete.dependencies, ...DEPENDENCIAS };
    writeFileSync(rutaPaquete, JSON.stringify(paquete, null, 2) + "\n");
    console.log(`Dependencias del sitio: agregadas (${faltanDependencias.join(", ")}). Ejecuta npm install.`);
}

// 5. Barra "Copiar código" también en los bloques dentro de <details>.
//    LibDoc solo toma los <pre> que cuelgan directo de <main>, y el botón
//    "Ejecutar" del sitio se apoya en esa barra.
const rutaUi = ruta("core/assets/js/ui.js");
const ui = readFileSync(rutaUi, "utf8");
if (ui.includes("querySelectorAll('main pre')")) {
    console.log("Bloques de código: ya incluyen los que están dentro de <details>.");
} else if (ui.includes("querySelectorAll('main>pre')")) {
    writeFileSync(rutaUi, ui.replace("querySelectorAll('main>pre')", "querySelectorAll('main pre')"));
    console.log("Bloques de código: ahora incluyen los que están dentro de <details>.");
} else {
    console.warn("Bloques de código: no se encontró querySelectorAll('main>pre') en core/assets/js/ui.js.");
}

//    Los estilos de LibDoc también apuntan solo a los <pre> hijos de <main>.
const HOJAS = ["core/assets/css/ds__defaults.css", "core/assets/css/ds__colors.css", "core/assets/css/ds__dark_mode.css"];
for (const hoja of HOJAS) {
    const rutaHoja = ruta(hoja);
    const css = readFileSync(rutaHoja, "utf8");
    const ajustado = css.replace(/main\s*>\s*pre/g, "main pre");
    if (ajustado === css) {
        console.log(`Estilos de código (${hoja}): sin cambios.`);
    } else {
        writeFileSync(rutaHoja, ajustado);
        console.log(`Estilos de código (${hoja}): ahora alcanzan a los bloques dentro de <details>.`);
    }
}
