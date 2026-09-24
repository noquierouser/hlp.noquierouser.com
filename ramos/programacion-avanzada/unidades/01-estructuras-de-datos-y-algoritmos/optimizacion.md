---
title: Cazar el cuello de botella
description: Encontrar dónde se va el tiempo y optimizar sin romper nada
eleventyNavigation:
    order: 120
tags:
    - php
    - algoritmos
    - eficiencia
---
[Eficiencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/eficiencia.md) enseñó a medir y a contar operaciones. Saber que algo tarda 800 ms es interesante, pero la pregunta que sigue es más útil: **¿en qué parte se van esos 800 ms, y cómo la arreglo sin romper lo que ya funcionaba?**

Eso es cazar el cuello de botella. Y es una cacería con método, no a ojo.

## Qué es un cuello de botella

Un **cuello de botella** es la parte del código donde se va casi todo el tiempo. No el programa completo: un pedazo.

Casi siempre es lo mismo: **un ciclo dentro de otro ciclo**. Si el de afuera da 4.000 vueltas y el de adentro da otras 4.000, son 16 millones de operaciones para algo que quizás se podía resolver en 4.000.

Optimizar el resto —renombrar variables, sacar un `echo`, cambiar `for` por `foreach`— no mueve la aguja. Arreglar el ciclo de adentro sí.

## Los ciclos que no se ven

El problema es que el ciclo de adentro no siempre se escribe. A veces viene dentro de una función:

| Función | Qué hace por dentro |
|---|---|
| [`in_array($x, $lista)`](https://www.php.net/manual/es/function.in-array.php) | recorre la lista hasta encontrar `$x` |
| [`array_search($x, $lista)`](https://www.php.net/manual/es/function.array-search.php) | lo mismo, y devuelve la clave |
| [`array_column($filas, 'rut')`](https://www.php.net/manual/es/function.array-column.php) | recorre **todas** las filas para armar una lista nueva |
| [`array_shift($cola)`](https://www.php.net/manual/es/function.array-shift.php) | saca el primero y **renumera** todo el array |

Cualquiera de estas dentro de un `foreach` es un ciclo dentro de otro, aunque en la pantalla veas uno solo.

Esa es la primera sospecha cuando algo anda lento: **buscar llamadas a funciones que recorren, dentro de ciclos**.

## El método, en seis pasos

1. **Verifica que funciona.** Casos de prueba antes de tocar nada. Si no sabes si está bien, no sabrás si lo rompiste.
2. **Mide con tres tamaños.** Duplicando: 1.000, 2.000, 4.000. Un solo número no dice nada; tres muestran cómo crece.
3. **Cuenta operaciones.** Un contador da lo mismo en cualquier máquina y no depende de quién más esté usando el servidor.
4. **Busca el ciclo dentro del ciclo.** Incluidos los escondidos de la tabla de arriba.
5. **Optimiza.** Cambia la estructura, o saca del ciclo el trabajo que no cambia en cada vuelta.
6. **Verifica y mide otra vez.** La versión nueva tiene que dar exactamente lo mismo que la original. Si da otra cosa, no es una optimización: es un error más rápido.

El paso 1 y el paso 6 son la misma herramienta: el [verificador](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md#un-verificador-casero).

## Demo: el minimarket

El problema es corriente y aburrido, que es justo como son los problemas reales.

- **Entrada:** una lista de clientes registrados (`rut`, `nombre`) y una lista de pedidos (`rut`, `monto`).
- **Proceso:** sumar los montos de cada RUT registrado. Los pedidos de RUT no registrados se ignoran.
- **Salida:** un diccionario `rut => total`.

### Versión 1: funciona

```php
<?php
declare(strict_types=1);

function totalRegistradosLenta(array $clientes, array $pedidos): array
{
    $totales = [];
    foreach ($pedidos as $p) {
        if (in_array($p['rut'], array_column($clientes, 'rut'), true)) {
            $totales[$p['rut']] = ($totales[$p['rut']] ?? 0) + $p['monto'];
        }
    }
    return $totales;
}

$clientes = [
    ['rut' => '11-1', 'nombre' => 'Ana'],
    ['rut' => '22-2', 'nombre' => 'Beto'],
];
$pedidos = [
    ['rut' => '11-1', 'monto' => 3000],
    ['rut' => '99-9', 'monto' => 5000],   // no está registrado
    ['rut' => '11-1', 'monto' => 1500],
];

print_r(totalRegistradosLenta($clientes, $pedidos));
```

Con tres pedidos anda perfecto y es imposible sospechar nada. El problema aparece con datos de verdad.

### ¿Cuánto tarda?

Para medir hacen falta muchos datos, así que los generamos:

```php
<?php
declare(strict_types=1);

function totalRegistradosLenta(array $clientes, array $pedidos): array
{
    $totales = [];
    foreach ($pedidos as $p) {
        if (in_array($p['rut'], array_column($clientes, 'rut'), true)) {
            $totales[$p['rut']] = ($totales[$p['rut']] ?? 0) + $p['monto'];
        }
    }
    return $totales;
}

function generar(int $n): array
{
    $clientes = $pedidos = [];
    for ($i = 1; $i <= $n; $i++) {
        $clientes[] = ['rut' => "{$i}-K", 'nombre' => "Cliente {$i}"];
        $pedidos[]  = ['rut' => rand(1, (int) ($n * 1.2)) . '-K', 'monto' => rand(500, 20000)];
    }
    return [$clientes, $pedidos];
}

foreach ([1000, 2000, 4000] as $n) {
    [$c, $p] = generar($n);
    $t0 = hrtime(true);
    totalRegistradosLenta($c, $p);
    printf("n=%5d  lenta: %8.2f ms\n", $n, (hrtime(true) - $t0) / 1e6);
}
```

`generar` arma `$n` clientes con RUT correlativos y `$n` pedidos con RUT al azar entre 1 y `$n * 1,2`, así que un 20% de los pedidos no está registrado. Es lo bastante realista para lo que necesitamos.

{% alert 'Aquí en la página PHP corre dentro del navegador, y por seguridad los navegadores entregan la hora con precisión de milisegundos: lo que tarde menos de 1 ms va a marcar 0,00. La diferencia entre las dos versiones igual se ve de sobra. Para números más finos, corre el código en 3v4l o en tu computador.', 'info', 'Ojo con el reloj' %}

Al duplicar los datos el tiempo **se cuadruplica**. Esa señal ya basta para saber qué buscar: hay un ciclo dentro de otro.

### Dónde está el ciclo escondido

Míralo otra vez, línea por línea:

```php
foreach ($pedidos as $p) {                                     // n vueltas
    if (in_array($p['rut'], array_column($clientes, 'rut'), true)) {
        //          ^ recorre la lista          ^ recorre TODOS los clientes
    }
}
```

`array_column` arma una lista nueva con los 4.000 RUT **en cada vuelta**, y después `in_array` la recorre buscando uno. Cuatro mil vueltas por ocho mil operaciones cada una.

Y lo peor: esa lista de RUT es **siempre la misma**. Los clientes no cambian dentro del ciclo. Estamos rehaciendo 4.000 veces un trabajo idéntico.

### Versión 2: la misma respuesta, otra estructura

Dos cambios, y los dos salen de lo que ya vimos: sacar del ciclo lo que no cambia, y usar un [diccionario](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md#dos-formas-de-preguntar-si-algo-existe) en vez de una lista para preguntar si algo existe.

```php
<?php
declare(strict_types=1);

function totalRegistradosRapida(array $clientes, array $pedidos): array
{
    $registrados = array_flip(array_column($clientes, 'rut'));   // una sola vez
    $totales = [];
    foreach ($pedidos as $p) {
        if (isset($registrados[$p['rut']])) {
            $totales[$p['rut']] = ($totales[$p['rut']] ?? 0) + $p['monto'];
        }
    }
    return $totales;
}

$clientes = [
    ['rut' => '11-1', 'nombre' => 'Ana'],
    ['rut' => '22-2', 'nombre' => 'Beto'],
];
$pedidos = [
    ['rut' => '11-1', 'monto' => 3000],
    ['rut' => '99-9', 'monto' => 5000],
    ['rut' => '11-1', 'monto' => 1500],
];

print_r(totalRegistradosRapida($clientes, $pedidos));
```

[`array_flip`](https://www.php.net/manual/es/function.array-flip.php) da vuelta la lista de RUT: los convierte en claves. Y preguntar por una clave con `isset` cuesta lo mismo con 10 clientes que con 10.000.

El `array_column` sigue ahí, pero ahora corre **una sola vez**, afuera del ciclo. De 4.000 recorridos completos pasamos a uno.

### Antes de celebrar: ¿dan lo mismo?

Una versión rápida que entrega otra cosa no sirve de nada. Antes de cualquier tabla de tiempos, la comparación:

```php
<?php
declare(strict_types=1);

function totalRegistradosLenta(array $clientes, array $pedidos): array
{
    $totales = [];
    foreach ($pedidos as $p) {
        if (in_array($p['rut'], array_column($clientes, 'rut'), true)) {
            $totales[$p['rut']] = ($totales[$p['rut']] ?? 0) + $p['monto'];
        }
    }
    return $totales;
}

function totalRegistradosRapida(array $clientes, array $pedidos): array
{
    $registrados = array_flip(array_column($clientes, 'rut'));
    $totales = [];
    foreach ($pedidos as $p) {
        if (isset($registrados[$p['rut']])) {
            $totales[$p['rut']] = ($totales[$p['rut']] ?? 0) + $p['monto'];
        }
    }
    return $totales;
}

function verificar(string $caso, mixed $esperado, mixed $obtenido): void
{
    printf("[%s] %s\n", $esperado === $obtenido ? ' OK ' : 'FALLA', $caso);
}

function generar(int $n): array
{
    $clientes = $pedidos = [];
    for ($i = 1; $i <= $n; $i++) {
        $clientes[] = ['rut' => "{$i}-K", 'nombre' => "Cliente {$i}"];
        $pedidos[]  = ['rut' => rand(1, (int) ($n * 1.2)) . '-K', 'monto' => rand(500, 20000)];
    }
    return [$clientes, $pedidos];
}

[$c, $p] = generar(500);
verificar('lenta y rápida dan lo mismo',
    totalRegistradosLenta($c, $p), totalRegistradosRapida($c, $p));

foreach ([1000, 2000, 4000] as $n) {
    [$c, $p] = generar($n);
    $t0 = hrtime(true); totalRegistradosLenta($c, $p);
    $t1 = hrtime(true); totalRegistradosRapida($c, $p);
    $t2 = hrtime(true);
    printf("n=%5d  lenta: %8.2f ms   rápida: %6.2f ms\n", $n, ($t1 - $t0) / 1e6, ($t2 - $t1) / 1e6);
}
```

Fíjate en que `verificar` compara con `===`, que en arrays también exige **el mismo orden de claves**. Como las dos versiones recorren los pedidos en el mismo orden, los totales salen en el mismo orden y la comparación es honesta.

Este es el script completo de la clase, por si lo quieres correr afuera: [3v4l.org/qjonA](https://3v4l.org/qjonA#v8.5.11).

### Antes y después

Estos son los tiempos en mi computador (los tuyos van a ser distintos; lo que importa es cómo crecen):

| Datos | Versión 1 | Versión 2 |
|---|---|---|
| 1.000 | 12,8 ms | 0,20 ms |
| 2.000 | 39,0 ms | 0,29 ms |
| 4.000 | 143,2 ms | 0,65 ms |

Al duplicar los datos, la versión 1 se cuadruplica —es **cuadrática**— y la versión 2 apenas se duplica —es **lineal**—. Con 4.000 datos la diferencia ya es de 200 veces, y mientras más datos, peor.

Y ojo con la trampa: la versión 1 con 1.000 datos tarda 12 ms. Nadie va a reclamar por 12 ms. El problema no es hoy, es cuando el minimarket tenga 50.000 clientes.

## Tres movimientos que sirven casi siempre

Cuando encuentras el cuello, la solución suele ser una de estas tres:

1. **Cambiar la estructura.** Si estás buscando dentro de una lista, conviértela en [diccionario](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md) y pregunta con `isset`. De recorrer todo a ir directo.
2. **Sacar del ciclo lo que no cambia.** Si el resultado es el mismo en todas las vueltas, calcúlalo una vez antes de entrar.
3. **Elegir la operación barata.** Sacar del final con `array_pop` no cuesta lo mismo que sacar del inicio con `array_shift`; recorrer con `foreach` no cuesta lo mismo que ir vaciando el array. Y si de verdad necesitas una cola que se vacíe, está [`SplQueue`](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md#de-paso-splstack-y-splqueue).

Lo que **no** sirve: adivinar. Optimizar sin medir es cambiar código al azar y quedarse con la sensación de haber hecho algo.

## Para practicar: tres sospechosos

Cada uno de estos programas funciona y cada uno esconde un ciclo. Para cada uno: **mídelo** con tres tamaños, **encuentra** el ciclo escondido, **optimízalo** y **verifica** que la versión nueva da el mismo resultado.

Compara siempre con los mismos datos: genera la lista una vez y pásasela a las dos versiones.

### Sospechoso 1: asistentes inscritos

```php
<?php
declare(strict_types=1);

$n = 4_000;   // prueba con 1_000, 2_000 y 4_000

$inscritos  = array_map(fn($i) => "rut-{$i}", range(1, $n));
$asistentes = array_map(fn($i) => 'rut-' . rand(1, 2 * $n), range(1, $n));

$t0 = hrtime(true);
$validos = 0;
foreach ($asistentes as $rut) {
    if (in_array($rut, $inscritos, true)) {
        $validos++;
    }
}
printf("Asistentes inscritos: %d (%.2f ms)\n", $validos, (hrtime(true) - $t0) / 1e6);
```

<details>
<summary><span>Ver la solución</span></summary>

El ciclo escondido es `in_array`: recorre los 4.000 inscritos en cada una de las 4.000 vueltas. Es el mismo caso del minimarket, y la solución es la misma: un índice con `array_flip`, armado una sola vez.

```php
<?php
declare(strict_types=1);

$n = 4_000;

$inscritos  = array_map(fn($i) => "rut-{$i}", range(1, $n));
$asistentes = array_map(fn($i) => 'rut-' . rand(1, 2 * $n), range(1, $n));

// Versión original
$t0 = hrtime(true);
$validos = 0;
foreach ($asistentes as $rut) {
    if (in_array($rut, $inscritos, true)) {
        $validos++;
    }
}
$t1 = hrtime(true);

// Versión optimizada
$indice = array_flip($inscritos);   // una sola vez
$validos2 = 0;
foreach ($asistentes as $rut) {
    if (isset($indice[$rut])) {
        $validos2++;
    }
}
$t2 = hrtime(true);

printf("original:  %d inscritos, %8.2f ms\n", $validos,  ($t1 - $t0) / 1e6);
printf("optimizada: %d inscritos, %7.2f ms\n", $validos2, ($t2 - $t1) / 1e6);
printf("[%s] las dos cuentan lo mismo\n", $validos === $validos2 ? ' OK ' : 'FALLA');
```

En mi computador: 55 ms contra 0,2 ms con 4.000 datos.

</details>

### Sospechoso 2: la fila de atención

```php
<?php
declare(strict_types=1);

$fila = range(1, 20_000);   // prueba con 10_000, 20_000 y 40_000

$t0 = hrtime(true);
$atendidos = 0;
while ($fila) {
    $cliente = array_shift($fila);
    $atendidos++;
}
printf("Atendidos: %d (%.2f ms)\n", $atendidos, (hrtime(true) - $t0) / 1e6);
```

<details>
<summary><span>Ver la solución</span></summary>

Aquí no hay ningún ciclo adentro a la vista, pero `array_shift` renumera el array completo cada vez que saca el primero: 20.000 vueltas por 20.000 elementos que correr una posición.

Si lo único que necesitas es **recorrer** la fila, ni siquiera hay que vaciarla:

```php
<?php
declare(strict_types=1);

$n = 20_000;

// Versión original: vaciando con array_shift
$fila = range(1, $n);
$t0 = hrtime(true);
$a = 0;
while ($fila) {
    $cliente = array_shift($fila);
    $a++;
}
$t1 = hrtime(true);

// Recorriendo con foreach
$fila = range(1, $n);
$t2 = hrtime(true);
$b = 0;
foreach ($fila as $cliente) {
    $b++;
}
$t3 = hrtime(true);

// Recorriendo con un índice
$fila = range(1, $n);
$t4 = hrtime(true);
$c = 0;
$total = count($fila);
while ($c < $total) {
    $cliente = $fila[$c];
    $c++;
}
$t5 = hrtime(true);

printf("array_shift: %d, %8.2f ms\n", $a, ($t1 - $t0) / 1e6);
printf("foreach:     %d, %8.2f ms\n", $b, ($t3 - $t2) / 1e6);
printf("índice:      %d, %8.2f ms\n", $c, ($t5 - $t4) / 1e6);
```

En mi computador, con 20.000: 219 ms contra 0,4 ms y 0,6 ms. Las tres versiones atienden a los mismos 20.000 clientes.

Este es el código que probamos en clases: [3v4l.org/nDQpJ](https://3v4l.org/nDQpJ#v8.5.10).

Y si de verdad necesitas **sacar** a la gente de la fila (porque llegan y se van mientras el programa corre), la estructura correcta es [`SplQueue`](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md#de-paso-splstack-y-splqueue): `dequeue()` saca el primero sin renumerar nada.

</details>

### Sospechoso 3: RUT repetidos

```php
<?php
declare(strict_types=1);

$n = 2_000;   // prueba con 1_000, 2_000 y 4_000

$ruts = array_map(fn($i) => 'rut-' . rand(1, 2 * $n), range(1, $n));

$t0 = hrtime(true);
$duplicados = [];
foreach ($ruts as $i => $a) {
    foreach ($ruts as $j => $b) {
        if ($i < $j && $a === $b) {
            $duplicados[$a] = true;
        }
    }
}
printf("%d RUT repetidos (%.2f ms)\n", count($duplicados), (hrtime(true) - $t0) / 1e6);
```

<details>
<summary><span>Ver la solución</span></summary>

Este ni siquiera esconde el ciclo: están los dos a la vista, y con `$n = 4_000` son 16 millones de comparaciones para encontrar un puñado de repetidos.

La idea: en vez de comparar todos contra todos, recorrer una sola vez anotando lo que ya viste. Si un RUT aparece cuando ya estaba anotado, es repetido.

```php
<?php
declare(strict_types=1);

$n = 2_000;

$ruts = array_map(fn($i) => 'rut-' . rand(1, 2 * $n), range(1, $n));

// Versión original
$t0 = hrtime(true);
$duplicados = [];
foreach ($ruts as $i => $a) {
    foreach ($ruts as $j => $b) {
        if ($i < $j && $a === $b) {
            $duplicados[$a] = true;
        }
    }
}
$t1 = hrtime(true);

// Versión optimizada: una sola pasada
$vistos = [];
$duplicados2 = [];
foreach ($ruts as $rut) {
    if (isset($vistos[$rut])) {
        $duplicados2[$rut] = true;
    }
    $vistos[$rut] = true;
}
$t2 = hrtime(true);

printf("original:   %d repetidos, %8.2f ms\n", count($duplicados),  ($t1 - $t0) / 1e6);
printf("optimizada: %d repetidos, %8.2f ms\n", count($duplicados2), ($t2 - $t1) / 1e6);

ksort($duplicados);
ksort($duplicados2);
printf("[%s] encuentran exactamente los mismos\n", $duplicados === $duplicados2 ? ' OK ' : 'FALLA');
```

Con 4.000 datos, en mi computador: 828 ms contra 0,3 ms. Y con 8.000 la original tarda más de tres segundos, mientras que la optimizada ni se entera.

(El `ksort` es porque las dos encuentran los mismos RUT pero no necesariamente en el mismo orden, y `===` en arrays compara también el orden.)

</details>

## Caso integrador: la ferretería

Un caso completo que junta todo lo de la unidad: elegir estructuras, diseñar, probar y optimizar. Vale la pena hacerlo entero, en ese orden, sin saltarse el pseudocódigo ni los casos de prueba.

### A. Elegir la estructura para cada necesidad

Una ferretería necesita resolver tres cosas:

1. **Despachos:** pedidos que se atienden **por orden de llegada**.
2. **Precios:** consultar el precio de un producto **por su código**.
3. **Deshacer:** el botón «deshacer» del carrito de venta, que anula **lo último** que se agregó.

Para cada una, responde: ¿qué estructura usarías?, ¿por qué (pensando en cómo se accede, se inserta y se elimina)?, y ¿qué pasaría si eligieras una estructura inadecuada?

<details>
<summary><span>Ver la respuesta</span></summary>

1. **Despachos: una cola.** Primero en llegar, primero en salir. Con una lista y `array_shift` funciona, pero cada despacho renumera la lista completa; con `SplQueue` no. Si usaras una pila, el último pedido se atendería primero y el primero podría no atenderse nunca.
2. **Precios: un diccionario**, `código => precio`. La consulta es por clave, y con `isset` cuesta lo mismo con 20 productos que con 20.000. Con una lista habría que recorrerla entera en cada consulta: el cuello de botella de esta página.
3. **Deshacer: una pila.** Lo último que entró es lo primero que sale, que es exactamente lo que significa «deshacer». `array_push` y `array_pop`, ambos baratos. Con una cola deshacerías el primer producto del carrito en vez del último.

</details>

### B. Monto vendido por categoría

- **Entrada:** un catálogo (`código => nombre, categoría, precio`) y una lista de ventas (`código`, `cantidad`).
- **Salida:** un diccionario `categoría => monto`.
- **Regla:** una venta con un código que no está en el catálogo se ignora.

Los datos:

```php
<?php
declare(strict_types=1);

$catalogo = [
    'MAR-01' => ['nombre' => 'Martillo',       'categoria' => 'herramientas', 'precio' => 8990],
    'TOR-10' => ['nombre' => 'Tornillo 1"',    'categoria' => 'fijaciones',   'precio' => 50],
    'LLA-22' => ['nombre' => 'Llave inglesa',  'categoria' => 'herramientas', 'precio' => 12490],
    'CLA-05' => ['nombre' => 'Clavo 2"',       'categoria' => 'fijaciones',   'precio' => 20],
    'PIN-03' => ['nombre' => 'Pintura blanca', 'categoria' => 'pinturas',     'precio' => 15990],
];

$ventas = [
    ['codigo' => 'MAR-01', 'cantidad' => 2],
    ['codigo' => 'TOR-10', 'cantidad' => 100],
    ['codigo' => 'MAR-01', 'cantidad' => 1],
    ['codigo' => 'XXX-99', 'cantidad' => 4],   // no existe en el catálogo
    ['codigo' => 'CLA-05', 'cantidad' => 250],
];

print_r($catalogo['MAR-01']);
```

Antes del código: el [pseudocódigo](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/disenar-algoritmos.md#el-pseudocodigo-no-es-un-tramite). Después, la [tabla de cinco casos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md#los-cinco-casos-que-siempre-hay-que-pensar) —vacío, uno solo, repetidos, límite e inválido— y el verificador.

<details>
<summary><span>Ver la solución</span></summary>

El pseudocódigo, primero:

```plaintext
totales <- diccionario vacío
para cada venta en ventas
    si el código de la venta NO está en el catálogo
        seguir con la siguiente
    producto  <- catalogo[código]
    categoría <- categoría del producto
    totales[categoría] <- totales[categoría] + precio * cantidad
devolver totales
```

Y el código, con los casos de prueba:

```php
<?php
declare(strict_types=1);

function montoPorCategoria(array $catalogo, array $ventas): array
{
    $totales = [];
    foreach ($ventas as $v) {
        if (!isset($catalogo[$v['codigo']])) {
            continue;                                  // código inválido: se ignora
        }
        $producto = $catalogo[$v['codigo']];
        $categoria = $producto['categoria'];
        $totales[$categoria] = ($totales[$categoria] ?? 0)
            + $producto['precio'] * $v['cantidad'];
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

$catalogo = [
    'MAR-01' => ['nombre' => 'Martillo',       'categoria' => 'herramientas', 'precio' => 8990],
    'TOR-10' => ['nombre' => 'Tornillo 1"',    'categoria' => 'fijaciones',   'precio' => 50],
    'LLA-22' => ['nombre' => 'Llave inglesa',  'categoria' => 'herramientas', 'precio' => 12490],
    'CLA-05' => ['nombre' => 'Clavo 2"',       'categoria' => 'fijaciones',   'precio' => 20],
    'PIN-03' => ['nombre' => 'Pintura blanca', 'categoria' => 'pinturas',     'precio' => 15990],
];

// 1. Vacío
verificar('sin ventas, diccionario vacío',
    [], montoPorCategoria($catalogo, []));

// 2. Uno solo
verificar('una venta: precio por cantidad',
    ['herramientas' => 17980],
    montoPorCategoria($catalogo, [['codigo' => 'MAR-01', 'cantidad' => 2]]));

// 3. Repetidos: dos ventas del mismo producto se suman
verificar('dos ventas del mismo producto se suman',
    ['herramientas' => 26970],
    montoPorCategoria($catalogo, [
        ['codigo' => 'MAR-01', 'cantidad' => 2],
        ['codigo' => 'MAR-01', 'cantidad' => 1],
    ]));

// 4. Límite: cantidad cero
verificar('cantidad cero deja la categoría en 0',
    ['fijaciones' => 0],
    montoPorCategoria($catalogo, [['codigo' => 'TOR-10', 'cantidad' => 0]]));

// 5. Inválido: código que no está en el catálogo
verificar('un código inexistente se ignora',
    ['herramientas' => 8990],
    montoPorCategoria($catalogo, [
        ['codigo' => 'MAR-01', 'cantidad' => 1],
        ['codigo' => 'XXX-99', 'cantidad' => 4],
    ]));

// Y el caso completo
print_r(montoPorCategoria($catalogo, [
    ['codigo' => 'MAR-01', 'cantidad' => 2],
    ['codigo' => 'TOR-10', 'cantidad' => 100],
    ['codigo' => 'MAR-01', 'cantidad' => 1],
    ['codigo' => 'XXX-99', 'cantidad' => 4],
    ['codigo' => 'CLA-05', 'cantidad' => 250],
]));
```

Fíjate en el caso 4: una venta con cantidad 0 **sí** crea la categoría, con monto 0. Eso hay que decidirlo antes de programar, no después: si prefieres que no aparezca, el algoritmo cambia, y el caso de prueba también.

Como el catálogo ya es un diccionario por código, `isset` resuelve la búsqueda sin recorrer nada. El algoritmo completo es lineal: una vuelta por venta.

</details>

### C. Funciona, pero es lento

Esta función entrega los productos que no se vendieron ni una vez. Mídela, encuentra el cuello de botella, optimízala y demuestra que la versión nueva da exactamente lo mismo.

```php
<?php
declare(strict_types=1);

// Productos que no se vendieron ni una vez
function sinVentas(array $catalogo, array $ventas): array
{
    $resultado = [];
    foreach ($catalogo as $codigo => $producto) {
        $vendido = false;
        foreach ($ventas as $v) {
            if ($v['codigo'] === $codigo) {
                $vendido = true;
            }
        }
        if (!$vendido) {
            $resultado[] = $codigo;
        }
    }
    return $resultado;
}

$catalogo = [
    'MAR-01' => ['nombre' => 'Martillo',       'categoria' => 'herramientas', 'precio' => 8990],
    'TOR-10' => ['nombre' => 'Tornillo 1"',    'categoria' => 'fijaciones',   'precio' => 50],
    'LLA-22' => ['nombre' => 'Llave inglesa',  'categoria' => 'herramientas', 'precio' => 12490],
    'CLA-05' => ['nombre' => 'Clavo 2"',       'categoria' => 'fijaciones',   'precio' => 20],
    'PIN-03' => ['nombre' => 'Pintura blanca', 'categoria' => 'pinturas',     'precio' => 15990],
];

$ventas = [
    ['codigo' => 'MAR-01', 'cantidad' => 2],
    ['codigo' => 'TOR-10', 'cantidad' => 100],
    ['codigo' => 'CLA-05', 'cantidad' => 250],
];

print_r(sinVentas($catalogo, $ventas));
```

Con cinco productos y tres ventas no se nota nada. Genera un catálogo de 2.000 productos y 2.000 ventas y mídelo.

<details>
<summary><span>Ver la solución</span></summary>

Hay dos problemas, y el segundo es más sutil que el primero:

1. Por cada producto se recorren **todas** las ventas: ciclo dentro de ciclo.
2. El ciclo de adentro **no se detiene** cuando encuentra la venta. Sigue hasta el final aunque ya sepa la respuesta.

Un `break` arregla el segundo y ayuda bastante, pero no cambia el fondo: en el peor caso —un producto que no se vendió— hay que recorrer las ventas completas igual. La solución de verdad es la de siempre: armar **una sola vez** un índice de los códigos vendidos.

```php
<?php
declare(strict_types=1);

function sinVentas(array $catalogo, array $ventas): array
{
    $resultado = [];
    foreach ($catalogo as $codigo => $producto) {
        $vendido = false;
        foreach ($ventas as $v) {
            if ($v['codigo'] === $codigo) {
                $vendido = true;
            }
        }
        if (!$vendido) {
            $resultado[] = $codigo;
        }
    }
    return $resultado;
}

function sinVentasRapida(array $catalogo, array $ventas): array
{
    $vendidos = array_flip(array_column($ventas, 'codigo'));   // una sola vez
    $resultado = [];
    foreach ($catalogo as $codigo => $producto) {
        if (!isset($vendidos[$codigo])) {
            $resultado[] = $codigo;
        }
    }
    return $resultado;
}

function verificar(string $caso, mixed $esperado, mixed $obtenido): void
{
    printf("[%s] %s\n", $esperado === $obtenido ? ' OK ' : 'FALLA', $caso);
}

function generarFerreteria(int $n): array
{
    $catalogo = $ventas = [];
    for ($i = 1; $i <= $n; $i++) {
        $catalogo["COD-{$i}"] = [
            'nombre' => "Producto {$i}",
            'categoria' => 'categoria-' . ($i % 5),
            'precio' => rand(100, 20000),
        ];
        $ventas[] = ['codigo' => 'COD-' . rand(1, $n), 'cantidad' => rand(1, 10)];
    }
    return [$catalogo, $ventas];
}

[$cat, $ven] = generarFerreteria(500);
verificar('las dos versiones encuentran los mismos productos',
    sinVentas($cat, $ven), sinVentasRapida($cat, $ven));

foreach ([1000, 2000, 4000] as $n) {
    [$cat, $ven] = generarFerreteria($n);
    $t0 = hrtime(true); $a = sinVentas($cat, $ven);
    $t1 = hrtime(true); $b = sinVentasRapida($cat, $ven);
    $t2 = hrtime(true);
    printf("n=%5d  original: %8.2f ms   optimizada: %6.2f ms   (%d sin ventas)\n",
        $n, ($t1 - $t0) / 1e6, ($t2 - $t1) / 1e6, count($a));
}
```

Las dos versiones devuelven los códigos en el orden del catálogo, así que `===` sirve para compararlas directamente.

</details>

### Para responder en voz alta

Cuatro preguntas que deberías poder contestar sobre cualquier solución tuya, sin leer el código:

1. ¿Por qué la estructura que elegiste es la más adecuada?
2. ¿Cómo comprobaste que el algoritmo funciona correctamente?
3. ¿Qué cambio tuvo el mayor impacto en la eficiencia?
4. ¿Cómo cambiaría tu solución si aumentara mucho el volumen de datos?

Si las cuatro tienen respuesta, la unidad está entendida.

---

Sigue con **[Clases y objetos](/ramos/programacion-avanzada/unidades/02-poo-avanzada/clases-y-objetos.md)**, en la unidad 2.
