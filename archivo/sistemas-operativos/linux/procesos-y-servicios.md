---
title: Procesos y servicios
description: Todo lo que corre, quién lo levanta y cómo detenerlo
eleventyNavigation:
    order: 60
tags:
    - linux
---
Cada programa que se ejecuta es un **proceso**. Ahora mismo, en tu equipo, hay cientos: tu navegador, la terminal, y muchos que no ves, trabajando en segundo plano.

## Procesos

Un proceso es un programa **en ejecución**: el código, más la memoria que usa, los archivos que tiene abiertos y su estado. El mismo programa puede estar corriendo varias veces, y cada una es un proceso distinto.

Cada proceso tiene:

- un número único, el **PID** (*process ID*);
- un **proceso padre**, el que lo lanzó (cuando escribes `ls` en la terminal, el padre es la shell);
- un **usuario** dueño, cuyos permisos usa.

El primer proceso, con PID 1, es **systemd**, que el kernel lanza al arrancar. Todos los demás descienden de él.

```bash
pstree -p | head    # el árbol de procesos, con sus PID
```

## Ver los procesos

```bash
ps           # los procesos de esta terminal
ps aux       # todos los procesos del sistema, de todos los usuarios
ps aux | grep firefox    # buscar uno en particular
pgrep -a firefox         # lo mismo, más directo
```

`ps aux` muestra una línea por proceso:

```plaintext
USER    PID %CPU %MEM    VSZ   RSS TTY   STAT START  TIME COMMAND
ana    4312  6.5  4.0 152013 30726 ?     Sl   12:23  3:03 /usr/bin/firefox
```

Las columnas que más importan:

- **USER** y **PID**: quién lo ejecuta y su número.
- **%CPU** y **%MEM**: cuánto procesador y memoria usa.
- **STAT**: el estado. `R` corriendo, `S` durmiendo (esperando algo), `T` detenido, `Z` zombi (terminó, pero su padre aún no se ha enterado).
- **COMMAND**: el comando que lo lanzó.

Para verlos en vivo, ordenados por consumo, está `top` (se sale con `q`), o [`htop`](https://htop.dev), que es más amigable y hay que instalarlo.

## Primer y segundo plano

Normalmente, un comando ocupa la terminal hasta que termina: corre en **primer plano**. Con `&` al final, corre en **segundo plano** y la terminal queda libre:

```bash
sleep 300 &      # corre en segundo plano
jobs             # lista los trabajos de esta terminal
fg %1            # trae el trabajo 1 al primer plano
```

Si un programa ya está corriendo en primer plano, **Ctrl + Z** lo **suspende** (lo congela), y después se puede continuar:

```bash
bg %1            # sigue corriendo, en segundo plano
fg %1            # sigue corriendo, en primer plano
```

## Señales

Los procesos se comunican con **señales**: avisos que el sistema le envía a un proceso para que haga algo. Las más comunes:

| Señal | Número | Qué hace | Cómo se envía |
|---|---|---|---|
| `SIGTERM` | 15 | Pide terminar, de forma ordenada | `kill PID` |
| `SIGKILL` | 9 | Termina de golpe; no se puede ignorar | `kill -9 PID` |
| `SIGINT` | 2 | Interrumpe | Ctrl + C |
| `SIGTSTP` | 20 | Suspende (el programa lo puede ignorar) | Ctrl + Z |
| `SIGSTOP` | 19 | Detiene; no se puede ignorar | `kill -STOP PID` |
| `SIGCONT` | 18 | Continúa un proceso detenido | `kill -CONT PID` |
| `SIGHUP` | 1 | "Se cortó la terminal"; muchos servicios lo usan para recargar su configuración | `kill -HUP PID` |

A pesar del nombre, [`kill`](https://man7.org/linux/man-pages/man1/kill.1.html) no solo mata: envía cualquier señal. Por defecto envía `SIGTERM`.

```bash
kill 4312             # pide a 4312 que termine
kill -9 4312          # lo termina a la fuerza
pkill firefox         # envía la señal por nombre, sin buscar el PID
```

**Primero siempre `kill` a secas.** `SIGTERM` le da al programa la oportunidad de guardar su trabajo y cerrar sus archivos. `kill -9` es el último recurso, para cuando no responde: el programa muere sin poder limpiar nada.

La lista completa está en `man 7 signal` o con `kill -l`.

## Servicios y systemd

Un **servicio** (o *demonio*, *daemon*) es un proceso que corre en segundo plano, sin terminal, esperando trabajo: el servidor web, SSH, la impresión, el reloj.

Los servicios los levanta y administra [**systemd**](https://systemd.io). Cada servicio se describe en una **unidad** (*unit*), un archivo `.service` en `/usr/lib/systemd/system/` (los que instalan los paquetes) o en `/etc/systemd/system/` (los propios o modificados).

Todo se maneja con [`systemctl`](https://man7.org/linux/man-pages/man1/systemctl.1.html):

```bash
systemctl status sshd          # estado del servicio: si corre, desde cuándo, últimos logs
sudo systemctl start sshd      # lo inicia ahora
sudo systemctl stop sshd       # lo detiene ahora
sudo systemctl restart sshd    # lo reinicia
sudo systemctl enable sshd     # que se inicie solo al arrancar
sudo systemctl disable sshd    # que ya no se inicie al arrancar
sudo systemctl enable --now sshd   # habilita e inicia, de una vez
```

Es importante no confundir estas dos parejas:

- `start` y `stop` actúan **ahora**, pero no cambian lo que pasará en el próximo arranque.
- `enable` y `disable` cambian **lo que pasará al arrancar**, pero no tocan el servicio que está corriendo ahora (salvo que agregues `--now`).

Para listar servicios:

```bash
systemctl list-units --type=service                       # los que están cargados
systemctl list-unit-files --type=service --state=enabled  # los habilitados al arrancar
```

(El nombre del servicio puede variar entre distribuciones: el de SSH es `sshd` en Fedora y `ssh` en Debian y Ubuntu.)

### Targets: hasta dónde arrancar

Un **target** es un grupo de unidades que definen un "estado" del sistema. Los principales:

| Target | Qué hay |
|---|---|
| `rescue.target` | Modo de rescate: solo root, lo mínimo, sin red |
| `multi-user.target` | Sistema completo para varios usuarios, con red, en modo texto |
| `graphical.target` | Todo lo anterior, más el entorno gráfico |
| `poweroff.target` | Apagado |
| `reboot.target` | Reinicio |

```bash
systemctl get-default                            # con qué target arranca
sudo systemctl set-default multi-user.target     # arrancar en modo texto
sudo systemctl isolate multi-user.target         # cambiar ahora, sin reiniciar
systemctl reboot                                 # reiniciar
systemctl poweroff                               # apagar
```

{% alert 'Antes de systemd, el primer proceso era init (SysV init). En /etc/inittab se definía el runlevel con que arrancaba el sistema: 0 apagar, 1 monousuario, 2 multiusuario sin red, 3 multiusuario completo, 5 entorno gráfico y 6 reiniciar. Los servicios eran scripts en /etc/init.d (o /etc/rc.d/init.d), se iniciaban con service sshd start, y se habilitaban por runlevel con chkconfig. systemd reemplazó todo esto, y los targets equivalen a los antiguos runlevels: multi-user.target es el 3 y graphical.target el 5.', 'info', 'Nota histórica' %}

## Logs: qué pasó

Los servicios y el kernel van dejando registro de lo que hacen. En systemd, todo va al **journal**, y se consulta con [`journalctl`](https://man7.org/linux/man-pages/man1/journalctl.1.html):

```bash
journalctl                  # todo, desde lo más antiguo
journalctl -e               # salta al final
journalctl -f               # muestra lo nuevo en vivo (como tail -f)
journalctl -u sshd          # solo un servicio
journalctl -b               # desde el último arranque
journalctl -p err           # solo errores y peores
journalctl --since "1 hour ago"
```

Varios programas siguen escribiendo además archivos de texto en `/var/log`, y se leen con `less` o `tail -f`. Si la distribución tiene **rsyslog** instalado, los mensajes generales van a `/var/log/messages` (Red Hat, Fedora) o `/var/log/syslog` (Debian, Ubuntu), y los de autenticación a `/var/log/secure` o `/var/log/auth.log`.

## Instalar programas

Los programas se instalan con el **gestor de paquetes** de la distribución, que descarga el programa y todo lo que necesita desde repositorios confiables:

| Acción | Fedora / Red Hat | Debian / Ubuntu |
|---|---|---|
| Instalar | `sudo dnf install paquete` | `sudo apt install paquete` |
| Actualizar todo | `sudo dnf upgrade` | `sudo apt update && sudo apt upgrade` |
| Buscar | `dnf search palabra` | `apt search palabra` |
| Desinstalar | `sudo dnf remove paquete` | `sudo apt remove paquete` |

Instalar un servicio no lo deja corriendo: después hay que habilitarlo con `systemctl enable --now`.

{% alert 'En Red Hat y CentOS, antes de dnf se usaba yum. dnf lo reemplazó a partir de Fedora 22 y Red Hat Enterprise Linux 8, y acepta prácticamente los mismos comandos.', 'info', 'Nota histórica' %}

## Ejercicios

<details>
<summary><span>¿Qué muestra <code>ps</code>? ¿Y <code>ps aux</code>?</span></summary>

`ps` muestra los procesos asociados a la terminal actual: normalmente la shell y lo que lanzaste desde ella.

`ps aux` muestra **todos** los procesos del sistema: de todos los usuarios (`a`), con el usuario dueño (`u`) e incluyendo los que no tienen terminal, como los servicios (`x`). Para cada uno indica PID, consumo de CPU y memoria, estado y el comando.

</details>

<details>
<summary><span>¿Con qué "nivel" arranca el sistema, y qué significa cada uno?</span></summary>

Con systemd, el sistema arranca en un **target**. Se consulta con `systemctl get-default`:

- `rescue.target`: modo de rescate, solo root.
- `multi-user.target`: multiusuario completo, con red, en modo texto.
- `graphical.target`: lo anterior más el entorno gráfico.
- `poweroff.target` y `reboot.target`: apagar y reiniciar.

Equivalen a los antiguos runlevels de `init`: 0 apagar, 1 monousuario, 3 multiusuario, 5 gráfico y 6 reiniciar (ver la nota histórica en [Servicios y systemd](#servicios-y-systemd)).

</details>

<details>
<summary><span>¿Qué hacen <code>systemctl reboot</code> y <code>systemctl enable</code>?</span></summary>

- `systemctl reboot` reinicia el equipo. El clásico comando `reboot` sigue existiendo, pero hoy es un atajo a `systemctl`.
- `systemctl enable servicio` configura un servicio para que se inicie solo al arrancar. No lo inicia en el momento (para eso, `start`, o `enable --now`).

Ambos requieren permisos de administrador. En un escritorio, reiniciar se permite al usuario que está frente al equipo.

</details>

<details>
<summary><span>¿Cómo listas los servicios que no están habilitados, y guardas la lista en un archivo?</span></summary>

```bash
systemctl list-unit-files --type=service --state=disabled > servicios-deshabilitados.txt
```

`systemctl` lista los archivos de unidad de tipo servicio con estado `disabled`, y `>` manda esa salida al archivo.

</details>

<details>
<summary><span>Encuentra los servicios que se inician con el entorno gráfico y deshabilita uno.</span></summary>

Los servicios habilitados al arrancar se listan con:

```bash
systemctl list-unit-files --type=service --state=enabled
```

Para ver todo lo que arrastra el target gráfico: `systemctl list-dependencies graphical.target`.

Elegido uno (por ejemplo, `cups`, el servicio de impresión), se detiene y deshabilita de una vez:

```bash
sudo systemctl disable --now cups
```

</details>

<details>
<summary><span>¿Dónde quedan los mensajes del sistema (los logs)?</span></summary>

En el **journal** de systemd, que se consulta con `journalctl`. Además, muchos programas escriben archivos de texto en `/var/log`, y si está instalado rsyslog, los mensajes generales quedan también en `/var/log/messages` (Red Hat, Fedora) o `/var/log/syslog` (Debian, Ubuntu).

</details>

<details>
<summary><span>¿Qué hace <code>tail archivo</code>? ¿Y <code>tail -f archivo</code>?</span></summary>

`tail` muestra las últimas 10 líneas de un archivo (con `-n 50`, las últimas 50).

`tail -f` (de *follow*) muestra las últimas líneas y **se queda esperando**: cada línea nueva que se agrega al archivo aparece en pantalla. Es la forma clásica de ver un log en tiempo real. Se sale con Ctrl + C. Para el journal, el equivalente es `journalctl -f`.

</details>

<details>
<summary><span>¿Cómo monitoreas en vivo los eventos que ocurren en el sistema?</span></summary>

```bash
journalctl -f
```

Muestra los mensajes nuevos del journal a medida que llegan, de todos los servicios y del kernel. Para uno solo, `journalctl -f -u servicio`.

</details>

<details>
<summary><span>Necesitas monitorear en vivo los accesos por SSH y guardarlos en un archivo. ¿Cómo lo haces?</span></summary>

```bash
sudo journalctl -f -u sshd >> accesos.log
```

`-f` sigue los mensajes nuevos, `-u sshd` filtra el servicio de SSH (`ssh` en Debian y Ubuntu) y `>>` los agrega al archivo. Si quieres verlos en pantalla y guardarlos a la vez, usa `tee`: `sudo journalctl -f -u sshd | tee -a accesos.log`.

Con rsyslog, también se puede seguir el archivo de autenticación: `sudo tail -f /var/log/secure >> accesos.log` (o `/var/log/auth.log` en Debian y Ubuntu).

</details>

<details>
<summary><span>¿Qué señal pausa un programa? Escribe el comando completo.</span></summary>

`SIGSTOP`:

```bash
kill -STOP 4312      # el proceso 4312 queda detenido
kill -CONT 4312      # continúa donde quedó
```

Si el programa está en primer plano en tu terminal, **Ctrl + Z** hace algo parecido (envía `SIGTSTP`), y después se continúa con `fg` o `bg`.

Ojo: poner `&` al final de un comando **no** lo pausa, sino que lo lanza en segundo plano, corriendo.

</details>

<details>
<summary><span>Un proceso está usando muchísima CPU o memoria. ¿Cuál es la forma aconsejable de terminarlo?</span></summary>

1. Identificarlo: `top` (o `htop`) lo muestra arriba de la lista, con su PID.
2. Pedirle que termine de forma ordenada: `kill PID`, que envía `SIGTERM`.
3. Si después de unos segundos sigue ahí, forzarlo: `kill -9 PID`, que envía `SIGKILL`.

Si el proceso es de otro usuario o de un servicio, hace falta `sudo`. Y si es un servicio, lo correcto es detenerlo con `sudo systemctl stop servicio`.

</details>

<details>
<summary><span>¿Qué pasa con <code>systemctl stop sshd</code>? ¿Es lo mismo que <code>systemctl disable sshd</code>?</span></summary>

No es lo mismo:

- `systemctl stop sshd` **detiene** el servicio **ahora**. Pero si está habilitado, al reiniciar el equipo vuelve a iniciarse.
- `systemctl disable sshd` **deshabilita** el inicio automático: en el próximo arranque ya no se inicia. Pero si está corriendo ahora, sigue corriendo.

Para las dos cosas a la vez: `sudo systemctl disable --now sshd`.

</details>

<details>
<summary><span>¿Qué hace <code>sudo dnf install httpd php mariadb-server</code>?</span></summary>

Instala, con sus dependencias, tres paquetes: el servidor web **Apache** (`httpd`), el lenguaje **PHP** y el servidor de bases de datos **MariaDB** (el reemplazo libre de MySQL). En Debian y Ubuntu, el equivalente es `sudo apt install apache2 php mariadb-server`.

Después, para que los servicios queden corriendo:

```bash
sudo systemctl enable --now httpd mariadb
```

</details>

<details>
<summary><span>¿Cómo harías que los logs de un programa queden en otro archivo?</span></summary>

Depende de a dónde escribe el programa:

- **Si escribe al journal** (los servicios de systemd), sus mensajes se pueden exportar cuando se necesiten: `journalctl -u servicio > servicio.log`.
- **Si se usa rsyslog**, se agrega una regla en un archivo dentro de `/etc/rsyslog.d/` que envíe ciertos mensajes a un archivo propio, y se reinicia con `sudo systemctl restart rsyslog`.
- **Muchos programas** (Apache, por ejemplo) tienen en su configuración una opción que dice en qué archivo escriben su log.

</details>

<details>
<summary><span>¿Dónde se definen hoy los servicios? ¿Qué había antes en <code>/etc/rc.d/init.d</code>?</span></summary>

Hoy, cada servicio es un archivo de **unidad** de systemd: los que instalan los paquetes están en `/usr/lib/systemd/system/` y los creados o modificados por el administrador en `/etc/systemd/system/`. Se puede ver uno con `systemctl cat sshd`.

Antes de systemd, en `/etc/rc.d/init.d` (o `/etc/init.d`) había **scripts de shell**, uno por servicio, que aceptaban argumentos como `start`, `stop` y `restart`.

</details>

---

Sigue con **[Redes en Linux](/archivo/sistemas-operativos/linux/redes-en-linux.md)**.
