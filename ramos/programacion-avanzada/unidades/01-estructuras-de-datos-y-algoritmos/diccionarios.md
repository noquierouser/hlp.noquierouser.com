---
title: Diccionarios
description: Cuando la clave es el dato
eleventyNavigation:
    order: 80
tags:
    - php
    - estructuras-de-datos
---
En [Arrays](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md) vimos que un array de PHP puede funcionar como diccionario, y en [Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md) quedó como la tercera estructura: la que sirve para **buscar por identificador**. Ahora toca mirarlo con calma, porque tiene sus mañas.

## La clave es el dato

En una lista, la posición es un número sin significado: que un producto esté en la posición 2 no dice nada del producto. En un diccionario, **la clave es parte del problema**: el SKU de un producto, el RUT de una persona, la fecha de una venta.

```php
<?php
declare(strict_types=1);

$stock = [
    'A-100' => 12,
    'B-205' => 0,
    'C-330' => 7,
];

// Acceso directo por clave: no recorre nada
echo $stock['B-205'], PHP_EOL;  // 0

foreach ($stock as $sku => $cantidad) {
    printf("%-6s %d\n", $sku, $cantidad);
}
```

[`printf`](https://www.php.net/manual/es/function.printf.php) muestra texto con formato. Se le pasa una plantilla y los valores que van en ella:

- `%s` es un texto; `%-6s` es un texto alineado a la izquierda en un espacio de 6 caracteres. Sirve para armar columnas.
- `%d` es un número entero.
- `%.2f` (no está en el ejemplo) es un decimal con 2 cifras.

## El orden es el de llegada

Un array de PHP **conserva el orden en que se insertaron las claves**. No se ordena solo, ni alfabética ni numéricamente:

```php
<?php
declare(strict_types=1);

$stock = [];
$stock['C-330'] = 7;
$stock['A-100'] = 12;
$stock['B-205'] = 0;

print_r($stock);  // C, A, B: el orden en que llegaron

ksort($stock);    // ahora sí, ordenado por clave
print_r($stock);
```

Si necesitas el diccionario ordenado por clave, está [`ksort`](https://www.php.net/manual/es/function.ksort.php). Fíjate que, igual que `sort`, lo ordena [en su lugar](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md).

## Tres trampas que hay que ver ejecutadas

### 1. `isset` miente con `null`

[`isset`](https://www.php.net/manual/es/function.isset.php) no pregunta "¿existe la clave?", sino "¿existe y **no es `null`**?". Si el valor guardado es `null`, dice que no está:

```php
<?php
$config = ['debug' => null];

var_dump(isset($config['debug']));              // false (!)
var_dump(array_key_exists('debug', $config));   // true
```

- Si solo te importa que haya un valor útil, `isset` sirve y es cómodo.
- Si necesitas saber si la clave está, aunque su valor sea `null`, usa [`array_key_exists`](https://www.php.net/manual/es/function.array-key-exists.php).

### 2. Leer una clave que no existe

Ya lo vimos en [Arrays](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md#claves-que-no-existen): un *warning*, un `null`, y el programa sigue. Con `??` se resuelve dando un valor por defecto:

```php
<?php
$config = ['debug' => null];

echo $config['idioma'], PHP_EOL;          // Warning + null
echo $config['idioma'] ?? 'es', PHP_EOL;  // es
```

### 3. PHP normaliza las claves

Las claves solo pueden ser números enteros o textos, así que PHP [convierte](https://www.php.net/manual/es/language.types.array.php#language.types.array.syntax) lo demás. El texto `'1'` se convierte en el número `1`, y `true` también. Resultado: estas tres asignaciones usan **la misma clave** y se pisan entre sí:

```php
<?php
$r = [];
$r['1'] = 'a';
$r[1] = 'b';
$r[true] = 'c';

var_dump(count($r));  // 1
var_dump($r);         // una sola clave, 1, con el último valor
```

Esto importa cuando las claves vienen de datos: un código `'1'` leído de un archivo y un `1` calculado van a caer en el mismo casillero.

## Dos formas de preguntar si algo existe

```php
<?php
declare(strict_types=1);

$stock = ['A-100' => 12, 'B-205' => 0, 'C-330' => 7];

// Recorriendo: revisa las claves una por una
var_dump(in_array('C-330', array_keys($stock), true));

// Preguntando por la clave: va directo
var_dump(isset($stock['C-330']));
```

Las dos dicen `true`, pero no hacen lo mismo:

- [`array_keys`](https://www.php.net/manual/es/function.array-keys.php) arma una lista con las claves.
- [`in_array`](https://www.php.net/manual/es/function.in-array.php) la recorre elemento por elemento hasta encontrarlo. El `true` del final le pide comparar con `===`.
- `isset` va directo a la clave, tenga el diccionario 3 elementos o 3 millones.

Cuánto cuesta cada una lo medimos en [Eficiencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/eficiencia.md). Adelanto: la diferencia crece con la cantidad de datos.

## Diccionarios dentro de diccionarios

El valor de una clave puede ser otro array. Así se arma algo parecido a una pequeña base de datos, donde cada usuario se busca por su nombre de usuario:

```php
<?php
// Usuario
// nombre_usuario
// - nombres
// - apellidos
// - rut
// - fecha_nacimiento
// - domicilio

$base_usuarios = [
    "jcbodoque" => [
        "nombres" => "Juan Carlos",
        "apellidos" => "Bodoque Bodoque",
        "rut" => "15.432.876-9",
        "fecha_nacimiento" => 19900412,
        "domicilio" => "Av. Siempreviva 742",
    ],
    "chernobog" => [
        "nombres" => "Andrés",
        "apellidos" => "Palma Cerna",
        "rut" => "20.111.222-2",
        "fecha_nacimiento" => 20100315,
        "domicilio" => "Las Comadres 33-B",
    ],
    "sussynot32" => [
        "nombres" => "Susana Nicole",
        "apellidos" => "Jiménez Caro",
        "rut" => "9.876.543-3",
        "fecha_nacimiento" => 19670527,
        "domicilio" => "Tricolor de Paine 1880",
    ],
];

$busqueda = "jcbodoque";
//$busqueda = "estequiometrico";

echo array_key_exists($busqueda, $base_usuarios)
    ? "El usuario {$busqueda} se llama {$base_usuarios[$busqueda]['nombres']}."
    : "El usuario {$busqueda} no lo conoce ni Santa Isabel.";
```

Hay dos cosas nuevas aquí:

- **Acceso en dos niveles.** `$base_usuarios[$busqueda]['nombres']` primero entra al usuario y después a su campo `nombres`. Dentro de un string con interpolación también funciona, siempre que vaya entre llaves.
- **El operador ternario** `condición ? valor_si : valor_no`. Es un `if`/`else` que devuelve un valor, ideal cuando solo hay que elegir entre dos cosas. Más en el [manual](https://www.php.net/manual/es/language.operators.comparison.php#language.operators.comparison.ternary). Si se empieza a complicar, mejor vuelve al `if`.

Prueba a descomentar la otra `$busqueda`.

## Para practicar

Partiendo de la base de usuarios:

1. Agrega un usuario nuevo y muestra todos los usuarios en una tabla con `printf`: nombre de usuario, nombres y apellidos en columnas.
2. Busca a un usuario **por su RUT**. Como el RUT no es la clave, vas a tener que recorrer. ¿Cuántas vueltas das en el peor caso?
3. Ahora arma un segundo diccionario, `rut => nombre_usuario`, y úsalo para buscar por RUT sin recorrer. ¿Qué ganaste y qué tuviste que pagar a cambio?

```php
<?php
declare(strict_types=1);

$base_usuarios = [
    "jcbodoque" => ["nombres" => "Juan Carlos", "apellidos" => "Bodoque Bodoque", "rut" => "15.432.876-9"],
    "chernobog" => ["nombres" => "Andrés", "apellidos" => "Palma Cerna", "rut" => "20.111.222-2"],
    "sussynot32" => ["nombres" => "Susana Nicole", "apellidos" => "Jiménez Caro", "rut" => "9.876.543-3"],
];

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

---

Sigue con **[Diseñar algoritmos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/disenar-algoritmos.md)**.
