---
title: Texto
description: Comillas, puntos y llaves
eleventyNavigation:
    order: 20
tags:
    - php
---
En PHP, el texto (los *strings*) se escribe entre comillas, igual que en Python. Las diferencias están en cómo se juntan pedazos de texto y en qué comillas usas.

## Juntar texto: el punto

Para concatenar se usa el [operador `.`](https://www.php.net/manual/es/language.operators.string.php), no el `+`:

```php
<?php
$var = "Juan";

echo "Hola, " . $var . PHP_EOL;
```

El `+` es solo para sumar. Si le pasas texto que no es número, PHP reclama:

```php
<?php
echo "5" + "3", PHP_EOL;  // 8: son números escritos como texto
echo "a" + "b", PHP_EOL;  // TypeError
```

## Meter variables dentro del texto

Con comillas dobles, las variables se reemplazan por su valor. Esto se llama [interpolación](https://www.php.net/manual/es/language.types.string.php#language.types.string.parsing), y es lo más parecido a los *f-strings* de Python:

```php
<?php
$var = "Juan";

echo "Hola, " . $var . PHP_EOL;  // concatenación
echo "Hola, {$var}", PHP_EOL;    // interpolación
```

Las llaves en `{$var}` no siempre son obligatorias, pero conviene usarlas siempre: dejan claro dónde empieza y termina la variable.

## Comillas dobles y simples no son lo mismo

Con [comillas simples](https://www.php.net/manual/es/language.types.string.php#language.types.string.syntax.single), el texto va tal cual: no se reemplazan variables ni se interpretan cosas como `\n`.

```php
<?php
$nombre = "Ana";

echo 'Hola, {$nombre}\n';  // literal, tal cual
echo PHP_EOL;
echo "Hola, {$nombre}\n";  // con interpolación y salto de línea
```

Regla práctica: comillas dobles cuando hay variables o saltos de línea; simples cuando el texto es fijo.

## Texto de varias líneas

Un string entre comillas dobles puede ocupar varias líneas, y la interpolación funciona igual:

```php
<?php
$var = "Juan";

echo "Buenas noches,
Este es un texto con múltiples líneas.

Un saludo para {$var} que está en el bar.";
```

Para textos largos también existe la [sintaxis heredoc](https://www.php.net/manual/es/language.types.string.php#language.types.string.syntax.heredoc), pero con esto basta por ahora.

## Caracteres especiales

Dentro de comillas dobles, la barra invertida `\` [escapa](https://www.php.net/manual/es/language.types.string.php#language.types.string.syntax.double) caracteres: `\n` es un salto de línea, `\"` una comilla, y `\$` un signo peso de verdad (no el comienzo de una variable):

```php
<?php
foreach (range(1, 10) as $n) {
    echo "\${$n} ";
}
```

---

Sigue con **[Decisiones y ciclos](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/decisiones-y-ciclos.md)**.
