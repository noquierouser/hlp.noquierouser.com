---
title: Entorno de trabajo en Fedora
description: Instalar Fedora, Lerd y PhpStorm para programar en PHP sobre Linux
eleventyNavigation:
    order: 10
tags:
    - linux
    - php
    - herramientas
---
Para trabajar en un proyecto de verdad hacen falta tres piezas, y cada una hace una sola cosa:

| Pieza | Para qué sirve |
|---|---|
| **[Fedora KDE](https://fedoraproject.org/kde/)** | El sistema operativo. Es Linux, que es donde corre casi todo lo que vas a publicar algún día. |
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

## 1. Fedora KDE Plasma Desktop

### Preparar el pendrive

Fedora viene en varias ediciones, que se diferencian sobre todo por el escritorio. Usamos **Fedora KDE Plasma Desktop**, que trae el escritorio KDE Plasma: barra abajo, menú de aplicaciones a la izquierda y ventanas con sus botones de siempre. Viniendo de Windows, todo está más o menos donde uno lo busca.

1. Descarga **Fedora Media Writer** desde [fedoraproject.org/kde/download](https://fedoraproject.org/kde/download). Hay versión para Windows, macOS y Linux.
2. Ábrelo, elige **Fedora KDE Plasma Desktop** y tu pendrive. El programa descarga la imagen y la graba.

En clases instalamos Fedora 44. Si al descargar te ofrece una versión más nueva, sirve igual: todo lo de esta página funciona en las versiones con soporte.

### Arrancar desde el pendrive

Con el pendrive conectado, reinicia y abre el menú de arranque. La tecla depende de la marca: suele ser `F12`, `F9`, `F2` o `Esc`, y hay que presionarla apenas enciende el equipo.

Fedora parte en **modo en vivo**: funciona completo desde el pendrive, sin tocar el disco. Aprovecha de revisar que el Wi-Fi, el sonido y el teclado respondan antes de instalar.

### Instalar

El instalador pregunta poco: idioma, teclado y qué hacer con el disco. Esa última es la única decisión delicada:

- **Compartir el disco con el otro sistema**, para conservar Windows y elegir cuál usar al encender.
- **Usar el disco completo**, que borra todo lo que hay.

En el proceso vas a crear tu usuario. Ese usuario es administrador: su contraseña es la que te va a pedir `sudo`. Al terminar, reinicia y saca el pendrive.

### Lo primero después de instalar

Abre **Konsole**, la terminal de KDE (está en el menú de aplicaciones), y actualiza el sistema:

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
curl -fsSL https://lerd.sh/install.sh | bash
```

Es el instalador oficial, tal como aparece en [lerd.sh](https://lerd.sh/getting-started/installation). `curl` lo descarga y `bash` lo ejecuta. El instalador hace todo esto:

1. Revisa si falta Podman, que es el motor de contenedores que usa, y ofrece instalarlo. Dile que sí.
2. Pide tu contraseña **una sola vez**, al principio, para los pocos ajustes que necesitan permisos de administrador.
3. Descarga Lerd y lo deja en `~/.local/bin`.
4. Prepara el entorno: Composer, el servidor web y las direcciones `.test`.

Cuando salga una versión nueva, se actualiza con `lerd update`.

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
mkdir ~/Proyectos
lerd park ~/Proyectos
```

Desde ahora, cada proyecto PHP que pongas dentro de `~/Proyectos` queda disponible en el navegador con el nombre de su carpeta: `~/Proyectos/mi-proyecto` responde en `http://mi-proyecto.test`. No hay que configurar nada más.

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

En Fedora, PhpStorm se instala con `dnf` desde un repositorio **COPR**. Los COPR son repositorios que mantienen personas o proyectos por fuera de Fedora, y hay que activarlos antes de usarlos:

```bash
sudo dnf copr enable medzik/jetbrains
sudo dnf install phpstorm
```

La primera línea activa el repositorio y pide que confirmes con `y`. La segunda instala el programa, que queda en el menú de aplicaciones como cualquier otro.

{% alert 'Este repositorio dejó de recibir versiones nuevas en octubre de 2026. La versión de PhpStorm que trae sirve para todo lo que vamos a hacer. Más adelante veremos cómo pasar a otra forma de instalarlo.', 'info', 'Sobre este repositorio' %}

### La licencia

PhpStorm es de pago, pero **gratis para estudiantes**. Pide la [licencia educativa](https://www.jetbrains.com/community/education/#students) con tu correo institucional, y después inicia sesión con tu cuenta de JetBrains en PhpStorm. Mientras llega la aprobación puedes usar el período de prueba.

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

Sigue con **[Conociendo PhpStorm](/ramos/programacion-avanzada/construyendo-un-blockbuster/conociendo-phpstorm.md)**.
