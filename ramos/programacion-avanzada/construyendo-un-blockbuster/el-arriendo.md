---
title: El arriendo
description: Unir socios, copias y clasificaciones en la operación que le da sentido al videoclub
eleventyNavigation:
    order: 60
tags:
    - laravel
    - eloquent
    - poo
---
Blockbuster ya tiene películas con clasificación, copias en la estantería y socios. Lo que falta es lo que pasa en el mostrador: **alguien se lleva una copia**. Eso es un arriendo, y es la primera pieza del sistema que no se puede construir mirando un solo modelo.

## 1. Partir desde lo último

Antes de crear una rama nueva, deja tu `main` igual al de GitHub y reconstruye:

```bash
git switch main
git pull
composer install
php artisan migrate:fresh --seed
```

Si `migrate:fresh --seed` no termina limpio, **eso se arregla primero**. Nadie construye encima de una base que no levanta.

## 2. Qué es un arriendo

Un arriendo registra que **un socio** se llevó **una copia**, cuándo, hasta cuándo, y cuándo la devolvió.

Tabla `arriendos`:

| Columna | Tipo | Notas |
|---|---|---|
| `socio_id` | llave foránea | Quién arrienda |
| `copia_id` | llave foránea | Qué copia se lleva |
| `fecha_arriendo` | date | El día en que se la lleva |
| `fecha_vencimiento` | date | Hasta cuándo puede tenerla |
| `fecha_devolucion` | date, puede ser nula | Vacía mientras no la devuelva |

Y tiene tres reglas. Un arriendo **no se puede registrar** si:

1. El socio está suspendido.
2. La copia no está disponible.
3. El socio no tiene edad para la clasificación de la película.

Fíjate en que cada regla ya tiene dueño. Quién está activo lo sabe `Socio`. Qué copia está disponible lo sabe `Copia`. Qué edad exige una película lo sabe `Clasificacion`. El arriendo no vuelve a escribir esas reglas: **les pregunta a los modelos que las conocen**.

## 3. Tres ramas, tres piezas

Cada persona prepara la parte que le toca a su modelo. Las tres se pueden escribir al mismo tiempo, porque no dependen entre sí.

### Rama `arriendo-tabla`: la tabla y el modelo

Para quien hizo `Socio`.

- Migración de `arriendos` con las columnas de arriba, más `timestamps()` y `softDeletes()`.
- Modelo `Arriendo` con `$fillable`, `SoftDeletes` y las tres fechas declaradas como `date` en `casts()`.
- Relaciones: un arriendo pertenece a un socio (`socio()`) y a una copia (`copia()`). Y la inversa en `Socio.php`: un socio tiene muchos arriendos (`arriendos()`).
- Dos métodos propios en `Arriendo`:
    - `estaDevuelto(): bool`
    - `estaAtrasado(): bool`: no se ha devuelto y ya pasó la fecha de vencimiento.

Para la fecha de hoy usa [`today()`](https://laravel.com/docs/13.x/helpers#method-today), que devuelve un objeto Carbon. Dos fechas Carbon se comparan con `lt()` (menor que) y `gt()` (mayor que).

### Rama `copia-estados`: la copia cambia de estado

Para quien hizo `Copia`.

Hoy el estado de una copia es un texto que cualquiera puede cambiar a mano. Eso se acaba: la copia va a tener métodos que hacen el cambio **y revisan que tenga sentido**.

- `marcarArrendada(): void`. Si la copia no está disponible, lanza una excepción en vez de cambiar nada. Si lo está, cambia el estado y guarda.
- `marcarDisponible(): void`. Deja la copia disponible de nuevo y guarda.
- Relación `arriendos()`: una copia tiene muchos arriendos, a lo largo del tiempo.

```PHP
public function marcarArrendada(): void
{
    if (! $this->estaDisponible()) {
        throw new \DomainException("La copia {$this->codigo} no está disponible.");
    }

    $this->estado = 'arrendada';
    $this->save();
}
```

[`DomainException`](https://www.php.net/manual/es/class.domainexception.php) es una excepción de PHP pensada justo para esto: algo que el negocio no permite. La barra inicial le dice a PHP que la clase es suya y no de `App\Models`, igual que en [Clases y objetos](/ramos/programacion-avanzada/unidades/02-poo-avanzada/clases-y-objetos.md).

### Rama `pelicula-edad`: quién puede ver qué

Para quien hizo `Clasificacion`.

- En `Pelicula.php`, un método `permiteA(Socio $socio): bool`: responde si ese socio tiene edad para esa película. No calcules nada ahí: `Clasificacion` ya tiene `permite()` y `Socio` ya tiene `edad()`.
- Decide qué pasa con una película **sin clasificación** y déjalo escrito en un comentario. El operador [`?->`](https://www.php.net/manual/es/language.oop5.basic.php#language.oop5.basic.nullsafe) te va a servir.
- En `ClasificacionSeeder`, asigna a cada película la clasificación que le corresponde de verdad, por su título, en vez de repartirlas por turno. Toy Story no puede quedar para mayores de 18.

## 4. Juntar todo: registrar un arriendo

Cuando las tres ramas estén en `main`, viene la pieza que las usa. Esta se escribe en conjunto.

En `Arriendo.php`, un método estático que hace la operación completa:

```PHP
public static function registrar(Socio $socio, Copia $copia, int $dias = 3): self
{
    // 1. ¿El socio está activo? Si no, excepción.
    // 2. ¿El socio tiene edad para la película de esta copia? Si no, excepción.
    // 3. Marcar la copia como arrendada (ella misma reclama si no está disponible).
    // 4. Crear el arriendo, con fecha de hoy y vencimiento en $dias días, y devolverlo.
}
```

Cada paso es una o dos líneas, porque el trabajo ya está hecho en los otros modelos. Eso es lo que se gana al poner cada regla donde corresponde.

Y el camino de vuelta, un método `devolver(): void` en el arriendo: anota la fecha de devolución de hoy y le pide a la copia que se marque disponible.

{% alert 'Registrar un arriendo cambia dos tablas: crea una fila en arriendos y modifica una en copias. Si la primera resulta y la segunda falla, la base de datos queda mintiendo. Para que sea todo o nada, las dos operaciones van dentro de <code>DB::transaction(function () { ... })</code>.', 'info', 'Dos cambios que tienen que ocurrir juntos' %}

## 5. Comprobar

En Tinker, después de `php artisan migrate:fresh --seed`:

```PHP
use App\Models\{Arriendo, Copia, Socio};

$socio = Socio::where('estado', 'activo')->first();
$copia = Copia::where('estado', 'disponible')->first();

$arriendo = Arriendo::registrar($socio, $copia);

$copia->fresh()->estado;        // "arrendada"
$socio->arriendos()->count();   // 1
$arriendo->estaAtrasado();      // false
```

Ahora los tres casos que **tienen que fallar**, cada uno con su mensaje:

```PHP
// La misma copia, otra vez: ya no está disponible.
Arriendo::registrar($socio, $copia->fresh());

// Un socio suspendido.
Arriendo::registrar(Socio::where('estado', 'suspendido')->first(), Copia::where('estado', 'disponible')->first());

// Un socio de 12 años con una película para mayores de 18.
```

El tercero ármalo tú: busca al socio más joven y una copia disponible de una película con clasificación `18`.

Y la devolución:

```PHP
$arriendo->devolver();

$arriendo->estaDevuelto();      // true
$copia->fresh()->estado;        // "disponible"
```

Si los cinco casos responden lo esperado, el videoclub ya arrienda.
