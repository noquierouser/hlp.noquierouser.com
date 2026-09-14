---
title: Probar algoritmos
description: Un algoritmo que no se prueba no está terminado; está escrito
eleventyNavigation:
    order: 100
tags:
    - php
    - algoritmos
    - pruebas
---
Escribiste un algoritmo, lo ejecutaste y dio bien. ¿Cómo sabes que está correcto?

Seguramente lo probaste **una vez**, con datos que elegiste tú, que son justo los que el programa maneja bien. ¿Qué pasa con una lista vacía? ¿Con un cliente repetido? ¿Con un monto negativo? El salto de "funciona" a "**lo verifiqué**" es de lo que trata este tema.

## El código funciona... hasta que no

```php
<?php
declare(strict_types=1);

function promedio(array $notas): float
{
    return array_sum($notas) / count($notas);
}

echo promedio([6.0, 5.5, 4.0]), PHP_EOL;  // 5.1666...
echo promedio([]), PHP_EOL;               // ?
```

Con una lista vacía, `count([])` es 0, y dividir por cero lanza un [`DivisionByZeroError`](https://www.php.net/manual/es/class.divisionbyzeroerror.php). La función nunca contempló ese caso, y nadie lo probó.

Arreglarlo obliga a **decidir** qué significa el promedio de nada. Una opción razonable es devolver `null`, y dejarlo claro en la firma con `?float`:

```php
<?php
declare(strict_types=1);

function promedio(array $notas): ?float
{
    if (count($notas) === 0) {
        return null;  // no hay promedio de una lista vacía
    }
    return array_sum($notas) / count($notas);
}

var_dump(promedio([6.0, 5.5, 4.0]));
var_dump(promedio([]));
```

Esa decisión no la toma el código: la tomas tú, pensando en el problema. Por eso los casos borde hay que pensarlos **antes**.

## Los cinco casos que siempre hay que pensar

Para cualquier algoritmo que recibe una lista, prueba al menos estos:

1. **Vacío:** la lista no trae nada.
2. **Uno solo:** un único elemento.
3. **Repetidos:** dos elementos que caen en la misma clave o son iguales.
4. **Límite:** un cero, o el valor justo en el borde (una nota exactamente 4,0, por ejemplo).
5. **Inválido:** un monto negativo, un campo que falta, un estado que no es ni `presente` ni `ausente`.

La mayoría de los errores vive en estos cinco lugares, no en el caso "normal".

## La tabla de casos de prueba

Antes de la herramienta, el instrumento: una tabla donde cada fila es un caso. Para el [total vendido por día](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/disenar-algoritmos.md#caso-guiado-total-vendido-por-dia):

| # | Caso | Entrada | Salida esperada | Obtenida | ¿OK? |
|---|---|---|---|---|---|
| 1 | Lista vacía | `[]` | `[]` | | |
| 2 | Un solo elemento | una venta | esa venta, íntegra | | |
| 3 | Dos del mismo día | montos 1000 y 500 | 1500 en esa fecha | | |
| 4 | Valor cero | una venta con monto 0 | la fecha, con 0 | | |
| 5 | Valor negativo | una venta con monto -200 | el total, descontado | | |

La columna **salida esperada** se llena antes de ejecutar, pensando. Las columnas **obtenida** y **¿OK?**, después. Si las llenas al revés (ejecutas, copias lo que salió y lo pones como esperado), la tabla no prueba nada.

## Un verificador casero

Llenar la tabla a mano cada vez que cambias el código es lento. Mejor que PHP lo haga por ti:

```php
<?php
declare(strict_types=1);

function totalPorDia(array $ventas): array
{
    $totales = [];
    foreach ($ventas as $v) {
        $f = $v['fecha'];
        $totales[$f] = ($totales[$f] ?? 0) + $v['monto'];
    }
    return $totales;
}

function verificar(string $caso, mixed $esperado, mixed $obtenido): void
{
    $ok = $esperado === $obtenido;
    printf("[%s] %s\n", $ok ? ' OK ' : 'FALLA', $caso);
    if (!$ok) {
        echo '  esperado: ', var_export($esperado, true), "\n";
        echo '  obtenido: ', var_export($obtenido, true), "\n";
    }
}

verificar('lista vacía devuelve arreglo vacío',
    [], totalPorDia([]));

verificar('un solo elemento queda íntegro',
    ['2026-09-09' => 1000],
    totalPorDia([['fecha' => '2026-09-09', 'monto' => 1000]]));

verificar('dos ventas del mismo día se suman',
    ['2026-09-09' => 1500],
    totalPorDia([
        ['fecha' => '2026-09-09', 'monto' => 1000],
        ['fecha' => '2026-09-09', 'monto' => 500],
    ]));

verificar('una venta en cero aparece con 0',
    ['2026-09-09' => 0],
    totalPorDia([['fecha' => '2026-09-09', 'monto' => 0]]));

verificar('un monto negativo se descuenta',
    ['2026-09-09' => 800],
    totalPorDia([
        ['fecha' => '2026-09-09', 'monto' => 1000],
        ['fecha' => '2026-09-09', 'monto' => -200],
    ]));
```

- `mixed` es un tipo que acepta [cualquier cosa](https://www.php.net/manual/es/language.types.declarations.php): el verificador sirve para números, textos o arrays.
- [`var_export`](https://www.php.net/manual/es/function.var-export.php) muestra un valor escrito como código PHP. Con el `true`, lo devuelve como texto en vez de imprimirlo.

### ¿Y cuando algo falla?

Para eso está. Aquí, una versión con un error típico: en vez de sumar, **reemplaza** el total:

```php
<?php
declare(strict_types=1);

function totalPorDia(array $ventas): array
{
    $totales = [];
    foreach ($ventas as $v) {
        $totales[$v['fecha']] = $v['monto'];  // error: pisa en vez de sumar
    }
    return $totales;
}

function verificar(string $caso, mixed $esperado, mixed $obtenido): void
{
    $ok = $esperado === $obtenido;
    printf("[%s] %s\n", $ok ? ' OK ' : 'FALLA', $caso);
    if (!$ok) {
        echo '  esperado: ', var_export($esperado, true), "\n";
        echo '  obtenido: ', var_export($obtenido, true), "\n";
    }
}

verificar('un solo elemento queda íntegro',
    ['2026-09-09' => 1000],
    totalPorDia([['fecha' => '2026-09-09', 'monto' => 1000]]));

verificar('dos ventas del mismo día se suman',
    ['2026-09-09' => 1500],
    totalPorDia([
        ['fecha' => '2026-09-09', 'monto' => 1000],
        ['fecha' => '2026-09-09', 'monto' => 500],
    ]));
```

Con una sola venta, la versión con error pasa sin problemas. **Solo el caso de repetidos la delata.** Si hubieras probado "una vez, con tus datos", no te habrías enterado.

### `===` y no `==`

El verificador compara con `===`. Con `==`, PHP [convierte tipos antes de comparar](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/decisiones-y-ciclos.md#code-code-contra-code-code): `'1' == '01'` es `true`, así que un verificador con `==` puede aprobar código incorrecto.

Dos detalles de `===` que conviene conocer:

```php
<?php
// Con arrays, === también exige el mismo orden de las claves
var_dump(['a' => 1, 'b' => 2] === ['b' => 2, 'a' => 1]);  // false
var_dump(['a' => 1, 'b' => 2] == ['b' => 2, 'a' => 1]);   // true

// Con decimales, los errores de precisión hacen fallar comparaciones "obvias"
var_dump(0.1 + 0.2 === 0.3);            // false (!)
var_dump(round(0.1 + 0.2, 2) === 0.3);  // true
```

- **Orden de las claves:** si tu algoritmo devuelve las claves en otro orden que el esperado, `===` dice que falla. A veces el orden importa y está bien que falle; si no importa, ordena ambos con `ksort` antes de comparar.
- **Decimales:** para promedios y cosas por el estilo, compara después de redondear con [`round`](https://www.php.net/manual/es/function.round.php).

## Un truco para probar en grupo

Si trabajas con más gente, intercambien algoritmos. Cada quien le aporta **un caso de prueba que el autor no consideró**. Es sorprendente lo rápido que aparecen.

## Y más adelante...

Esto mismo, pero más cómodo y con más herramientas, es lo que hacen [PHPUnit](https://phpunit.de) y [Pest](https://pestphp.com). Cuando lleguen no van a ser magia: ya habrás escrito uno a mano.

## Para practicar

Toma tu solución de uno de los problemas de [Diseñar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/disenar-algoritmos.md#para-practicar):

1. Arma su tabla de casos de prueba, con al menos cuatro casos. El caso vacío es obligatorio.
2. Escribe los casos con el verificador.
3. Si alguno falla, corrige el algoritmo y anota qué corregiste.

```php
<?php
declare(strict_types=1);

function verificar(string $caso, mixed $esperado, mixed $obtenido): void
{
    $ok = $esperado === $obtenido;
    printf("[%s] %s\n", $ok ? ' OK ' : 'FALLA', $caso);
    if (!$ok) {
        echo '  esperado: ', var_export($esperado, true), "\n";
        echo '  obtenido: ', var_export($obtenido, true), "\n";
    }
}

// Pega aquí tu algoritmo y escribe tus casos

```

---

Sigue con **[Eficiencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/eficiencia.md)**.
