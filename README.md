# hlp.noquierouser.com

Sitio de material de estudio, ejercicios y referencia para mis ramos de programación. Está construido con [Eleventy](https://www.11ty.dev/) y la plantilla [Eleventy LibDoc](https://github.com/ita-design-system/eleventy-libdoc) (v0.14.9, commit `50e4386`).

## Uso

```bash
npm install
npx @11ty/eleventy --serve   # desarrollo en http://localhost:8080
npx @11ty/eleventy           # genera el sitio en _site/
```

## Estructura

```
index.md                 Portada
settings.json            Configuración de LibDoc (título, idioma, enlaces)
ramos/                   Ramos vigentes
  <ramo>/                slug estable y sin año (ej. programacion-avanzada)
    index.md             Presentación breve y listado de unidades
    unidades/
      01-<tema>/
        index.md         De qué va la unidad, temas en orden y diapositivas
        <tema>.md        Un tema (ej. arrays.md), con ejemplos ejecutables y ejercicios
referencia/              Material que sirve a varios ramos
archivo/                 Material histórico (sitio 2012–2013), sin notas ni anuncios
assets/                  PDFs, imágenes y zips; se copian tal cual (misma ruta que el contenido)
  php/                   Ejecutor de PHP compilado (generado desde scripts/ejecutar-php)
sandboxes/               Demos HTML/JS para el shortcode {% sandbox %}
scripts/                 Código propio (navegación, ajustes a LibDoc, ejecutor de PHP)
_includes/hlp_pagina.liquid  Layout propio: envuelve el de LibDoc y agrega el ejecutor de PHP
```

## Convenciones

- **Tono informal y contenido general.** No se publican horas, resultados de aprendizaje, evaluaciones ni notas; solo material de estudio.
- **Por tema, no por clase.** El material de las clases se reparte en páginas temáticas dentro de su unidad, ordenadas como una progresión de aprendizaje. Así no queda atado a fechas.
  - El `index.md` de la unidad lista los temas en orden.
  - Cada tema termina con un enlace "Sigue con" al siguiente.
  - Las diapositivas van en una sección aparte del índice de la unidad.
- **Enlaces al manual.** Cada función o concepto de PHP enlaza a su página en [php.net/manual/es](https://www.php.net/manual/es/).
- **URLs sin año**, para que se mantengan entre semestres. Cuando deje de dictar un ramo, su carpeta pasa a `archivo/`.
- **Navegación automática.** Dentro de `ramos/`, `referencia/` y `archivo/`, [`scripts/navegacion.js`](scripts/navegacion.js) arma el menú a partir de las carpetas:
  - el título del menú es el `title` de la página;
  - el padre es el `index.md` más cercano en una carpeta superior. Una carpeta sin `index.md`, como `unidades/`, no aparece como nivel.
  - El orden se define con `eleventyNavigation.order`. Hoy se usa Ramos 10, Referencia 80 y Archivo 90; dentro de cada nivel, de 10 en 10.
  - Para sacar una página del menú, usa `eleventyNavigation: false`.

  Un front matter típico:

  ```yaml
  ---
  title: Variables y tipos
  description: Qué es una variable y qué tipos de datos básicos existen
  eleventyNavigation:
      order: 20
  tags:
      - ejercicios
  ---
  ```
- **Tags** para temas transversales (`recursion`, `arreglos`, `ejercicios`), no para la estructura.
- **Enlaces internos** apuntando al archivo fuente: `[Unidad 1](/ramos/<ramo>/unidades/01-x/index.md)`. LibDoc los convierte a la URL final.

## Código PHP ejecutable

Todo bloque ` ```php ` cuyo código empiece con `<?php` se puede **editar y ejecutar en la página**. No hay que marcar nada: basta con escribir un programa completo. Los fragmentos sin `<?php` quedan como código normal, solo para copiar.

- PHP 8.5 corre en el navegador con WebAssembly ([php-wasm](https://github.com/WordPress/wordpress-playground/tree/trunk/packages/php-wasm), de WordPress Playground), dentro de un worker. No hay servidor involucrado.
- Solo se carga `assets/php/ejecutar-php.js` (4 KB), y solo en páginas con bloques PHP. El binario de PHP (`php_8_5.wasm`, 20 MB, unos 8 MB comprimido) se descarga recién la primera vez que alguien presiona "Ejecutar".
- Si un programa tarda más de 10 segundos (un ciclo infinito, por ejemplo), se detiene sin congelar la página.
- Sin `input()`: los datos van escritos en el código, igual que en 3v4l.

El código fuente está en `scripts/ejecutar-php/`. Para recompilar (por ejemplo, al actualizar la versión de php-wasm en su `package.json`):

```bash
cd scripts/ejecutar-php
npm install
npm run build   # escribe en assets/php/
```

## Actualizar LibDoc

1. Reemplaza `_data/`, `_includes/`, `core/`, `.eleventy.js` y `package*.json` por los de la versión nueva, y corre `npm install`. **Conserva `_includes/hlp_pagina.liquid`**, que es propio.
2. Vuelve a aplicar los ajustes propios sobre la plantilla:

   ```bash
   node scripts/ajustar-libdoc.mjs
   ```

   El script hace dos cosas:
   - agrega la traducción al español de la interfaz, que LibDoc no incluye. Los textos están en [`scripts/libdoc-es.json`](scripts/libdoc-es.json), y si la versión nueva agrega textos, avisa cuáles quedaron en inglés;
   - hace que las migas de pan muestren el título de cada página en vez de su `key`, que aquí es la URL.
