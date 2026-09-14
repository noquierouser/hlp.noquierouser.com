---
title: Decisiones y ciclos
description: if, foreach y las comparaciones que no hacen lo que crees
eleventyNavigation:
    order: 30
tags:
    - php
---
Las estructuras de control son las mismas que ya conoces. Cambia la ropa (llaves y paréntesis) y aparecen un par de trampas con las comparaciones.

## if, elseif, else

```php
<?php
$nota = 5.5;

if ($nota >= 6.0) {
    echo "Excelente", PHP_EOL;
} elseif ($nota >= 4.0) {
    echo "Aprobado", PHP_EOL;
} else {
    echo "Reprobado", PHP_EOL;
}
```

- La condición va entre paréntesis y el bloque entre llaves.
- Es [`elseif`](https://www.php.net/manual/es/control-structures.elseif.php), todo junto, no `elif`.
- Más en el manual de [`if`](https://www.php.net/manual/es/control-structures.if.php).

## Y, o, no: `&&`, `||`, `!`

Los [operadores lógicos](https://www.php.net/manual/es/language.operators.logical.php) son `&&` (y), `||` (o) y `!` (no). PHP también tiene `and` y `or`, pero con una [precedencia](https://www.php.net/manual/es/language.operators.precedence.php) tan baja que hacen cosas raras:

```php
<?php
$conAnd = true and false;  // se lee como: ($conAnd = true) and false
$conAmp = true && false;

var_dump($conAnd);  // true (!)
var_dump($conAmp);  // false
```

Moraleja: usa siempre `&&`, `||` y `!`.

## `==` contra `===`

Esta es de las importantes. [`==`](https://www.php.net/manual/es/language.operators.comparison.php) convierte los tipos antes de comparar (lo que se conoce como *type juggling*), y eso da resultados sorprendentes. `===` compara valor **y** tipo, sin conversiones:

```php
<?php
var_dump("0" == false);    // true (!)
var_dump("0" === false);   // false

var_dump("1" == "01");     // true: los compara como números
var_dump("1" === "01");    // false: son textos distintos

var_dump(null == false);   // true
var_dump(null === false);  // false
```

Usa siempre `===` y `!==`, salvo que tengas una muy buena razón. Si te da curiosidad lo que hace `==`, el manual tiene una [tabla completa de comparaciones](https://www.php.net/manual/es/types.comparisons.php) que da un poco de miedo.

## foreach

[`foreach`](https://www.php.net/manual/es/control-structures.foreach.php) es el `for ... in` de Python: recorre los elementos de un array.

```php
<?php
$notas = [6.0, 5.5, 4.8];

foreach ($notas as $n) {
    echo "Nota: {$n}", PHP_EOL;
}

// range() arma un array con una secuencia, como range() en Python
foreach (range(1, 5) as $i) {
    echo $i, " ";
}
```

Ojo con el orden: en PHP es `foreach ($coleccion as $elemento)`, al revés que en Python. La función [`range`](https://www.php.net/manual/es/function.range.php) incluye ambos extremos: `range(1, 5)` llega hasta el 5.

## for y while

También están [`for`](https://www.php.net/manual/es/control-structures.for.php) al estilo C y [`while`](https://www.php.net/manual/es/control-structures.while.php):

```php
<?php
for ($i = 0; $i < 3; $i++) {
    echo "Vuelta {$i}", PHP_EOL;
}

$cuenta = 3;
while ($cuenta > 0) {
    echo "Quedan {$cuenta}", PHP_EOL;
    $cuenta--;
}
```

Para recorrer arrays, casi siempre conviene `foreach`.

---

Sigue con **[Arrays](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md)**.
