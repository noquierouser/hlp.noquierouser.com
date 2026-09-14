// Agrega "Ejecutar" a los bloques de código PHP que empiezan con <?php.
// El código se puede editar ahí mismo; la salida aparece bajo el bloque.
// PHP se descarga recién la primera vez que alguien presiona "Ejecutar".

const TIEMPO_MAXIMO_MS = 10000;
const URL_WORKER = new URL("./php-worker.js", import.meta.url);

// ---------- Worker ----------

let worker = null;
let workerListo = null;
let siguienteId = 0;
const pendientes = new Map();

function obtenerWorker() {
    if (worker) return workerListo;
    worker = new Worker(URL_WORKER, { type: "module" });
    workerListo = new Promise((resolve, reject) => {
        worker.onmessage = ({ data }) => {
            if (data.tipo === "listo") resolve();
            else if (data.tipo === "error-carga") reject(new Error(data.mensaje));
            else if (data.tipo === "resultado") {
                pendientes.get(data.id)?.(data);
                pendientes.delete(data.id);
            }
        };
        worker.onerror = (evento) => reject(new Error(evento.message || "No se pudo cargar PHP."));
    });
    workerListo.catch(reiniciarWorker);
    return workerListo;
}

function reiniciarWorker() {
    worker?.terminate();
    worker = null;
    workerListo = null;
    pendientes.clear();
}

// Una ejecución a la vez, en orden.
let cola = Promise.resolve();

function ejecutar(codigo, alCargar) {
    const tarea = cola.then(async () => {
        const esPrimeraCarga = !worker;
        if (esPrimeraCarga) alCargar();
        await obtenerWorker();
        const id = siguienteId++;
        return new Promise((resolve) => {
            const temporizador = setTimeout(() => {
                pendientes.delete(id);
                reiniciarWorker();
                resolve({ agotado: true });
            }, TIEMPO_MAXIMO_MS);
            pendientes.set(id, (resultado) => {
                clearTimeout(temporizador);
                resolve(resultado);
            });
            worker.postMessage({ id, codigo });
        });
    });
    cola = tarea.catch(() => {});
    return tarea;
}

// ---------- Interfaz ----------

const ESTILOS = `
.comandos-php [hidden], main > pre > code.salida-php[hidden] { display: none !important; }
main > pre > code.salida-php { margin-top: var(--ita-spacings-5); white-space: pre-wrap; }
main > pre > code.salida-php.error { box-shadow: inset 4px 0 0 var(--ita-colors-danger-500, #d33); }
main > pre > code.salida-php.estado { opacity: .75; font-style: italic; }
main > pre > code[contenteditable] { outline: none; cursor: text; }
main > pre > code[contenteditable]:focus { box-shadow: 0 0 0 2px var(--ita-colors-primary-500, #06c); }
.comandos-php { display: flex; gap: var(--ita-spacings-5); margin-right: auto; }
@media print { .comandos-php, .salida-php { display: none !important; } }
`;

function crearBoton(texto, titulo) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "d-flex ai-center | pt-5 pb-5 fvs-wght-400 fs-2 tt-uppercase | bc-0 c-primary-900 b-0 cur-pointer";
    boton.textContent = texto;
    if (titulo) boton.title = titulo;
    return boton;
}

function resaltar(elCodigo) {
    if (typeof hljs === "undefined") return;
    const texto = elCodigo.textContent;
    elCodigo.textContent = texto;
    delete elCodigo.dataset.highlighted;
    hljs.highlightElement(elCodigo);
}

function mostrarSalida(elSalida, texto, { error = false, estado = false } = {}) {
    elSalida.hidden = false;
    elSalida.textContent = texto;
    elSalida.classList.toggle("error", error);
    elSalida.classList.toggle("estado", estado);
}

function textoResultado(resultado) {
    if (resultado.agotado) {
        return {
            texto: `Se detuvo: tardó más de ${TIEMPO_MAXIMO_MS / 1000} segundos. ¿Hay un ciclo infinito?`,
            error: true,
        };
    }
    let texto = resultado.salida;
    if (resultado.errores && !texto.includes(resultado.errores.trim())) {
        texto += (texto && !texto.endsWith("\n") ? "\n" : "") + resultado.errores;
    }
    return { texto: texto === "" ? "(sin salida)" : texto, error: resultado.codigoSalida !== 0 };
}

function prepararBloque(elPre, elCodigo) {
    const original = elCodigo.textContent;
    const barra = elPre.firstElementChild;

    const comandos = document.createElement("div");
    comandos.className = "comandos-php";
    const btnEjecutar = crearBoton("▶ Ejecutar", "Ejecutar (Ctrl + Enter)");
    const btnRestaurar = crearBoton("Restaurar", "Volver al código original");
    btnRestaurar.hidden = true;
    comandos.append(btnEjecutar, btnRestaurar);
    barra.prepend(comandos);

    const elSalida = document.createElement("code");
    elSalida.className = "hljs salida-php";
    elSalida.dataset.languageName = "Salida";
    elSalida.hidden = true;
    elPre.append(elSalida);

    // Código editable
    elCodigo.setAttribute("contenteditable", "plaintext-only");
    elCodigo.spellcheck = false;
    elCodigo.addEventListener("input", () => {
        btnRestaurar.hidden = elCodigo.textContent === original;
    });
    elCodigo.addEventListener("blur", () => resaltar(elCodigo));
    elCodigo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
            evento.preventDefault();
            btnEjecutar.click();
        } else if (evento.key === "Tab" && !evento.shiftKey) {
            evento.preventDefault();
            document.execCommand("insertText", false, "    ");
        }
    });

    btnRestaurar.addEventListener("click", () => {
        elCodigo.textContent = original;
        resaltar(elCodigo);
        btnRestaurar.hidden = true;
        elSalida.hidden = true;
    });

    btnEjecutar.addEventListener("click", async () => {
        btnEjecutar.disabled = true;
        mostrarSalida(elSalida, "Ejecutando…", { estado: true });
        try {
            const resultado = await ejecutar(elCodigo.textContent, () =>
                mostrarSalida(elSalida, "Cargando PHP… (la primera vez tarda un poco)", { estado: true })
            );
            const { texto, error } = textoResultado(resultado);
            mostrarSalida(elSalida, texto, { error });
        } catch (error) {
            mostrarSalida(elSalida, `No se pudo cargar PHP en este navegador.\n${error.message}`, { error: true });
        } finally {
            btnEjecutar.disabled = false;
        }
    });
}

function iniciar() {
    const bloques = [...document.querySelectorAll("main > pre > code.language-php")]
        .filter((elCodigo) => elCodigo.textContent.trimStart().startsWith("<?php"));
    if (bloques.length === 0 || typeof Worker === "undefined" || typeof WebAssembly === "undefined") return;

    const estilos = document.createElement("style");
    estilos.textContent = ESTILOS;
    document.head.append(estilos);

    for (const elCodigo of bloques) {
        const elPre = elCodigo.parentElement;
        // La barra con "Copiar código" la crea ui.js de LibDoc.
        if (elPre.firstElementChild?.querySelector(".copy_code_block")) prepararBloque(elPre, elCodigo);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
