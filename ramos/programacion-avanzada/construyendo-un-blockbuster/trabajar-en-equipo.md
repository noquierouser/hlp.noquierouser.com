---
title: Trabajar en equipo sobre el mismo código
description: Ramas compartidas, conflictos en PhpStorm y correcciones a un pull request
eleventyNavigation:
    order: 70
tags:
    - git
    - github
    - phpstorm
---
Mientras cada quien tenía su modelo, casi nadie tocaba los archivos de otra persona. Eso se acabó: ahora varias personas van a cambiar los mismos archivos, a veces la misma rama, y a corregirse entre sí. Git está hecho para eso, pero hay que saber cuatro cosas.

## 1. Partir siempre desde lo último

Antes de crear una rama, y cada vez que te sientes a trabajar:

```bash
git switch main
git pull
composer install
php artisan migrate
```

Y recién entonces la rama nueva:

```bash
git switch -c peliculas-listado
```

En PhpStorm: **Git → Update Project** (`Ctrl+T`) trae lo último, y **Git → New Branch** crea la rama.

Una rama que nace de un `main` viejo trae problemas que se podían evitar.

## 2. Trabajar en la rama de otra persona

Una rama que está en GitHub es de todo el equipo. Para sumarte a la de alguien más:

```bash
git fetch
git switch peliculas-listado
```

`git fetch` actualiza la lista de ramas que existen en GitHub. `git switch` te deja en esa rama, enlazada con la de GitHub. En PhpStorm: **Git → Fetch**, después **Git → Branches**, busca la rama bajo *Remote* y elige **Checkout**.

Desde ahí es lo de siempre, con un paso antes de subir:

```bash
git pull
git add .
git commit -m "Corrige el enlace al detalle en el listado de películas"
git push
```

El `git pull` trae lo que la otra persona haya subido mientras tanto.

### Si el push es rechazado

```plaintext
! [rejected]        peliculas-listado -> peliculas-listado (fetch first)
```

No es un error tuyo: alguien subió commits a esa rama después de tu último `pull`, y Git no deja pasar por encima. Trae lo nuevo y vuelve a subir:

```bash
git pull
git push
```

Si los cambios de la otra persona tocan las mismas líneas que los tuyos, aparece un conflicto. Se resuelve [como cualquier otro](#a_4-resolver-un-conflicto-en-phpstorm).

{% alert 'Si Git rechaza tu push, la solución nunca es <code>git push --force</code>. Eso borra de GitHub los commits de tu compañero o compañera. Siempre: pull, resolver, push.', 'danger', 'Nunca fuerces un push' %}

### Cuando el commit es de dos personas

Si lo escribieron juntos en un solo computador, el commit puede llevar las dos firmas. Deja una línea en blanco después del mensaje y agrega:

```plaintext
Listado de socios con edad y estado

Co-authored-by: Nombre Apellido <correo-de-su-cuenta-de-github@ejemplo.com>
```

GitHub muestra a las dos personas como autoras. El correo tiene que ser el de la cuenta de GitHub de quien acompañó.

## 3. Mantener tu rama al día con main

Mientras trabajas, `main` sigue avanzando: la PM fusiona los pull requests de los demás. Mientras más tiempo pase sin traer esos cambios, más grande es el conflicto del final. Tráelos seguido, y **siempre antes de pedir la revisión**:

```bash
git fetch
git merge origin/main
```

En PhpStorm: **Git → Fetch**, y después **Git → Merge**, eligiendo `origin/main`.

Si nadie tocó lo mismo que tú, Git junta todo solo y crea un commit de mezcla. Si alguien sí lo hizo, hay conflicto.

## 4. Resolver un conflicto en PhpStorm

Un conflicto aparece cuando dos personas cambiaron **las mismas líneas** del mismo archivo, y Git no puede decidir con cuál quedarse. No pierde nada: se detiene y pregunta.

El caso típico de este proyecto: tú agregaste una ruta al final de `routes/web.php`, y otra persona agregó otra ruta en el mismo lugar.

### El diálogo de conflictos

Al hacer el *merge*, PhpStorm abre una ventana **Conflicts** con los archivos en conflicto y tres botones:

| Botón | Qué hace | Cuándo sirve |
|---|---|---|
| **Accept Yours** | Se queda con tu versión y descarta la otra | Casi nunca |
| **Accept Theirs** | Se queda con la otra versión y descarta la tuya | Casi nunca |
| **Merge…** | Abre el editor para combinarlas | Casi siempre |

Los dos primeros botan el trabajo de alguien. Usa **Merge…**

Si cerraste la ventana sin querer, vuelve con **Git → Resolve Conflicts**.

### El editor de tres paneles

| Panel | Qué muestra |
|---|---|
| Izquierda | Tu versión: lo que hay en tu rama |
| Centro | El resultado: lo que va a quedar en el archivo |
| Derecha | La otra versión: lo que viene de `main` o de la otra persona |

Los cambios están marcados con colores, y cada uno tiene dos controles en el borde:

- **`»`** o **`«`**: lleva ese cambio al centro.
- **`✕`**: lo descarta.

El procedimiento:

1. Presiona **Apply non-conflicting changes** (el botón de la barra con las dos flechas hacia el centro). Acepta todo lo que no choca, y deja a la vista solo los conflictos de verdad, en rojo.
2. Para cada conflicto, decide qué tiene que quedar. Con dos rutas nuevas la respuesta es **las dos**: acepta la de la izquierda y también la de la derecha.
3. Revisa el panel del centro. Es código que va a ejecutarse: mira que no falte un `use` arriba, ni un `;`, y que no haya quedado nada repetido. Puedes escribir directamente ahí.
4. Cuando no queden marcas pendientes, presiona **Apply**.

Repite con cada archivo de la lista.

### Terminar la mezcla

Un conflicto resuelto todavía no está guardado. Falta el commit:

1. **Prueba primero.** Abre las pantallas que tocan esos archivos. Que Git esté conforme no significa que el código funcione.
2. Haz el commit (`Ctrl+K`). PhpStorm ya propone el mensaje de la mezcla.
3. Sube (`Ctrl+Shift+K`).

Si te enredaste y quieres volver a como estabas antes del *merge*: **Git → Abort Merge**. No se pierde nada, y puedes intentarlo de nuevo.

### Lo mismo, a mano

Sin PhpStorm, Git deja el conflicto marcado dentro del archivo:

```PHP
<<<<<<< HEAD
Route::get('/socios', [SocioController::class, 'index'])->name('socios.index');
=======
Route::get('/copias', [CopiaController::class, 'index'])->name('copias.index');
>>>>>>> origin/main
```

Entre `<<<<<<<` y `=======` está lo tuyo; entre `=======` y `>>>>>>>`, lo que viene de afuera. Se edita hasta dejar lo que corresponde, **se borran las tres líneas de marcas**, y se termina con:

```bash
git add routes/web.php
git commit
```

Si alguna vez ves esas marcas en un archivo del proyecto, alguien subió un conflicto sin resolver.

## 5. Corregir un pull request

Un pull request no es una entrega cerrada: es una conversación. Sigue abierto hasta que se fusiona, y **todo lo que subas a su rama aparece en él**.

### Si te piden cambios a ti

1. Lee los comentarios en la pestaña **Conversation** o **Files changed** del pull request.
2. Corrige en tu computador, en la misma rama.
3. Haz un commit que diga qué corregiste, y `git push`.
4. Responde cada comentario contando qué hiciste, y márcalo con **Resolve conversation**.

No crees otro pull request ni otra rama: el mismo se actualiza solo.

### Si corriges el trabajo de otra persona

1. Cámbiate a su rama, como en el [paso 2](#a_2-trabajar-en-la-rama-de-otra-persona), y prueba la pantalla.
2. Si encuentras algo, arréglalo ahí mismo: commit y `git push` a esa rama.
3. Deja un comentario en el pull request explicando **qué cambiaste y por qué**. Quien armó la pantalla tiene que poder entender tu corrección sin preguntarte.

Antes de seguir trabajando en una rama que otra persona corrigió, haz `git pull`.

### Mensajes de commit que sirven

El mensaje es lo único que el resto del equipo lee sin abrir el código.

| En vez de | Escribe |
|---|---|
| `cambios` | `Listado de películas con género y clasificación` |
| `arreglo` | `Corrige el error 500 cuando la película no tiene clasificación` |
| `listo` | `Agrega el filtro por estado a la lista de copias` |

## En resumen

| Momento | Qué haces |
|---|---|
| Al sentarte a trabajar | `git pull` |
| Antes de subir | `git pull`, y después `git push` |
| Antes de pedir la revisión | `git merge origin/main`, y probar |
| Si hay conflicto | **Merge…**, conservar el trabajo de ambos, probar, commit |
| Si te piden cambios | Commit en la misma rama y `git push` |
| Si el push es rechazado | `git pull`. Nunca `--force` |
