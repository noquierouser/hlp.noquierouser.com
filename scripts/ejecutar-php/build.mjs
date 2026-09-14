// Compila el ejecutor de PHP hacia assets/php/.
//   cd scripts/ejecutar-php && npm install && npm run build
import { build } from "esbuild";
import { rmSync } from "node:fs";

const destino = new URL("../../assets/php/", import.meta.url).pathname;
rmSync(destino, { recursive: true, force: true });

await build({
    entryPoints: ["src/ejecutar-php.js", "src/php-worker.js"],
    outdir: destino,
    bundle: true,
    format: "esm",
    platform: "browser",
    minify: true,
    // Solo el binario de PHP; la extensión intl no se usa.
    loader: { ".wasm": "file", ".so": "empty" },
    assetNames: "[name]",
    // php-wasm menciona módulos de Node que en el navegador nunca se cargan.
    external: ["worker_threads", "fs", "path", "crypto", "net", "tls", "os", "child_process", "http", "https", "url", "util", "stream", "events", "buffer", "zlib"],
    logLevel: "info",
});
