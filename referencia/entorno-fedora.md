---
title: Entorno de trabajo en Fedora
description: Instalar Fedora, Lerd y PhpStorm para programar en PHP sobre Linux
eleventyNavigation:
    order: 20
tags:
    - linux
    - php
    - herramientas
---
Para trabajar en un proyecto de verdad hacen falta tres piezas, y cada una hace una sola cosa:

| Pieza | Para qué sirve |
|---|---|
| **[Fedora](https://fedoraproject.org/workstation/)** | El sistema operativo. Es Linux, que es donde corre casi todo lo que vas a publicar algún día. |
| **[Lerd](https://lerd.sh)** | Deja PHP, Composer y un servidor web funcionando, y le da a cada proyecto una dirección como `mi-proyecto.test`. |
| **[PhpStorm](https://www.jetbrains.com/phpstorm/)** | El editor: autocompleta, avisa errores antes de ejecutar y trae Git integrado. |

Se instalan en ese orden.

## Antes de empezar

Instalar un sistema operativo toca el disco, así que estos pasos no son opcionales:

1. **Respalda tus archivos** en otro disco o en la nube. Todo lo que no quieras perder.
2. Consigue un **pendrive de 8 GB o más**. Se va a borrar completo.
3. Libera **al menos 40 GB** en el disco si vas a conservar Windows al lado.
4. Si tu computador tiene Windows:
    - Si usa **BitLocker** (cifrado del disco), guarda la clave de recuperación y desactívalo antes de instalar. Sin eso, Windows puede pedirte la clave en el siguiente arranque.
    - Desactiva el **Inicio rápido** en las opciones de energía. Deja el disco en un estado a medio apagar que complica compartirlo con Linux.

{% alert 'Si algo sale mal a medio camino, un respaldo convierte un desastre en una molestia. Hazlo antes, no después.', 'warning', 'Primero el respaldo' %}

## 1. Fedora Workstation

### Preparar el pendrive

1. Descarga **Fedora Media Writer** desde [fedoraproject.org/workstation/download](https://fedoraproject.org/workstation/download). Hay versión para Windows, macOS y Linux.
2. Ábrelo, elige **Fedora Workstation** y tu pendrive. El programa descarga la imagen y la graba.

En clases instalamos Fedora 44. Si al descargar te ofrece una versión más nueva, sirve igual: todo lo de esta página funciona en las versiones con soporte.

### Arrancar desde el pendrive

Con el pendrive conectado, reinicia y abre el menú de arranque. La tecla depende de la marca: suele ser `F12`, `F9`, `F2` o `Esc`, y hay que presionarla apenas enciende el equipo.

Fedora parte en **modo en vivo**: funciona completo desde el pendrive, sin tocar el disco. Aprovecha de revisar que el Wi-Fi, el sonido y el teclado respondan antes de instalar.

### Instalar

El instalador pregunta poco: idioma, teclado y qué hacer con el disco. Esa última es la única decisión delicada:

- **Compartir el disco con el otro sistema**, para conservar Windows y elegir cuál usar al encender.
- **Usar el disco completo**, que borra todo lo que hay.

Al terminar, reinicia, saca el pendrive y crea tu usuario. Ese usuario es administrador: su contraseña es la que te va a pedir `sudo`.

### Lo primero después de instalar

Abre la terminal y actualiza el sistema:

```bash
sudo dnf upgrade --refresh
```

`dnf` es el gestor de paquetes de Fedora: instala, actualiza y desinstala programas. `sudo` ejecuta el comando como administrador, por eso pide tu contraseña. Mientras la escribes no se ve nada en pantalla, ni asteriscos. Es normal.

Cuando termine, reinicia.

Si la terminal es nueva para ti, parte por [La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md).

<details>
<summary><span>Si el Wi-Fi no aparece</span></summary>

Algunas tarjetas de red necesitan un controlador que no viene incluido. Para salir del paso, conecta el celular por USB y comparte internet desde ahí ("anclaje USB" o "módem USB" en los ajustes del teléfono). Fedora lo reconoce como una red cableada. Con eso puedes actualizar el sistema, y muchas veces la actualización trae el controlador que faltaba.

</details>

## 2. Lerd

Lerd levanta PHP, un servidor web y, cuando haga falta, una base de datos. Todo corre en contenedores, así que no tienes que instalar ni configurar cada cosa por separado en el sistema.

### Instalar

```bash
sudo dnf copr enable georged/lerd
sudo dnf install lerd
```

La primera línea agrega un repositorio **COPR**. Son repositorios que mantienen personas o proyectos por fuera de Fedora; este es el oficial de Lerd. La segunda instala el programa junto con Podman, que es el motor de contenedores que usa.

Aprovecha de instalar Git, que vas a necesitar muy pronto:

```bash
sudo dnf install git
```

**Cierra la terminal y abre una nueva** para que reconozca los comandos recién instalados. Después revisa que todo esté arriba:

```bash
lerd status
```

Si algo aparece en rojo, `lerd doctor` revisa el sistema completo y dice qué falta.

### Una carpeta para tus proyectos

```bash
mkdir ~/Lerd
lerd park ~/Lerd
```

Desde ahora, cada proyecto PHP que pongas dentro de `~/Lerd` queda disponible en el navegador con el nombre de su carpeta: `~/Lerd/mi-proyecto` responde en `http://mi-proyecto.test`. No hay que configurar nada más.

### La versión de PHP

```bash
lerd use 8.5
php -v
composer --version
```

`lerd use` deja PHP 8.5 como versión por defecto. La primera vez descarga la imagen, así que puede tardar. Los otros dos comandos deberían responder con sus versiones: son el PHP y el Composer que Lerd dejó disponibles en tu terminal.

### Comandos para el día a día

| Comando | Qué hace |
|---|---|
| `lerd status` | Muestra si los servicios están funcionando |
| `lerd start` / `lerd stop` | Enciende o apaga todo |
| `lerd sites` | Lista tus proyectos y sus direcciones |
| `lerd open` | Abre en el navegador el proyecto de la carpeta actual |
| `lerd dashboard` | Abre el panel web, que también está en `http://127.0.0.1:7073` |
| `lerd doctor` | Diagnostica problemas del entorno |

La [documentación de Lerd](https://lerd.sh/getting-started/quick-start) tiene el resto.

## 3. PhpStorm

PhpStorm se instala con **JetBrains Toolbox**, una aplicación que instala y mantiene al día los programas de JetBrains.

1. Descarga Toolbox para Linux desde [jetbrains.com/toolbox-app](https://www.jetbrains.com/toolbox-app/). Es un archivo `.tar.gz`.
2. Descomprímelo y ejecútalo:

    ```bash
    cd ~/Descargas
    tar -xzf jetbrains-toolbox-*.tar.gz
    ./jetbrains-toolbox-*/bin/jetbrains-toolbox
    ```

    Si tu sistema está en inglés, la carpeta es `~/Downloads`.
3. Toolbox se instala solo y queda en el menú de aplicaciones. Ya puedes borrar lo que descargaste.
4. En la lista de Toolbox, busca **PhpStorm** y presiona **Install**.

### La licencia

PhpStorm es de pago, pero **gratis para estudiantes**. Pide la [licencia educativa](https://www.jetbrains.com/community/education/#students) con tu correo institucional, y después inicia sesión con tu cuenta de JetBrains en Toolbox o en PhpStorm. Mientras llega la aprobación puedes usar el período de prueba.

{% alert 'El repositorio COPR medzik/jetbrains fue descontinuado en octubre de 2026: ya no recibe versiones nuevas ni correcciones de seguridad. Si instalaste PhpStorm desde ahí, sigue funcionando, pero no se va a actualizar más. Conviene desinstalar ese paquete, quitar el repositorio con <code>sudo dnf copr remove medzik/jetbrains</code> e instalar PhpStorm con Toolbox. Tus proyectos y tu configuración no se pierden.', 'warning', 'Si lo instalaste desde el COPR de medzik' %}

## Comprobar que todo quedó bien

Con las tres piezas instaladas, esto debería funcionar sin errores:

```bash
lerd status
php -v
composer --version
git --version
```

Y PhpStorm debería abrir desde el menú de aplicaciones.

Si algo falla, **guarda el mensaje de error completo**, tal cual sale. Sin el mensaje, nadie te puede ayudar.

---

Sigue con **[Conociendo PhpStorm](/referencia/conociendo-phpstorm.md)**.
