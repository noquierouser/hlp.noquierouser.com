---
title: Planificación de CPU
description: Quién usa el procesador ahora, y por qué justo ese
eleventyNavigation:
    order: 50
tags:
    - sistemas-operativos
---
En tu computador hay cientos de procesos y unos pocos núcleos. Cada pocos milisegundos, el sistema operativo tiene que decidir cuál de los procesos [listos](/archivo/sistemas-operativos/teoria/procesos.md#estados-de-un-proceso) usa el procesador. Esa decisión, repetida miles de veces por segundo, es la **planificación de CPU** (en las diapositivas antiguas, *itineración*).

## Ráfagas de CPU y de E/S

Casi ningún proceso usa el procesador de corrido hasta terminar. Su ejecución es una **alternancia** de dos cosas:

- **Ráfagas de CPU:** tramos en que calcula.
- **Ráfagas de E/S:** tramos en que espera (al disco, a la red, a que escribas).

```plaintext
 cargar dato    esperar     calcular      esperar     calcular
 sumar, leer    al disco    promedio      teclado     guardar
 [-- CPU --]   [-- E/S --]  [-- CPU --]  [-- E/S --]  [-- CPU --] ...
```

Si se mide cuánto duran las ráfagas de CPU, la mayoría son **muy cortas** (unos pocos milisegundos) y unas pocas son largas. Los procesos [limitados por E/S](/archivo/sistemas-operativos/teoria/procesos.md#colas-y-planificadores) tienen muchas ráfagas cortas; los limitados por CPU, pocas y largas. Un buen planificador aprovecha esto.

## Cuándo se decide

El **planificador de corto plazo** elige un proceso de la cola de listos cada vez que ocurre alguna de estas situaciones:

1. Un proceso pasa de **ejecución a espera** (por ejemplo, pide E/S).
2. Un proceso pasa de **ejecución a listo** (por ejemplo, se le acabó su tiempo).
3. Un proceso pasa de **espera a listo** (terminó su E/S).
4. Un proceso **termina**.

Si solo se decide en los casos 1 y 4, la planificación es **no apropiativa** (*non-preemptive*): una vez que un proceso tiene la CPU, la conserva hasta que la suelta por su cuenta. Si también se decide en los casos 2 y 3, es **apropiativa** (*preemptive*): el sistema operativo puede **quitarle** la CPU a un proceso para dársela a otro. Todos los sistemas operativos actuales son apropiativos; es lo que permite el [tiempo compartido](/archivo/sistemas-operativos/teoria/el-computador-por-dentro.md#proteccion-de-la-cpu).

### El despachador

Una vez elegido el proceso, el **despachador** (*dispatcher*) le entrega la CPU:

1. hace el [cambio de contexto](/archivo/sistemas-operativos/teoria/procesos.md#cambio-de-contexto);
2. cambia a modo usuario;
3. salta al punto del programa donde el proceso iba.

El tiempo que tarda se llama **latencia de despacho**, y es tiempo en que nadie avanza. Tiene que ser mínimo.

## Criterios: ¿qué es planificar "bien"?

No hay una sola respuesta: depende de qué se quiera optimizar.

| Criterio | Qué mide | Se busca |
|---|---|---|
| **Utilización de CPU** | Qué porcentaje del tiempo la CPU está haciendo algo útil | Máxima |
| **Rendimiento** (*throughput*) | Cuántos procesos terminan por unidad de tiempo | Máximo |
| **Tiempo de retorno** (*turnaround*) | Cuánto pasa desde que un proceso llega hasta que termina | Mínimo |
| **Tiempo de espera** | Cuánto tiempo pasa el proceso en la cola de listos | Mínimo |
| **Tiempo de respuesta** | Cuánto pasa desde que llega hasta que **empieza** a ejecutarse | Mínimo |

Un servidor que procesa trabajos en lote se preocupa del rendimiento; un escritorio, del tiempo de respuesta: nadie quiere que la ventana tarde en reaccionar a un clic, aunque el total de trabajo hecho sea el mismo. Los ejemplos de abajo usan sobre todo el **tiempo de espera promedio**, que es fácil de calcular y comparar.

## Algoritmos

### Por orden de llegada (FCFS)

*First Come, First Served*: el primero que llega a la cola de listos es el primero que usa la CPU, y la conserva hasta terminar su ráfaga. Es una [cola](/ramos/programacion-avanzada/unidades/01-estructuras-de-datos-y-algoritmos/pilas-y-colas.md) común y corriente, y es no apropiativo.

Tres procesos llegan en este orden, con estas ráfagas:

| Proceso | Ráfaga |
|---|---|
| P1 | 24 |
| P2 | 3 |
| P3 | 3 |

```plaintext
|                      P1                       | P2  | P3  |
0                                               24    27    30
```

Tiempos de espera: P1 = 0, P2 = 24, P3 = 27. Promedio: **(0 + 24 + 27) / 3 = 17**.

Pero si llegan en el orden P2, P3, P1:

```plaintext
| P2  | P3  |                      P1                       |
0     3     6                                               30
```

Espera: P1 = 6, P2 = 0, P3 = 3. Promedio: **3**. Los mismos procesos, casi seis veces mejor.

Es el **efecto convoy**: los procesos cortos quedan atrapados detrás de uno largo, como autos detrás de un camión en un camino de una sola pista.

### El trabajo más corto primero (SJF)

*Shortest Job First*: se elige el proceso cuya **próxima ráfaga** es la más corta. Tiene dos variantes:

- **No apropiativa:** una vez que un proceso tiene la CPU, termina su ráfaga.
- **Apropiativa**, también llamada **SRTF** (*Shortest Remaining Time First*): si llega un proceso con una ráfaga más corta que lo que **le queda** al que está corriendo, le quita la CPU.

| Proceso | Llegada | Ráfaga |
|---|---|---|
| P1 | 0 | 7 |
| P2 | 2 | 4 |
| P3 | 4 | 1 |
| P4 | 5 | 4 |

**SJF no apropiativo:**

```plaintext
|         P1         |P3 |    P2     |    P4     |
0                    7   8           12          16
```

Espera promedio: (0 + 6 + 3 + 7) / 4 = **4**.

**SJF apropiativo (SRTF):**

```plaintext
| P1  | P2  |P3 | P2  |    P4     |      P1      |
0     2     4   5     7           11             16
```

En el tiempo 2 llega P2, con 4 unidades, y a P1 le quedan 5: P2 le quita la CPU. En el 4 llega P3, con 1, y a P2 le quedan 2: P3 le quita la CPU. Espera promedio: (9 + 1 + 0 + 2) / 4 = **3**.

SJF es **óptimo**: ningún otro algoritmo logra un tiempo de espera promedio menor para un mismo conjunto de procesos. El problema es que exige **saber cuánto durará la próxima ráfaga**, y eso no se sabe. Solo se puede **estimar**, a partir de las ráfagas anteriores, con un **promedio exponencial**:

```plaintext
τ(n+1) = α · t(n) + (1 − α) · τ(n)
```

- `t(n)` es lo que realmente duró la última ráfaga.
- `τ(n)` es lo que se había estimado para ella.
- `α`, entre 0 y 1, dice cuánto pesa la historia reciente. Con `α = 0` se ignora lo que pasó; con `α = 1`, solo cuenta la última ráfaga. Es común usar `α = 0,5`.

### Por prioridad

Cada proceso tiene un **número de prioridad**, y la CPU se le da al de mayor prioridad (en muchos sistemas, un número **menor** significa prioridad **mayor**). Puede ser apropiativo o no. SJF es un caso particular: la prioridad es la duración estimada de la ráfaga.

La prioridad puede venir de adentro del sistema (memoria que usa, cuánto espera por E/S) o de afuera (lo importante que es el proceso para el usuario).

El gran problema es la **inanición** (*starvation*): un proceso de baja prioridad puede quedarse esperando **para siempre** si siempre llegan procesos más prioritarios. Cuenta la leyenda que al apagar un computador IBM del MIT en 1973 encontraron un proceso esperando desde 1967.

La solución es el **envejecimiento** (*aging*): subirle la prioridad a un proceso a medida que pasa tiempo esperando, hasta que le toque sí o sí.

### Turno circular (Round Robin)

Cada proceso recibe un pequeño trozo de tiempo, el **quantum** (`q`), típicamente entre 10 y 100 milisegundos. Si no termina en ese tiempo, el [temporizador](/archivo/sistemas-operativos/teoria/el-computador-por-dentro.md#proteccion-de-la-cpu) lo interrumpe y el proceso vuelve **al final** de la cola de listos. Es FCFS con apropiación por tiempo.

Con `n` procesos en la cola, cada uno recibe 1/n del tiempo de CPU, y ninguno espera más de `(n − 1) · q` para su próximo turno. Por eso da buenos **tiempos de respuesta**.

Con `q = 20` y cuatro procesos que llegan juntos:

| Proceso | Ráfaga |
|---|---|
| P1 | 53 |
| P2 | 17 |
| P3 | 68 |
| P4 | 24 |

```plaintext
|  P1  | P2  |  P3  |  P4  |  P1  |  P3  |P4 | P1 |   P3    |
0      20    37     57     77     97     117 121  134       162
```

(Al final, a P3 le tocan dos turnos seguidos porque ya no queda nadie más en la cola.)

El quantum lo es todo:

- **Si `q` es muy grande**, ningún proceso alcanza a ser interrumpido y Round Robin se vuelve FCFS.
- **Si `q` es muy chico**, el sistema pasa más tiempo haciendo cambios de contexto que ejecutando procesos. El quantum tiene que ser mucho mayor que lo que tarda un cambio de contexto.

Una regla práctica: que el 80 % de las ráfagas de CPU sean más cortas que el quantum.

Round Robin suele tener un tiempo de retorno promedio **peor** que SRTF, pero un tiempo de **respuesta** mucho mejor, que es lo que se nota en un sistema interactivo.

### Colas multinivel

La cola de listos se divide en **varias colas**, según el tipo de proceso, y cada una usa su propio algoritmo:

- **Primer plano** (procesos interactivos): Round Robin.
- **Segundo plano** (procesos por lotes): FCFS.

Y hay que planificar **entre** las colas:

- **Prioridad fija:** no se atiende la cola de segundo plano mientras haya algo en la de primer plano. Puede provocar inanición.
- **Porcentaje de tiempo:** por ejemplo, 80 % del tiempo de CPU para primer plano y 20 % para segundo plano.

```plaintext
 mayor prioridad   [ procesos del sistema          ]
                   [ procesos interactivos         ]
                   [ procesos de edición           ]
                   [ procesos por lotes            ]
 menor prioridad   [ procesos de estudiantes       ]
```

(Sí, el ejemplo clásico pone a los estudiantes al fondo.)

### Colas multinivel con realimentación

Igual que la anterior, pero los procesos **se pueden mover** entre colas. Un proceso que usa mucha CPU baja a una cola de menor prioridad; uno que espera mucho, sube (envejecimiento).

Un ejemplo con tres colas:

- **Q0:** Round Robin con quantum de 8 ms.
- **Q1:** Round Robin con quantum de 16 ms.
- **Q2:** FCFS.

Todo proceso nuevo entra a Q0. Si no termina en sus 8 ms, baja a Q1. Si tampoco termina en 16 ms más, baja a Q2. Q1 solo se atiende si Q0 está vacía, y Q2 si Q0 y Q1 lo están.

El efecto: los procesos con ráfagas cortas (los interactivos) terminan rápido en Q0 y se sienten ágiles, y los que calculan mucho se van al fondo sin molestar. Se define con varios parámetros: cuántas colas, qué algoritmo usa cada una, cuándo sube o baja un proceso, y en qué cola entra uno nuevo. Es el algoritmo más general, y el más difícil de ajustar.

## Simulador

Cambia los procesos (llegada y duración de la ráfaga), el algoritmo y el quantum, y ejecuta. El simulador dibuja el diagrama de Gantt y calcula los tiempos de espera, retorno y respuesta de cada proceso.

```php
<?php
declare(strict_types=1);

// Simulador de planificación de CPU
// Cambia los procesos, el algoritmo y el quantum, y vuelve a ejecutar.

$procesos = [
    // nombre => [llegada, duración de la ráfaga]
    'P1' => [0, 7],
    'P2' => [2, 4],
    'P3' => [4, 1],
    'P4' => [5, 4],
];

$algoritmo = 'SRTF';  // 'FCFS', 'SJF', 'SRTF' o 'RR'
$quantum = 2;         // solo se usa en RR

// ---------------------------------------------------------------------------

function planificar(array $procesos, string $algoritmo, int $quantum): array
{
    $restante = array_map(fn($p) => $p[1], $procesos);
    $tiempo = 0;
    $gantt = [];          // [nombre, inicio, fin]
    $cola = [];           // cola de listos (para RR)
    $llegaron = [];
    $actual = null;
    $usadoEnTurno = 0;

    $terminados = 0;
    while ($terminados < count($procesos)) {
        // Llegan los procesos de este instante, en orden
        foreach ($procesos as $nombre => [$llegada]) {
            if ($llegada === $tiempo && !isset($llegaron[$nombre])) {
                $llegaron[$nombre] = true;
                $cola[] = $nombre;
            }
        }

        // ¿Hay que elegir otro proceso?
        $listos = array_values(array_filter($cola, fn($n) => $restante[$n] > 0));
        $elegir = $actual === null
            || $restante[$actual] === 0
            || $algoritmo === 'SRTF'
            || ($algoritmo === 'RR' && $usadoEnTurno === $quantum);

        if ($elegir) {
            if ($algoritmo === 'RR' && $actual !== null && $restante[$actual] > 0) {
                // Se acabó su quantum: vuelve al final de la cola
                $cola = array_values(array_diff($cola, [$actual]));
                $cola[] = $actual;
                $listos = array_values(array_filter($cola, fn($n) => $restante[$n] > 0));
            }
            $actual = match ($algoritmo) {
                'FCFS', 'RR' => $listos[0] ?? null,
                'SJF', 'SRTF' => array_reduce($listos, fn($a, $n) =>
                    $a === null || $restante[$n] < $restante[$a] ? $n : $a),
            };
            $usadoEnTurno = 0;
        }

        // Ejecutar una unidad de tiempo ("--" si la CPU está ociosa)
        $quien = $actual ?? '--';
        $ultimo = array_key_last($gantt);
        if ($ultimo !== null && $gantt[$ultimo][0] === $quien && $gantt[$ultimo][2] === $tiempo) {
            $gantt[$ultimo][2]++;
        } else {
            $gantt[] = [$quien, $tiempo, $tiempo + 1];
        }
        if ($actual === null) {
            $tiempo++;
            continue;
        }
        $restante[$actual]--;
        $usadoEnTurno++;
        $tiempo++;

        if ($restante[$actual] === 0) {
            $terminados++;
            $cola = array_values(array_diff($cola, [$actual]));
        }
    }
    return $gantt;
}

$gantt = planificar($procesos, $algoritmo, $quantum);

// Diagrama de Gantt en texto, escalado para que quepa en unas 60 columnas
$total = end($gantt)[2];
$escala = min(3, 60 / $total);
$barra = '';
$marcas = '';
foreach ($gantt as [$nombre, $inicio, $fin]) {
    $ancho = max(strlen($nombre) + 2, (int) round(($fin - $inicio) * $escala));
    $barra .= '|' . str_pad($nombre, $ancho - 1, ' ', STR_PAD_BOTH);
    $marcas .= str_pad((string) $inicio, $ancho);
}
echo "Algoritmo: {$algoritmo}", $algoritmo === 'RR' ? " (quantum = {$quantum})" : '', PHP_EOL, PHP_EOL;
echo $barra, '|', PHP_EOL;
echo $marcas, end($gantt)[2], PHP_EOL, PHP_EOL;

// Tiempos por proceso
$totales = ['espera' => 0, 'retorno' => 0, 'respuesta' => 0];
printf("%-8s %8s %8s %10s\n", 'Proceso', 'Espera', 'Retorno', 'Respuesta');
foreach ($procesos as $nombre => [$llegada, $duracion]) {
    $tramos = array_filter($gantt, fn($t) => $t[0] === $nombre);
    $fin = max(array_column($tramos, 2));
    $primero = min(array_column($tramos, 1));
    $retorno = $fin - $llegada;
    $espera = $retorno - $duracion;
    $respuesta = $primero - $llegada;
    printf("%-8s %8d %8d %10d\n", $nombre, $espera, $retorno, $respuesta);
    $totales['espera'] += $espera;
    $totales['retorno'] += $retorno;
    $totales['respuesta'] += $respuesta;
}
$n = count($procesos);
printf("%-8s %8.2f %8.2f %10.2f\n", 'Promedio', $totales['espera'] / $n, $totales['retorno'] / $n, $totales['respuesta'] / $n);
```

Prueba a:

- cargar los tres procesos del ejemplo de FCFS (24, 3 y 3, todos llegando en 0) y cambiar su orden;
- comparar SJF con SRTF con los mismos procesos;
- usar Round Robin con quantum 1, 4 y 100, y mirar cómo cambian los tiempos de respuesta y de retorno.

## Varios procesadores

Con varios núcleos la planificación se complica:

- **Multiprocesamiento asimétrico:** un solo procesador toma todas las decisiones y los demás ejecutan. Es simple, pero ese procesador se vuelve un cuello de botella.
- **Multiprocesamiento simétrico (SMP):** cada procesador se planifica a sí mismo. Es lo que hacen todos los sistemas actuales.

Dos ideas nuevas aparecen:

- **Afinidad:** conviene que un proceso siga corriendo en el **mismo** núcleo, porque la [caché](/archivo/sistemas-operativos/teoria/el-computador-por-dentro.md#cache-tener-a-mano-lo-que-se-va-a-usar) de ese núcleo ya tiene sus datos. Moverlo a otro obliga a llenarla de nuevo.
- **Balanceo de carga:** tampoco conviene que un núcleo esté saturado mientras otro está ocioso. De vez en cuando, el sistema mueve procesos de uno a otro.

Las dos ideas tiran para lados opuestos, y el planificador busca un equilibrio. En los procesadores con núcleos de alto rendimiento y de bajo consumo, además, tiene que decidir qué tipo de núcleo le conviene a cada proceso.

## Tiempo real

- En los sistemas de [tiempo real **duro**](/archivo/sistemas-operativos/teoria/que-es-un-sistema-operativo.md#de-tiempo-real), una tarea crítica tiene que completarse dentro de un plazo, siempre. El planificador tiene que poder garantizarlo, o rechazar la tarea.
- En los de tiempo real **blando**, basta con que los procesos críticos tengan prioridad sobre los demás.

En ambos, la **latencia de despacho** tiene que ser mínima: si un proceso urgente queda listo, no puede esperar a que el kernel termine algo largo. Por eso el kernel mismo tiene que poder ser interrumpido.

## En Linux

Linux planifica **hilos**, no procesos, y tiene varias políticas:

| Política | Para qué |
|---|---|
| `SCHED_OTHER` | La normal, para casi todo |
| `SCHED_BATCH` e `SCHED_IDLE` | Trabajos de fondo, que pueden esperar |
| `SCHED_FIFO` y `SCHED_RR` | Tiempo real: prioridades fijas de 1 a 99, FCFS o Round Robin |
| `SCHED_DEADLINE` | Tiempo real con plazos: el que tiene el plazo más cercano va primero |

La política normal busca ser **justa**: cada hilo recibe una porción del tiempo de CPU proporcional a su peso. Desde 2007 lo hacía el planificador CFS (*Completely Fair Scheduler*), y desde 2023 (Linux 6.6) lo hace **EEVDF**, que además da mejor latencia a los hilos que necesitan porciones cortas de CPU, como los interactivos.

El peso se controla con el valor **nice**, de −20 (más prioridad) a 19 (menos prioridad). "Nice" porque un proceso con nice alto es "amable" con los demás:

```bash
nice -n 10 ./compilar.sh       # ejecutar con menos prioridad
renice -n 5 -p 4312            # cambiar la de un proceso que ya corre
top                            # la columna NI muestra el nice
chrt -f 50 ./control           # ejecutar con SCHED_FIFO, prioridad 50 (necesita sudo)
taskset -c 0,1 ./programa      # ejecutar solo en los núcleos 0 y 1 (afinidad)
```

## Cómo se evalúa un algoritmo

Primero hay que definir **qué importa** (por ejemplo, "máxima utilización de CPU, con un tiempo de respuesta de a lo más 1 segundo"). Después se compara:

- **Modelo determinista:** tomar una carga fija y calcular a mano cómo se comporta cada algoritmo, como en los ejemplos de esta página. Es simple y exacto, pero solo vale para esa carga.
- **Modelos de colas:** describir matemáticamente cómo llegan los procesos y cuánto duran sus ráfagas, y calcular promedios.
- **Simulación:** programar un modelo del sistema y alimentarlo con datos reales o aleatorios, como el simulador de arriba, pero con miles de procesos.
- **Implementación:** programar el algoritmo en un sistema operativo real y medir. Es lo único completamente fiel, y lo más caro.

Más detalles en los capítulos de planificación de [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf).

## Ejercicios

Para estos ejercicios, usa estos procesos:

| Proceso | Llegada | Ráfaga |
|---|---|---|
| P1 | 0 | 6 |
| P2 | 1 | 3 |
| P3 | 2 | 1 |
| P4 | 3 | 7 |

<details>
<summary><span>Dibuja el diagrama de Gantt con FCFS y calcula el tiempo de espera promedio.</span></summary>

```plaintext
|       P1        |   P2   |P3 |         P4         |
0                 6        9   10                   17
```

Espera: P1 = 0, P2 = 6 − 1 = 5, P3 = 9 − 2 = 7, P4 = 10 − 3 = 7. Promedio: **4,75**.

</details>

<details>
<summary><span>Ahora con SJF no apropiativo.</span></summary>

En el tiempo 6, cuando P1 termina, están listos P2 (3), P3 (1) y P4 (7). Se elige P3, después P2 y al final P4.

```plaintext
|       P1        |P3 |   P2   |         P4         |
0                 6   7        10                   17
```

Espera: P1 = 0, P2 = 6, P3 = 4, P4 = 7. Promedio: **4,25**.

</details>

<details>
<summary><span>Ahora con SRTF (SJF apropiativo).</span></summary>

- En el tiempo 1 llega P2 (3) y a P1 le quedan 5: P2 le quita la CPU.
- En el 2 llega P3 (1) y a P2 le quedan 2: P3 le quita la CPU.
- En el 3 termina P3; llega P4 (7), a P2 le quedan 2 y a P1 le quedan 5: sigue P2.

```plaintext
|P1 |P2 |P3 | P2  |      P1      |         P4         |
0   1   2   3     5              10                   17
```

Espera: P1 = 10 − 0 − 6 = 4, P2 = 5 − 1 − 3 = 1, P3 = 0, P4 = 7. Promedio: **3**.

</details>

<details>
<summary><span>Ahora con Round Robin, quantum 4. ¿Qué algoritmo dio el mejor tiempo de respuesta promedio?</span></summary>

```plaintext
|    P1     |   P2   |P3 |    P4     | P1  |   P4   |
0           4        7   8           12    14       17
```

Espera: P1 = 8, P2 = 3, P3 = 5, P4 = 7. Promedio: **5,75**, el peor de los cuatro.

Tiempo de respuesta promedio (desde que llega hasta que empieza): FCFS 4,75; SJF 4,25; **SRTF 1,75**; Round Robin 3,25. Aquí SRTF gana en todo, pero porque **conoce** la duración de las ráfagas. Round Robin no necesita saberla, y aun así mejora bastante la respuesta frente a FCFS.

Puedes verificarlo todo en el simulador.

</details>

<details>
<summary><span>¿Por qué SJF es óptimo, y por qué casi no se puede usar tal cual?</span></summary>

Es óptimo porque atender primero a los procesos cortos reduce la espera de muchos a costa de aumentar un poco la de pocos: mover un proceso corto antes que uno largo baja la espera del corto más de lo que sube la del largo.

No se puede usar tal cual porque exige conocer la duración de la **próxima** ráfaga de CPU, y el sistema operativo no puede adivinar el futuro. Se usa en versiones que **estiman** esa duración a partir de las ráfagas anteriores.

</details>

<details>
<summary><span>Con α = 0,5 y una estimación inicial τ0 = 10, un proceso tiene ráfagas reales de 6, 4, 6 y 4. ¿Cómo evolucionan las estimaciones?</span></summary>

Con τ(n+1) = 0,5 · t(n) + 0,5 · τ(n):

- τ1 = 0,5 · 6 + 0,5 · 10 = **8**
- τ2 = 0,5 · 4 + 0,5 · 8 = **6**
- τ3 = 0,5 · 6 + 0,5 · 6 = **6**
- τ4 = 0,5 · 4 + 0,5 · 6 = **5**

La estimación parte lejos (10) y se va acercando a lo que el proceso realmente hace (ráfagas entre 4 y 6).

</details>

<details>
<summary><span>¿Qué es la inanición, en qué algoritmos puede ocurrir y cómo se evita?</span></summary>

Es cuando un proceso listo **nunca** llega a usar la CPU, porque siempre hay otro que el algoritmo prefiere. Puede ocurrir en la planificación **por prioridad**, en **SJF/SRTF** (un proceso largo, si siguen llegando cortos) y en las **colas multinivel** con prioridad fija.

Se evita con **envejecimiento**: aumentar la prioridad de un proceso a medida que espera. En las colas multinivel con realimentación, subiéndolo de cola.

</details>

<details>
<summary><span>En Round Robin, ¿qué pasa si el quantum es muy grande? ¿Y si es muy chico?</span></summary>

- **Muy grande:** los procesos terminan su ráfaga antes de que se acabe el quantum, nadie es interrumpido, y el algoritmo se comporta como **FCFS**, con su efecto convoy.
- **Muy chico:** los procesos se interrumpen constantemente y el sistema pasa gran parte del tiempo haciendo **cambios de contexto**, que no son trabajo útil. En el extremo, casi todo el tiempo de CPU se va en cambiar de proceso.

</details>

---

Sigue con **[Sincronización](/archivo/sistemas-operativos/teoria/sincronizacion.md)**.
