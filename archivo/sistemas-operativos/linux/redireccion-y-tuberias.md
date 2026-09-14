---
title: Redirección y tuberías
description: Comandos pequeños que, juntos, hacen cosas grandes
eleventyNavigation:
    order: 30
tags:
    - linux
---
La gracia de la terminal no está en cada comando por separado, sino en poder **conectarlos**: mandar lo que produce uno a un archivo, o a la entrada de otro. Es la filosofía de UNIX: programas pequeños que hacen una sola cosa bien, y que se combinan.

## Entradas y salidas

Todo programa que corre en la terminal tiene tres canales abiertos, cada uno con un número:

| Número | Nombre | Qué es | Normalmente conectado a |
|---|---|---|---|
| 0 | `stdin` | entrada estándar | el teclado |
| 1 | `stdout` | salida estándar | la pantalla |
| 2 | `stderr` | salida de errores | la pantalla |

Los resultados van por la salida estándar (1) y los mensajes de error por la de errores (2). Como ambas terminan en la pantalla, parecen lo mismo, pero no lo son: se pueden separar.

## Redirigir la salida a un archivo

```bash
ls -l /etc > listado.txt       # la salida va al archivo (lo sobrescribe)
ls -l /home >> listado.txt     # la salida se agrega al final del archivo
```

- `>` crea el archivo, o lo **sobrescribe** si ya existía. Úsalo con cuidado.
- `>>` **agrega** al final, sin borrar lo que había.

`>` es un atajo de `1>`: redirige el canal 1.

## Redirigir los errores

```bash
ls -l no_existe 2> errores.txt       # los errores van al archivo
ls -l no_existe > salida.txt         # el error igual sale en pantalla
```

En el segundo caso, `salida.txt` queda vacío y el error aparece en la pantalla: `>` solo redirige la salida estándar, no la de errores.

Se pueden mandar a lugares distintos, o juntos:

```bash
comando > salida.txt 2> errores.txt   # cada uno a su archivo
comando > todo.txt 2>&1               # errores al mismo lugar que la salida
comando &> todo.txt                   # lo mismo, forma corta de Bash
```

`2>&1` se lee "manda el canal 2 a donde vaya el 1".

## `/dev/null`: el agujero negro

`/dev/null` es un archivo especial que **descarta** todo lo que se le escribe. Sirve para callar un comando:

```bash
find / -name "*.conf" 2> /dev/null   # busca, sin mostrar los "Permiso denegado"
```

Lo que se manda a `/dev/null` no se puede recuperar: nunca se guardó en ninguna parte.

## Redirigir la entrada

`<` hace que un programa lea su entrada desde un archivo en vez del teclado:

```bash
wc -l < /etc/passwd    # cuenta las líneas del archivo
```

## Tuberías: conectar comandos

Una **tubería** (*pipe*), escrita `|`, conecta la salida estándar de un comando con la entrada estándar del siguiente:

```bash
ls --help | less
```

La ayuda de `ls` es tan larga que no cabe en la pantalla. Con la tubería, en vez de salir a la pantalla, entra a `less`, que la muestra paginada.

```mermaid Una tubería entre ls y less
flowchart LR
    A["ls --help"] -->|"stdout → stdin"| B[less]
    B -->|stdout| C[Pantalla]
```

Se pueden encadenar tantas como quieras:

```bash
cat /etc/passwd | cut -d: -f7 | sort | uniq -c | sort -rn
```

Esa línea cuenta cuántos usuarios usan cada shell:

- `cut` saca la columna 7 de cada línea;
- `sort` ordena;
- `uniq -c` cuenta las líneas repetidas;
- el último `sort -rn` ordena de mayor a menor.

Algunos comandos que se usan mucho en tuberías:

| Comando | Qué hace |
|---|---|
| [`grep`](https://man7.org/linux/man-pages/man1/grep.1.html) | Filtra las líneas que contienen un texto |
| `sort` | Ordena líneas |
| `uniq` | Elimina (o cuenta, con `-c`) líneas repetidas seguidas |
| `wc -l` | Cuenta líneas |
| `head` y `tail` | Se quedan con las primeras o últimas líneas |
| `cut` | Saca columnas |
| [`tee`](https://man7.org/linux/man-pages/man1/tee.1.html) | Muestra en pantalla **y** guarda en un archivo a la vez |

## Varias órdenes en una línea

```bash
cd /tmp ; ls        # ejecuta uno y después el otro, pase lo que pase
mkdir x && cd x     # el segundo solo si el primero funcionó
cd x || echo "no existe"   # el segundo solo si el primero falló
```

## Variables

Una variable guarda un valor con un nombre. Se crea sin espacios alrededor del `=`, y se lee anteponiendo `$`:

```bash
nombre="Ana"
echo "Hola, $nombre"
```

### Variables de entorno

Las **variables de entorno** son variables que la shell les pasa a los programas que ejecuta. Varias se crean solas al iniciar la sesión:

| Variable | Contiene |
|---|---|
| `HOME` | Tu carpeta personal |
| `USER` | Tu nombre de usuario |
| `PATH` | Los directorios donde se buscan los comandos |
| `SHELL` | La shell que usas |
| `EDITOR` | El editor preferido, para los programas que lo necesiten |

```bash
echo $HOME
printenv          # muestra todas las variables de entorno
```

Para convertir una variable en variable de entorno, y que la vean los programas que lances, se usa `export`:

```bash
export EDITOR="nano"
```

Fíjate: al **crear** o **exportar** la variable, el nombre va sin `$`. El `$` solo se usa para **leer** su valor.

Estas variables duran hasta que cierras la terminal. Para que sean permanentes, se agregan a `~/.bashrc`.

## Un primer script

Un **script** es un archivo de texto con comandos, que se ejecutan en orden como si los escribieras uno por uno. Sirve para automatizar tareas repetitivas.

```bash
#!/bin/bash
# respaldo.sh: copia la carpeta de documentos con la fecha de hoy

fecha=$(date +%Y-%m-%d)
cp -r ~/documentos ~/respaldo-$fecha
echo "Respaldo listo en ~/respaldo-$fecha"
```

- La primera línea (`#!/bin/bash`, el *shebang*) dice con qué programa se ejecuta el archivo.
- `$(comando)` se reemplaza por la salida del comando.

Para ejecutarlo, hay que darle permiso de ejecución:

```bash
chmod +x respaldo.sh
./respaldo.sh
```

Para ir más allá, la [guía de Bash de Greg's Wiki](https://mywiki.wooledge.org/BashGuide) es excelente (en inglés).

## Ejercicios

<details>
<summary><span>¿Qué significan <code>|</code>, <code>>></code> y <code>&</code>?</span></summary>

- `|` es una **tubería**: conecta la salida de un programa con la entrada de otro.
- `>>` **agrega** la salida de un programa al final de un archivo, sin borrar lo que había.
- `&` al final de un comando lo ejecuta **en segundo plano**, y la terminal queda libre para seguir usándola. Se ve en [Procesos y servicios](/archivo/sistemas-operativos/linux/procesos-y-servicios.md#primer-y-segundo-plano).

</details>

<details>
<summary><span>¿Qué muestra <code>echo $HOME</code>? ¿Qué son las variables de entorno?</span></summary>

Muestra el contenido de la variable de entorno `HOME`: la ruta absoluta de la carpeta personal del usuario que lo ejecuta, por ejemplo `/home/ana`.

Las variables de entorno son variables que la shell define y les pasa a los programas que ejecuta. Sirven para configurar su comportamiento (qué editor usar, en qué idioma mostrar mensajes, dónde buscar comandos) y son muy útiles en scripts. Otras conocidas son `PATH`, `USER` y `EDITOR`. Una propia se crea con:

```bash
export MI_VARIABLE="mis valores"
```

</details>

<details>
<summary><span>Después de ejecutar estos comandos en orden, ¿qué contienen <code>data</code>, <code>data2</code> y <code>data3</code>?</span></summary>

```bash
echo "Juan" > data
echo "Jose" >> data
echo "Jorge" >> data
cat data > data2
echo "Francisca" >> data2
ls nn 2>> data2
cat data2 2> data3
```

Vamos por partes:

- **`data`** tiene `Juan`, `Jose` y `Jorge`: el primer `>` lo crea y los `>>` agregan.
- **`data2`** parte como copia de `data`, se le agrega `Francisca`, y como el archivo `nn` no existe, `ls` genera un error que `2>>` **agrega** al final. Queda:

    ```plaintext
    Juan
    Jose
    Jorge
    Francisca
    ls: no se puede acceder a 'nn': No existe el fichero o el directorio
    ```

- **`data3`** queda **vacío**. `cat data2` funciona sin errores: su salida estándar va a la pantalla, y lo único que se redirige a `data3` son los errores, que no hubo.

</details>

<details>
<summary><span>Explica qué hace <code>grep ANY ANY.password | less</code>.</span></summary>

`grep` busca las líneas que contienen el texto `ANY` dentro del archivo `ANY.password`. Su salida, en vez de ir a la pantalla, entra por la tubería a `less`, que la muestra paginada.

</details>

<details>
<summary><span>¿Qué pasa al ejecutar <code>cat /proc/cpuinfo ; wc -l /proc/cpuinfo</code>?</span></summary>

El `;` separa dos comandos que se ejecutan uno después del otro:

1. `cat /proc/cpuinfo` muestra la información del procesador (hay un bloque por cada núcleo).
2. `wc -l /proc/cpuinfo` cuenta cuántas líneas tiene ese mismo archivo.

`/proc/cpuinfo` no es un archivo guardado en disco: lo genera el kernel en el momento en que lo lees. Para un resumen más legible existe `lscpu`.

</details>

<details>
<summary><span>¿Cómo mandas la salida de <code>cat salida</code> al archivo <code>salida2</code>, y los errores a <code>2salida2</code>?</span></summary>

```bash
cat salida > salida2 2> 2salida2
```

`>` redirige la salida estándar y `2>` la de errores, cada una a su archivo.

</details>

<details>
<summary><span>¿Qué es un script?</span></summary>

Un archivo de texto con comandos que se ejecutan en orden, como si los escribieras uno por uno. Parte con una línea como `#!/bin/bash`, que dice qué programa lo interpreta, y necesita permiso de ejecución (`chmod +x script.sh`). Sirve para automatizar tareas: respaldos, instalaciones, procesamiento de archivos.

</details>

---

Sigue con **[Usuarios y permisos](/archivo/sistemas-operativos/linux/usuarios-y-permisos.md)**.
