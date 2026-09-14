---
title: Parámetros por referencia
description: Cuando una función necesita cambiar algo que no es suyo
eleventyNavigation:
    order: 70
tags:
    - php
---
En [Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md) quedó una pregunta pendiente: si quiero una función `visitar()` que agregue un sitio al historial, ¿cómo hago para que cambie el historial de afuera? En Python eso funciona solo. En PHP, no.

## El problema: las funciones reciben copias

En PHP, cuando le pasas un array a una función, la función recibe **una copia**. Puede hacer lo que quiera con ella, pero el array original no se entera:

```php
<?php
declare(strict_types=1);

function visitar(array $historial, string $sitio): void {
    $historial[] = $sitio;
    echo "Dentro de la función hay ", count($historial), " sitios", PHP_EOL;
}

$historial = ["google.com"];
visitar($historial, "reddit.com");

echo "Afuera sigue habiendo ", count($historial), " sitio", PHP_EOL;
```

Si vienes de Python, esto es una trampa de las buenas, porque allá las listas se comportan distinto:

```python
def visitar(historial, sitio):
    historial.append(sitio)

historial = ["google.com"]
visitar(historial, "reddit.com")
print(len(historial))  # 2: en Python la lista original sí cambió
```

En Python la función recibe la **misma** lista; en PHP recibe una copia del array. Esto se llama *paso por valor*, y es lo que PHP hace por defecto con todo: números, textos y arrays.

## La solución: `&`

Si pones un `&` antes del nombre del parámetro, la función deja de recibir una copia y trabaja **directamente sobre la variable que le pasaste**. Es el [paso por referencia](https://www.php.net/manual/es/language.references.pass.php):

```php
<?php
declare(strict_types=1);

function visitar(array &$historial, string $sitio): void {
    $historial[] = $sitio;
}

$historial = ["google.com"];
visitar($historial, "reddit.com");

print_r($historial);  // ahora sí: 2 sitios
```

Un solo carácter de diferencia. Con esto, el historial de navegación queda así:

```php
<?php
declare(strict_types=1);

$historial_navegacion = [];

function visitar_sitio(string $sitio_web, array &$historial): void {
    array_push($historial, $sitio_web);
}

function volver_historial(array &$historial): void {
    array_pop($historial);
}

// Solo lee el historial, no lo cambia: no necesita &
function mostrar_historial(array $historial): void {
    echo "Historial de visita:", PHP_EOL;
    foreach ($historial as $sitio_visitado) {
        echo "➔ {$sitio_visitado}", PHP_EOL;
    }
    echo PHP_EOL;
}

visitar_sitio("google.com", $historial_navegacion);
visitar_sitio("mail.google.com", $historial_navegacion);
visitar_sitio("reddit.com", $historial_navegacion);
mostrar_historial($historial_navegacion);

volver_historial($historial_navegacion);
mostrar_historial($historial_navegacion);

volver_historial($historial_navegacion);
mostrar_historial($historial_navegacion);
```

Compáralo con la versión de [Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md) que repetía el `foreach` tres veces. Fíjate también en `mostrar_historial`: solo **lee**, así que no lleva `&`. Ponérselo no rompe nada, pero confunde: quien lea la firma va a pensar que la función modifica el historial.

## Qué es una referencia

Una [referencia](https://www.php.net/manual/es/language.references.whatare.php) es **otro nombre para la misma variable**. No es una copia ni un puntero a la memoria como en C: son dos nombres que apuntan al mismo contenido.

```php
<?php
$a = 1;
$b = &$a;  // $b es otro nombre para $a

$b = 5;
echo $a, PHP_EOL;  // 5: cambiaste $b, y $a es la misma variable
```

Con un parámetro pasa exactamente eso: mientras la función se ejecuta, `$historial` (adentro) y `$historial_navegacion` (afuera) son dos nombres para la misma variable.

```php
<?php
declare(strict_types=1);

function sumarUno(int &$n): void {
    $n++;
}

function sumarUnoCopia(int $n): void {
    $n++;
}

$contador = 10;

sumarUno($contador);
echo $contador, PHP_EOL;  // 11

sumarUnoCopia($contador);
echo $contador, PHP_EOL;  // sigue en 11: la función cambió su copia
```

## Ya las estabas usando

¿Nunca te preguntaste cómo hace `array_pop($pila)` para cambiar `$pila`? Mira su firma en el manual de [`array_pop`](https://www.php.net/manual/es/function.array-pop.php):

```
array_pop(array &$array): mixed
```

Ahí está el `&`. Lo mismo pasa con `array_push`, `array_shift` y [`sort`](https://www.php.net/manual/es/function.sort.php), que ordena el array que le pasas en lugar de devolver uno nuevo:

```php
<?php
$numeros = [3, 1, 2];
sort($numeros);      // no devuelve el array ordenado: lo ordena en su lugar
print_r($numeros);
```

Cuando en el manual veas un `&` en un parámetro, ya sabes: esa función va a modificar la variable que le pases.

## Detalles y trampas

### El `&` va en la definición, no en la llamada

Se escribe al **declarar** la función. Al llamarla, la variable se pasa normal:

```php
function volver(array &$historial): void { ... }  // bien: & en la definición

volver($historial);   // bien
volver(&$historial);  // error de sintaxis: esto se eliminó hace años
```

### Hay que pasar una variable

Una referencia necesita una variable con la cual conectarse. Si le pasas un valor escrito directamente, no hay nada que modificar:

```php
<?php
echo array_pop([1, 2, 3]);  // Error: ¿qué array modificaría?
```

La solución es guardarlo primero en una variable.

### Úsalas solo cuando la función modifica

Una firma con `&` es un aviso: "ojo, esta función cambia lo que le pases". Si la función solo lee, deja el parámetro normal. Así, con leer la firma se sabe qué funciones tocan tus datos y cuáles no.

### La trampa del `foreach` con referencia

`foreach` también puede recorrer [por referencia](https://www.php.net/manual/es/control-structures.foreach.php#control-structures.foreach.reference), para modificar cada elemento en su lugar. Pero la referencia **sigue viva** después del ciclo, y eso produce uno de los errores más desconcertantes de PHP:

```php
<?php
$notas = [4.0, 5.0, 6.0];

foreach ($notas as &$n) {
    $n = $n + 0.5;  // subimos medio punto a cada nota
}
print_r($notas);  // bien: 4.5, 5.5, 6.5

// Otro foreach cualquiera, reutilizando el nombre $n...
foreach ($notas as $n) {
}
print_r($notas);  // ¿¡la última nota cambió!?
```

Después del primer ciclo, `$n` sigue siendo otro nombre para la última nota. El segundo ciclo va escribiendo cada valor en `$n`... o sea, en la última nota. La solución es cortar la referencia con `unset($n)` apenas termina el ciclo. Mejor aún: evita el `foreach` con `&` y crea un array nuevo.

## Dos ejemplos resueltos

Estas son soluciones posibles a los ejercicios de [Pilas y colas](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md#para-practicar).

### Fila de atención

```php
<?php
declare(strict_types=1);

$fila = [];

function ingresar(string $cliente, array &$fila): void {
    $fila[] = $cliente;
    echo "{$cliente} ingresó a la fila.", PHP_EOL;
}

function atender(array &$fila): void {
    if (empty($fila)) {
        echo "No hay clientes en espera.", PHP_EOL;
        return;
    }
    $cliente = array_shift($fila);
    echo "Atendiendo a {$cliente}.", PHP_EOL;
}

ingresar("Ana", $fila);
ingresar("Luis", $fila);
ingresar("Marta", $fila);

atender($fila);
atender($fila);
atender($fila);
atender($fila);  // ya no queda nadie
```

### Deshacer

Una primera versión:

```php
<?php
declare(strict_types=1);

$documento = "";
$historialUndo = []; // pila

function escribir(string $texto, string &$documento, array &$historial): void {
    $historial[] = $documento; // guardamos el estado anterior
    $documento .= $texto;
}

function deshacer(array &$historial): string {
    return array_pop($historial) ?? "";
}

escribir("Hola", $documento, $historialUndo);
escribir(" mundo", $documento, $historialUndo);
echo "Documento: {$documento}", PHP_EOL;

$documento = deshacer($historialUndo);
echo "Después de deshacer: {$documento}", PHP_EOL;
```

Funciona, pero tiene dos detalles:

- **Mezcla dos estilos.** `escribir` modifica `$documento` por referencia, pero `deshacer` devuelve el documento y hay que asignarlo afuera. Las dos formas son válidas, pero en un mismo programa conviene elegir una.
- **Deshacer de más borra todo.** Si no queda nada en el historial, `deshacer` devuelve `""` y el documento queda vacío, aunque tuviera texto desde el principio. Lo esperable sería que no pase nada.

Una versión consistente, que además resuelve el reto (tres escrituras y dos deshacer seguidos). Para que se note la diferencia, el documento parte con algo escrito:

```php
<?php
declare(strict_types=1);

$documento = "Querido diario:";
$historialUndo = []; // pila

function escribir(string $texto, string &$documento, array &$historial): void {
    $historial[] = $documento; // guardamos el estado anterior
    $documento .= $texto;
}

function deshacer(string &$documento, array &$historial): void {
    // Si no hay nada que deshacer, el documento queda como está
    $documento = array_pop($historial) ?? $documento;
}

escribir(" hoy", $documento, $historialUndo);
escribir(" aprendí", $documento, $historialUndo);
escribir(" PHP", $documento, $historialUndo);
echo "Documento: {$documento}", PHP_EOL;

deshacer($documento, $historialUndo);
deshacer($documento, $historialUndo);
echo "Después de deshacer dos veces: {$documento}", PHP_EOL;

deshacer($documento, $historialUndo);  // vuelve al texto inicial
deshacer($documento, $historialUndo);  // ya no hay nada que deshacer
echo "Deshaciendo de más: {$documento}", PHP_EOL;
```

## ¿Cuándo conviene usarlas?

Tienen su lugar:

- **Modificar una estructura en su lugar**, como hacen `array_push`, `array_pop` o `sort`.
- **Entregar más de un resultado.** Por ejemplo, [`preg_match`](https://www.php.net/manual/es/function.preg-match.php) devuelve si encontró algo, y además deja lo encontrado en un parámetro por referencia.

Pero también tienen un costo:

- **La llamada no avisa.** `volver_historial($historial)` se ve igual que una función que solo lee. Para saber que modifica, hay que ir a mirar la firma.
- **Los cambios ocurren lejos.** Si una variable tiene un valor raro, puede ser culpa de cualquier función a la que se la pasaste por referencia. Seguirle la pista cuesta.

Y un mito: **no las uses para "ahorrar memoria"**. PHP no copia el array al pasarlo: lo comparte, y solo lo copia si la función intenta modificarlo. Pasar un array grande por valor para leerlo no cuesta nada extra.

## Alternativas

### 1. Devolver el valor nuevo

En vez de que la función modifique la variable desde adentro, la función **devuelve** el resultado con [`return`](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/return.md) y tú lo asignas afuera:

```php
<?php
declare(strict_types=1);

$variable = 0;

function sumar(int $valor, int $cantidad): int {
    return $valor + $cantidad;
}

echo $variable, PHP_EOL;
$variable = sumar($variable, 3);  // el cambio queda a la vista
echo $variable, PHP_EOL;
```

Con el historial funciona igual:

```php
<?php
declare(strict_types=1);

function visitar(array $historial, string $sitio): array {
    $historial[] = $sitio;
    return $historial;
}

$historial = [];
$historial = visitar($historial, "google.com");
$historial = visitar($historial, "reddit.com");

print_r($historial);
```

¿Y cuando la función tiene que devolver dos cosas, como "volver" (el sitio que sacó *y* el historial que quedó)? Se devuelven las dos en un array, y afuera se [desarman](https://www.php.net/manual/es/language.types.array.php#language.types.array.syntax.destructuring) en dos variables:

```php
<?php
declare(strict_types=1);

function volver(array $historial): array {
    $ultimo = array_pop($historial);
    return [$ultimo, $historial];
}

$historial = ["google.com", "mail.google.com", "reddit.com"];

[$saliDe, $historial] = volver($historial);

echo "Saliste de {$saliDe}", PHP_EOL;
print_r($historial);
```

**Ventaja:** cada cambio queda escrito con un `=` a la vista, y la función es fácil de probar (le das algo, te devuelve algo). **Desventaja:** hay que acordarse de asignar el resultado. Si escribes `visitar($historial, "x");` sin el `$historial =`, no pasa nada.

### 2. Un objeto que guarda su propio estado

Los objetos funcionan distinto: una función que recibe un objeto trabaja sobre **el mismo objeto**, sin necesidad de `&` ([más detalles en el manual](https://www.php.net/manual/es/language.oop5.references.php)). Por eso, con un `SplStack`, esto funciona:

```php
<?php
declare(strict_types=1);

function visitar(SplStack $historial, string $sitio): void {
    $historial->push($sitio);  // sin &, y el historial de afuera cambia igual
}

$historial = new SplStack();
visitar($historial, "google.com");
visitar($historial, "reddit.com");

echo "Hay ", count($historial), " sitios; el último es ", $historial->top(), PHP_EOL;
```

Mejor todavía: en vez de funciones sueltas que reciben el historial, el historial mismo tiene sus operaciones (`$historial->visitar(...)`). Esa es la idea de las clases, y es la alternativa que más se usa en código real. La ves en [Clases y objetos](/ramos/programacion-avanzada/unidades/02-poo-avanzada/clases-y-objetos.md).

### 3. `global` (mejor no)

PHP permite que una función use una variable de afuera con la palabra [`global`](https://www.php.net/manual/es/language.variables.scope.php#language.variables.scope.global):

```php
<?php
$historial = [];

function visitar(string $sitio): void {
    global $historial;  // "usa la $historial de afuera"
    $historial[] = $sitio;
}

visitar("google.com");
visitar("reddit.com");
print_r($historial);
```

Funciona, pero es la peor de las opciones. La firma `visitar(string $sitio)` **esconde** que la función depende del historial y lo modifica. Tampoco puedes usarla con otro historial (¿y si hay dos usuarios?), y probarla es un dolor de cabeza. Es bueno saber que existe, sobre todo para reconocerla en código ajeno.

### En resumen

| Opción | Cómo se ve | Úsala cuando... |
|---|---|---|
| **Referencia** `&` | `volver($historial);` | la función modifica una estructura en su lugar, como las funciones de arrays |
| **Devolver el valor** | `$historial = visitar($historial, "x");` | quieres que cada cambio quede a la vista. Es la opción más segura por defecto |
| **Objeto** | `$historial->push("x");` | los datos y sus operaciones van juntos. Es lo más común en código real |
| **`global`** | `visitar("x");` | casi nunca |

---

Sigue con **[Diccionarios](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/diccionarios.md)**.
