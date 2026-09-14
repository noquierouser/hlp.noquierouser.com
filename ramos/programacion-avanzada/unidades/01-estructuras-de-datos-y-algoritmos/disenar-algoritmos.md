---
title: Diseñar algoritmos
description: Del problema al código, pasando por el papel
eleventyNavigation:
    order: 90
tags:
    - php
    - algoritmos
---
Un algoritmo tiene tres partes, no una:

1. **Diseño.** Entrada, proceso y salida, en papel y antes del código.
2. **Implementación.** La traducción a PHP. Suele ser la parte más corta de las tres.
3. **Validación.** Casos de prueba. Sin esto, no está terminado.

Este tema es sobre las dos primeras. La tercera tiene su propio tema: [Probar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md).

## Antes de escribir código: tres preguntas

- **Entrada:** ¿qué datos recibo, y en qué forma vienen?
- **Proceso:** ¿qué transformación tengo que hacer, paso a paso?
- **Salida:** ¿qué debo devolver exactamente, y en qué estructura?

Si no puedes responder las tres, todavía no es momento de abrir el editor.

## El pseudocódigo no es un trámite

El pseudocódigo es **el lugar barato para equivocarse**. Corregir una decisión en papel cuesta un borrón; corregirla después de escribir cien líneas cuesta media hora.

No tiene una sintaxis oficial. Lo importante es que se entienda paso a paso y que no dependa de ningún lenguaje: nada de `$`, llaves ni nombres de funciones de PHP.

## Caso guiado: total vendido por día

> Una tienda registra cada venta con su fecha y su monto. Se necesita el total vendido por día.

Primero, las tres preguntas:

- **Entrada:** una lista de ventas; cada venta tiene una `fecha` y un `monto`.
- **Proceso:** recorrer las ventas e ir sumando los montos de cada fecha.
- **Salida:** un diccionario `fecha => total`.

La salida ya nos dice la estructura: vamos a **buscar por fecha**, así que es un [diccionario](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md).

Ahora, el pseudocódigo:

```plaintext
FUNCIÓN totalPorDia(ventas)
    totales ← diccionario vacío
    PARA CADA venta EN ventas
        fecha ← venta.fecha
        SI fecha NO existe EN totales
            totales[fecha] ← 0
        FIN SI
        totales[fecha] ← totales[fecha] + venta.monto
    FIN PARA
    DEVOLVER totales
FIN FUNCIÓN
```

Y recién ahora, la traducción a PHP:

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

$ventas = [
    ['fecha' => '2026-09-08', 'monto' => 1000],
    ['fecha' => '2026-09-08', 'monto' => 500],
    ['fecha' => '2026-09-09', 'monto' => 2500],
    ['fecha' => '2026-09-08', 'monto' => 300],
];

print_r(totalPorDia($ventas));
```

Fíjate en `($totales[$f] ?? 0) + $v['monto']`: reemplaza todo el bloque "SI fecha NO existe EN totales ENTONCES 0" del pseudocódigo. La lógica es la misma; la escritura, más corta. Eso pasa seguido: el pseudocódigo es más largo que el código, y está bien que así sea.

## Recorrer y acumular

El total por día sigue una forma que vas a encontrar en todas partes:

1. Partir con un diccionario vacío.
2. Recorrer una lista.
3. Por cada elemento, calcular su clave y acumular algo en esa clave.

Contar palabras, sumar ventas por vendedor, agrupar alumnos por curso: todos son el mismo algoritmo con otra ropa. Cuando reconoces la forma, la mitad del diseño ya está hecha.

## Para practicar

Para cada problema, **primero escribe el pseudocódigo en papel**. Recién cuando esté escrito, pasa al código.

**1. Control de stock.** Hay una lista de movimientos, cada uno con un SKU y una cantidad. La cantidad puede ser negativa: es una venta o una salida de bodega.

- Salida: `sku => cantidad final`

```php
<?php
declare(strict_types=1);

$movimientos = [
    ['sku' => 'A-100', 'cantidad' => 10],
    ['sku' => 'B-205', 'cantidad' => 5],
    ['sku' => 'A-100', 'cantidad' => -3],
    ['sku' => 'C-330', 'cantidad' => 7],
    ['sku' => 'B-205', 'cantidad' => -5],
];

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

**2. Registro de asistencia.** Hay una lista de marcas, cada una con un alumno y un estado (`presente` o `ausente`).

- Salida: `alumno => [presentes, ausentes]`

```php
<?php
declare(strict_types=1);

$marcas = [
    ['alumno' => 'Ana', 'estado' => 'presente'],
    ['alumno' => 'Luis', 'estado' => 'ausente'],
    ['alumno' => 'Ana', 'estado' => 'presente'],
    ['alumno' => 'Luis', 'estado' => 'presente'],
    ['alumno' => 'Marta', 'estado' => 'ausente'],
];

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

**3. Promedio de notas.** Hay una lista de notas, cada una con su estudiante. Se aprueba desde 4,0.

- Salida: `alumno => [promedio, aprobado]`

```php
<?php
declare(strict_types=1);

$notas = [
    ['alumno' => 'Ana', 'nota' => 6.5],
    ['alumno' => 'Luis', 'nota' => 3.2],
    ['alumno' => 'Ana', 'nota' => 5.0],
    ['alumno' => 'Luis', 'nota' => 4.4],
    ['alumno' => 'Marta', 'nota' => 4.0],
];

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

¿Notaste que los tres tienen la misma forma? Recorrer una lista y acumular en un diccionario. El tercero tiene una vuelta más: primero hay que acumular, y después calcular el promedio de lo acumulado.

Cuando termines, pregúntate:

- ¿Qué decisiones fueron clave en el diseño?
- ¿Qué dificultades aparecieron al pasar del pseudocódigo al código?
- ¿Cómo sabes que el algoritmo resuelve correctamente el problema? Si la respuesta es "lo ejecuté y dio bien", sigue leyendo.

---

Sigue con **[Probar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/probar-algoritmos.md)**.
