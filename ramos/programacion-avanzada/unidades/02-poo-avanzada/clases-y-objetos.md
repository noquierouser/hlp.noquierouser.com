---
title: Clases y objetos
description: La pila deja de ser un array suelto y pasa a defenderse sola
eleventyNavigation:
    order: 10
tags:
    - php
    - poo
---
Si ya viste clases en Python, la idea es la misma: juntar datos y las operaciones que los manipulan. En PHP la [sintaxis básica](https://www.php.net/manual/es/language.oop5.basic.php) cambia un poco, y la privacidad es de verdad.

## La pila, como clase

Tomemos la [pila](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md) que armamos con un array y encerrémosla en una clase:

```php
<?php
declare(strict_types=1);

class Pila {
    private array $items = [];

    public function apilar(string $item): void {
        $this->items[] = $item;
    }

    public function desapilar(): ?string {
        return array_pop($this->items);
    }
}

$p = new Pila();
$p->apilar("pagina1");
$p->apilar("pagina2");
echo $p->desapilar(), PHP_EOL;  // pagina2

// Descomenta la siguiente línea para ver qué pasa al tocar algo privado:
// print_r($p->items);
```

Comparado con Python:

- `self` pasa a ser `$this`, y **no** se declara como parámetro del método.
- `obj.x` pasa a ser `$obj->x`: la flecha reemplaza al punto.
- Las [propiedades](https://www.php.net/manual/es/language.oop5.properties.php) se declaran arriba, con su tipo.
- `private` es de verdad. En Python, el guion bajo (`_items`) es un acuerdo entre caballeros; en PHP, el motor no te deja tocar `$items` desde afuera. Más en [visibilidad](https://www.php.net/manual/es/language.oop5.visibility.php).

Con esto, nadie fuera de la clase puede meter la mano en `$items`: la única forma de usar la pila es apilar y desapilar.

## Copiar un objeto con cambios

PHP 8.5 permite [clonar](https://www.php.net/manual/es/language.oop5.cloning.php) un objeto cambiando algunas propiedades en el mismo paso. Es muy útil con objetos que no se pueden modificar (`readonly`):

```php
<?php
declare(strict_types=1);

final readonly class Color {
    public function __construct(
        public string $nombre,
        public float $alpha,
    ) {}

    public function conAlpha(float $alpha): static {
        return clone($this, ['alpha' => $alpha]);
    }
}

$rojo = new Color("rojo", 1.0);
$rojoTransparente = $rojo->conAlpha(0.5);

var_dump($rojo->alpha, $rojoTransparente->alpha);  // 1.0 y 0.5
```

El original no cambia: `conAlpha` devuelve un objeto nuevo.

{% alert 'Esta página va a ir creciendo con el resto de la unidad.', 'info' %}
