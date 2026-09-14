---
title: Arrays
description: Una sola estructura que hace de lista y de diccionario
eleventyNavigation:
    order: 40
tags:
    - php
    - estructuras-de-datos
---
En Python, `list` y `dict` son tipos distintos. En PHP son lo mismo: el [array](https://www.php.net/manual/es/language.types.array.php). Es cómodo, porque todo se hace con una sola estructura, y peligroso por la misma razón.

## Como lista

Si no le pones claves, PHP numera los elementos desde 0:

```php
<?php
$notas = [6.0, 5.5, 4.8];

$notas[] = 7.0;                // agrega al final
echo count($notas), PHP_EOL;   // 4
echo $notas[0], PHP_EOL;       // 6

print_r($notas);
```

- `$notas[] = ...` agrega un elemento al final, como `append` en Python.
- [`count`](https://www.php.net/manual/es/function.count.php) es el `len` de PHP.

## Como diccionario

Con `clave => valor`, el array funciona como un diccionario (en PHP se le llama *array asociativo*):

```php
<?php
$stock = [
    "arroz" => 12,
    "azúcar" => 3,
];

echo $stock["arroz"], PHP_EOL;   // 12

$stock["fideos"] = 8;            // agrega una clave nueva
$stock["azúcar"] = 5;            // cambia el valor de una clave existente

print_r($stock);
```

A simple vista nada distingue una lista de un diccionario: hay que leer el código que lo llena.

## Recorrer clave y valor

`foreach` puede entregar la clave y el valor a la vez, como `.items()` en Python:

```php
<?php
$sala = [
    'lunes' => 'A202',
    'martes' => 'C104',
    'miercoles' => 'F102',
    'jueves' => 'C304',
    'viernes' => 'A201',
    'sabado' => null,
    'domingo' => null,
];

foreach ($sala as $dia => $salon) {
    if ($salon) {
        echo "El {$dia} toca en la sala {$salon}.", PHP_EOL;
    } else {
        echo "El {$dia} no hay clases. Obvio.", PHP_EOL;
    }
}
```

Con una lista también funciona: la clave es la posición (0, 1, 2...).

## Claves que no existen

Aquí está la trampa más traicionera para quien viene de Python. Si pides una clave que no existe, PHP **no** lanza un error: muestra un *warning*, te devuelve `null` y sigue como si nada.

```php
<?php
$sala = [
    'lunes' => 'A202',
    'jueves' => 'C304',
];

echo $sala['jueves'], PHP_EOL;  // existe: C304
echo $sala[3], PHP_EOL;         // no hay clave 3: Warning
echo $sala['marzo'], PHP_EOL;   // tampoco existe: Warning
var_dump($sala['marzo']);       // y lo que devuelve es NULL
echo "...y el programa sigue como si nada.", PHP_EOL;
```

Ese `null` puede viajar por todo el programa y explotar muy lejos de donde se originó. Dos formas de protegerse:

```php
<?php
$stock = ["arroz" => 12];

// 1. Preguntar antes si la clave existe
if (array_key_exists("azúcar", $stock)) {
    echo $stock["azúcar"], PHP_EOL;
} else {
    echo "No hay azúcar registrada", PHP_EOL;
}

// 2. Usar ?? para dar un valor por defecto
echo $stock["azúcar"] ?? 0, PHP_EOL;  // 0, sin warning
```

- [`array_key_exists`](https://www.php.net/manual/es/function.array-key-exists.php) pregunta si existe la clave.
- El operador [`??`](https://www.php.net/manual/es/language.operators.comparison.php#language.operators.comparison.coalesce) entrega el valor de la izquierda si existe y no es `null`, y si no, el de la derecha.

También existe `isset`, pero tiene una trampa con los valores `null`; la vemos en [Diccionarios](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md).

## Borrar elementos

[`unset`](https://www.php.net/manual/es/function.unset.php) borra un elemento. Ojo: en una lista, las posiciones **no** se reordenan:

```php
<?php
$letras = ["a", "b", "c"];
unset($letras[1]);

print_r($letras);  // quedan las claves 0 y 2
```

Si después haces `$letras[1]`, te llevas un warning. Si necesitas volver a numerar, existe [`array_values`](https://www.php.net/manual/es/function.array-values.php).

## Primero y último

Desde PHP 8.5 existen [`array_first`](https://www.php.net/manual/es/function.array-first.php) y [`array_last`](https://www.php.net/manual/es/function.array-last.php). Si el array está vacío devuelven `null`, sin warnings:

```php
<?php
$eventos = ["inicio", "pausa", "fin"];

var_dump(array_first($eventos));  // "inicio"
var_dump(array_last($eventos));   // "fin"
var_dump(array_last([]));         // NULL
```

## Para practicar

Escribe en PHP estos programas que ya sabrías hacer en Python:

1. Recorrer un diccionario imprimiendo cada clave y su valor.
2. Contar cuántas veces aparece cada palabra en un texto. Te puede servir [`explode`](https://www.php.net/manual/es/function.explode.php) para separar el texto en palabras.

```php
<?php
declare(strict_types=1);

$texto = "el perro y el gato y el ratón";

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

---

Sigue con **[Funciones](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/funciones.md)**.
