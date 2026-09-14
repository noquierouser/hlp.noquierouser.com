---
title: Introducción a Linux
description: Qué es, de dónde viene y quién manda aquí
eleventyNavigation:
    order: 10
tags:
    - linux
---
Antes de meter las manos en la terminal, conviene saber con qué estamos tratando.

## Hardware, software y el que hace de puente

Un computador es un montón de piezas: procesador, memoria, disco, tarjeta de red, teclado. El hardware hace exactamente lo que le dicen, pero habla un idioma muy primitivo. Los programas que usamos (un navegador, un editor) no pueden ni deben hablar directo con cada pieza.

Ahí entra el **sistema operativo**. Hace de puente entre los programas y el hardware, y además reparte los recursos: decide qué programa usa el procesador, cuánta memoria le toca a cada uno y quién puede leer qué archivo.

```plaintext
   Usuario
      │
   Programas         (navegador, editor, terminal)
      │
   Kernel            (el núcleo del sistema operativo)
      │
   Hardware          (procesador, memoria, discos, red)
```

La parte central del sistema operativo es el **kernel** (núcleo): el programa que tiene control total del hardware. **Linux, en rigor, es un kernel**, escrito principalmente en C. Todo lo demás (la terminal, los comandos, el escritorio) son programas que corren encima.

## De dónde viene

- **1969:** en los Laboratorios Bell, Ken Thompson y Dennis Ritchie crean **UNIX**. En 1973 lo reescriben en C, algo inédito para un sistema operativo, y eso le permite llegar a muchas máquinas distintas.
- **1983:** Richard Stallman anuncia el proyecto **GNU** (*GNU's Not Unix*): un sistema operativo al estilo UNIX, pero **libre**. En 1985 crea la **Free Software Foundation** (FSF) y en 1989 publica la licencia **GPL**. GNU logra casi todo (compilador, shell, comandos), pero su kernel nunca termina de estar listo.
- **1987:** Andrew Tanenbaum publica **MINIX**, un pequeño UNIX para enseñar sistemas operativos.
- **1991:** Linus Torvalds, estudiante en Finlandia, escribe un kernel para su PC con procesador 386, inspirado en MINIX. Lo llama **Linux**, y al poco tiempo lo publica bajo la GPL.

Juntando el kernel Linux con las herramientas de GNU se obtiene un sistema operativo completo. Por eso hay quienes insisten en llamarlo **GNU/Linux**.

## Libre no es lo mismo que gratis

La GPL es una licencia de **software libre**, y libre se refiere a libertad, no a precio. Un programa es libre si puedes:

1. Usarlo para lo que quieras.
2. Estudiar cómo funciona (tener acceso al código fuente) y modificarlo.
3. Compartir copias.
4. Compartir tus versiones modificadas.

La GPL agrega una condición: si distribuyes una versión modificada, también debe ser libre. Linux es gratis casi siempre, pero lo importante es que es **libre**. El contraste es el software **propietario**, del que solo recibes el programa ya compilado y una licencia que dice qué puedes hacer con él.

Más en [¿Qué es el software libre?](https://www.gnu.org/philosophy/free-sw.es.html), de la FSF.

## Distribuciones

Un kernel solo no sirve de mucho. Una **distribución** junta el kernel con miles de programas, un instalador, un sistema para instalar paquetes y una configuración inicial. El kernel es el mismo; lo que cambia es todo lo que viene alrededor.

| Familia | Distribuciones | Instalar paquetes |
|---|---|---|
| Debian | [Debian](https://www.debian.org/index.es.html), [Ubuntu](https://ubuntu.com), Linux Mint | `apt` |
| Red Hat | [Fedora](https://fedoraproject.org/es/), Red Hat Enterprise Linux, AlmaLinux, Rocky Linux | `dnf` |
| Independientes | [Arch Linux](https://archlinux.org), openSUSE | `pacman`, `zypper` |

{% alert 'En 2012 el laboratorio usaba CentOS 6, una copia gratuita de Red Hat Enterprise Linux muy popular en servidores. CentOS Linux dejó de publicarse (su última versión llegó a fin de soporte en 2024) y fue reemplazado por CentOS Stream. Hoy ese lugar lo ocupan AlmaLinux y Rocky Linux. Otras distribuciones de la época, como Mandrake o Knoppix, ya no existen o quedaron en segundo plano.', 'info', 'Nota histórica' %}

## Qué tiene de especial

- **Multiusuario:** varias personas pueden usar el mismo equipo al mismo tiempo, cada una con sus archivos y permisos.
- **Multitarea:** muchos programas corriendo a la vez.
- **Multiplataforma:** corre en PC, servidores, teléfonos, routers, televisores y en una Raspberry Pi del tamaño de una tarjeta de crédito.
- **Permisos en todo:** cada archivo tiene dueño y reglas de acceso. Esto es la base de su seguridad, y lo vemos en [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md).

Y está en todas partes: la mayoría de los servidores de internet, todos los supercomputadores de la lista [TOP500](https://www.top500.org), la nube y cada teléfono Android (que usa el kernel Linux).

## Cómo arranca

Cuando prendes el computador pasan varias cosas en cadena:

1. **Firmware (UEFI).** El programa grabado en la placa madre revisa el hardware y busca algo que arrancar.
2. **Cargador de arranque.** Un pequeño programa, como [GRUB](https://www.gnu.org/software/grub/) o systemd-boot, muestra el menú (si tienes varios sistemas) y carga el kernel elegido.
3. **Kernel.** Se carga en memoria, detecta el hardware y monta el sistema de archivos principal.
4. **systemd.** El kernel lanza el primer proceso, con identificador (PID) 1: [systemd](https://systemd.io). Este levanta todo lo demás: servicios, red, pantalla de inicio de sesión.

Lo que pasa desde el paso 4 en adelante lo vemos en [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md).

{% alert 'Antes el firmware era la BIOS, y el primer proceso era init, que leía /etc/inittab para saber hasta qué nivel de ejecución (runlevel) levantar el sistema. systemd reemplazó a init en casi todas las distribuciones alrededor de 2015.', 'info', 'Nota histórica' %}

## root: el que puede todo

En todo Linux existe un usuario con poder total sobre el sistema: **root** (el superusuario). Puede leer y modificar cualquier archivo, instalar y borrar programas, crear usuarios y apagar el equipo.

Justamente por eso **no se usa para el trabajo de todos los días**. Un error de tipeo como root puede borrar el sistema completo, y un programa malicioso que corra como root puede hacer lo que quiera.

Lo habitual es trabajar con un usuario normal y pedir permisos de root solo para la tarea puntual, con [`sudo`](https://www.sudo.ws):

```bash
sudo dnf install htop    # Fedora
sudo apt install htop    # Debian/Ubuntu
```

`sudo` pide **tu** contraseña, revisa si tienes permiso para actuar como administrador, y ejecuta ese único comando como root.

## Ejercicios

<details>
<summary><span>¿Para qué es necesario usar la cuenta de root?</span></summary>

Para tareas de administración del sistema:

- instalar, actualizar y eliminar programas;
- editar archivos de configuración del sistema (en `/etc`);
- crear, modificar y eliminar usuarios y grupos;
- iniciar, detener y configurar servicios;
- montar discos y cambiar la configuración de red.

En la práctica, casi nunca se entra "como root": se usa `sudo` para ejecutar solo el comando que lo necesita.

</details>

<details>
<summary><span>Si quiero leer las noticias en internet, ¿por qué no es recomendable hacerlo como root?</span></summary>

Por seguridad. Un navegador está expuesto a todo lo que hay en internet: páginas maliciosas, descargas, extensiones. Si el navegador corre como root y alguien logra aprovechar una vulnerabilidad, obtiene control **total** del sistema.

Con un usuario normal, el daño queda limitado a lo que ese usuario puede tocar. Es la misma razón por la que los escritorios modernos directamente no dejan iniciar una sesión gráfica como root.

</details>

<details>
<summary><span>Con un usuario distinto de root, ¿por qué no puedo eliminar un archivo que está en <code>/etc</code>?</span></summary>

Porque borrar un archivo no depende de los permisos **del archivo**, sino de los permisos **del directorio** que lo contiene: eliminar es modificar la lista de archivos del directorio.

El directorio `/etc` pertenece a root y solo root tiene permiso de escritura sobre él. Se puede comprobar con:

```bash
ls -ld /etc
```

```plaintext
drwxr-xr-x. 1 root root 5076 sep 12 09:30 /etc
```

El `w` (escritura) aparece solo para el dueño, root. Los permisos se explican en detalle en [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md).

</details>

---

Sigue con **[La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md)**.
