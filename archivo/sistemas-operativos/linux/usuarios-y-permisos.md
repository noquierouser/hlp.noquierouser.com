---
title: Usuarios y permisos
description: Quién puede hacer qué con cada archivo
eleventyNavigation:
    order: 40
tags:
    - linux
---
Linux es multiusuario desde su origen: varias personas comparten el mismo equipo, y cada una tiene sus archivos protegidos de las demás. Todo eso se sostiene con dos ideas simples: **usuarios y grupos**, y **permisos**.

## Tipos de usuarios

- **root** (identificador 0): el superusuario, con acceso total. Lo vimos en la [introducción](/archivo/sistemas-operativos/linux/introduccion-a-linux.md#root-el-que-puede-todo).
- **Usuarios de sistema:** cuentas que no son personas, sino servicios. El servidor web, por ejemplo, corre con su propio usuario, así si alguien lo ataca, solo puede tocar lo que ese usuario puede tocar. Normalmente no pueden iniciar sesión.
- **Usuarios normales:** las personas. En la mayoría de las distribuciones parten desde el identificador 1000.

Cada usuario tiene un número de identificación (**UID**) y pertenece a uno o más **grupos**, cada uno con su propio número (**GID**). Los grupos sirven para dar permisos a varias personas a la vez: profesores, ayudantes, alumnos.

```bash
whoami     # tu nombre de usuario
id         # tu UID, tu grupo principal y todos tus grupos
groups     # solo los grupos
```

## Dónde se guarda todo esto

| Archivo | Contiene | Quién lo puede leer |
|---|---|---|
| `/etc/passwd` | Las cuentas: nombre, UID, GID, carpeta personal y shell | Todos |
| `/etc/shadow` | Las contraseñas, guardadas como *hash* | Solo root |
| `/etc/group` | Los grupos y sus miembros | Todos |

Una línea de `/etc/passwd` se ve así:

```plaintext
ana:x:1000:1000:Ana Pérez:/home/ana:/bin/bash
```

Nombre, `x` (la contraseña está en `/etc/shadow`), UID, GID, nombre completo, carpeta personal y shell.

Las contraseñas no se guardan "encriptadas" de forma que se puedan descifrar, sino como un [**hash**](https://es.wikipedia.org/wiki/Funci%C3%B3n_hash_criptogr%C3%A1fica): una huella que se calcula a partir de la contraseña, pero de la que no se puede volver a la contraseña original. Al iniciar sesión, el sistema calcula el hash de lo que escribiste y lo compara con el guardado.

## Administrar usuarios y grupos

Todos estos comandos necesitan permisos de administrador, así que van con `sudo`:

```bash
sudo useradd -m ana                 # crea el usuario y su carpeta /home/ana
sudo passwd ana                     # le asigna una contraseña
sudo usermod -aG alumnos ana        # agrega a ana al grupo alumnos
sudo usermod -m -d /opt/ana ana     # cambia su carpeta personal y la mueve
sudo groupadd profesores            # crea un grupo
sudo userdel ana                    # elimina el usuario (deja su carpeta)
sudo userdel -r ana                 # elimina el usuario y su carpeta
```

- En [`usermod`](https://man7.org/linux/man-pages/man8/usermod.8.html), la `-a` de `-aG` es importantísima: significa **agregar**. Sin ella, el usuario queda **solo** en los grupos que nombres y sale de todos los demás.
- En Debian y Ubuntu existe también `adduser`, una versión interactiva que va preguntando los datos.

Para cambiar tu propia contraseña basta con `passwd`, sin `sudo`.

## Leer un listado largo

```bash
ls -l
```

```plaintext
drwxr-xr-x. 2 ana  alumnos 4096 sep 12 10:15 proyectos
-rw-r--r--. 1 ana  alumnos  230 sep 12 10:20 notas.txt
lrwxrwxrwx. 1 ana  alumnos    9 sep 12 10:21 atajo -> notas.txt
```

Tomemos la segunda línea, de izquierda a derecha:

| Parte | Significa |
|---|---|
| `-` | El tipo: `-` archivo común, `d` directorio, `l` enlace simbólico |
| `rw-` | Permisos del **dueño** |
| `r--` | Permisos del **grupo** |
| `r--` | Permisos de **otros** (todos los demás) |
| `1` | Cantidad de enlaces al archivo |
| `ana` | El usuario dueño |
| `alumnos` | El grupo dueño |
| `230` | Tamaño, en bytes (con `ls -lh` se ve en KB, MB...) |
| `sep 12 10:20` | Fecha de la última modificación |
| `notas.txt` | El nombre |

(El punto que aparece después de los permisos en algunas distribuciones indica que el archivo tiene un contexto de seguridad SELinux. Por ahora, ignóralo.)

## Qué significa `rwx`

Cada grupo de tres letras dice qué se puede hacer. Pero **no significa lo mismo en un archivo que en un directorio**:

| Permiso | En un archivo | En un directorio |
|---|---|---|
| `r` (lectura) | Leer su contenido | Ver la lista de nombres que contiene |
| `w` (escritura) | Modificar su contenido | Crear, borrar y renombrar archivos dentro |
| `x` (ejecución) | Ejecutarlo como programa | **Entrar** al directorio y acceder a lo que tiene |

Dos consecuencias que sorprenden:

- **Borrar un archivo depende del directorio, no del archivo.** Si tienes `w` en el directorio, puedes borrar un archivo aunque el archivo no te dé ningún permiso.
- **Sin `x` en un directorio no llegas a nada de lo que contiene**, aunque los archivos de adentro tengan todos los permisos abiertos. Es como un cuaderno en el que todos pueden escribir, pero encerrado en una pieza con llave: si no tienes la llave, no hay cuaderno.

## Cambiar permisos: `chmod`

[`chmod`](https://man7.org/linux/man-pages/man1/chmod.1.html) tiene dos formas de escribir los permisos.

### Con letras

Se indica **a quién** (`u` dueño, `g` grupo, `o` otros, `a` todos), **qué operación** (`+` agregar, `-` quitar, `=` dejar exactamente) y **qué permiso** (`r`, `w`, `x`):

```bash
chmod u+x script.sh          # el dueño puede ejecutarlo
chmod g-w notas.txt          # el grupo ya no puede modificarlo
chmod o= notas.txt           # otros: ningún permiso
chmod u=rw,g=r,o= notas.txt  # varios a la vez, separados por coma
```

### Con números

Cada permiso vale un número, y se suman:

| Permiso | Valor |
|---|---|
| `r` | 4 |
| `w` | 2 |
| `x` | 1 |

Así, `rw-` es 4 + 2 = **6**, `r-x` es 4 + 1 = **5** y `rwx` es 4 + 2 + 1 = **7**. Se escriben tres cifras: dueño, grupo y otros.

```bash
chmod 644 notas.txt     # rw-r--r--: lo típico para un archivo
chmod 755 script.sh     # rwxr-xr-x: lo típico para un programa o directorio
chmod 600 secreto.txt   # rw-------: solo el dueño
```

## Cambiar dueño y grupo: `chown` y `chgrp`

```bash
sudo chown tom notas.txt           # cambia el dueño
sudo chown tom:alumnos notas.txt   # cambia dueño y grupo
chgrp alumnos notas.txt            # cambia solo el grupo
```

- **Solo root puede cambiar el dueño** de un archivo, aunque el archivo sea tuyo. Si no fuera así, cualquiera podría "regalarle" archivos a otro usuario.
- El **grupo** sí lo puede cambiar el dueño del archivo, pero solo a un grupo al que pertenezca.

## Permisos especiales

Hay tres más, que vas a encontrar de vez en cuando:

- **SUID** (`s` en lugar de la `x` del dueño): el programa se ejecuta con los permisos de su dueño, no de quien lo lanza. Así funciona `passwd`: es de root y tiene SUID, por eso un usuario normal puede cambiar su contraseña en `/etc/shadow`.
- **SGID** (`s` en la `x` del grupo): en un directorio, los archivos nuevos heredan el grupo del directorio. Útil para carpetas compartidas.
- **Sticky bit** (`t` en la `x` de otros): en un directorio, cada uno solo puede borrar sus propios archivos. Es lo que tiene `/tmp`: todos escriben ahí, pero nadie borra lo de los demás.

```bash
ls -l /usr/bin/passwd   # -rwsr-xr-x
ls -ld /tmp             # drwxrwxrwt
```

Más detalles en la [página de permisos de la ArchWiki](https://wiki.archlinux.org/title/File_permissions_and_attributes) (en inglés).

## Quién entró al sistema

```bash
w          # quién está conectado ahora
last       # las últimas sesiones iniciadas
lastb      # los intentos fallidos (necesita sudo)
```

## Ejercicios

<details>
<summary><span>¿Qué hace <code>sudo useradd -m -d /opt/curso curso</code>?</span></summary>

Crea el usuario `curso` con su carpeta personal en `/opt/curso` (en vez de la habitual `/home/curso`). La opción `-m` hace que la carpeta se cree; `-d` indica dónde.

</details>

<details>
<summary><span>Al crear el usuario te equivocaste y escribiste <code>-d /opt/curos</code>. ¿Cómo lo corriges? Plantea dos soluciones.</span></summary>

- **La recomendada:** `sudo usermod -m -d /opt/curso curso`. Cambia la carpeta registrada para el usuario y, gracias a `-m`, mueve el contenido de la carpeta antigua a la nueva.
- **A mano:** cambiar la ruta en `/etc/passwd` (con `sudo vipw`, que lo edita de forma segura) y mover la carpeta con `sudo mv /opt/curos /opt/curso`.

</details>

<details>
<summary><span>Si te preguntan, como administrador del sistema, si puedes ver las contraseñas de los usuarios, ¿qué respondes?</span></summary>

Que no. Las contraseñas se guardan en `/etc/shadow` como *hash*: una huella de la que no se puede recuperar la contraseña original. Lo que sí puede hacer root es **asignar una nueva** con `sudo passwd usuario`.

</details>

<details>
<summary><span>¿Qué diferencia hay entre <code>userdel curso</code> y <code>userdel -r curso</code>?</span></summary>

`userdel curso` elimina la cuenta, pero deja intacta su carpeta personal y sus archivos. `userdel -r curso` elimina además la carpeta personal y la casilla de correo local del usuario.

</details>

A partir de esta salida de `ls -l` dentro de `/etc`, responde las preguntas que siguen:

```plaintext
lrwxrwxrwx   1 root  root      15 jul 11 02:12 vfontcap -> ../usr/vfontcap
-rw-r--r--   1 root  alumnos 1305 feb 17 13:50 warnquota.conf
drwxr-xr-x  16 tom   curso   4096 jul 14 12:13 X11
drwx------   3 curso alumnos 4096 jul 11 02:13 xdg
-rw-r--r--   1 root  curso    289 feb 17 15:59 xinetd.conf
```

<details>
<summary><span>¿Qué tipo de archivo es cada uno?</span></summary>

Lo dice el primer carácter:

- `vfontcap` es un **enlace simbólico** (`l`).
- `warnquota.conf` y `xinetd.conf` son **archivos** comunes (`-`).
- `X11` y `xdg` son **directorios** (`d`).

</details>

<details>
<summary><span>¿Qué indica la fecha de cada archivo?</span></summary>

La fecha y hora de la **última modificación** de su contenido.

</details>

<details>
<summary><span>Si existe el grupo <code>alumnos</code>, ¿puedo suponer que existe un usuario <code>alumnos</code>?</span></summary>

No. Muchas distribuciones crean un grupo con el mismo nombre de cada usuario nuevo, pero un grupo puede existir sin un usuario que se llame igual, como en este caso, donde `alumnos` agrupa a varias personas. Se puede comprobar con `id alumnos`: si no existe el usuario, lo dice.

</details>

<details>
<summary><span>¿Cualquier usuario puede acceder al archivo <code>/usr/vfontcap</code>?</span></summary>

No se puede saber con esta información. Los enlaces simbólicos siempre muestran `rwxrwxrwx`, pero esos permisos no significan nada: lo que cuenta son los permisos del **archivo al que apunta**, que no aparece en el listado. Habría que revisar `ls -l /usr/vfontcap`.

</details>

<details>
<summary><span>¿Puedo afirmar que <code>/usr/vfontcap</code> pesa 15 bytes?</span></summary>

No. Los 15 bytes son el tamaño **del enlace**, y un enlace simbólico solo guarda la ruta a la que apunta: `../usr/vfontcap` tiene exactamente 15 caracteres. El tamaño del archivo real hay que verlo en el archivo real.

</details>

<details>
<summary><span>Queremos que <code>xdg</code> pase a ser de <code>tom</code>, manteniendo el grupo <code>alumnos</code>. ¿Cómo se hace y qué condición se tiene que cumplir?</span></summary>

```bash
sudo chown tom xdg
```

La condición: tiene que hacerlo **root**. Ni siquiera `curso`, el dueño actual, puede regalarle el directorio a otro usuario.

</details>

<details>
<summary><span>¿Qué harías para que el usuario <code>curso</code> pueda modificar <code>warnquota.conf</code>?</span></summary>

El archivo es de `root`, del grupo `alumnos`, con permisos `rw-r--r--`. Lo más ordenado es aprovechar el grupo:

```bash
sudo usermod -aG alumnos curso      # curso entra al grupo alumnos
sudo chmod g+w warnquota.conf       # el grupo puede escribir (queda 664)
```

Dar permiso de escritura a **otros** (`chmod 646`) también funcionaría, pero cualquier usuario del sistema podría modificar el archivo. Para eso existen los grupos.

</details>

<details>
<summary><span>¿Quién puede acceder a los archivos dentro de <code>xdg</code>?</span></summary>

Solo el usuario `curso` (y root). Los permisos `rwx------` no dan nada ni al grupo ni a otros.

</details>

<details>
<summary><span>Dentro de <code>xdg</code> hay un archivo <code>test.txt</code> con permisos <code>rwxrwxrwx</code>. ¿Puede <code>tom</code> leerlo?</span></summary>

No. Para llegar a `test.txt` hay que **entrar** a `xdg`, y eso requiere el permiso `x` sobre el directorio, que `tom` no tiene. Los permisos del archivo no importan si no puedes llegar hasta él: es el cuaderno encerrado en la pieza con llave.

</details>

<details>
<summary><span>Si se elimina el usuario <code>curso</code>, ¿qué pasa con las columnas de dueño y grupo de <code>X11</code> y <code>xdg</code>?</span></summary>

- **`X11`:** su dueño es `tom`, así que la columna de usuario no cambia. En la de grupo, depende. Si el grupo `curso` sigue existiendo, no cambia nada. Si se eliminó junto con el usuario (pasa cuando era el grupo personal de `curso` y no tenía más miembros), `ls` ya no encuentra el nombre y muestra el **número** del grupo (GID).
- **`xdg`:** su dueño era `curso`, así que ahora aparece el **número** de usuario (UID) que tenía `curso`. Los archivos no se borran ni cambian de dueño solos.

</details>

<details>
<summary><span>¿Qué representa <code>drw-rw-rw-</code> en un elemento llamado <code>kejebi</code>?</span></summary>

`kejebi` es un **directorio** (`d`) con permisos de lectura y escritura para todos, pero **sin `x` para nadie**. En la práctica, casi no sirve: se puede ver la lista de nombres que contiene, pero nadie (salvo root) puede entrar, abrir los archivos de adentro ni crear archivos nuevos, porque para todo eso hace falta `x`.

</details>

<details>
<summary><span>¿Para qué sirven los grupos de usuarios?</span></summary>

Para administrar permisos de muchas personas a la vez. En vez de dar acceso a un archivo o directorio usuario por usuario, se le da al grupo, y basta con agregar o quitar personas del grupo. También permiten aplicar políticas comunes: por ejemplo, que solo el grupo `wheel` (o `sudo`, en Debian) pueda usar `sudo`.

</details>

<details>
<summary><span>Para <code>-rw----r-- 3 sole labs 434 dic 10 09:13 prueba-final</code>, ¿qué permisos tienen el dueño, el grupo y otros? ¿Cómo haces que el grupo <code>curso</code> pueda leerlo?</span></summary>

- **Dueño (`sole`):** lectura y escritura.
- **Grupo (`labs`):** ninguno.
- **Otros:** lectura.

Para que el grupo `curso` pueda leerlo, se cambia el grupo del archivo y se le da lectura:

```bash
sudo chgrp curso prueba-final
sudo chmod g+r prueba-final
```

(Sin `sudo`, `sole` también podría hacerlo, siempre que pertenezca al grupo `curso`.)

</details>

<details>
<summary><span>Si a un archivo con permisos <code>-rw-r----x</code> le aplicas <code>chmod u+x,g=rx,o-x</code>, ¿cómo queda?</span></summary>

`-rwxr-x---`

- `u+x`: el dueño gana ejecución, de `rw-` a `rwx`.
- `g=rx`: el grupo queda exactamente con lectura y ejecución, de `r--` a `r-x`.
- `o-x`: otros pierde ejecución, de `--x` a `---`.

</details>

<details>
<summary><span>¿Cómo creas el usuario <code>pepito</code> con su carpeta personal en <code>/home/casadepepito</code>?</span></summary>

```bash
sudo useradd -m -d /home/casadepepito pepito
sudo passwd pepito
```

</details>

<details>
<summary><span>¿Cómo ves cuáles fueron las últimas sesiones abiertas en tu computador?</span></summary>

Con `last`, que muestra las últimas sesiones iniciadas con usuario, terminal, origen y duración. `w` muestra quién está conectado **ahora**, y `sudo lastb` los intentos fallidos de inicio de sesión.

</details>

---

Sigue con **[El sistema de archivos](/archivo/sistemas-operativos/linux/sistema-de-archivos.md)**.
