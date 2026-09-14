// Worker que carga PHP (WebAssembly) y ejecuta código.
// Corre en un hilo aparte para que un ciclo infinito no congele la página:
// si tarda demasiado, ejecutar-php.js termina el worker.
import { loadPHPRuntime, PHP, setPhpIniEntries } from "@php-wasm/universal";
import * as loaderModule from "../node_modules/@php-wasm/web-8-5/asyncify/php_8_5.js";

const listo = (async () => {
    const php = new PHP(await loadPHPRuntime(loaderModule));
    // Errores en texto plano, como en la terminal o en 3v4l.
    await setPhpIniEntries(php, {
        html_errors: "0",
        display_errors: "1",
        error_reporting: String(32767), // E_ALL
        log_errors: "0",
    });
    return php;
})();

listo.then(
    () => postMessage({ tipo: "listo" }),
    (error) => postMessage({ tipo: "error-carga", mensaje: String(error) })
);

// php-wasm ejecuta el código como /internal/eval.php; se muestra con un nombre más claro.
const RUTA_INTERNA = /\/internal\/eval\.php/g;
const limpiar = (texto) => texto.replace(RUTA_INTERNA, "tu-codigo.php");

onmessage = async ({ data: { id, codigo } }) => {
    const php = await listo;
    let respuesta;
    try {
        respuesta = await php.run({ code: codigo });
    } catch (error) {
        // php-wasm lanza una excepción cuando PHP termina con error fatal;
        // la respuesta con la salida real viene adjunta.
        if (!error.response) {
            postMessage({ tipo: "resultado", id, salida: "", errores: String(error.message ?? error), codigoSalida: 255 });
            return;
        }
        respuesta = error.response;
    }
    postMessage({
        tipo: "resultado",
        id,
        salida: limpiar(respuesta.text),
        errores: limpiar(respuesta.errors),
        codigoSalida: respuesta.exitCode,
    });
};
