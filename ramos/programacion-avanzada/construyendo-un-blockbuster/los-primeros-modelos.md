---
title: Los primeros modelos
description: Cada persona agrega una pieza al modelo de datos del videoclub
eleventyNavigation:
    order: 50
tags:
    - laravel
    - eloquent
    - git
---
Hasta ahora Blockbuster tiene un catálogo: **géneros** y **películas**. Con eso todavía no se puede arrendar nada. Faltan las copias que están en la estantería, las personas que se las llevan y las reglas sobre quién puede ver qué.

Cada integrante del equipo va a agregar una de esas piezas, completa, y a subirla para que el resto la tenga.

## 1. Clonar el proyecto del grupo

El repositorio es [prv-cftohiggins/blockbuster](https://github.com/prv-cftohiggins/blockbuster). Clónalo en una carpeta nueva, `blockbuster-grupo`:

```bash
cd ~/Proyectos
git clone git@github.com:prv-cftohiggins/blockbuster.git blockbuster-grupo
cd blockbuster-grupo
```

Y hazlo funcionar, igual que en [Clonar, cambiar y subir](/ramos/programacion-avanzada/construyendo-un-blockbuster/clonar-cambiar-y-subir.md#a_2-hacer-que-funcione):

```bash
lerd setup
php artisan migrate:fresh --seed
```

`migrate:fresh --seed` borra las tablas, las crea de nuevo y carga los datos de prueba. Abre `http://blockbuster-grupo.test/peliculas`: deberías ver el catálogo.

Ábrelo también en PhpStorm. El `README.md` del proyecto tiene estas mismas instrucciones, para cuando las necesites de nuevo.

## 2. Leer lo que ya existe

Antes de escribir, mira cómo está hecho lo que hay. Tu modelo va a seguir el mismo patrón. Una película son cuatro archivos:

| Archivo | Qué hace |
|---|---|
| `database/migrations/..._create_peliculas_table.php` | Define las columnas de la tabla |
| `app/Models/Pelicula.php` | La clase: qué se puede llenar y con qué se relaciona |
| `database/seeders/PeliculaSeeder.php` | Los datos de prueba |
| `database/seeders/DatabaseSeeder.php` | La lista de seeders, en orden |

Fíjate en tres cosas de `Pelicula.php`:

- **`$fillable`** es la lista de columnas que se pueden llenar de una vez con `create()` o `update()`. Lo que no está ahí, se ignora.
- **`genero()`** es la [relación](https://laravel.com/docs/13.x/eloquent-relationships): una película pertenece a un género (`belongsTo`). Al otro lado, en `Genero.php`, está la inversa: un género tiene muchas películas (`hasMany`).
- **`SoftDeletes`** hace que eliminar no borre la fila: solo la marca con una fecha.

Y pruébalo en vivo. [Tinker](https://laravel.com/docs/13.x/artisan#tinker) es una consola para hablar con tus modelos:

```bash
php artisan tinker
```

```PHP
App\Models\Pelicula::count();
App\Models\Pelicula::where('anio', '<', 1990)->pluck('titulo');
App\Models\Pelicula::first()->genero->nombre;
App\Models\Genero::where('nombre', 'Terror')->first()->peliculas;
```

Se sale con `exit`.

## 3. Tu rama

Tres personas escribiendo sobre `main` al mismo tiempo se pisan. Cada una trabaja en una **rama**: una línea de trabajo propia, que después se junta con la principal.

```bash
git switch -c copia
```

`git switch -c` crea la rama y te cambia a ella. Ponle el nombre de tu modelo: `copia`, `clasificacion` o `socio`. Desde PhpStorm es **Git → New Branch**.

## 4. Tu modelo

Hay tres. Los tres se construyen con los mismos pasos, que están [más abajo](#a_5-los-pasos-uno-por-uno); lo que cambia es la tabla y un detalle propio de cada uno.

### Copia

Lo que se arrienda no es la película: es **una copia física** de la película. Puede haber cinco copias de Matrix, y cada una está disponible o no.

Tabla `copias`:

| Columna | Tipo | Notas |
|---|---|---|
| `pelicula_id` | llave foránea | A qué película corresponde |
| `codigo` | string, único | El código de la etiqueta: `BB-0001`, `BB-0002`… |
| `formato` | string | `VHS`, `DVD` o `Blu-ray` |
| `estado` | string | `disponible`, `arrendada`, `danada` o `baja`. Por defecto, `disponible` |

- **Relaciones:** una copia pertenece a una película (`pelicula()`), y una película tiene muchas copias (`copias()`, que agregas en `Pelicula.php`).
- **Un método propio:** `estaDisponible(): bool`.
- **Seeder:** dos o tres copias por cada película del catálogo, con códigos correlativos. Deja algunas en un estado distinto de `disponible`.

Para comprobar, en Tinker:

```PHP
App\Models\Pelicula::first()->copias;
App\Models\Copia::first()->pelicula->titulo;
App\Models\Copia::where('estado', 'disponible')->count();
App\Models\Copia::first()->estaDisponible();
```

### Clasificacion

No todas las películas son para todas las edades. En Chile las califica el Consejo de Calificación Cinematográfica, con cuatro categorías.

Tabla `clasificaciones`:

| Columna | Tipo | Notas |
|---|---|---|
| `codigo` | string, único | `TE`, `TE+7`, `14` o `18` |
| `nombre` | string | «Todo espectador», «Mayores de 14 años»… |
| `edad_minima` | integer | 0, 7, 14 o 18 |

Y una columna nueva en la tabla `peliculas`, **en una segunda migración**:

| Columna | Tipo | Notas |
|---|---|---|
| `clasificacion_id` | llave foránea, puede ser nula | Las películas que ya existen no tienen clasificación todavía |

- **Relaciones:** una película pertenece a una clasificación (`clasificacion()`, que agregas en `Pelicula.php` junto con la columna en `$fillable`), y una clasificación tiene muchas películas (`peliculas()`).
- **Un método propio:** `permite(int $edad): bool`, que dice si alguien de esa edad puede ver una película con esta clasificación.
- **Seeder:** las cuatro clasificaciones y, después, asignarle una a cada película del catálogo.

{% alert 'Laravel adivina el nombre de la tabla poniendo el modelo en plural, pero lo hace con las reglas del inglés: para Clasificacion espera una tabla "clasificacions". Hay que decirle el nombre correcto: en el modelo, con la propiedad <code>protected $table = \'clasificaciones\';</code>, y en la llave foránea, con <code>constrained(\'clasificaciones\')</code>. Revisa también el nombre de la tabla en la migración que genera el comando.', 'warning', 'El plural no es automático' %}

Para comprobar, en Tinker:

```PHP
App\Models\Clasificacion::count();
App\Models\Pelicula::where('titulo', 'Toy Story')->first()->clasificacion->codigo;
App\Models\Clasificacion::where('codigo', '18')->first()->peliculas->pluck('titulo');
App\Models\Clasificacion::where('codigo', '14')->first()->permite(12);
```

### Socio

Para arrendar hay que ser socio del videoclub. De cada socio interesa saber quién es, cómo ubicarlo y si está al día.

Tabla `socios`:

| Columna | Tipo | Notas |
|---|---|---|
| `rut` | string, único | Con guion y dígito verificador: `12345678-5` |
| `nombre` | string | |
| `email` | string, único | |
| `telefono` | string, puede ser nulo | |
| `fecha_nacimiento` | date | |
| `estado` | string | `activo` o `suspendido`. Por defecto, `activo` |

- **Relaciones:** hoy, ninguna. El socio es la otra mitad del arriendo, que viene después.
- **Dos métodos propios:** `estaActivo(): bool` y `edad(): int`. Para la edad, declara `fecha_nacimiento` como fecha en `casts()`: Laravel la convierte en un objeto [Carbon](/ramos/programacion-avanzada/unidades/02-poo-avanzada/clases-y-objetos.md#a_5-sumar-una-biblioteca), que ya sabe calcularla.
- **Seeder:** unos diez socios inventados, de edades variadas (alguno menor de 14 y alguno menor de 18), y al menos uno suspendido. Los RUT tienen que ser ficticios.

Para comprobar, en Tinker:

```PHP
App\Models\Socio::count();
App\Models\Socio::first()->edad();
App\Models\Socio::where('estado', 'suspendido')->first()->estaActivo();
App\Models\Socio::create(['rut' => App\Models\Socio::first()->rut, 'nombre' => 'Repetido', 'email' => 'otro@example.com', 'fecha_nacimiento' => '2000-01-01']);
```

La última línea tiene que fallar: no puede haber dos socios con el mismo RUT.

## 5. Los pasos, uno por uno

Los ejemplos usan `Copia`. Cambia el nombre por el de tu modelo.

### Generar los archivos

```bash
php artisan make:model Copia --migration --seed
```

Crea el modelo, su migración y su seeder, vacíos.

### La migración

En el método `up()` de la migración nueva van las columnas. Mira la de `peliculas` como guía, y la [lista de tipos de columna](https://laravel.com/docs/13.x/migrations#available-column-types). Algunas que vas a necesitar:

```PHP
$table->foreignId('pelicula_id')->constrained();   // llave foránea a peliculas
$table->string('codigo')->unique();                // no se puede repetir
$table->string('estado')->default('disponible');   // valor si no se indica otro
$table->string('telefono')->nullable();            // puede quedar vacío
$table->date('fecha_nacimiento');
$table->softDeletes();                             // la columna deleted_at
```

Para agregar una columna a una tabla que ya existe se crea otra migración:

```bash
php artisan make:migration add_clasificacion_id_to_peliculas_table
```

Y adentro se usa `Schema::table('peliculas', ...)` en vez de `Schema::create`. La migración `..._ajusta_generos_y_peliculas.php` del proyecto es un ejemplo.

Ejecuta lo nuevo:

```bash
php artisan migrate
```

Si te equivocaste en una columna, `php artisan migrate:rollback` deshace la última tanda. Corrige el archivo y vuelve a migrar.

### El modelo

Sigue a `Pelicula.php`: `use SoftDeletes`, el `$fillable` con tus columnas, tus relaciones y tu método propio.

```PHP
public function pelicula(): BelongsTo
{
    return $this->belongsTo(Pelicula::class);
}

public function estaDisponible(): bool
{
    return $this->estado === 'disponible';
}
```

No escribas los `use` de arriba a mano: `Alt+Enter` sobre `BelongsTo` lo importa.

Si tu modelo se relaciona con otro, **agrega la relación inversa en el otro modelo**. Para `Copia`, en `Pelicula.php`:

```PHP
public function copias(): HasMany
{
    return $this->hasMany(Copia::class);
}
```

### El seeder

Los datos de prueba van en el método `run()` de tu seeder. Usa `updateOrCreate`, como `PeliculaSeeder`: el primer array es cómo reconocer la fila, el segundo es el resto de los datos. Así se puede ejecutar varias veces sin duplicar nada.

```PHP
Copia::updateOrCreate(
    ['codigo' => 'BB-0001'],
    ['pelicula_id' => $pelicula->id, 'formato' => 'VHS'],
);
```

Después regístralo en `DatabaseSeeder.php`, al final de la lista. El orden importa: si tu seeder necesita películas, va después de `PeliculaSeeder`.

### Probar desde cero

```bash
php artisan migrate:fresh --seed
```

Si esto termina sin errores y las consultas de Tinker de tu modelo responden lo esperado, está listo.

## 6. Subirlo

Revisa qué cambiaste, y guarda:

```bash
git status
git add .
git commit -m "Modelo Copia con migración y seeder"
git push -u origin copia
```

El `-u origin copia` solo hace falta la primera vez: crea la rama en GitHub y la deja enlazada con la tuya.

Ahora entra al repositorio en GitHub. Va a aparecer un aviso con el botón **Compare & pull request**. Un *pull request* es pedirle al equipo que revise tu rama y la sume a `main`. Escribe en la descripción **qué agregaste y cómo probarlo**, y créalo.

## 7. Revisar el trabajo de otra persona

Nadie fusiona su propio pull request. Abre el de un compañero o compañera y:

1. Lee los cambios en la pestaña **Files changed**.
2. Bájalo y pruébalo en tu computador:

    ```bash
    git fetch
    git switch clasificacion
    composer install
    php artisan migrate:fresh --seed
    ```

3. Corre las consultas de Tinker de ese modelo.
4. Si funciona, apruébalo con **Review changes → Approve**. Si no, comenta qué falló, con el mensaje de error completo.

Para volver a tu trabajo: `git switch copia`.

{% alert 'Dos de los tres modelos tocan Pelicula.php, y los tres tocan DatabaseSeeder.php. Al fusionar el segundo pull request, GitHub puede avisar que hay un conflicto: dos personas cambiaron las mismas líneas y Git no sabe con cuál quedarse. No es un error ni culpa de nadie. No lo fuerces: se resuelve en conjunto.', 'info', 'Si aparece un conflicto' %}

## Cuando esté todo fusionado

Vuelve a `main`, trae lo de todos y reconstruye:

```bash
git switch main
git pull
composer install
php artisan migrate:fresh --seed
```

Ahora tu Blockbuster tiene películas con clasificación, copias en la estantería y socios. Falta lo que los une: el **arriendo**, que junta a un socio con una copia y tiene que revisar que la copia esté disponible, que el socio esté activo y que tenga edad para verla. Las tres piezas que acaban de construir son justo las que necesita.
