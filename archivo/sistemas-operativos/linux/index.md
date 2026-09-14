---
title: Linux en la práctica
description: La terminal no muerde (mucho)
eleventyNavigation:
    order: 10
---
Linux se aprende usándolo. Este recorrido parte desde qué es Linux y termina configurando redes, pasando por todo lo que se hace a diario en una terminal.

Los comandos son los de una distribución actual. Cuando algo difiere entre distribuciones, aparecen las dos más comunes: la familia de **Fedora/Red Hat** (`dnf`) y la de **Debian/Ubuntu** (`apt`).

## Temas

Están en orden: cada uno se apoya en los anteriores.

1. [Introducción a Linux](/archivo/sistemas-operativos/linux/introduccion-a-linux.md): qué es, de dónde viene, cómo arranca y quién es `root`.
2. [La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md): la shell, comandos básicos, cómo pedir ayuda y editores.
3. [Redirección y tuberías](/archivo/sistemas-operativos/linux/redireccion-y-tuberias.md): `>`, `>>`, `2>`, `|`, variables de entorno y un primer script.
4. [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md): cuentas, grupos, `rwx`, `chmod` y `chown`.
5. [El sistema de archivos](/archivo/sistemas-operativos/linux/sistema-de-archivos.md): el árbol de directorios, dispositivos, montaje y espacio en disco.
6. [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md): procesos, señales, systemd, logs e instalación de programas.
7. [Redes en Linux](/archivo/sistemas-operativos/linux/redes-en-linux.md): direcciones IP, subredes, DNS y herramientas.
8. [Repaso](/archivo/sistemas-operativos/linux/repaso.md): preguntas de todo el recorrido, para ponerse a prueba.

## Dónde practicar

- **Una máquina virtual** con [VirtualBox](https://www.virtualbox.org) o [GNOME Boxes](https://apps.gnome.org/es/Boxes/), e instalar ahí [Fedora](https://fedoraproject.org/es/) o [Ubuntu](https://ubuntu.com/download). Si rompes algo, no pasa nada.
- **WSL** en Windows: [instala Linux dentro de Windows](https://learn.microsoft.com/es-es/windows/wsl/install) con un solo comando.
- **Un pendrive "live"**: arranca Linux desde el pendrive sin tocar el disco.

Los ejercicios tienen la respuesta escondida: piénsala antes de abrirla.
