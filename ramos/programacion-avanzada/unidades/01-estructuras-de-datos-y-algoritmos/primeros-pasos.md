---
title: Primeros pasos con PHP
description: Ya sabes programar; ahora toca mudarse de lenguaje
eleventyNavigation:
    order: 10
tags:
    - php
---
El lenguaje de este ramo es **PHP 8.5**. Si llegaste hasta aquí ya sabes programar (en Python, seguramente), así que esto no es aprender de nuevo: es mudarse de lenguaje. La mayoría de las ideas son las mismas; lo que cambia es la sintaxis y un par de mañas.

## Dónde probar el código

- **Aquí mismo.** Los ejemplos que empiezan con `<?php` tienen un botón ▶ Ejecutar. También los puedes editar antes de correrlos (Ctrl + Enter los ejecuta), y si te enredas, "Restaurar" deja el código como estaba.
- **En [3v4l.org](https://3v4l.org).** Pegas el código y lo corre en muchas versiones de PHP. Ojo: lo que pegues ahí queda público, así que nada de datos reales.
- **En tu computador.** Más adelante vas a necesitar un entorno de verdad: revisa [Herramientas para PHP](/referencia/herramientas-php.md).

En ninguno de los dos primeros hay `input()`, así que los datos van escritos en el mismo código.

## Lo mismo, dos veces

Un programa en Python que ya sabrías escribir:

```python
nombre = "Ana"
notas = [6.0, 5.5, 4.8]

for n in notas:
    print(f"Nota: {n}")

def promedio(ns: list) -> float:
    return sum(ns) / len(ns)

print(nombre, promedio(notas))
```

Y el mismo programa en PHP:

```php
<?php
declare(strict_types=1);

$nombre = "Ana";
$notas = [6.0, 5.5, 4.8];

foreach ($notas as $n) {
    echo "Nota: {$n}\n";
}

function promedio(array $ns): float {
    return array_sum($ns) / count($ns);
}

echo $nombre, " ", promedio($notas), "\n";
```

Lo único realmente nuevo:

- El archivo parte con [`<?php`](https://www.php.net/manual/es/language.basic-syntax.phptags.php).
- Cada variable lleva [`$`](https://www.php.net/manual/es/language.variables.basics.php) adelante.
- Cada instrucción termina en [`;`](https://www.php.net/manual/es/language.basic-syntax.instruction-separation.php).
- Los bloques van entre llaves `{ }`; la indentación es solo para que se lea bien.

¿Y el `declare(strict_types=1)`? Hace que PHP se tome en serio los tipos. Lo vemos con calma en [Funciones](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/funciones.md); por ahora, ponlo siempre en la primera línea.

## Mostrar cosas en pantalla

Hay tres formas que vas a usar todo el tiempo:

- [`echo`](https://www.php.net/manual/es/function.echo.php) muestra texto, pensado para personas.
- [`print_r`](https://www.php.net/manual/es/function.print-r.php) muestra arrays de forma legible.
- [`var_dump`](https://www.php.net/manual/es/function.var-dump.php) muestra el tipo y el valor exacto. Es la que sirve para depurar.

```php
<?php
$notas = [6.3, 4.8, 6.1];

echo "Hola", PHP_EOL;  // PHP_EOL es un salto de línea
print_r($notas);
var_dump($notas);
```

Y a veces no muestran lo mismo:

```php
<?php
declare(strict_types=1);

function promedio(array $ns): float {
    return array_sum($ns) / count($ns);
}

$mi_promedio = promedio([6.3, 4.8, 6.1, 2.0, 6.9]);

echo $mi_promedio, PHP_EOL;
var_dump($mi_promedio);
```

`echo` redondea para mostrar; `var_dump` muestra el valor real, con todo y el error de precisión que tienen los [números de punto flotante](https://www.php.net/manual/es/language.types.float.php) en cualquier lenguaje (en Python también pasa).

## Comentarios

```php
<?php
// Comentario de una línea
# También de una línea, pero casi no se usa

/*
   Comentario de
   varias líneas
*/

echo "Los comentarios no se ejecutan", PHP_EOL;
```

Un truco útil para probar: comentar un bloque entero con `/* */` y descomentarlo de a poco. Más en el [manual](https://www.php.net/manual/es/language.basic-syntax.comments.php).

## Si vienes de Python

Aquí es donde la intuición de Python te va a hacer perder tiempo. Cada una se explica en su tema:

| En Python | En PHP | La trampa |
|---|---|---|
| `"a" + "b"` | `"a" . "b"` | El `+` suma números o une arrays, pero nunca concatena texto. Ver [Texto](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/texto.md). |
| `"0" == False` es falso | `"0" == false` es verdadero | `==` convierte tipos antes de comparar. Usa `===`. Ver [Decisiones y ciclos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/decisiones-y-ciclos.md). |
| `elif`, `and`, `not` | `elseif`, `&&`, `!` | `and` y `or` existen, pero con otra precedencia. Ver [Decisiones y ciclos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/decisiones-y-ciclos.md). |
| `d["x"]` lanza `KeyError` | `$d["x"]` avisa y da `null` | El programa **no** se detiene. Ver [Arrays](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md). |
| Una función lee variables globales | Una función no ve nada de afuera | Todo entra por parámetro. Ver [Funciones](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/funciones.md). |
| Una función que hace `lista.append()` cambia la lista original | Una función que agrega a un array cambia **su copia** | Los arrays se pasan por valor. Ver [Parámetros por referencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md). |

La cuarta es la que más muerde: en Python el programa se cae; en PHP sigue con un `null` adentro, y el error aparece mucho después.

## Para tener a mano

El [manual de PHP en español](https://www.php.net/manual/es/) es bueno de verdad. Cada función tiene su página con ejemplos, y en este sitio vamos a enlazarlo seguido.

---

Sigue con **[Texto](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/texto.md)**.
