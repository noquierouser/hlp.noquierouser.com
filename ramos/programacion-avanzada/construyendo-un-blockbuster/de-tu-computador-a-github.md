---
title: De tu computador a GitHub
description: Crear una cuenta, armar un proyecto Laravel, ponerlo bajo Git y publicarlo
eleventyNavigation:
    order: 30
tags:
    - git
    - github
    - laravel
---
Un proyecto que vive solo en tu computador tiene dos problemas: si el disco muere, se acabó, y nadie más puede trabajar en él. Esta página resuelve los dos. Al final vas a tener un proyecto Laravel funcionando, con historial de cambios y publicado en GitHub.

Necesitas el [entorno instalado](/ramos/programacion-avanzada/construyendo-un-blockbuster/entorno-fedora.md): Lerd, Git y PhpStorm.

## Git y GitHub no son lo mismo

- **Git** es un programa que corre en tu computador. Guarda el historial de tu proyecto: qué cambió, cuándo y por qué. Funciona sin internet.
- **GitHub** es un sitio web que guarda una copia de ese historial. Sirve de respaldo y es el lugar donde un equipo junta su trabajo.

Puedes usar Git sin GitHub. Lo contrario no tiene sentido.

## 1. Crear tu cuenta en GitHub

Entra a [github.com](https://github.com) y elige **Sign up**. Dos consejos antes de llenar el formulario:

- **El nombre de usuario es público, y cambiarlo después rompe los enlaces a tu trabajo.** Va a aparecer en cada cosa que publiques, y es lo que va a ver alguien que revise tu trabajo cuando postules a un empleo. Elige uno que puedas poner en un currículum.
- **Usa un correo al que vayas a tener acceso siempre.** El institucional se pierde al egresar. Puedes agregarlo después como correo secundario.

Confirma el correo con el código que te llega, y listo.

## 2. Presentarte ante Git

Cada cambio que guardes queda firmado con tu nombre y tu correo. Git no los adivina: hay que decírselos una vez.

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.cl"
git config --global init.defaultBranch main
```

Usa el mismo correo de tu cuenta de GitHub, para que GitHub reconozca tus cambios como tuyos. La tercera línea hace que la rama principal de tus proyectos nuevos se llame `main`, que es como la llama GitHub.

Para revisar cómo quedó:

```bash
git config --global --list
```

## 3. Conectar tu computador con GitHub

GitHub necesita saber que quien sube cambios eres tú. La contraseña de la cuenta **no sirve** para eso desde la terminal. Lo que se usa es una **llave SSH**: un par de archivos, uno privado que se queda en tu computador y uno público que le entregas a GitHub.

### Crear la llave

```bash
ssh-keygen -t ed25519 -C "tu-correo@ejemplo.cl"
```

Pregunta dónde guardarla (presiona `Enter` para aceptar el lugar por defecto) y si quieres ponerle una frase de contraseña. Puedes dejarla vacía con `Enter`; si pones una, te la va a pedir al usar la llave.

### Entregarle la parte pública a GitHub

Muestra la llave pública:

```bash
cat ~/.ssh/id_ed25519.pub
```

Sale una sola línea larga que empieza con `ssh-ed25519`. Cópiala completa. En GitHub:

1. Clic en tu foto, arriba a la derecha, y luego **Settings**.
2. En el menú de la izquierda, **SSH and GPG keys**.
3. **New SSH key**. Ponle un título que identifique el computador ("Notebook Fedora") y pega la llave.

{% alert 'El archivo que termina en .pub es el público: ese se comparte. El otro, id_ed25519 sin extensión, es el privado. No se copia, no se envía y no se sube a ninguna parte.', 'warning', 'La llave privada no sale de tu computador' %}

### Probar

```bash
ssh -T git@github.com
```

La primera vez pregunta si confías en el servidor: escribe `yes`. Si todo está bien, responde con tu nombre de usuario:

```plaintext
Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

La llave se crea **una vez por computador**. Si trabajas en dos equipos, cada uno tiene la suya.

## 4. Crear un proyecto Laravel

[Composer](https://getcomposer.org) es el gestor de dependencias de PHP: descarga las bibliotecas que un proyecto necesita. También sabe crear un proyecto nuevo a partir de una plantilla.

```bash
cd ~/Lerd
composer create-project laravel/laravel mi-proyecto
cd mi-proyecto
```

Ese comando hace bastante más que copiar archivos:

1. Descarga la plantilla de [Laravel](https://laravel.com/docs/13.x/installation) en la carpeta `mi-proyecto`.
2. Descarga el framework y sus dependencias en `vendor/`.
3. Crea el archivo `.env` con la configuración de tu computador, y le genera una clave.
4. Crea una base de datos SQLite y las tablas iniciales.

Como la carpeta está dentro de `~/Lerd`, el proyecto ya tiene dirección. Abre `http://mi-proyecto.test` en el navegador, o ejecuta `lerd open`, y deberías ver la página de bienvenida de Laravel.

Ábrelo también en PhpStorm: **Open** y eliges la carpeta. Si no conoces el programa, pasa por [Conociendo PhpStorm](/ramos/programacion-avanzada/construyendo-un-blockbuster/conociendo-phpstorm.md).

## 5. Poner el proyecto bajo Git

Por ahora es una carpeta cualquiera. Para que Git empiece a llevar su historial:

```bash
git init
git status
```

`git init` crea el repositorio: una carpeta oculta `.git` donde se guarda todo el historial. `git status` es el comando que más vas a usar: muestra en qué estado está cada archivo. En este momento lista todo en rojo, como archivos sin seguimiento.

### Lo que no se sube

Si miras con atención, `git status` no menciona `vendor/` ni `.env`. No es un error: el proyecto trae un archivo `.gitignore` que le dice a Git qué ignorar.

| Queda fuera | Por qué |
|---|---|
| `vendor/` | Son miles de archivos que Composer puede volver a descargar cuando quiera |
| `.env` | Tiene claves y configuración de **tu** computador |
| `node_modules/` | Lo mismo que `vendor/`, pero para JavaScript |
| `.idea/` | Configuración personal de PhpStorm |
| `database/database.sqlite` | Tu base de datos local, con tus datos de prueba |

La regla general: **se sube lo que escribiste, no lo que se puede regenerar ni lo que es secreto.**

### El primer commit

Guardar un cambio en Git tiene dos pasos:

```bash
git add .
git commit -m "Proyecto base de Laravel"
```

- `git add .` **prepara** todos los cambios de la carpeta actual. Es elegir qué va a entrar en la foto.
- `git commit` **toma la foto** y la guarda en el historial, con un mensaje que explica qué es.

```mermaid El camino de un cambio
flowchart LR
    A["Tus archivos"] -->|git add| B["Preparado"]
    B -->|git commit| C["Historial local"]
    C -->|git push| D["GitHub"]
```

Revisa que quedó:

```bash
git status
git log --oneline
```

`git status` ahora dice que no hay nada pendiente, y `git log` muestra tu commit. El historial ya existe, pero solo en tu computador.

## 6. Publicar en GitHub

### Crear el repositorio vacío

En GitHub, botón **+** de arriba a la derecha y luego **New repository**:

- **Repository name:** el mismo nombre de la carpeta, `mi-proyecto`.
- **Public** o **Private**, como prefieras.
- **No marques** las opciones de agregar README, `.gitignore` ni licencia. El repositorio tiene que nacer vacío, porque el contenido lo vas a subir tú.

Al crearlo, GitHub muestra una página con instrucciones. Arriba hay una dirección: elige **SSH** y cópiala. Se ve así: `git@github.com:tu-usuario/mi-proyecto.git`.

### Conectar y subir

```bash
git remote add origin git@github.com:tu-usuario/mi-proyecto.git
git push -u origin main
```

- `git remote add` le dice a tu repositorio dónde está su copia en internet. `origin` es el nombre que se le da por costumbre a esa copia.
- `git push` sube tus commits. El `-u` deja enlazada tu rama `main` con la de GitHub: se escribe solo esta vez, y desde ahora basta con `git push`.

Recarga la página del repositorio en GitHub. Ahí está tu proyecto, sin `vendor/` y sin `.env`, que es exactamente lo que queríamos.

### El atajo desde PhpStorm

PhpStorm puede hacer los pasos 5 y 6 por ti. En el menú principal: **Git → GitHub → Share Project on GitHub**. Si el proyecto todavía no tiene Git, la opción está en **VCS → Share Project on GitHub**.

Te pide iniciar sesión en GitHub desde el navegador, y después el nombre del repositorio y si es privado. Al presionar **Share** crea el repositorio y sube el proyecto.

Vale la pena hacerlo a mano al menos una vez. Cuando algo falle, y va a fallar, los mensajes de error hablan de `remote`, `origin` y `push`, y conviene saber qué son.

## Cuando algo sale mal

<details>
<summary><span>Permission denied (publickey)</span></summary>

GitHub no reconoce tu llave. Revisa que `ssh -T git@github.com` responda con tu usuario. Si no, la llave pública no está cargada en tu cuenta, o estás en un computador distinto del que la creó.

</details>

<details>
<summary><span>remote origin already exists</span></summary>

Ya habías ejecutado `git remote add`. Revisa adónde apunta con `git remote -v`. Si la dirección está mal, corrígela:

```bash
git remote set-url origin git@github.com:tu-usuario/mi-proyecto.git
```

</details>

<details>
<summary><span>src refspec main does not match any</span></summary>

Estás tratando de subir una rama `main` que no existe. Pasa por dos motivos: todavía no has hecho ningún commit, o tu rama se llama `master`. Revísalo con `git status`, que en la primera línea dice en qué rama estás. Si se llama `master`, cámbiale el nombre:

```bash
git branch -M main
```

</details>

<details>
<summary><span>Updates were rejected</span></summary>

El repositorio de GitHub no estaba vacío: seguramente lo creaste con un README. Como está recién creado y no tiene nada tuyo, lo más simple es borrarlo en GitHub (*Settings*, al final de la página) y crearlo de nuevo, sin marcar nada.

</details>

## En resumen

| Comando | Qué hace |
|---|---|
| `git init` | Convierte una carpeta en un repositorio |
| `git status` | Muestra el estado de los archivos |
| `git add .` | Prepara todos los cambios |
| `git commit -m "mensaje"` | Guarda los cambios preparados en el historial |
| `git log --oneline` | Muestra el historial, un commit por línea |
| `git remote add origin <dirección>` | Enlaza el repositorio con su copia en GitHub |
| `git push` | Sube los commits a GitHub |

---

Sigue con **[Clonar, cambiar y subir](/ramos/programacion-avanzada/construyendo-un-blockbuster/clonar-cambiar-y-subir.md)**.
