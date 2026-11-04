---
title: Conociendo PhpStorm
description: Dónde está cada cosa, cómo moverte por un proyecto y los atajos que más rinden
eleventyNavigation:
    order: 30
tags:
    - phpstorm
    - herramientas
---
PhpStorm tiene cientos de botones y al principio abruma. La buena noticia: para trabajar bien basta con conocer cuatro zonas de la ventana y una docena de atajos. El resto lo vas descubriendo cuando lo necesites.

Si todavía no lo tienes instalado, parte por [Entorno de trabajo en Fedora](/referencia/entorno-fedora.md).

## Abrir un proyecto

En PhpStorm, **un proyecto es una carpeta**. No hay que importar ni convertir nada: en la pantalla de bienvenida eliges **Open** y seleccionas la carpeta del proyecto, por ejemplo `~/Lerd/mi-proyecto`.

La primera vez pasan dos cosas:

- Pregunta si confías en el proyecto. Si es tuyo o del curso, sí.
- Abajo aparece una barra que dice que está **indexando**. PhpStorm está leyendo todo el código para poder autocompletar y navegar. Mientras termina, algunas funciones no responden. La primera vez es la más lenta; después solo revisa lo que cambió.

PhpStorm crea dentro del proyecto una carpeta `.idea` con su configuración. Es tuya y de tu computador: no se comparte con el equipo.

## Las cuatro zonas

```plaintext
+--------------------------------------------------------------+
|  menú   proyecto   rama de Git                   ejecutar    |
+-----------+--------------------------------------------------+
|           |                                                  |
| Archivos  |                    Editor                        |
|    del    |              (una pestaña por archivo)           |
| proyecto  |                                                  |
|           |                                                  |
+-----------+--------------------------------------------------+
|  Terminal, Git, problemas...                                 |
+--------------------------------------------------------------+
|  barra de estado: posición del cursor, versión de PHP...     |
+--------------------------------------------------------------+
```

1. **Archivos del proyecto**, a la izquierda (`Alt+1`). El árbol de carpetas. Doble clic abre un archivo.
2. **Editor**, al centro. Cada archivo abierto es una pestaña.
3. **Paneles de abajo**. Los que más vas a usar son la terminal (`Alt+F12`) y el historial de Git (`Alt+9`).
4. **Barra superior**. Muestra el nombre del proyecto y la rama de Git en la que estás. En Linux, el menú principal está en el botón de las tres rayas, arriba a la izquierda.

Los paneles se abren y se cierran con su atajo. Si la pantalla se llena, `Ctrl+Shift+F12` esconde todo y deja solo el editor; el mismo atajo los devuelve.

## No hay botón de guardar

PhpStorm **guarda solo**. Cada cambio queda en el disco cuando cambias de archivo, de ventana o ejecutas algo. No busques `Ctrl+S`: no hace falta.

Y si te arrepientes de algo, hay dos redes de seguridad:

- `Ctrl+Z` deshace, como en todas partes.
- **Local History**: clic derecho sobre un archivo o carpeta, y luego *Local History → Show History*. PhpStorm guarda por su cuenta las versiones anteriores de cada archivo durante varios días, aunque no uses Git. Sirve para rescatar algo que borraste sin querer.

## Buscar en vez de navegar

Recorrer carpetas con el mouse es la forma lenta. Estos atajos son la forma rápida:

| Atajo | Qué hace |
|---|---|
| `Shift` dos veces | **Buscar en todas partes**: archivos, clases, funciones y acciones |
| `Ctrl+Shift+N` | Ir a un archivo por su nombre |
| `Ctrl+N` | Ir a una clase por su nombre |
| `Ctrl+E` | Archivos recientes |
| `Ctrl+Shift+F` | Buscar un texto en todo el proyecto |
| `Ctrl+Shift+A` | Buscar una **acción** de PhpStorm por su nombre |

Si tuvieras que aprender uno solo, que sea `Shift` dos veces. Y `Ctrl+Shift+A` es el que te salva cuando sabes que algo existe pero no dónde está: escribes "reformat", "rename" o "terminal", y aparece la acción junto con su atajo.

No hace falta escribir el nombre completo. Para llegar a `ArriendoController` basta con `ArrC` o `arrcon`.

## Entender código ajeno

Buena parte del trabajo es leer código que no escribiste tú. Para eso:

| Atajo | Qué hace |
|---|---|
| `Ctrl+B` o `Ctrl+clic` | Ir a la **definición** de una clase, función o variable |
| `Ctrl+Alt+Flecha izquierda` | Volver adonde estabas |
| `Alt+F7` | Ver **dónde se usa** lo que tienes bajo el cursor |
| `Ctrl+F12` | Lista de métodos del archivo actual |
| `Ctrl+Q` | Documentación rápida de lo que tienes bajo el cursor |

`Ctrl+B` y `Ctrl+Alt+Flecha izquierda` van en pareja: entras a ver cómo funciona algo y vuelves. Con eso puedes seguir una llamada a través de diez archivos sin perderte.

## Escribir y arreglar

| Atajo | Qué hace |
|---|---|
| `Alt+Enter` | **Arreglo rápido**: propone soluciones para lo que está subrayado |
| `Shift+F6` | **Renombrar** una variable, función o clase en todos los lugares donde se usa |
| `Ctrl+Alt+L` | Ordenar el formato del archivo |
| `Ctrl+/` | Comentar o descomentar la línea |
| `Ctrl+D` | Duplicar la línea |
| `Ctrl+Y` | Borrar la línea |
| `Alt+Shift+Flecha arriba` o `abajo` | Mover la línea |

Dos de estos cambian la forma de trabajar:

- **`Alt+Enter`**. Cuando PhpStorm subraya algo en amarillo o rojo, pon el cursor encima y presiónalo. Importa la clase que falta, agrega el tipo de retorno, corrige el nombre mal escrito. Léelo antes de aceptar: es una sugerencia, no una orden.
- **`Shift+F6`**. Nunca renombres con buscar y reemplazar. Este atajo entiende el código: cambia la variable `$total` de esta función y deja tranquila a la `$total` de la función de al lado.

## Lo que dicen los colores

- **Subrayado rojo**: error. El código no va a funcionar así.
- **Subrayado amarillo**: advertencia. Funciona, pero hay algo sospechoso o mejorable.
- **Texto en gris**: una variable o un `use` que no se usa.
- **Arriba a la derecha del editor**: el resumen de errores y advertencias del archivo. Un visto verde significa que no encontró nada.

En el árbol de archivos, los colores hablan de Git: **azul** es un archivo modificado, **verde** uno nuevo que ya agregaste, y **rojo** uno nuevo que Git todavía no sigue.

## La terminal integrada

`Alt+F12` abre una terminal que ya está ubicada en la carpeta del proyecto. Es la misma terminal del sistema, así que todo funciona igual: `php artisan`, `composer`, `git`, `lerd`.

Usarla ahí en vez de en una ventana aparte tiene una ventaja concreta: cuando un error menciona un archivo y una línea, puedes hacer clic y PhpStorm te lleva directo.

## Recorrido por un proyecto Laravel

Al abrir un proyecto Laravel aparecen muchas carpetas. Estas son las que importan al principio:

| Carpeta o archivo | Qué hay |
|---|---|
| `app/` | **Tu código**: modelos, controladores y el resto de las clases |
| `routes/web.php` | Qué dirección del navegador lleva a qué código |
| `resources/views/` | Las plantillas HTML (archivos `.blade.php`) |
| `database/migrations/` | La estructura de las tablas, escrita en PHP |
| `tests/` | Las pruebas automáticas |
| `public/` | Lo único que el navegador ve directamente |
| `config/` | Configuración del framework |
| `.env` | Configuración **de tu computador**: claves, base de datos. No se comparte |
| `composer.json` | Las bibliotecas que el proyecto necesita |
| `vendor/` | Esas bibliotecas, ya descargadas. No se edita ni se comparte |

Un buen primer ejercicio: abre `routes/web.php`, pon el cursor sobre `view` y presiona `Ctrl+B`. Acabas de entrar al código del framework. Vuelve con `Ctrl+Alt+Flecha izquierda`.

## Si un atajo no responde

Los atajos de esta página son los que PhpStorm trae por defecto. En Linux pueden variar por dos motivos: el escritorio se queda con algunas combinaciones antes de que lleguen a PhpStorm, y PhpStorm puede partir con un mapa de teclas adaptado al escritorio que detecta.

Si un atajo no hace nada, o hace otra cosa, busca la acción por su nombre con `Ctrl+Shift+A`: ahí aparece la combinación que tiene asignada **en tu equipo**.

Y si la combinación la está usando el escritorio, hay dos salidas. Puedes liberarla en KDE, en *Preferencias del sistema → Teclado → Atajos*. O puedes asignarle otra en PhpStorm, en *Settings → Keymap*.

La lista completa está en la [referencia de atajos de PhpStorm](https://www.jetbrains.com/help/phpstorm/mastering-keyboard-shortcuts.html).

---

Sigue con **[De tu computador a GitHub](/ramos/programacion-avanzada/unidades/04-calidad-e-integracion/de-tu-computador-a-github.md)**, en Programación Avanzada.
