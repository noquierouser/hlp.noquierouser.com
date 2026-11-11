---
title: Clases y objetos
description: Clases en PHP desde lo básico, y cómo ordenarlas en un proyecto con Composer
eleventyNavigation:
    parent: /ramos/programacion-avanzada/
    order: 20
tags:
    - php
    - poo
    - composer
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

## El constructor

La pila parte vacía, así que no necesitaba nada para nacer. La mayoría de los objetos sí: una película sin título no sirve de mucho. Los datos iniciales se reciben en el [constructor](https://www.php.net/manual/es/language.oop5.decon.php), un método especial llamado `__construct` que PHP ejecuta cuando haces `new`. Es el `__init__` de Python.

```php
<?php
declare(strict_types=1);

class Pelicula {
    private bool $arrendada = false;

    public function __construct(
        public readonly string $titulo,
        public readonly int $anio,
    ) {}

    public function arrendar(): void {
        if ($this->arrendada) {
            throw new RuntimeException("{$this->titulo} ya está arrendada");
        }
        $this->arrendada = true;
    }

    public function devolver(): void {
        $this->arrendada = false;
    }

    public function estaDisponible(): bool {
        return !$this->arrendada;
    }
}

$matrix = new Pelicula("Matrix", 1999);
$alien  = new Pelicula("Alien", 1979);

$matrix->arrendar();

var_dump($matrix->estaDisponible());  // false
var_dump($alien->estaDisponible());   // true

// Descomenta para ver los dos errores:
// $matrix->arrendar();        // ya está arrendada
// $matrix->titulo = "Otra";   // readonly: no se puede cambiar
```

Hay varias cosas pasando en pocas líneas:

- **Cada objeto tiene sus propios datos.** Arrendar Matrix no le hace nada a Alien, aunque las dos salgan de la misma clase.
- **`public readonly string $titulo` dentro de los paréntesis** declara la propiedad y la llena con lo que llega, todo en un paso. Se llama [promoción de propiedades](https://www.php.net/manual/es/language.oop5.decon.php#language.oop5.decon.constructor.promotion), y te ahorra escribir `$this->titulo = $titulo` por cada dato.
- **[`readonly`](https://www.php.net/manual/es/language.oop5.properties.php#language.oop5.properties.readonly-properties)** deja leer la propiedad desde afuera, pero no cambiarla después de creada. El título de una película no cambia.
- **`$arrendada` es `private`** porque sí cambia, y no de cualquier forma: solo a través de `arrendar()` y `devolver()`. Así la regla "no se arrienda dos veces" vive en un solo lugar y nadie se la puede saltar.
- **Cuando algo no se puede hacer, el método lanza una [excepción](https://www.php.net/manual/es/language.exceptions.php)** en vez de devolver `false` y esperar que alguien revise.

Esa es la idea de fondo: una clase no es una bolsa de datos, es datos **con sus reglas**.

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

## Una clase por archivo, con Composer

Hasta aquí todo cabía en un solo archivo. En un proyecto de verdad hay decenas de clases, y la costumbre es **una clase por archivo**, con el archivo llamado igual que la clase. El problema es que entonces cada archivo que usa una clase tendría que cargarla a mano con `require`.

[Composer](https://getcomposer.org) resuelve eso. Además de descargar bibliotecas, sabe **cargar tus clases solo**, en el momento en que las usas. Esta parte no se puede ejecutar en la página: se hace en tu computador, con el [entorno instalado](/ramos/programacion-avanzada/construyendo-un-blockbuster/entorno-fedora.md).

### 1. Armar el proyecto

```bash
cd ~/Proyectos
mkdir videoclub
cd videoclub
mkdir src
```

Ábrelo en PhpStorm y crea en la raíz un archivo `composer.json`:

```json
{
    "name": "tu-usuario/videoclub",
    "autoload": {
        "psr-4": {
            "Videoclub\\": "src/"
        }
    }
}
```

La parte de `autoload` es un acuerdo: **toda clase cuyo nombre empiece con `Videoclub\` está en la carpeta `src/`**. Ese acuerdo es un estándar llamado [PSR-4](https://www.php-fig.org/psr/psr-4/), y lo siguen prácticamente todos los proyectos PHP.

### 2. La clase, en su archivo

Crea `src/Pelicula.php` con la clase de más arriba y una línea nueva:

```PHP
<?php
declare(strict_types=1);

namespace Videoclub;

class Pelicula {
    private bool $arrendada = false;

    public function __construct(
        public readonly string $titulo,
        public readonly int $anio,
    ) {}

    public function arrendar(): void {
        if ($this->arrendada) {
            throw new \RuntimeException("{$this->titulo} ya está arrendada");
        }
        $this->arrendada = true;
    }

    public function devolver(): void {
        $this->arrendada = false;
    }

    public function estaDisponible(): bool {
        return !$this->arrendada;
    }
}
```

El [`namespace`](https://www.php.net/manual/es/language.namespaces.rationale.php) es el apellido de la clase. Su nombre completo ahora es `Videoclub\Pelicula`, y eso evita choques: tu `Pelicula` y la `Pelicula` de una biblioteca ajena pueden convivir porque tienen apellidos distintos.

Por lo mismo cambió `RuntimeException` a `\RuntimeException`: la barra inicial dice "esta clase es de PHP, no la busques dentro de `Videoclub`".

### 3. Generar el cargador

```bash
composer dump-autoload
```

Aparece una carpeta `vendor/` con un archivo `autoload.php`. Ese archivo es el que sabe encontrar tus clases.

### 4. Usar la clase

Crea `prueba.php` en la raíz del proyecto:

```PHP
<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Videoclub\Pelicula;

$pelicula = new Pelicula("Matrix", 1999);
$pelicula->arrendar();

echo $pelicula->titulo, ": ";
echo $pelicula->estaDisponible() ? "disponible" : "arrendada", PHP_EOL;
```

Y ejecútalo desde la terminal:

```bash
php prueba.php
```

```plaintext
Matrix: arrendada
```

Fíjate en lo que **no** hay: ningún `require` de `src/Pelicula.php`. El único `require` es el del cargador, una vez. Cuando PHP llega a `new Pelicula(...)`, el cargador traduce `Videoclub\Pelicula` a `src/Pelicula.php` y lo carga solo. Puedes agregar veinte clases más a `src/` sin tocar esa línea.

El [`use`](https://www.php.net/manual/es/language.namespaces.importing.php) de arriba es solo comodidad: permite escribir `Pelicula` en vez de `Videoclub\Pelicula` cada vez. En PhpStorm no lo escribas a mano: escribe `Pelicula`, y `Alt+Enter` lo importa.

### 5. Sumar una biblioteca

El mismo cargador sirve para el código de otras personas. Las fechas, por ejemplo, las resuelve muy bien [Carbon](https://carbon.nesbot.com):

```bash
composer require nesbot/carbon
```

Composer la descarga en `vendor/` y la anota en `composer.json`. Ahora puedes usarla en `prueba.php` igual que tu propia clase:

```PHP
<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Carbon\Carbon;
use Videoclub\Pelicula;

$pelicula = new Pelicula("Matrix", 1999);
$pelicula->arrendar();

$devolucion = Carbon::now()->addDays(3);

echo "{$pelicula->titulo} se devuelve el ", $devolucion->format('d/m/Y'), PHP_EOL;
```

### Qué quedó en la carpeta

| Archivo o carpeta | Qué es | ¿Se sube a GitHub? |
|---|---|---|
| `composer.json` | Lo que el proyecto necesita y dónde están tus clases | Sí |
| `composer.lock` | Las versiones exactas que se instalaron | Sí |
| `src/` | Tu código | Sí |
| `vendor/` | Las bibliotecas descargadas y el cargador | No: se regenera con `composer install` |

### Esto mismo hace Laravel

Abre el `composer.json` de un proyecto Laravel y busca la sección `autoload`: dice que `App\` está en `app/`. Por eso `App\Models\User` vive en `app/Models/User.php`, y por eso nunca vas a ver un `require` en el código de Blockbuster. Es exactamente lo que acabas de armar a mano, con más carpetas.

{% alert 'Esta página va a ir creciendo.', 'info' %}

---

Sigue con **[Construyendo un Blockbuster](/ramos/programacion-avanzada/construyendo-un-blockbuster/index.md)**.
