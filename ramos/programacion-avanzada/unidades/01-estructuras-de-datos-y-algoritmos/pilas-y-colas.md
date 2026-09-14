---
title: Pilas y colas
description: Quién sale primero, con el mismo array de siempre
eleventyNavigation:
    order: 60
tags:
    - php
    - estructuras-de-datos
---
Si un [array](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/arrays.md) de PHP ya permite guardar datos y sacarlos... ¿para qué hablar de pilas y colas?

Porque una pila y una cola no son otra forma de guardar cosas: son **reglas** sobre cómo se usan. Las dos guardan elementos en orden, pero cambia **cuál sale primero**, y esa diferencia decide qué problemas resuelve cada una. Pasar de "un array" a "una estructura con propósito" es justamente eso: decidir la regla.

## Pila: sale el último que entró

Una pila (*stack*) sigue la regla LIFO (*last in, first out*): el último que entra es el primero que sale. Es una torre de platos: solo se toca el de arriba, el **tope**.

- **push** agrega un elemento arriba.
- **pop** saca el elemento de arriba.

En PHP, una pila es un array que solo se usa por el final:

```php
<?php
// PILA con array nativo de PHP
$pila = [];

array_push($pila, "Página A");
array_push($pila, "Página B");
array_push($pila, "Página C");

echo "Historial: " . implode(" → ", $pila) . PHP_EOL;

$ultima = array_pop($pila); // saca el último que entró
echo "Retrocediendo desde: {$ultima}" . PHP_EOL;

echo "Historial: " . implode(" → ", $pila) . PHP_EOL;
```

- [`array_push`](https://www.php.net/manual/es/function.array-push.php) agrega al final. `$pila[] = "Página A"` hace exactamente lo mismo; usa la que te resulte más clara.
- [`array_pop`](https://www.php.net/manual/es/function.array-pop.php) saca el último elemento y lo devuelve. Si la pila está vacía, devuelve `null`.
- [`implode`](https://www.php.net/manual/es/function.implode.php) junta los elementos en un texto, con el separador que le digas. Muy práctico para ver qué hay adentro.

**Sirve para:** el historial de navegación (el botón Atrás), deshacer con Ctrl + Z y la pila de llamadas de funciones, que es como el propio PHP sabe a dónde volver cuando una función termina.

### Un historial de navegación

Cada vez que visitas un sitio, se apila. Cada vez que vuelves atrás, se desapila:

```php
<?php
$historial_navegacion = [];

array_push($historial_navegacion, "http://google.com");
array_push($historial_navegacion, "http://mail.google.com");
array_push($historial_navegacion, "http://reddit.com");

echo "Historial de visita:", PHP_EOL;
foreach ($historial_navegacion as $sitio_visitado) {
    echo "➔ {$sitio_visitado}", PHP_EOL;
}

echo PHP_EOL;

array_pop($historial_navegacion);
echo "Historial de visita:", PHP_EOL;
foreach ($historial_navegacion as $sitio_visitado) {
    echo "➔ {$sitio_visitado}", PHP_EOL;
}

echo PHP_EOL;

array_pop($historial_navegacion);
echo "Historial de visita:", PHP_EOL;
foreach ($historial_navegacion as $sitio_visitado) {
    echo "➔ {$sitio_visitado}", PHP_EOL;
}
```

Funciona, pero el mismo `foreach` está copiado tres veces. Lo natural sería convertir "visitar", "volver" y "mostrar" en funciones... y ahí aparece un problema: una función recibe una **copia** del array, así que no puede cambiar el historial de afuera. La solución está en [Parámetros por referencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md), el siguiente tema.

## Cola: sale el primero que entró

Una cola (*queue*) sigue la regla FIFO (*first in, first out*): el primero que entra es el primero que sale. Es la fila del banco: se entra por un extremo y se sale por el otro.

```php
<?php
// COLA con array nativo de PHP
$cola = [];

array_push($cola, "Cliente 1");
array_push($cola, "Cliente 2");
array_push($cola, "Cliente 3");

echo "Fila: " . implode(", ", $cola) . PHP_EOL;

$atendido = array_shift($cola); // saca el primero que entró
echo "Atendiendo a: {$atendido}" . PHP_EOL;

echo "Fila: " . implode(", ", $cola) . PHP_EOL;
```

- Se agrega igual que en la pila, al final.
- [`array_shift`](https://www.php.net/manual/es/function.array-shift.php) saca el **primer** elemento y lo devuelve. Con la cola vacía, devuelve `null`.
- [`empty`](https://www.php.net/manual/es/function.empty.php) dice si la cola quedó vacía, ideal para no intentar atender a nadie cuando no hay nadie:

```php
<?php
$cola = ["Cliente 1"];

while (!empty($cola)) {
    $cliente = array_shift($cola);
    echo "Atendiendo a {$cliente}", PHP_EOL;
}

echo "No quedan clientes en espera.", PHP_EOL;
```

**Sirve para:** la fila de atención de clientes, la cola de impresión, procesar solicitudes o pedidos en orden de llegada.

## Pila contra cola

| | Pila (LIFO) | Cola (FIFO) |
|---|---|---|
| **Entra** | al final: `array_push` | al final: `array_push` |
| **Sale** | desde el final: `array_pop` | desde el inicio: `array_shift` |
| **Orden de salida** | último en entrar, primero en salir | primero en entrar, primero en salir |
| **Ejemplo** | Ctrl + Z, historial | fila de atención |

Fíjate que se llenan igual. Toda la diferencia está en **por dónde salen**.

## Parecidas, pero no cuestan lo mismo

`array_pop` saca del final y no toca nada más. `array_shift` saca del inicio y después **vuelve a numerar todo el array**: si hay 100.000 elementos, los renumera todos, cada vez.

```php
<?php
$cola = ["a", "b", "c"];
array_shift($cola);
print_r($cola);  // "b" pasó a ser la clave 0, "c" la 1
```

Con pocos datos no se nota, pero con muchos sí. Por ahora quédate con la idea: **dos operaciones que se ven parecidas pueden costar muy distinto**. Cómo medir esa diferencia está en [Eficiencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/eficiencia.md).

## De paso: SplStack y SplQueue

PHP trae clases nativas para esto en la [SPL](https://www.php.net/manual/es/book.spl.php) (*Standard PHP Library*): [`SplStack`](https://www.php.net/manual/es/class.splstack.php) y [`SplQueue`](https://www.php.net/manual/es/class.splqueue.php). Hacen lo mismo que los arrays, pero en versión orientada a objetos:

```php
<?php
$pila = new SplStack();
$pila->push("A");
$pila->push("B");
echo $pila->pop(), PHP_EOL;  // B

$cola = new SplQueue();
$cola->enqueue("Cliente 1");
$cola->enqueue("Cliente 2");
echo $cola->dequeue(), PHP_EOL;  // Cliente 1

var_dump($pila);
```

Dos diferencias con los arrays:

- Por dentro no son arrays: el `var_dump` muestra una `SplDoublyLinkedList`, una lista doblemente enlazada. Por eso sacar del inicio no obliga a renumerar nada.
- Si intentas sacar algo de una estructura vacía, no devuelven `null`: lanzan una excepción. Hay que preguntar antes con `isEmpty()`.

Por ahora nos quedamos con arrays; las clases y los objetos vienen en la unidad 2.

## ¿Pila, cola o diccionario?

Elegir la estructura es mirar qué **operaciones** pide el problema:

| | Pila | Cola | Diccionario |
|---|---|---|---|
| **Regla** | LIFO | FIFO | clave → valor |
| **Se usa cuando...** | importa lo último que entró | importa el orden de llegada | necesito buscar por identificador |

Por ejemplo:

- Atención de clientes de una empresa: se atiende por orden de llegada, así que **cola**.
- Historial de navegación: el botón Atrás siempre vuelve a lo último, así que **pila**.
- Registro de usuarios: se busca a alguien por su RUT sin recorrer todo, así que **diccionario** (array asociativo).

## Para practicar

**1. Deshacer un texto (pila).** Arma un "documento" al que se le va agregando texto. Cada vez que escribes, guarda en una pila cómo estaba el documento *antes* del cambio. Una función `deshacer()` debe dejar el documento como estaba antes del último cambio.

- Reto: escribe tres veces y deshaz dos veces seguidas.

**2. Fila de atención (cola).** Una función `ingresar()` agrega un cliente al final de la fila, y `atender()` saca y muestra al primero.

- Reto: que el programa avise cuando la fila queda vacía.

Para que esas funciones puedan modificar el documento o la fila, vas a necesitar [parámetros por referencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md). Ahí mismo hay una solución de cada uno, pero inténtalo primero.

```php
<?php
declare(strict_types=1);

// Escribe tu solución aquí y presiona ▶ Ejecutar

```

**3. Casos.** Para cada uno, analiza qué operaciones necesita, elige la estructura y justifica por qué, e impleméntala con datos de prueba:

1. **Sistema de atención de clientes** de una empresa local.
2. **Historial de navegación** de un usuario.
3. **Registro de usuarios** de un sistema.

Y después, pregúntate:

- ¿Qué características del problema fueron clave para elegir la estructura?
- ¿Qué dificultades aparecerían si usaras una estructura inadecuada?
- ¿Cómo influye la forma de acceder a los datos en la eficiencia de la solución?

---

Sigue con **[Parámetros por referencia](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/referencias.md)**.
