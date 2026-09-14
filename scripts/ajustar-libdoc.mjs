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
