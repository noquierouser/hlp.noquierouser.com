---
title: Eficiencia
description: ¿Cuánto cuesta? Medir antes de opinar
eleventyNavigation:
    order: 110
tags:
    - php
    - algoritmos
    - eficiencia
---
Varias veces quedó dando vueltas la misma idea: `array_pop` y `array_shift` se ven parecidas pero [no cuestan lo mismo](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md#parecidas-pero-no-cuestan-lo-mismo), y buscar en una lista no es lo mismo que [preguntar por una clave](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md#dos-formas-de-preguntar-si-algo-existe). Llegó el momento de dejar de creerlo y **medirlo**.

## Cómo se mide

[`hrtime(true)`](https://www.php.net/manual/es/function.hrtime.php) entrega la hora del reloj de alta resolución, en nanosegundos. Se toma antes y después de lo que quieres medir, y se resta:

```php
<?php
$inicio = hrtime(true);   // nanosegundos

$suma = 0;
for ($i = 0; $i < 1_000_000; $i++) {
    $suma += $i;
}

$fin = hrtime(true);

printf("%.3f ms\n", ($fin - $inicio) / 1_000_000);
```

- Un milisegundo son 1.000.000 de nanosegundos; de ahí la división.
- Los `_` en `1_000_000` son solo para leer mejor el número: PHP [los ignora](https://www.php.net/manual/es/language.types.integer.php#language.types.integer.syntax).

{% alert 'Aquí en la página, PHP corre dentro del navegador, y por seguridad los navegadores entregan la hora con precisión de milisegundos. Algo que tarda 0,02 ms va a marcar 0. Por eso los ejemplos de abajo repiten la operación muchas veces. En 3v4l o en tu computador, la medición es más fina.', 'info', 'Ojo con el reloj' %}

## Demo A: buscar en una lista o en un diccionario

Buscamos el número 20.000 (el último, o sea, el peor caso) de dos formas:

- en una **lista**, con [`in_array`](https://www.php.net/manual/es/function.in-array.php), que revisa elemento por elemento;
- en un **diccionario**, con `isset`, que va directo a la clave.

[`array_flip`](https://www.php.net/manual/es/function.array-flip.php) intercambia claves y valores: convierte la lista `[1, 2, 3...]` en un diccionario `[1 => 0, 2 => 1, 3 => 2...]` donde los números son las claves.

```php
<?php
declare(strict_types=1);

$n = 20_000;              // prueba con 40_000 y 80_000
$repeticiones = 1_000;

$lista = range(1, $n);
$mapa = array_flip($lista);
$objetivo = $n;           // el último: el peor caso

$t0 = hrtime(true);
for ($i = 0; $i < $repeticiones; $i++) {
    in_array($objetivo, $lista, true);
}
$t1 = hrtime(true);
for ($i = 0; $i < $repeticiones; $i++) {
    isset($mapa[$objetivo]);
}
$t2 = hrtime(true);

printf("Con %d elementos, %d búsquedas:\n", $n, $repeticiones);
printf("  lista (in_array):   %8.2f ms\n", ($t1 - $t0) / 1_000_000);
printf("  diccionario (isset): %7.2f ms\n", ($t2 - $t1) / 1_000_000);
```

Ejecútalo con 20.000, 40.000 y 80.000 elementos, y anota los tiempos. Vas a ver que:

- **La lista duplica su tiempo cada vez que duplicas los datos.** Tiene que revisar el doble.
- **El diccionario no se mueve.** Siempre va directo a la clave, sin importar cuántas haya.

Eso es **evaluación empírica**: no opinar sobre cuál es más rápida, sino medir.

## Demo B: `array_pop` contra `array_shift`

La deuda pendiente de [Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md): vaciamos un array de 20.000 elementos sacando del final y sacando del inicio.

```php
<?php
declare(strict_types=1);

$n = 20_000;  // prueba con 40_000

$a = range(1, $n);
$t0 = hrtime(true);
while ($a) { array_pop($a); }     // saca del final
$t1 = hrtime(true);

$b = range(1, $n);
$t2 = hrtime(true);
while ($b) { array_shift($b); }   // saca del inicio
$t3 = hrtime(true);

printf("Vaciando %d elementos:\n", $n);
printf("  array_pop:   %8.1f ms\n", ($t1 - $t0) / 1_000_000);
printf("  array_shift: %8.1f ms\n", ($t3 - $t2) / 1_000_000);
```

(`while ($a)` sigue mientras el array no esté vacío: un array vacío cuenta como `false`.)

- `array_pop` saca el último y no toca nada más.
- `array_shift` saca el primero y **renumera todo el array**, cada vez.

Y fíjate en lo que pasa al duplicar los datos: `array_pop` tarda el doble, pero `array_shift` tarda **cuatro veces más**. Con el doble de elementos hay el doble de vueltas, y en cada vuelta hay el doble de elementos que renumerar.

La conexión con lo anterior: la [fila de atención](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md#fila-de-atencion) hecha con `array_shift` paga ese costo cada vez que atiende a un cliente. Con una fila corta da lo mismo; con una de cien mil, no. Para eso existen estructuras como [`SplQueue`](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md#de-paso-splstack-y-splqueue).

## Los números no van a dar iguales dos veces

Ejecuta cualquiera de las demos varias veces: los tiempos cambian. En 3v4l el servidor es compartido con otra gente; en tu computador hay otros programas corriendo; aquí, el navegador. Eso no invalida la medición, pero obliga a dos reglas.

**1. Mira el orden de magnitud.** Compara escalas, no decimales. ¿Es el doble? ¿Es cien veces más? Esa es la información útil. Que un día dé 3,2 ms y otro 3,5 ms no importa.

**2. Cuenta operaciones.** Un contador dentro del ciclo es **determinista**: da lo mismo el servidor, la hora o la versión de PHP. Es la métrica que se puede defender.

```php
<?php
declare(strict_types=1);

$n = 20_000;
$lista = range(1, $n);
$mapa = array_flip($lista);
$objetivo = $n;

// Buscar en la lista, contando cada comparación
$ops = 0;
foreach ($lista as $item) {
    $ops++;
    if ($item === $objetivo) {
        break;
    }
}
echo "Lista: {$ops} operaciones", PHP_EOL;

// Buscar en el diccionario: una sola consulta
$ops = 1;
$existe = isset($mapa[$objetivo]);
echo "Diccionario: {$ops} operación", PHP_EOL;
```

20.000 operaciones contra 1, siempre, en cualquier máquina.

## Cómo crece

Lo que realmente importa no es cuánto tarda con estos datos, sino **cómo crece el costo cuando crecen los datos**:

| Si duplicas los datos... | Ejemplo | Se dice que crece |
|---|---|---|
| el costo no cambia | `isset` en un diccionario, sacar un elemento con `array_pop` | constante |
| el costo se duplica | `in_array` en una lista, un `foreach`, vaciar con `array_pop` | lineal |
| el costo se cuadruplica | vaciar con `array_shift`, un ciclo dentro de otro | cuadrático |

Un algoritmo cuadrático puede ir perfecto con 100 datos y ser inusable con 100.000. Si más adelante te encuentras con la notación O(1), O(n) y O(n²), es exactamente esto, con nombre formal.

## Para practicar

1. Ejecuta la demo A con 20.000, 40.000 y 80.000 elementos. Anota los tiempos en una tabla y confirma que la lista se duplica y el diccionario no.
2. Toma tu solución de uno de los problemas de [Diseñar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/disenar-algoritmos.md#para-practicar). Genera datos de prueba grandes (1.000, 10.000 y 100.000 elementos) y mide cuánto tarda. ¿Cómo crece?
3. Agrégale un contador de operaciones. ¿Cuántas hace con cada tamaño?

Para generar muchos datos de prueba, puedes partir de aquí:

```php
<?php
declare(strict_types=1);

$n = 10_000;
$ventas = [];
for ($i = 0; $i < $n; $i++) {
    $ventas[] = [
        'fecha' => '2026-09-' . str_pad((string) rand(1, 30), 2, '0', STR_PAD_LEFT),
        'monto' => rand(100, 5000),
    ];
}

echo count($ventas), " ventas generadas. La primera:", PHP_EOL;
print_r($ventas[0]);

// Mide aquí tu algoritmo

```

[`rand`](https://www.php.net/manual/es/function.rand.php) entrega un número al azar entre dos límites, y [`str_pad`](https://www.php.net/manual/es/function.str-pad.php) rellena el día con un cero a la izquierda (`7` pasa a `07`).

Encontrar dónde se va el tiempo (el *cuello de botella*) y mejorarlo, comparando la versión original con la optimizada, es el siguiente paso.

---

Sigue con **[Clases y objetos](/ramos/programacion-avanzada/unidades/02-poo-avanzada/clases-y-objetos.md)**, en la unidad 2.
