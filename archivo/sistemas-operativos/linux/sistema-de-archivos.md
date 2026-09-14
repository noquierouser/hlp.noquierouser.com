---
title: El sistema de archivos
description: Un solo árbol, y todo cuelga de él
eleventyNavigation:
    order: 50
tags:
    - linux
---
En Windows cada disco tiene su letra: `C:`, `D:`, `E:`. En Linux no hay letras: hay **un solo árbol** de directorios que parte en la raíz, `/`, y cada disco, pendrive o partición se "cuelga" en alguna rama de ese árbol.

## Todo es un archivo

Es una de las ideas centrales de UNIX: casi todo se maneja como si fuera un archivo. Los documentos, sí, pero también los discos, las terminales, e incluso información del kernel. Por eso los mismos comandos (`cat`, `ls`, redirecciones) sirven para todo.

```bash
cat /proc/uptime     # hace cuánto está prendido el equipo, en segundos
ls /dev              # los dispositivos, como archivos
```

## El árbol de directorios

Los directorios principales siguen un estándar, el [FHS](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html), así que son casi iguales en todas las distribuciones:

| Directorio | Qué contiene |
|---|---|
| `/` | La raíz: de aquí parte todo |
| `/bin`, `/sbin` | Programas básicos y de administración. Hoy casi siempre son enlaces a `/usr/bin` y `/usr/sbin` |
| `/boot` | Lo necesario para arrancar: el kernel y el *initramfs* |
| `/dev` | Los dispositivos (discos, terminales, etc.) |
| `/etc` | Configuración del sistema y de los programas instalados |
| `/home` | Las carpetas personales de los usuarios |
| `/lib` | Bibliotecas compartidas y módulos del kernel (también enlazado a `/usr/lib`) |
| `/media` | Donde se montan discos removibles, como pendrives |
| `/mnt` | Para montar sistemas de archivos a mano, de forma temporal |
| `/opt` | Programas instalados por fuera del gestor de paquetes |
| `/proc`, `/sys` | Información del kernel y de los procesos, generada al vuelo (no ocupa disco) |
| `/root` | La carpeta personal de root |
| `/run` | Datos temporales de los programas en ejecución; se borran al reiniciar |
| `/tmp` | Archivos temporales, que cualquier programa puede usar |
| `/usr` | La mayoría de los programas, bibliotecas y documentación |
| `/var` | Datos que cambian y crecen: logs, cachés, colas de impresión, bases de datos |

Una descripción completa está en el manual: `man hier`.

{% alert 'Antes, /bin, /sbin y /lib eran directorios reales, separados de /usr, porque /usr podía estar en otro disco que se montaba más tarde. Hoy casi todas las distribuciones los unificaron dentro de /usr y dejaron enlaces con los nombres antiguos.', 'info', 'Nota histórica' %}

## Dispositivos en `/dev`

Cada disco y cada partición aparecen como un archivo en `/dev`:

| Nombre | Qué es |
|---|---|
| `/dev/sda`, `/dev/sdb` | Primer y segundo disco SATA, SAS o USB |
| `/dev/sda1`, `/dev/sda2` | Primera y segunda partición del primer disco |
| `/dev/nvme0n1` | Primer disco NVMe (los SSD modernos) |
| `/dev/nvme0n1p2` | Su segunda partición |
| `/dev/mmcblk0p1` | Primera partición de una tarjeta SD |
| `/dev/sr0` | La unidad de CD/DVD |
| `/dev/tty1`, `/dev/tty2` | Las consolas de texto |
| `/dev/pts/0` | Una pseudoterminal: la usan las terminales gráficas y las conexiones remotas |
| `/dev/null` | El agujero negro: descarta todo lo que recibe |
| `/dev/zero`, `/dev/urandom` | Entregan ceros o bytes aleatorios sin fin |

Para ver los discos y particiones de forma ordenada:

```bash
lsblk        # discos, particiones y dónde están montados
lsblk -f     # además, el sistema de archivos de cada una
```

{% alert 'Los discos IDE, comunes hasta mediados de los 2000, se llamaban /dev/hda, /dev/hdb, etc. Las disqueteras eran /dev/fd0. Con los discos SATA y USB se pasó a la nomenclatura sd.', 'info', 'Nota histórica' %}

## Sistemas de archivos

Un **sistema de archivos** es la forma en que se organizan los datos dentro de una partición: cómo se guardan los nombres, los permisos, dónde está cada bloque de cada archivo. Hay varios, y Linux entiende casi todos:

| Sistema | Dónde se usa |
|---|---|
| **ext4** | El clásico de Linux; predeterminado en Debian y Ubuntu |
| **btrfs** | Predeterminado en Fedora; permite *snapshots* y compresión |
| **xfs** | Predeterminado en Red Hat Enterprise Linux; bueno con archivos grandes |
| **vfat** (FAT32) | Pendrives y la partición de arranque EFI; lo lee cualquier sistema |
| **exFAT** | Pendrives y tarjetas grandes; sin el límite de 4 GB por archivo de FAT32 |
| **NTFS** | Windows |
| **swap** | No guarda archivos: es memoria de intercambio |

Los sistemas de archivos de Linux usan **journaling**: antes de hacer un cambio, anotan lo que van a hacer en un registro. Si se corta la luz a mitad de camino, al volver a prender se revisa ese registro y el sistema de archivos no queda corrupto.

{% alert 'Antes de ext4 el estándar fue ext3, y antes ext2, que no tenía journaling. ext4 se volvió el predeterminado entre 2009 y 2013, según la distribución, y años después Fedora pasó a btrfs y Red Hat a xfs.', 'info', 'Nota histórica' %}

### ¿Y las particiones de Windows?

Linux lee y escribe sin problemas FAT32, exFAT (soporte incluido en el kernel desde la versión 5.7) y NTFS (con el controlador `ntfs3`, desde la 5.15).

Hay que tener en cuenta que FAT y exFAT **no tienen permisos** al estilo Linux. Al montarlas, todos los archivos aparecen con el mismo dueño y los mismos permisos, que se fijan con opciones de montaje (`uid`, `gid`, `umask`). Tampoco se respetan los atributos de Windows, como "oculto".

## Montar: colgar un disco del árbol

**Montar** es conectar un sistema de archivos a un directorio del árbol, que pasa a llamarse **punto de montaje**. Desde ahí, el contenido del disco aparece dentro de ese directorio.

```bash
sudo mount /dev/sdb1 /mnt       # monta la partición en /mnt
ls /mnt                         # ahora se ve su contenido
sudo umount /mnt                # la desmonta (ojo: umount, sin la n)
```

`mount` detecta solo el tipo de sistema de archivos. Si hace falta indicarlo, se usa `-t`:

```bash
sudo mount -t exfat /dev/sdb1 /mnt
```

Para ver qué está montado y dónde:

```bash
findmnt          # en forma de árbol
mount            # la lista completa, más difícil de leer
```

En un escritorio casi nunca hace falta montar a mano: al conectar un pendrive, el sistema lo monta solo, en `/run/media/tu-usuario/` (Fedora) o `/media/tu-usuario/` (Ubuntu). Desde la terminal, sin `sudo`, se puede hacer lo mismo con `udisksctl mount -b /dev/sdb1`.

### Montar al arrancar: `/etc/fstab`

Los sistemas de archivos que se montan solos al iniciar el equipo están en [`/etc/fstab`](https://man7.org/linux/man-pages/man5/fstab.5.html), uno por línea:

```plaintext
UUID=893b6987-b026-400d-8065-55f59f67dff0  /boot  ext4  defaults  0 0
```

Qué montar (identificado por su UUID, que no cambia aunque cambie el orden de los discos; se ve con `lsblk -f`), dónde, qué tipo, con qué opciones, y dos números para respaldos y revisión al arrancar. Un error en este archivo puede impedir que el sistema arranque: revisa dos veces antes de guardar.

## Cuánto espacio queda

```bash
df -h              # espacio usado y libre en cada sistema de archivos
du -sh documentos  # cuánto ocupa un directorio
du -sh * | sort -h # cuánto ocupa cada cosa aquí, de menor a mayor
```

La `-h` (*human*) muestra los tamaños en K, M y G en vez de bloques.

## Particiones y LVM

Al instalar, un esquema típico hoy es:

- una **partición EFI** pequeña (`/boot/efi`, en vfat), que el firmware usa para arrancar;
- a veces una partición **`/boot`** aparte;
- la **raíz** `/`, con todo lo demás (y a veces `/home` separado).

La memoria de intercambio (swap) ya no siempre es una partición: puede ser un archivo, o **zram**, memoria comprimida en la propia RAM (lo que usa Fedora por defecto).

Muchas instalaciones usan además [**LVM**](https://wiki.archlinux.org/title/LVM) (*Logical Volume Manager*): una capa entre los discos y los sistemas de archivos que permite agrandar, achicar o mover "particiones" (volúmenes lógicos) sin tener que reparticionar. Se ve con:

```bash
lsblk               # los volúmenes aparecen con tipo "lvm"
sudo pvs            # discos físicos que usa LVM
sudo vgs            # grupos de volúmenes
sudo lvs            # volúmenes lógicos
```

## Ejercicios

<details>
<summary><span>Describe para qué sirven los directorios que cuelgan de la raíz <code>/</code>.</span></summary>

Están en la [tabla del árbol de directorios](#el-arbol-de-directorios). Los más importantes para el día a día: `/etc` (configuración), `/home` (usuarios), `/var` (logs y datos que crecen), `/tmp` (temporales), `/usr` (programas) y `/dev` (dispositivos).

</details>

<details>
<summary><span>Las carpetas de los usuarios están en <code>/home</code>. ¿Dónde está la de root?</span></summary>

En `/root`, fuera de `/home` y protegida del resto de los usuarios (sus permisos no dejan entrar a nadie más).

</details>

<details>
<summary><span>¿Qué esperas que pase si eliminas el directorio <code>/boot</code>?</span></summary>

Que el sistema **no vuelva a arrancar**. En `/boot` están el kernel, el *initramfs* (un pequeño sistema que el kernel usa para poder montar el disco principal) y la configuración del cargador de arranque. Sin eso, no hay nada que cargar. Mientras el equipo siga prendido todo parece funcionar, porque el kernel ya está en memoria; el problema aparece en el siguiente reinicio.

</details>

<details>
<summary><span>Cuando un usuario inicia sesión, ¿en qué directorio queda?</span></summary>

En su carpeta personal, la que indica su variable `HOME`: normalmente `/home/usuario`.

</details>

<details>
<summary><span>¿El directorio <code>/</code> tiene permisos?</span></summary>

Sí, como cualquier directorio. Pertenece a root y normalmente tiene `drwxr-xr-x`: todos pueden entrar y ver su contenido, pero solo root puede crear o borrar cosas directamente en la raíz. Se comprueba con `ls -ld /`.

</details>

<details>
<summary><span>Al instalar una aplicación, ¿dónde sospecharías que queda su configuración?</span></summary>

La configuración **del sistema** queda en `/etc`. La configuración **personal** de cada usuario suele quedar en su carpeta, dentro de `~/.config` o en archivos ocultos como `~/.bashrc`.

</details>

<details>
<summary><span>¿Qué significa <code>/dev/sdd6</code>? ¿Y <code>/dev/nvme0n1p2</code>?</span></summary>

- `/dev/sdd6` es la **sexta partición** (`6`) del **cuarto disco** (`d`) SATA, SAS o USB (`sd`).
- `/dev/nvme0n1p2` es la **segunda partición** (`p2`) del primer espacio de nombres (`n1`) del primer controlador NVMe (`nvme0`). En la práctica: la segunda partición del primer SSD NVMe.

(En la época de los discos IDE, la sexta partición del cuarto disco habría sido `/dev/hdd6`.)

</details>

<details>
<summary><span>¿Qué diferencia hay entre <code>/dev/tty6</code> y <code>/dev/pts/6</code>?</span></summary>

- `/dev/tty6` es una **consola** real: la sexta terminal de texto del equipo, la que aparece con Ctrl + Alt + F6.
- `/dev/pts/6` es una **pseudoterminal**: una terminal "de mentira" que crea un programa. La usan las terminales gráficas (cada ventana o pestaña abre una) y las conexiones remotas por SSH.

Puedes ver en cuál estás con el comando `tty`.

</details>

<details>
<summary><span>¿Cómo montas un pendrive a mano? ¿Y un CD o DVD?</span></summary>

Primero, identificar el dispositivo con `lsblk`. Luego, montarlo en un directorio:

```bash
sudo mkdir -p /mnt/pendrive
sudo mount /dev/sdb1 /mnt/pendrive
```

Para un CD o DVD, el dispositivo es `/dev/sr0`:

```bash
sudo mount /dev/sr0 /mnt
```

En un escritorio, ambos se montan solos al conectarlos o insertarlos.

</details>

<details>
<summary><span>¿Qué pasa si montas un pendrive sobre un directorio que no está vacío?</span></summary>

El contenido original del directorio **queda oculto** mientras el pendrive esté montado: en ese directorio solo se ve lo del pendrive. No se borra nada; al desmontar (`umount`), el contenido original vuelve a aparecer.

</details>

<details>
<summary><span>¿Se puede recuperar un archivo que mandaste a <code>/dev/null</code>?</span></summary>

No. `/dev/null` descarta todo lo que recibe: los datos nunca se guardan en ninguna parte, así que no hay nada que recuperar.

</details>

<details>
<summary><span>¿Puede un usuario normal montar un pendrive? ¿De qué depende?</span></summary>

Con `mount` a secas, no: montar necesita permisos de administrador. Pero hay dos formas habituales de permitirlo:

- **En un escritorio**, el servicio `udisks` deja que el usuario que está sentado frente al equipo monte discos removibles, sin contraseña. Por eso los pendrives se montan solos.
- **El administrador** puede agregar el dispositivo a `/etc/fstab` con la opción `user` (o `users`), que autoriza a los usuarios normales a montarlo.

</details>

<details>
<summary><span>¿Con qué comando ves los dispositivos montados?</span></summary>

`findmnt` los muestra en forma de árbol, bien ordenados. `mount` sin argumentos también, pero en una lista mucho más larga. Para ver discos y particiones con su punto de montaje, `lsblk`.

</details>

<details>
<summary><span>Como administrador, quieres que cualquier usuario pueda montar el pendrive <code>/dev/sdb1</code>. ¿Qué haces tú y qué hace el usuario?</span></summary>

Como administrador, se agrega una línea a `/etc/fstab` con las opciones `users` (cualquier usuario puede montar y desmontar) y `noauto` (no se monta al arrancar, porque el pendrive puede no estar conectado):

```plaintext
/dev/sdb1  /media/pendrive  auto  users,noauto  0 0
```

Y se crea el punto de montaje: `sudo mkdir -p /media/pendrive`.

El usuario, sin `sudo`, solo indica el punto de montaje:

```bash
mount /media/pendrive
umount /media/pendrive
```

(En un escritorio moderno esto normalmente no es necesario, porque `udisks` ya lo permite. Y como el nombre `sdb1` puede cambiar según el orden en que se conectan los discos, en `fstab` es más seguro identificar el pendrive por su UUID.)

</details>

<details>
<summary><span>¿Qué sistema de archivos usa Linux?</span></summary>

No hay uno solo. Los más usados son **ext4** (Debian, Ubuntu), **btrfs** (Fedora) y **xfs** (Red Hat Enterprise Linux), que el instalador permite elegir. Linux además lee y escribe FAT32, exFAT y NTFS, entre muchos otros.

Lo que sí necesita el sistema de archivos donde se instala Linux es soportar sus permisos, dueños y enlaces. Por eso no se instala en FAT32 o exFAT, que no los tienen.

</details>

<details>
<summary><span>¿Linux puede leer y escribir particiones de Windows? ¿Es seguro?</span></summary>

Sí puede: FAT32, exFAT y NTFS se leen y escriben directamente con el kernel.

En cuanto a seguridad, hay dos cosas que considerar:

- FAT y exFAT **no tienen permisos**, así que todos los archivos quedan con el dueño y los permisos que se definan al montar. Si se monta con permisos abiertos, cualquier usuario del equipo puede ver y modificar todo.
- Los atributos de Windows, como "oculto", no se respetan: desde Linux se ve todo.

Además, si Windows quedó en hibernación o con el "inicio rápido" activado, conviene no escribir en su partición: Windows puede tener cambios pendientes y el sistema de archivos se puede dañar.

</details>

<details>
<summary><span>¿Cuánto espacio queda en <code>/tmp</code>? ¿Qué diferencia hay entre <code>df</code> y <code>du</code>?</span></summary>

```bash
df -h /tmp
```

- `df` (*disk free*) muestra el espacio **total, usado y disponible de cada sistema de archivos**. Responde "¿cuánto espacio queda en el disco?".
- `du` (*disk usage*) **suma lo que ocupan** los archivos de un directorio. Responde "¿qué es lo que está llenando el disco?".

En muchas distribuciones `/tmp` no está en el disco, sino en memoria (tipo `tmpfs`), así que su tamaño depende de la RAM.

</details>

<details>
<summary><span>¿Cómo revisas la estructura de volúmenes LVM de tu sistema?</span></summary>

`lsblk` muestra los volúmenes lógicos (tipo `lvm`) dentro de sus discos. Para el detalle, `sudo pvs` (volúmenes físicos), `sudo vgs` (grupos de volúmenes) y `sudo lvs` (volúmenes lógicos). Si no aparece nada, el sistema no usa LVM, lo que es común en instalaciones con btrfs.

</details>

<details>
<summary><span>¿Por qué alguien querría tener <code>/var/log</code> en un sistema de archivos separado?</span></summary>

Porque los logs crecen con el tiempo, y pueden crecer muy rápido si algo empieza a fallar en bucle. Si están en el mismo sistema de archivos que la raíz y llenan el disco, se cae todo lo demás: los programas no pueden escribir, los usuarios no pueden iniciar sesión. En un sistema de archivos aparte, lo peor que pasa es que se llena ese.

</details>

<details>
<summary><span>¿Cómo montas de forma temporal un sistema de archivos que está en un disco local?</span></summary>

```bash
sudo mount /dev/sdb1 /mnt
```

`/mnt` existe justamente para montajes temporales hechos a mano. Queda montado hasta que se desmonta con `sudo umount /mnt` o se reinicia el equipo. Para que se monte siempre al arrancar, habría que agregarlo a `/etc/fstab`.

</details>

<details>
<summary><span>Al instalar un sistema, ¿qué particiones se necesitan y qué recursos hacen falta?</span></summary>

**Recursos:**

- un computador;
- el instalador de la distribución, normalmente en un pendrive (antes era un CD o DVD);
- espacio libre en el disco;
- idealmente, conexión a internet para descargar actualizaciones.

**Particiones:** el instalador propone un esquema automático que suele funcionar bien. Uno típico tiene:

- una **partición EFI** (unos cientos de MB, en vfat, montada en `/boot/efi`);
- la **raíz** `/`, con el resto del espacio;
- opcionalmente una partición `/boot` y un `/home` separado.

La swap puede ser una partición, un archivo o zram.

</details>

---

Sigue con **[Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md)**.
