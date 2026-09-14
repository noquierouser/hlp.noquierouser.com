---
title: Estructura del sistema operativo
description: Qué hace, cómo se le piden cosas y cómo está armado por dentro
eleventyNavigation:
    order: 30
tags:
    - sistemas-operativos
---
Un sistema operativo es uno de los programas más grandes y complejos que existen: el kernel Linux tiene decenas de millones de líneas de código. Para entenderlo hay que mirarlo desde tres ángulos: qué responsabilidades tiene, qué servicios ofrece y cómo está organizado por dentro.

## Sus responsabilidades

| Componente | De qué se encarga |
|---|---|
| **Procesos** | Crearlos y eliminarlos, suspenderlos y reanudarlos, y darles formas de sincronizarse y comunicarse |
| **Memoria principal** | Saber qué partes de la memoria están en uso y por quién, decidir qué cargar y asignar o liberar espacio |
| **Almacenamiento secundario** | Administrar el espacio libre, asignar espacio y decidir en qué orden atender las solicitudes al disco |
| **Entrada y salida** | Búferes y cachés, una interfaz común para los dispositivos y los drivers de cada uno |
| **Archivos** | Crear y eliminar archivos y directorios, operar sobre ellos y mapearlos al almacenamiento |
| **Protección** | Controlar el acceso de programas y usuarios a los recursos, y distinguir el uso autorizado del no autorizado |
| **Redes** | Comunicar el equipo con otros y dar acceso a recursos remotos |
| **Intérprete de comandos** | Leer lo que el usuario pide y ejecutarlo: la [shell](/archivo/sistemas-operativos/linux/linea-de-comandos.md) |

## Sus servicios

Visto desde los programas y los usuarios, el sistema operativo ofrece:

- **Ejecución de programas:** cargarlos en memoria, ejecutarlos y terminarlos.
- **Operaciones de E/S:** los programas no pueden hablar con los dispositivos, así que el sistema operativo lo hace por ellos.
- **Manejo de archivos:** leer, escribir, crear, borrar y buscar.
- **Comunicación** entre procesos, en el mismo equipo o a través de la red.
- **Detección de errores** en la CPU, la memoria, los dispositivos o los programas.

Y otros servicios que no son para el usuario, sino para que el sistema funcione bien:

- **Asignación de recursos** entre muchos usuarios y procesos a la vez.
- **Contabilidad:** registrar quién usa qué y cuánto (en Linux, por ejemplo, con los *cgroups*).
- **Protección y seguridad:** que todo acceso a los recursos esté controlado.

## Llamadas al sistema

Las **llamadas al sistema** (*system calls*) son la interfaz entre un programa en ejecución y el sistema operativo: la única puerta para pedirle servicios.

### Cómo funciona una llamada

Tomemos `read()`, la llamada que lee datos de un archivo:

1. El programa pone en registros de la CPU el **número** de la llamada (cada una tiene el suyo) y sus **parámetros**.
2. Ejecuta una instrucción especial que provoca una **trampa**. La CPU pasa a **modo kernel** y salta a la rutina del sistema operativo que atiende llamadas.
3. El sistema operativo **verifica** que los parámetros sean válidos y que el programa tenga permiso.
4. Hace el trabajo, pidiéndole al driver que lea del disco.
5. Deja el resultado, vuelve a **modo usuario** y el programa sigue en la instrucción siguiente.

Los parámetros se pueden pasar de tres formas: **en registros** (lo más rápido, y lo que hace Linux cuando son pocos), **en una tabla en memoria** cuya dirección va en un registro, o **en la pila** del programa.

### Casi nunca se llaman directamente

Los programas rara vez hacen llamadas al sistema a mano. Usan una **API**, una biblioteca de funciones que las envuelve:

- en C, la biblioteca estándar (`libc`), que sigue el estándar **POSIX** en sistemas tipo UNIX;
- en Windows, la **API de Windows**.

Y los lenguajes de más alto nivel se construyen encima. Cuando en PHP escribes:

```php
file_put_contents('notas.txt', "hola\n");
```

PHP llama a funciones de la biblioteca de C, que terminan haciendo, al menos, las llamadas al sistema `openat` (abrir el archivo), `write` (escribir) y `close` (cerrarlo). En Linux puedes espiar las llamadas al sistema que hace cualquier programa con [`strace`](https://man7.org/linux/man-pages/man1/strace.1.html) (hay que instalarlo):

```bash
strace ls /tmp              # todas las llamadas, una por línea
strace -c ls /tmp           # un resumen: cuántas veces se llamó a cada una
```

Hasta un simple `ls` hace decenas de llamadas al sistema.

### Tipos de llamadas

Linux tiene cerca de cuatrocientas (la lista está en [`man 2 syscalls`](https://man7.org/linux/man-pages/man2/syscalls.2.html)). Se agrupan así:

| Tipo | Ejemplos de lo que hacen | En Linux |
|---|---|---|
| **Control de procesos** | Crear, ejecutar, terminar, esperar a otro proceso | `fork`, `execve`, `exit`, `wait4` |
| **Archivos** | Crear, abrir, leer, escribir, cerrar, cambiar atributos | `openat`, `read`, `write`, `close`, `chmod` |
| **Dispositivos** | Pedir, configurar, leer y escribir dispositivos | `ioctl`, `read`, `write` |
| **Información** | Fecha y hora, datos del sistema o de un proceso | `getpid`, `clock_gettime`, `uname` |
| **Comunicación** | Conexiones, enviar y recibir mensajes, memoria compartida | `socket`, `sendto`, `pipe`, `mmap` |

Fíjate que en la fila de dispositivos se repiten `read` y `write`: como en Linux [todo es un archivo](/archivo/sistemas-operativos/linux/sistema-de-archivos.md#todo-es-un-archivo), las mismas llamadas sirven para ambos.

## Programas del sistema

La mayoría de los usuarios nunca ve una llamada al sistema: ve **programas del sistema**, que ofrecen un entorno cómodo para trabajar. Administradores de archivos, editores, compiladores, la terminal, el comando `ps` o un monitor de recursos. Para el usuario, el sistema operativo **es** lo que ofrecen estos programas.

## Cómo está organizado por dentro

### Estructura simple

Los primeros sistemas para computadores personales no tenían mucha estructura. **MS-DOS** buscaba hacer lo máximo en el mínimo espacio: los programas podían saltarse las capas y escribir directamente en el hardware. Si un programa fallaba, se caía el sistema completo.

### Monolítica

Todo el sistema operativo (procesos, memoria, archivos, drivers, red) es **un solo programa grande** que corre en modo kernel. Sus partes se llaman directamente entre sí, sin intermediarios.

- **Ventaja:** es muy rápido, porque no hay barreras internas.
- **Desventaja:** un error en cualquier parte (por ejemplo, en un driver) puede botar el sistema completo, y es difícil de mantener.

El UNIX original y **Linux** son monolíticos.

### Por capas

El sistema se divide en **niveles**, donde cada uno solo usa servicios del nivel inmediatamente inferior. La capa 0 es el hardware y la más alta es la interfaz con el usuario. El ejemplo clásico es el sistema **THE** de Dijkstra (1968):

| Capa | Función |
|---|---|
| 5 | Programas de usuario |
| 4 | Búferes para dispositivos de E/S |
| 3 | Driver de la consola del operador |
| 2 | Administración de memoria |
| 1 | Planificación de la CPU |
| 0 | Hardware |

- **Ventaja:** cada capa se puede construir y probar sobre las de abajo, que ya funcionan.
- **Desventaja:** no siempre es fácil decidir qué va en cada capa, y pasar por todas las capas para cada operación es lento. Casi ningún sistema actual es estrictamente por capas.

### Microkernel

La idea opuesta a la monolítica: dejar en el kernel **lo mínimo indispensable** (procesos, memoria básica y comunicación entre procesos) y sacar todo lo demás (sistema de archivos, drivers, red) a **procesos normales**, en modo usuario, que se comunican mediante mensajes.

- **Ventaja:** si un driver falla, se cae ese proceso y se puede reiniciar, sin botar el sistema. Es más seguro y fácil de extender.
- **Desventaja:** tantos mensajes entre procesos tienen un costo en rendimiento.

Ejemplos: **MINIX 3**, **QNX** (usado en autos) y **seL4**, cuya corrección está demostrada matemáticamente.

### Módulos

Los sistemas modernos combinan ideas. **Linux** es monolítico, pero **modular**: muchas partes (drivers, sistemas de archivos) son **módulos** que se cargan y descargan mientras el sistema corre, solo cuando se necesitan.

```bash
lsmod                  # los módulos cargados
modinfo ext4           # información de un módulo
```

### Híbridos

**Windows** (desde Windows NT) y **macOS** (con su núcleo XNU, que combina el microkernel Mach con partes de BSD) mezclan un núcleo con estructura de microkernel y muchos servicios corriendo dentro del kernel, por rendimiento.

| Estructura | Idea | Ejemplos |
|---|---|---|
| Monolítica | Todo en un programa, en modo kernel | UNIX original, Linux |
| Por capas | Cada nivel usa solo al de abajo | THE |
| Microkernel | Kernel mínimo; el resto, procesos de usuario | MINIX 3, QNX, seL4 |
| Modular | Monolítico, con partes que se cargan en caliente | Linux |
| Híbrida | Un poco de todo, según convenga | Windows, macOS |

## Máquinas virtuales

Una **máquina virtual** lleva la idea de capas al extremo: un software, el **hipervisor**, crea la ilusión de varios computadores completos (con su procesador, memoria y dispositivos) sobre un solo computador físico. Cada máquina virtual puede correr su propio sistema operativo, sin saber que no está sola.

- **Hipervisor tipo 1:** corre directamente sobre el hardware. KVM (dentro de Linux), Xen, Hyper-V, VMware ESXi. Es lo que se usa en la nube.
- **Hipervisor tipo 2:** corre como un programa sobre un sistema operativo normal. VirtualBox, GNOME Boxes.

Los procesadores actuales traen instrucciones especiales para virtualizar (Intel VT-x, AMD-V, extensiones de ARM), así que las máquinas virtuales corren casi a la misma velocidad que el hardware real.

**Ventajas:**

- **Aislamiento:** cada máquina está protegida de las demás, y si una se infecta o se cae, las otras siguen.
- Probar sistemas operativos, o desarrollarlos, sin arriesgar el equipo real.
- Aprovechar mejor un servidor, corriendo muchos sistemas en él.

**Desventaja:** ese mismo aislamiento hace más difícil compartir recursos entre máquinas.

### Contenedores

Un **contenedor** es un aislamiento más liviano: no simula un computador completo, sino que **comparte el kernel** del equipo y aísla a un grupo de procesos, que ven su propio sistema de archivos, su propia red y sus propios procesos. En Linux se construyen con dos mecanismos del kernel:

- los [*namespaces*](https://man7.org/linux/man-pages/man7/namespaces.7.html), que aíslan lo que un proceso **ve**;
- los [*cgroups*](https://man7.org/linux/man-pages/man7/cgroups.7.html), que limitan lo que **usa** (CPU, memoria).

Docker y Podman los hacen fáciles de usar. Un contenedor arranca en milisegundos y ocupa muy poco, pero todos comparten el mismo kernel: no puedes correr un contenedor de Windows sobre un kernel Linux.

(Existe también otro tipo de "máquina virtual": la de un **lenguaje**, como la JVM de Java, que ejecuta un código intermedio en vez de instrucciones del procesador.)

## Diseño e implementación

### Objetivos

- **Para el usuario:** que sea cómodo, fácil de aprender, confiable, seguro y rápido.
- **Para quien lo construye:** que sea fácil de diseñar, mantener y extender, flexible, confiable y eficiente.

Muchos de estos objetivos chocan entre sí, y no hay una respuesta única: depende de para qué es el sistema.

### Mecanismos y políticas

Un principio clave del diseño: separar **cómo** se hace algo (**mecanismo**) de **qué** se decide hacer (**política**).

Por ejemplo, el temporizador que le quita la CPU a un proceso es un **mecanismo**. Cuánto tiempo darle a cada proceso, y a quién darle prioridad, es una **política**. Si están separados, se puede cambiar la política (dar más prioridad a los programas interactivos, por ejemplo) sin tocar el mecanismo.

### En qué lenguaje se escriben

Los primeros sistemas operativos se escribían en **ensamblador**. Desde UNIX se escriben mayoritariamente en **C**, un lenguaje de alto nivel que igual permite controlar el hardware de cerca:

- se programa más rápido, y el código es más compacto y fácil de entender y depurar;
- sobre todo, es **portable**: el mismo kernel se compila para procesadores distintos, cambiando solo la parte que depende de la arquitectura.

Linux está escrito en C, con partes en ensamblador, y desde 2022 acepta también código en [**Rust**](https://docs.kernel.org/rust/index.html), un lenguaje que evita muchos errores de manejo de memoria.

### Configurarlo para cada máquina

Un mismo sistema operativo tiene que funcionar en computadores muy distintos. Antes, al instalarlo, se "generaba" una versión a la medida del hardware. Hoy las distribuciones traen un **kernel genérico** con todo lo común incluido, y cargan como **módulos** los drivers de lo que detectan al arrancar.

## Del código fuente a un proceso

Para que un programa escrito en un lenguaje de alto nivel llegue a ejecutarse, pasa por tres etapas:

1. **Compilar:** el compilador traduce el código fuente a **código objeto**, en lenguaje de máquina.
2. **Enlazar:** el enlazador (*linker*) junta el código objeto con las **bibliotecas** que usa y resuelve las referencias entre ellos. El resultado es un **ejecutable**.
3. **Cargar:** el sistema operativo, a través del cargador (*loader*), pone el ejecutable en memoria, ajusta sus direcciones a dónde quedó realmente y lo ejecuta.

(Los lenguajes **interpretados**, como PHP o Python, funcionan distinto: un intérprete, que sí pasó por estas tres etapas, lee el código y lo ejecuta directamente.)

### Enlace estático y dinámico

- **Estático:** las bibliotecas se copian dentro del ejecutable. Queda autocontenido, pero más grande.
- **Dinámico:** el ejecutable solo guarda referencias a **bibliotecas compartidas**, que se cargan al ejecutarlo. En Linux son los archivos `.so`, y en Windows los `.dll`.

```bash
ldd /usr/bin/ls        # las bibliotecas compartidas que usa ls
```

El enlace dinámico ahorra mucha memoria: la biblioteca de C se carga **una sola vez** y la comparten todos los procesos. Esto funciona porque su código es **reentrante**: no se modifica al ejecutarse, así que muchos procesos pueden usar la misma copia, cada uno con sus propios datos.

## Ejercicios

<details>
<summary><span>¿Qué es una llamada al sistema, y por qué los programas no pueden hacer lo mismo por su cuenta?</span></summary>

Es la forma en que un programa le pide un servicio al sistema operativo: leer un archivo, crear un proceso, enviar datos por la red.

Los programas no pueden hacerlo por su cuenta porque corren en **modo usuario**, donde las instrucciones que manejan el hardware están prohibidas. La llamada al sistema provoca una trampa que pasa la CPU a **modo kernel**, donde el sistema operativo verifica los permisos y hace el trabajo. Así, nadie se salta las reglas.

</details>

<details>
<summary><span>¿Qué diferencia hay entre una API como POSIX y las llamadas al sistema?</span></summary>

Las **llamadas al sistema** son la interfaz real del kernel: dependen del sistema operativo e incluso del procesador.

Una **API** como POSIX es un conjunto de funciones de biblioteca que los programas usan, y que por dentro hacen una o varias llamadas al sistema. Usar la API tiene dos ventajas: es más cómoda, y el programa se puede compilar en cualquier sistema que implemente esa API, aunque sus llamadas al sistema sean distintas.

</details>

<details>
<summary><span>Un driver de tarjeta de red tiene un error y se cae. ¿Qué pasa en un sistema monolítico y qué pasa en uno con microkernel?</span></summary>

- **Monolítico:** el driver corre dentro del kernel, en modo kernel, con acceso a todo. Su error puede corromper memoria del kernel y **botar el sistema completo**.
- **Microkernel:** el driver es un proceso más, en modo usuario. Se cae **solo ese proceso**, el resto del sistema sigue funcionando y el driver se puede reiniciar.

</details>

<details>
<summary><span>¿Qué diferencia hay entre una máquina virtual y un contenedor?</span></summary>

Una **máquina virtual** simula un computador completo, con su propio kernel: puedes correr Windows dentro de Linux. Es más pesada, pero el aislamiento es mayor.

Un **contenedor** comparte el kernel del equipo y solo aísla a un grupo de procesos (lo que ven y lo que pueden usar). Arranca mucho más rápido y ocupa menos, pero todos los contenedores deben usar el mismo tipo de kernel que el equipo.

</details>

<details>
<summary><span>Da un ejemplo de separación entre mecanismo y política.</span></summary>

En la planificación de la CPU, el **mecanismo** es el temporizador que interrumpe a un proceso y el cambio de un proceso a otro. La **política** es qué proceso elegir después y cuánto tiempo darle.

Otro ejemplo, de [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md): los permisos `rwx` y la revisión que hace el kernel en cada acceso son el **mecanismo**; qué permisos le das a cada archivo es la **política**.

</details>

<details>
<summary><span>¿Qué ventaja tiene que la biblioteca de C sea compartida (enlace dinámico) en vez de copiarse en cada programa?</span></summary>

- **Memoria y disco:** hay una sola copia en disco y una sola en memoria, compartida por cientos de procesos, en vez de una por programa.
- **Actualizaciones:** si se corrige un error de seguridad en la biblioteca, basta actualizarla una vez y todos los programas quedan corregidos, sin recompilarlos.

La desventaja: el programa depende de que la biblioteca esté instalada, y en una versión compatible.

</details>

---

Sigue con **[Procesos](/archivo/sistemas-operativos/teoria/procesos.md)**.
