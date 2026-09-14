---
title: Funciones
description: La firma de una función es un contrato
eleventyNavigation:
    order: 50
tags:
    - php
---
Las [funciones](https://www.php.net/manual/es/language.functions.php) en PHP se parecen mucho a las de Python. La gran diferencia es que aquí los tipos no son un adorno: si los declaras, PHP los hace cumplir.

## Definir una función

```php
<?php
declare(strict_types=1);

function promedio(array $ns): float {
    return array_sum($ns) / count($ns);
}

echo promedio([6.0, 5.5, 4.8]), PHP_EOL;
```

- `function` en vez de `def`, y el cuerpo va entre llaves.
- El **tipo va antes del nombre** del [parámetro](https://www.php.net/manual/es/functions.arguments.php) (`array $ns`), al revés que en Python.
- El [tipo de retorno](https://www.php.net/manual/es/functions.returning-values.php) va después de los dos puntos (`: float`).
- [`array_sum`](https://www.php.net/manual/es/function.array-sum.php) suma los elementos de un array, como `sum` en Python.

## `strict_types`: los tipos se hacen cumplir

En Python, los *type hints* son documentación y nadie los revisa al ejecutar. En PHP, con [`declare(strict_types=1)`](https://www.php.net/manual/es/language.types.declarations.php#language.types.declarations.strict) en la primera línea del archivo, el motor los verifica en cada llamada:

```php
<?php
declare(strict_types=1);

function doble(float $x): float {
    return $x * 2;
}

var_dump(doble(6));      // un int sí se acepta donde se pide float
var_dump(doble("6.0"));  // con strict_types, un string no pasa
```

Prueba a borrar la línea del `declare` y ejecutar de nuevo: PHP convierte `"6.0"` a número por su cuenta y el programa sigue como si nada.

¿Por qué insistir con esto?

- El error aparece **en la línea que lo causó**, no diez pasos después.
- Con solo leer la primera línea de la función ya sabes qué entra y qué sale.

## Puede devolver `null`: `?int`

Un `?` antes del tipo lo hace [*nullable*](https://www.php.net/manual/es/language.types.declarations.php#language.types.declarations.nullable): la función puede devolver ese tipo o `null`. Combinado con `??` (que vimos en [Arrays](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md)), queda algo muy expresivo:

```php
<?php
declare(strict_types=1);

function buscarStock(array $inventario, string $producto): ?int {
    return $inventario[$producto] ?? null;
}

$stock = ["arroz" => 12];
var_dump(buscarStock($stock, "arroz"));   // int(12)
var_dump(buscarStock($stock, "azúcar"));  // NULL, sin warning
```

Leyendo solo la firma (`array $inventario, string $producto): ?int`) ya sabes qué entra, qué sale y que puede no encontrar nada. Eso es código mantenible.

## Una función no ve lo de afuera

En Python, una función puede leer variables globales. En PHP, **no**: dentro de una función solo existen sus parámetros y las variables que cree ella misma. Es el [ámbito de las variables](https://www.php.net/manual/es/language.variables.scope.php).

```php
<?php
$sala = [
    'lunes' => 'A202',
    'jueves' => 'C304',
];

// Sin parámetro: la función no ve $sala
function leermeSinParametro() {
    echo $sala['jueves'], PHP_EOL;
}

// Con parámetro: ahora sí
function leerme($salon) {
    echo $salon['jueves'], PHP_EOL;
}

leermeSinParametro();
leerme($sala);
```

Esto que parece una molestia en realidad es una ayuda: todo lo que la función necesita está a la vista en su firma.

Ojo, que hay un segundo detalle: lo que entra por parámetro es una **copia**. Si la función modifica el array que recibió, el de afuera no cambia. Cómo hacer que sí cambie (y cuándo conviene) está en [Parámetros por referencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md).

## Encadenar funciones con `|>`

PHP 8.5 trajo el [operador pipe](https://www.php.net/manual/es/language.operators.functional.php) `|>`, que pasa el resultado de una función a la siguiente, de izquierda a derecha, en vez de anidarlas hacia adentro:

```php
<?php
declare(strict_types=1);

$titulo = "  Hola Mundo  ";

// Anidado: se lee de adentro hacia afuera
$slug1 = strtolower(trim($titulo));

// Con pipe: se lee en el orden en que ocurre
$slug2 = $titulo
    |> trim(...)
    |> strtolower(...);

var_dump($slug1, $slug2);
```

El `trim(...)` con tres puntos es la forma de referirse a [la función misma](https://www.php.net/manual/es/functions.first_class_callable_syntax.php), sin llamarla todavía.

## Para practicar

1. Una función `promedio` que reciba una lista de notas y devuelva el promedio. ¿Qué pasa si la lista viene vacía? (Spoiler en [Probar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md).)
2. Una función que reciba una lista de números y devuelva solo los mayores que un límite. Hazla primero con `foreach`, y después mira [`array_filter`](https://www.php.net/manual/es/function.array-filter.php).

```php
<?php
declare(strict_types=1);

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

---

Sigue con **[Devolver valores con return](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/return.md)**.
