---
title: Repaso
description: Preguntas de todo el recorrido, para ponerse a prueba
eleventyNavigation:
    order: 80
tags:
    - linux
---
Preguntas de todo el recorrido, mezcladas, como vendrían en una prueba. Intenta responder cada una **antes** de abrirla. Si alguna te cuesta, al final de la respuesta está el tema donde se explica.

<details>
<summary><span>1. ¿Cómo listas todos los servicios que no están habilitados y guardas el resultado en un archivo?</span></summary>

```bash
systemctl list-unit-files --type=service --state=disabled > salida.txt
```

Ver [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#servicios-y-systemd).

</details>

<details>
<summary><span>2. ¿Qué hace <code>grep root /etc/passwd</code>?</span></summary>

Muestra las líneas del archivo `/etc/passwd` que contienen el texto `root`: la cuenta de root, y cualquier otra línea donde aparezca esa palabra.

Ver [La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md#buscar).

</details>

<details>
<summary><span>3. ¿Con qué modo arranca el sistema por defecto, y cómo lo cambias?</span></summary>

Se consulta con `systemctl get-default`, que responde con un target, como `graphical.target` o `multi-user.target`. Se cambia con:

```bash
sudo systemctl set-default multi-user.target
```

(Antes esto se definía en `/etc/inittab`, con una línea como `id:3:initdefault:`, que significaba arrancar en el runlevel 3, multiusuario en modo texto.)

Ver [Targets: hasta dónde arrancar](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#targets-hasta-donde-arrancar).

</details>

<details>
<summary><span>4. Identifica los servicios que se inician al arrancar y deshabilita uno para que no se inicie más.</span></summary>

```bash
systemctl list-unit-files --type=service --state=enabled
sudo systemctl disable --now nombre-del-servicio
```

`--now` además lo detiene en el momento.

Ver [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#servicios-y-systemd).

</details>

<details>
<summary><span>5. Muestra en pantalla la información de la interfaz de red <em>loopback</em>.</span></summary>

```bash
ip addr show lo
```

Ver [Redes en Linux](/archivo/sistemas-operativos/linux/redes-en-linux.md#interfaces-de-red).

</details>

<details>
<summary><span>6. ¿Cómo monitoreas en vivo los eventos que ocurren en el sistema?</span></summary>

```bash
journalctl -f
```

Ver [Logs: qué pasó](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#logs-que-paso).

</details>

<details>
<summary><span>7. Explica qué hace <code>grep ANY ANY.password | less</code>.</span></summary>

Busca las líneas que contienen `ANY` en el archivo `ANY.password`, y la salida pasa por una tubería a `less`, que la muestra paginada.

Ver [Redirección y tuberías](/archivo/sistemas-operativos/linux/redireccion-y-tuberias.md#tuberias-conectar-comandos).

</details>

<details>
<summary><span>8. Para <code>-rw----r-- 3 sole labs 434 dic 10 09:13 prueba-final</code>, ¿qué permisos tienen el dueño, el grupo y otros? ¿Cómo haces que el grupo <code>curso</code> pueda leerlo?</span></summary>

- **Dueño (`sole`):** lectura y escritura.
- **Grupo (`labs`):** nada.
- **Otros:** lectura.

```bash
sudo chgrp curso prueba-final
sudo chmod g+r prueba-final
```

Ver [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md#que-significa-code-rwx-code).

</details>

<details>
<summary><span>9. ¿Qué señal pausa una aplicación? Escribe el comando completo.</span></summary>

`SIGSTOP`: `kill -STOP PID`. Para que continúe: `kill -CONT PID`. En primer plano, Ctrl + Z hace algo similar.

Ver [Señales](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#senales).

</details>

<details>
<summary><span>10. ¿Por qué querrías tener <code>/var/log</code> en un sistema de archivos separado?</span></summary>

Porque los logs pueden crecer mucho, sobre todo si algo falla en bucle. Separados, si llenan su espacio no dejan sin disco al resto del sistema.

Ver [El sistema de archivos](/archivo/sistemas-operativos/linux/sistema-de-archivos.md).

</details>

<details>
<summary><span>11. ¿Cómo montas de forma temporal un sistema de archivos que está en un disco local?</span></summary>

```bash
sudo mount /dev/sdb1 /mnt
```

Queda montado hasta que se desmonta con `sudo umount /mnt` o se reinicia.

Ver [Montar: colgar un disco del árbol](/archivo/sistemas-operativos/linux/sistema-de-archivos.md#montar-colgar-un-disco-del-arbol).

</details>

<details>
<summary><span>12. ¿Cuál es la forma aconsejable de terminar un proceso que está usando mucha CPU o memoria?</span></summary>

Encontrar su PID con `top`, pedirle que termine con `kill PID` y, solo si no responde, forzarlo con `kill -9 PID`.

Ver [Señales](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#senales).

</details>

<details>
<summary><span>13. ¿Qué pasa al ejecutar <code>cat /proc/cpuinfo ; wc -l /proc/cpuinfo</code>?</span></summary>

Se ejecutan los dos comandos, uno después del otro. El primero muestra la información del procesador y el segundo cuenta las líneas de ese mismo archivo.

Ver [Varias órdenes en una línea](/archivo/sistemas-operativos/linux/redireccion-y-tuberias.md#varias-ordenes-en-una-linea).

</details>

<details>
<summary><span>14. Al instalar un sistema, ¿cómo se hace el esquema de particiones y qué recursos se necesitan?</span></summary>

**Recursos:**

- un computador;
- el instalador en un pendrive;
- espacio en disco;
- idealmente, internet para descargar actualizaciones.

**Particiones:** el instalador propone un esquema automático. Uno típico tiene:

- una partición EFI (`/boot/efi`, en vfat);
- la raíz `/`;
- opcionalmente, `/boot` y `/home` separados.

La swap puede ser una partición, un archivo o zram.

Ver [Particiones y LVM](/archivo/sistemas-operativos/linux/sistema-de-archivos.md#particiones-y-lvm).

</details>

<details>
<summary><span>15. ¿Cómo creas un archivo vacío?</span></summary>

```bash
touch mi-archivo
```

(Si el archivo ya existe, `touch` no lo vacía: solo actualiza su fecha de modificación.)

Ver [La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md#archivos-y-directorios).

</details>

<details>
<summary><span>16. Necesitas monitorear en vivo los accesos al sistema y enviarlos a un archivo. ¿Cómo lo haces?</span></summary>

```bash
sudo journalctl -f -u sshd >> accesos.log
```

(`ssh` en vez de `sshd` en Debian y Ubuntu.)

Ver [Logs: qué pasó](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#logs-que-paso).

</details>

<details>
<summary><span>17. ¿Qué pasa con <code>systemctl stop sshd</code>? ¿Es lo mismo que <code>systemctl disable sshd</code>?</span></summary>

No. `stop` detiene el servicio **ahora**, pero vuelve a iniciarse en el próximo arranque si está habilitado. `disable` evita que se inicie **al arrancar**, pero no detiene el que está corriendo. Para ambas cosas: `sudo systemctl disable --now sshd`.

Ver [Servicios y systemd](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#servicios-y-systemd).

</details>

<details>
<summary><span>18. Si a un archivo con permisos <code>-rw-r----x</code> le aplicas <code>chmod u+x,g=rx,o-x</code>, ¿cómo queda?</span></summary>

`-rwxr-x---`

Ver [Cambiar permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md#cambiar-permisos-code-chmod-code).

</details>

<details>
<summary><span>19. Explica cómo hacer cada una de estas tareas.</span></summary>

**a. Crear el usuario `pepito` con su carpeta personal en `/home/casadepepito`.**

```bash
sudo useradd -m -d /home/casadepepito pepito
```

**b. Borrar un directorio que tiene 6 niveles de subdirectorios.**

```bash
rm -r directorio/
```

`-r` borra recursivamente, sin importar la profundidad.

**c. ¿Qué hace `sudo dnf install httpd php mariadb-server`?**

Instala el servidor web Apache, PHP y el servidor de bases de datos MariaDB. En Debian y Ubuntu: `sudo apt install apache2 php mariadb-server`.

**d. Enviar la salida de `cat salida` a `salida2`, y los errores a `2salida2`.**

```bash
cat salida > salida2 2> 2salida2
```

**e. Crear una variable de entorno.**

```bash
export MI_VARIABLE="mis valores"
```

Ver [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md#administrar-usuarios-y-grupos), [La línea de comandos](/archivo/sistemas-operativos/linux/linea-de-comandos.md), [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#instalar-programas) y [Redirección y tuberías](/archivo/sistemas-operativos/linux/redireccion-y-tuberias.md#variables).

</details>

---

Vuelve al índice de **[Linux en la práctica](/archivo/sistemas-operativos/linux/index.md)**.
