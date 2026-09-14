---
title: La línea de comandos
description: Cinco mil comandos, pero con veinte te las arreglas
eleventyNavigation:
    order: 20
tags:
    - linux
---
La línea de comandos provoca rechazo al principio: una pantalla negra que espera que escribas algo. Con la práctica pasa a ser la forma más rápida de hacer casi cualquier cosa, y en un servidor, muchas veces, la única.

## Terminal, consola y shell

Tres palabras que se usan como sinónimos, pero no lo son:

- **Terminal:** la ventana donde escribes. En un escritorio es un programa como GNOME Terminal, Konsole o Ptyxis.
- **Consola:** una terminal en modo texto, sin escritorio. En la mayoría de las distribuciones se llega con **Ctrl + Alt + F3** (hasta F6). Para volver al escritorio, Ctrl + Alt + F1 o F2, según la distribución.
- **Shell:** el programa que lee lo que escribes, lo interpreta y ejecuta. La más común es [**Bash**](https://www.gnu.org/software/bash/); otras son `zsh` y `fish`.

Cuando abres una terminal, lo primero que ves es el **prompt**:

```plaintext
noquierouser@oilers:~$
```

Usuario, `@`, nombre del equipo, `:`, directorio actual (`~` es tu carpeta personal) y `$`. Si en vez de `$` aparece `#`, estás como root: cuidado.

{% alert 'En 2012 el escritorio gráfico solía estar en la consola 7 (Ctrl + Alt + F7) y las de texto de la 1 a la 6. Hoy muchas distribuciones ponen la sesión gráfica en la 1 o la 2.', 'info', 'Nota histórica' %}

## Anatomía de un comando

```bash
ls -l -a /etc
```

- `ls` es el **comando**.
- `-l` y `-a` son **opciones**: cambian cómo se comporta. Las opciones cortas llevan un guion y se pueden juntar: `ls -la` es lo mismo que `ls -l -a`. Las largas llevan dos guiones y una palabra: `ls --all`.
- `/etc` es el **argumento**: sobre qué actúa el comando.

¿Y cómo sabe la shell dónde está el programa `ls`? Lo busca en los directorios listados en la variable `PATH`. Puedes ver dónde lo encontró con `which`:

```bash
which ls
```

```plaintext
/usr/bin/ls
```

## Moverse por los directorios

| Comando | Qué hace |
|---|---|
| `pwd` | Muestra en qué directorio estás (*print working directory*) |
| `ls` | Lista el contenido del directorio |
| `cd /etc` | Entra al directorio `/etc` |
| `cd ..` | Sube un nivel |
| `cd` o `cd ~` | Vuelve a tu carpeta personal |
| `cd -` | Vuelve al directorio donde estabas antes |

Una ruta puede ser:

- **Absoluta:** parte desde la raíz, con `/`. Por ejemplo, `/home/ana/documentos`. Funciona desde cualquier lugar.
- **Relativa:** parte desde donde estás. Si estás en `/home/ana`, basta con `documentos`. `.` es el directorio actual y `..` el de arriba.

## Dos teclas que te ahorran la vida

- **Tab** completa nombres de comandos, archivos y directorios. Si hay varias opciones, apretarla dos veces las muestra todas. Úsala siempre: evita errores de tipeo.
- **Flecha arriba** recorre los comandos anteriores, y **Ctrl + R** busca en el historial mientras escribes.

Y dos más: **Ctrl + C** interrumpe el programa que está corriendo, y **Ctrl + L** limpia la pantalla.

## Cómo pedir ayuda

Nadie se sabe los miles de comandos que existen, ni todas las opciones de cada uno. Lo que sí hay que saber es **dónde buscar**:

| Forma | Para qué sirve |
|---|---|
| `ls --help` | Ayuda rápida: la lista de opciones |
| `man ls` | El manual completo. Se navega con las flechas, `/palabra` busca y `q` sale |
| `man -k palabra` o `apropos palabra` | Busca comandos relacionados con un tema |
| `whatis ls` | Una línea que dice qué hace el comando |
| `info ls` | Documentación más extensa, en los programas de GNU |
| [tldr](https://tldr.sh) | Ejemplos prácticos y cortos, hechos por la comunidad |

Los manuales también están en línea, por ejemplo en [man7.org](https://man7.org/linux/man-pages/).

## Comandos de todos los días

### Archivos y directorios

```bash
mkdir proyectos           # crea un directorio
mkdir -p a/b/c            # crea toda la ruta de una vez
touch notas.txt           # crea un archivo vacío
cp notas.txt copia.txt    # copia un archivo
cp -r proyectos respaldo  # copia un directorio completo
mv copia.txt viejo.txt    # mueve o renombra
rm viejo.txt              # borra un archivo
rm -r respaldo            # borra un directorio y todo su contenido
```

`rm` no tiene papelera: lo borrado, borrado está. Con `rm -i` pregunta antes de cada archivo.

### Ver el contenido de un archivo

```bash
cat archivo       # vuelca todo el contenido
less archivo      # lo muestra paginado
head archivo      # las primeras 10 líneas
tail archivo      # las últimas 10 líneas
tail -f archivo   # las últimas, y se queda mostrando lo nuevo
```

### Buscar

```bash
find /etc -name "*.conf"    # busca archivos por nombre
grep root /etc/passwd       # busca líneas que contengan "root"
```

### Saber cosas del sistema

```bash
whoami     # quién soy
w          # quién está conectado y qué hace
uptime     # hace cuánto está prendido el equipo
uname -a   # versión del kernel
hostname   # nombre del equipo
```

## Archivos ocultos

En Linux, un archivo o directorio cuyo nombre empieza con un punto es **oculto**: `ls` no lo muestra a menos que se lo pidas con `-a`. Así se esconden, sobre todo, archivos de configuración como `.bashrc`.

```bash
ls -a ~
```

## Atajos propios: alias

Un **alias** le da un nombre corto a un comando largo:

```bash
alias ll='ls -la'
ll
```

Escribir `alias` solo muestra los que ya existen. Un alias creado así dura hasta que cierras la terminal. Para que sea permanente, se agrega esa misma línea al final de `~/.bashrc`.

## Editores de texto

Tarde o temprano vas a editar un archivo de configuración desde la terminal. Estos son los editores más comunes, y lo mínimo para sobrevivir:

| Editor | Guardar | Salir |
|---|---|---|
| [nano](https://www.nano-editor.org) | Ctrl + O, Enter | Ctrl + X |
| [vim](https://www.vim.org) | Esc, `:w`, Enter | Esc, `:q`, Enter (`:wq` guarda y sale; `:q!` sale sin guardar) |
| [emacs](https://www.gnu.org/software/emacs/) | Ctrl + X, Ctrl + S | Ctrl + X, Ctrl + C |

Si no conoces ninguno, parte con **nano**: los atajos aparecen en la parte de abajo de la pantalla. Y si caíste en vim sin querer, respira: Esc, `:q!`, Enter.

## Ejercicios

<details>
<summary><span>¿Qué opción de <code>ls</code> muestra los permisos, el dueño, el grupo, el tamaño y la fecha de cada archivo?</span></summary>

`ls -l`: muestra el listado en formato **largo**, una línea por archivo con todos esos datos. Qué significa cada columna se ve en [Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md#leer-un-listado-largo).

</details>

<details>
<summary><span>¿Qué hace <code>ls -la</code>? ¿Qué son los archivos de la forma <code>.nombre-archivo</code>?</span></summary>

`ls -la` combina dos opciones: `-l` para el formato largo y `-a` (de *all*) para mostrar **todos** los archivos, incluidos los ocultos.

Los archivos, directorios o enlaces cuyo nombre empieza con punto, como `.nombre-archivo`, son ocultos. Además, siempre aparecen dos entradas especiales: `.` (el directorio actual) y `..` (el directorio de arriba).

</details>

<details>
<summary><span>¿Qué hacen <code>pwd</code>, <code>cd ..</code> y <code>cd -</code>?</span></summary>

- `pwd` (*print working directory*) muestra la ruta **absoluta** del directorio donde estás.
- `cd ..` sube al directorio padre.
- `cd -` vuelve al directorio donde estabas antes del último `cd`.

</details>

<details>
<summary><span>Nombra todas las formas en que podrías obtener ayuda sobre un comando, por ejemplo, <code>xzibit</code>.</span></summary>

- `xzibit --help` o `xzibit -h`, si el programa lo soporta.
- `man xzibit`.
- `info xzibit`.
- `whatis xzibit`, para una descripción de una línea.
- `apropos xzibit` o `man -k xzibit`, para buscar temas relacionados.
- `tldr xzibit`, para ejemplos rápidos.
- Buscarlo en internet, idealmente en la documentación oficial o en [man7.org](https://man7.org/linux/man-pages/).

(Yo dawg, `xzibit` no existe. Pero si existiera, así pedirías ayuda.)

</details>

<details>
<summary><span>¿Por qué para eliminar un directorio con <code>rm</code> hay que agregar <code>-r</code>?</span></summary>

Porque un directorio contiene otros archivos y directorios, y `rm` no borra un directorio con contenido. La opción `-r` (recursivo) hace que entre a cada subdirectorio, borre su contenido y después borre el directorio. Funciona sin importar cuántos niveles de profundidad haya.

Existe también `rmdir`, que solo borra directorios **vacíos**: una forma segura de no llevarse nada por delante.

</details>

<details>
<summary><span>¿Qué hace <code>alias</code>? ¿Qué pasa si lo ejecutas sin nada más?</span></summary>

`alias` asocia un nombre corto a un comando más largo, por ejemplo `alias ll='ls -la'`. Sin argumentos, muestra todos los alias definidos en la sesión actual (varias distribuciones traen algunos configurados, como `ll` o `ls --color`).

</details>

<details>
<summary><span><code>cat</code>, <code>more</code> y <code>less</code> muestran el contenido de un archivo. ¿En qué se diferencian?</span></summary>

- **`cat`** vuelca todo el contenido de una vez. Es ideal para archivos cortos o para mandar el contenido a otro comando, pero con un archivo largo el texto pasa volando y solo ves el final.
- **`more`** muestra el archivo página por página, avanzando hacia abajo.
- **`less`** también pagina, pero permite moverse en cualquier dirección, buscar con `/palabra` y no necesita leer el archivo completo antes de mostrarlo.

Para leer un archivo largo, `less` es el más completo (de ahí el chiste: *less is more*).

</details>

<details>
<summary><span>¿Cómo mostrarías en pantalla el contenido del archivo <code>/etc/os-release</code>?</span></summary>

Con cualquiera de estos:

```bash
cat /etc/os-release
less /etc/os-release
more /etc/os-release
```

Por cierto, ese archivo dice qué distribución y versión estás usando.

</details>

<details>
<summary><span>En tu editor preferido, ¿cómo guardas los cambios y sales?</span></summary>

Depende del editor:

- **nano:** Ctrl + O y Enter para guardar; Ctrl + X para salir.
- **vim:** Esc y `:w` para guardar; `:q` para salir; `:wq` hace las dos cosas.
- **emacs:** Ctrl + X, Ctrl + S para guardar; Ctrl + X, Ctrl + C para salir.

</details>

---

Sigue con **[Redirección y tuberías](/archivo/sistemas-operativos/linux/redireccion-y-tuberias.md)**.
