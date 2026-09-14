---
title: Devolver valores con return
description: Lo que una función entrega de vuelta, y por qué no es lo mismo que mostrarlo
eleventyNavigation:
    order: 55
tags:
    - php
---
En [Funciones](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/funciones.md) usamos `return` sin detenernos mucho. Pero es de esas cosas que parecen obvias hasta que no lo son, así que vale la pena mirarlo con calma.

## Qué hace `return`

[`return`](https://www.php.net/manual/es/function.return.php) hace dos cosas a la vez:

1. **Termina la función** en ese mismo momento.
2. **Entrega un valor** a quien la llamó.

Ese valor aparece justo donde se llamó la función, como si la llamada se reemplazara por el resultado. Por eso se puede guardar en una variable, usar en una operación o pasárselo a otra función:

```php
<?php
declare(strict_types=1);

function doble(int $n): int {
    return $n * 2;
}

$resultado = doble(5);       // se guarda
echo $resultado, PHP_EOL;    // 10

echo doble(5) + 1, PHP_EOL;  // se usa en una operación: 11

echo doble(doble(3)), PHP_EOL;  // se pasa a otra función: doble(6), o sea, 12
```

Lee la última línea de adentro hacia afuera: `doble(3)` devuelve `6`, y ese `6` entra a la otra llamada.

## `echo` no es `return`

Esta es **la** confusión clásica. Mira estas dos funciones:

```php
<?php
declare(strict_types=1);

function saludarConEcho(string $nombre): void {
    echo "Hola, {$nombre}", PHP_EOL;
}

function saludarConReturn(string $nombre): string {
    return "Hola, {$nombre}";
}

$a = saludarConEcho("Ana");     // muestra el saludo...
var_dump($a);                    // ...pero no devuelve nada: NULL

$b = saludarConReturn("Ana");   // no muestra nada...
var_dump($b);                    // ...pero devuelve el saludo
```

Las dos parecen hacer lo mismo, pero no:

- `echo` **muestra** algo en pantalla, y el valor se va. La función no le entrega nada a quien la llamó.
- `return` **entrega** el valor, y quien llamó decide qué hacer con él: mostrarlo, guardarlo, transformarlo, compararlo.

Con `return`, la función sirve para mucho más:

```php
<?php
declare(strict_types=1);

function saludarConReturn(string $nombre): string {
    return "Hola, {$nombre}";
}

echo saludarConReturn("Luis"), PHP_EOL;              // mostrarlo
echo strtoupper(saludarConReturn("Luis")), PHP_EOL;  // transformarlo (a mayúsculas)
$saludos = [saludarConReturn("Ana"), saludarConReturn("Marta")];  // guardarlo
print_r($saludos);
```

Regla práctica: **una función calcula y devuelve; lo que se muestra, se muestra afuera.** Además, una función que solo hace `echo` no se puede [probar con un verificador](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md#un-verificador-casero), porque no hay nada que comparar.

## `return` termina la función de inmediato

Lo que viene después de un `return` que se ejecutó, **no se ejecuta**. Y si el `return` está dentro de un ciclo, no sale solo del ciclo: sale de la función completa.

```php
<?php
declare(strict_types=1);

// Devuelve la posición donde aparece $objetivo por primera vez, o null
function buscar(array $lista, int $objetivo): ?int {
    foreach ($lista as $posicion => $valor) {
        echo "revisando {$valor}", PHP_EOL;
        if ($valor === $objetivo) {
            return $posicion;  // lo encontró: se acaba la función, ciclo incluido
        }
    }
    return null;  // solo se llega aquí si recorrió todo sin encontrarlo
}

var_dump(buscar([5, 8, 3, 8], 8));
var_dump(buscar([5, 8, 3, 8], 7));
```

Fíjate en que no revisa el `3` ni el segundo `8`: apenas encuentra el primero, se va. Es parecido a [`break`](https://www.php.net/manual/es/control-structures.break.php), pero `break` solo sale del ciclo y la función sigue; `return` sale de todo.

## Salir temprano

Como `return` corta la función, se puede usar para **descartar los casos raros primero** y dejar el caso normal al final, sin `if` anidados. Se le llama *retorno temprano* (o *cláusula de guarda*):

```php
<?php
declare(strict_types=1);

function clasificar(float $nota): string {
    if ($nota < 1.0 || $nota > 7.0) {
        return "nota inválida";
    }
    if ($nota >= 6.0) {
        return "excelente";
    }
    if ($nota >= 4.0) {
        return "aprobado";
    }
    return "reprobado";
}

foreach ([6.5, 4.0, 2.1, 8.0] as $nota) {
    echo "{$nota}: ", clasificar($nota), PHP_EOL;
}
```

No hace falta ningún `else`: si una condición se cumple, la función ya terminó. Cada `if` se lee solo, de arriba hacia abajo.

Otro ejemplo: ¿qué pasa con el promedio de una lista vacía? Sin notas no hay promedio, así que ese caso se descarta primero. (Por qué importa tanto pensar en la lista vacía lo vas a ver en [Probar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md).)

```php
<?php
declare(strict_types=1);

function promedio(array $notas): ?float {
    if (count($notas) === 0) {
        return null;  // el caso raro, fuera de una
    }
    return array_sum($notas) / count($notas);  // el caso normal
}

var_dump(promedio([6.0, 5.5, 4.0]));
var_dump(promedio([]));
```

## Devolver un booleano directamente

Cuando la función responde una pregunta de sí o no, no hace falta un `if`: la comparación **ya es** un `true` o un `false`, así que se puede devolver tal cual.

```php
<?php
declare(strict_types=1);

// Funciona, pero da vueltas
function esAprobadoLargo(float $nota): bool {
    if ($nota >= 4.0) {
        return true;
    } else {
        return false;
    }
}

// Lo mismo, directo
function esAprobado(float $nota): bool {
    return $nota >= 4.0;
}

var_dump(esAprobado(4.0), esAprobado(3.9));
```

## Funciones que no devuelven nada

Si una función llega al final sin un `return`, devuelve `null`. Igual que en Python, donde devuelve `None`.

Cuando una función **a propósito** no devuelve nada (porque su trabajo es mostrar algo o modificar algo), se marca con el tipo [`void`](https://www.php.net/manual/es/language.types.declarations.php#language.types.declarations.void). Con `void` todavía se puede usar `return;` a secas, para salir temprano, pero no se puede devolver un valor:

```php
<?php
declare(strict_types=1);

function mostrarBoleta(array $productos): void {
    if (count($productos) === 0) {
        echo "No hay nada que cobrar.", PHP_EOL;
        return;  // sale temprano, sin devolver nada
    }
    foreach ($productos as $producto => $precio) {
        printf("%-10s $%5d\n", $producto, $precio);
    }
    printf("%-10s $%5d\n", "TOTAL", array_sum($productos));
}

mostrarBoleta(["pan" => 1200, "leche" => 990]);
echo PHP_EOL;
mostrarBoleta([]);

var_dump(mostrarBoleta([]));  // una función void, usada como valor: NULL
```

(`printf` arma columnas: `%-10s` es un texto en 10 espacios y `%5d` un entero en 5. Lo vemos con más calma en [Diccionarios](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md).)

## El tipo de retorno se hace cumplir

Con `strict_types`, el tipo que pusiste después de los dos puntos es una promesa, y PHP la revisa [al devolver](https://www.php.net/manual/es/functions.returning-values.php):

```php
<?php
declare(strict_types=1);

function edad(): int {
    return "18";  // un texto, aunque parezca número
}

echo edad();  // TypeError: debía devolver int
```

Y si olvidas el `return` en una función que prometió devolver algo, también reclama:

```php
<?php
declare(strict_types=1);

function total(array $montos): int {
    $suma = array_sum($montos);
    // ...se nos olvidó el return
}

echo total([100, 200]);  // TypeError: no devolvió nada
```

Sin tipo de retorno, esa función habría devuelto `null` en silencio, y el error habría aparecido más adelante, lejos de su origen. Una razón más para declarar los tipos.

## Devolver varias cosas

Una función devuelve **un** valor. Si necesitas entregar más de uno, se juntan en un array. En Python harías `return minimo, maximo`; en PHP es `return [$minimo, $maximo]`, y afuera se [desarma](https://www.php.net/manual/es/language.types.array.php#language.types.array.syntax.destructuring):

```php
<?php
declare(strict_types=1);

function minMax(array $notas): array {
    return [min($notas), max($notas)];
}

[$minima, $maxima] = minMax([4.5, 6.8, 3.2]);

echo "Mínima: {$minima}, máxima: {$maxima}", PHP_EOL;
```

Si son varias cosas con significado propio, un array con claves se entiende mejor, y también se puede desarmar por nombre:

```php
<?php
declare(strict_types=1);

function resumen(array $notas): array {
    $promedio = array_sum($notas) / count($notas);
    return [
        'promedio' => round($promedio, 1),
        'aprobado' => $promedio >= 4.0,
    ];
}

var_dump(resumen([4.5, 3.0, 5.1]));

['promedio' => $p, 'aprobado' => $ok] = resumen([3.0, 3.5]);
echo "Promedio {$p}: ", $ok ? "aprobado" : "reprobado", PHP_EOL;
```

[`min`](https://www.php.net/manual/es/function.min.php) y [`max`](https://www.php.net/manual/es/function.max.php) devuelven el menor y el mayor valor de un array.

## Ojo con las funciones que devuelven `false`

Varias funciones de PHP devuelven un valor si encuentran algo, y `false` si no. Por ejemplo, [`array_search`](https://www.php.net/manual/es/function.array-search.php) devuelve la **clave** donde encontró el valor. El problema aparece cuando esa clave es `0`:

```php
<?php
declare(strict_types=1);

$lista = ["cero", "uno", "dos"];

$posicion = array_search("cero", $lista, true);
var_dump($posicion);  // int(0): lo encontró en la posición 0

if ($posicion) {
    echo "Encontrado", PHP_EOL;
} else {
    echo "No encontrado (!)", PHP_EOL;  // 0 cuenta como falso
}

if ($posicion !== false) {
    echo "Ahora sí: encontrado", PHP_EOL;
}
```

`0` y `false` no son lo mismo, pero en un `if` los dos cuentan como falso. Por eso, cuando una función puede devolver `false`, se pregunta con `!== false`. Otra vez, [`===` y `!==`](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/decisiones-y-ciclos.md#code-code-contra-code-code) al rescate. Pasa lo mismo con [`strpos`](https://www.php.net/manual/es/function.strpos.php), que busca un texto dentro de otro.

## Para practicar

1. Cambia `saludarConEcho` para que use `return`, y usa el resultado para mostrar tres saludos en mayúsculas.
2. Escribe `esPar(int $n): bool` en una sola línea, sin `if`.
3. Escribe `primerReprobado(array $notas): ?string`, que reciba un diccionario `alumno => nota` y devuelva el nombre del primer alumno con nota bajo 4,0, o `null` si no hay ninguno. Usa un retorno temprano dentro del `foreach`.
4. Escribe `estadisticas(array $notas): array`, que devuelva el promedio, la nota mínima y la máxima en un array con claves, y desármalo afuera.

```php
<?php
declare(strict_types=1);

$notas = ["Ana" => 6.1, "Luis" => 3.4, "Marta" => 5.0, "Pedro" => 2.9];

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

---

Sigue con **[Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md)**.
