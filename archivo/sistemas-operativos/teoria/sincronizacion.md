---
title: Sincronización
description: Cuando dos procesos tocan lo mismo al mismo tiempo
eleventyNavigation:
    order: 60
tags:
    - sistemas-operativos
    - concurrencia
---
En [Procesos](/archivo/sistemas-operativos/teoria/procesos.md#hilos) vimos que los hilos comparten memoria, y que eso es a la vez su gran ventaja y su gran riesgo. Este tema es sobre el riesgo: qué pasa cuando varios procesos o hilos modifican los mismos datos, y cómo evitar que se pisen.

## El problema: condiciones de carrera

Dos hilos ejecutan `contador++` sobre la misma variable, que vale 5. Uno esperaría que termine en 7. Pero `contador++` **no es una sola instrucción** para el procesador; son tres:

1. **Leer** el valor de `contador` a un registro.
2. **Sumar** 1 al registro.
3. **Escribir** el registro de vuelta en `contador`.

Y el planificador puede quitarle la CPU a un hilo **entre cualquiera de esos pasos**. Si los pasos de los dos hilos se intercalan de mala manera, uno pisa el resultado del otro.

Esta simulación ejecuta los pasos de los hilos A y B en el orden que diga `$turnos`. Ejecútala tal cual, después cambia el orden de los turnos, y después activa el mutex:

```php
<?php
declare(strict_types=1);

// Condición de carrera: dos procesos hacen contador++ una vez cada uno.
// contador++ no es una sola instrucción: son tres pasos (leer, sumar, escribir).
// $turnos dice a quién le toca ejecutar su siguiente paso.

$usarMutex = false;
$turnos = ['A', 'B', 'A', 'B', 'A', 'B'];   // prueba ['A', 'A', 'A', 'B', 'B', 'B']

// ---------------------------------------------------------------------------

$contador = 5;
$pasos = $usarMutex
    ? ['tomar el mutex', 'leer', 'sumar', 'escribir', 'soltar el mutex']
    : ['leer', 'sumar', 'escribir'];

$estado = [
    'A' => ['paso' => 0, 'registro' => null],
    'B' => ['paso' => 0, 'registro' => null],
];
$mutexDe = null;   // quién tiene el mutex

echo "contador parte en {$contador}", PHP_EOL, PHP_EOL;

$i = 0;
// Si se acaban los turnos, se siguen alternando hasta que ambos terminen
while ($estado['A']['paso'] < count($pasos) || $estado['B']['paso'] < count($pasos)) {
    $quien = $turnos[$i] ?? ($i % 2 === 0 ? 'A' : 'B');
    $i++;
    $p = &$estado[$quien];

    if ($p['paso'] === count($pasos)) {
        unset($p);
        continue;   // ya terminó
    }

    $accion = $pasos[$p['paso']];
    switch ($accion) {
        case 'tomar el mutex':
            if ($mutexDe !== null) {
                echo "{$quien}: quiere el mutex, pero lo tiene {$mutexDe}: espera", PHP_EOL;
                unset($p);
                continue 2;
            }
            $mutexDe = $quien;
            echo "{$quien}: toma el mutex", PHP_EOL;
            break;
        case 'leer':
            $p['registro'] = $contador;
            echo "{$quien}: lee contador = {$contador}", PHP_EOL;
            break;
        case 'sumar':
            $p['registro']++;
            echo "{$quien}: suma 1 en su registro, queda {$p['registro']}", PHP_EOL;
            break;
        case 'escribir':
            $contador = $p['registro'];
            echo "{$quien}: escribe contador = {$contador}", PHP_EOL;
            break;
        case 'soltar el mutex':
            $mutexDe = null;
            echo "{$quien}: suelta el mutex", PHP_EOL;
            break;
    }
    $p['paso']++;
    unset($p);
}

echo PHP_EOL, "contador termina en {$contador} (debería ser 7)", PHP_EOL;
```

Con los turnos alternados, los dos hilos leen 5, los dos calculan 6 y los dos escriben 6: **se perdió una actualización**. Con `['A', 'A', 'A', 'B', 'B', 'B']` el resultado es correcto, porque cada hilo hizo sus tres pasos sin interrupción.

Esto es una **condición de carrera** (*race condition*): el resultado depende del orden exacto en que se intercalan los hilos. Y lo peor es que ese orden cambia en cada ejecución. El programa puede funcionar bien miles de veces y fallar justo en producción. Por eso la [programación concurrente](/ramos/programacion-avanzada/unidades/03-concurrencia-y-asincronia/index.md) tiene fama de difícil.

## La sección crítica

La parte del código que accede a los datos compartidos se llama **sección crítica**. El problema de la sección crítica es diseñar una forma de que, **si un proceso está en su sección crítica, ningún otro esté en la suya**.

Cada proceso sigue esta estructura:

```plaintext
repetir
    sección de entrada       <- pide permiso para entrar
    sección crítica          <- usa los datos compartidos
    sección de salida        <- avisa que salió
    sección restante         <- todo lo demás
```

Una solución correcta tiene que cumplir **tres requisitos**:

1. **Exclusión mutua:** si un proceso está en su sección crítica, ningún otro puede estar en la suya.
2. **Progreso:** si nadie está en la sección crítica y alguien quiere entrar, la decisión de quién entra no se puede postergar para siempre. Y solo participan de esa decisión los que quieren entrar.
3. **Espera limitada:** hay un límite de cuántas veces pueden entrar otros antes de que le toque a un proceso que ya pidió entrar. Nadie espera indefinidamente.

Y no se puede suponer nada sobre la velocidad relativa de los procesos: la solución tiene que funcionar con cualquier intercalación.

## Soluciones por software

### Para dos procesos

Las diapositivas recorren tres intentos para dos procesos, P0 y P1:

- **Algoritmo 1: una variable `turno`.** Solo entra el proceso cuyo turno es. Garantiza exclusión mutua, pero **no progreso**: si es el turno de P0 y P0 no quiere entrar, P1 queda esperando igual.
- **Algoritmo 2: un arreglo `quiere[2]`.** Cada proceso marca que quiere entrar y espera a que el otro no quiera. Garantiza exclusión mutua, pero si ambos marcan al mismo tiempo, **se quedan esperándose para siempre**.
- **Algoritmo 3: combinar ambos.** Es el **algoritmo de Peterson** (1981), y cumple los tres requisitos:

```plaintext
// Variables compartidas
quiere[2] = { falso, falso }
turno     = 0

// Proceso i (el otro es j = 1 - i)
repetir
    quiere[i] = verdadero
    turno = j                              // cede el turno al otro
    mientras quiere[j] y turno == j:
        no hacer nada                      // espera
    sección crítica
    quiere[i] = falso
    sección restante
```

Si los dos quieren entrar al mismo tiempo, ambos ceden el turno, pero `turno` solo puede quedar con un valor: entra aquel a quien el otro le cedió el turno al final.

Peterson es elegante, pero tiene dos problemas prácticos: solo sirve para **dos** procesos, y en procesadores y compiladores modernos, que pueden reordenar lecturas y escrituras de memoria, **no funciona de forma confiable** sin ayuda del hardware.

### Para N procesos: el algoritmo de la panadería

Leslie Lamport lo propuso inspirándose en las panaderías (o las farmacias) donde se saca un número. Antes de entrar a la sección crítica, cada proceso **toma un número**, mayor que todos los que ve en uso. Entra el que tenga el número más bajo. Si dos procesos sacan el mismo número, entra el que tenga el identificador menor. Los números siempre crecen: 1, 2, 3, 3, 3, 4, 5...

## Ayuda del hardware

Las soluciones por software son complicadas y lentas. Con ayuda del hardware se puede hacer mejor.

### Deshabilitar las interrupciones

Si no hay interrupciones, no hay cambio de contexto, y nadie puede interrumpir la sección crítica. Pero es **peligroso** (si el proceso nunca vuelve a habilitarlas, el sistema se congela), solo se puede hacer en modo kernel, y **no sirve con varios núcleos**: otro núcleo puede estar ejecutando la sección crítica al mismo tiempo.

### Instrucciones atómicas

La solución real es que el procesador ofrezca instrucciones que **leen y modifican una posición de memoria en un solo paso indivisible** (*atómico*). Si dos núcleos la ejecutan a la vez, el hardware garantiza que ocurren una después de la otra.

La clásica es **test-and-set**: devuelve el valor anterior de una variable y la deja en verdadero.

```plaintext
función test_and_set(variable):     // todo esto ocurre de una vez
    anterior = variable
    variable = verdadero
    devolver anterior
```

Con ella, la exclusión mutua es trivial:

```plaintext
cerrojo = falso                     // compartido

repetir
    mientras test_and_set(cerrojo):
        no hacer nada               // alguien está adentro: esperar
    sección crítica
    cerrojo = falso
    sección restante
```

Los procesadores actuales ofrecen **compare-and-swap** (CAS): "si la variable vale X, cámbiala a Y, y dime si lo hiciste", también de forma atómica. Con ella se construyen desde cerrojos hasta estructuras de datos concurrentes sin cerrojos.

Estas soluciones hacen **espera activa** (*busy waiting*): el proceso que espera gira en un ciclo gastando CPU. Un cerrojo que espera así se llama **spinlock**. Tiene sentido solo cuando la espera es muy corta (menos que lo que costaría un cambio de contexto) y hay varios núcleos. Linux los usa mucho por dentro del kernel.

## Semáforos

Edsger Dijkstra propuso en 1965 una herramienta más cómoda: el **semáforo**. Es una variable entera `S` a la que solo se accede con dos operaciones atómicas:

- **`wait(S)`** (también `P`, `down` o `adquirir`): si `S` es mayor que 0, la decrementa y sigue; si no, **espera** hasta que lo sea.
- **`signal(S)`** (también `V`, `up` o `liberar`): incrementa `S`, y si alguien estaba esperando, lo despierta.

Hay dos tipos:

- **Semáforo contador:** puede tomar cualquier valor. Sirve para controlar el acceso a un recurso con varias unidades: un semáforo que parte en 3 deja pasar a 3 procesos a la vez.
- **Semáforo binario:** solo vale 0 o 1. Se le llama también **mutex** (de *mutual exclusion*). Un semáforo contador se puede construir con semáforos binarios.

### Para la exclusión mutua

```plaintext
mutex = 1                           // compartido

repetir
    wait(mutex)
    sección crítica
    signal(mutex)
    sección restante
```

El primer proceso encuentra `mutex = 1`, lo deja en 0 y entra. Los que llegan después lo encuentran en 0 y esperan. Al salir, `signal` lo vuelve a 1 y despierta a uno. Es lo que hace la simulación de arriba con `$usarMutex = true`.

### Para ordenar la ejecución

Los semáforos también sirven para **coordinar**. Si la instrucción S1 del proceso P1 solo debe ejecutarse **después** de la instrucción S2 de P2:

```plaintext
s = 0                               // compartido

// P1                               // P2
wait(s)                             S2
S1                                  signal(s)
```

Si P1 llega primero, se queda esperando en `wait(s)` hasta que P2 ejecute S2 y haga `signal(s)`.

### Espera activa o bloqueo

La definición de arriba no dice **cómo** espera `wait`. Hay dos formas:

- **Espera activa:** girar en un ciclo preguntando. Es un spinlock, con los problemas ya vistos.
- **Bloqueo:** cada semáforo tiene una **cola** de procesos esperando. `wait` pone al proceso en la cola y lo pasa a estado de [espera](/archivo/sistemas-operativos/teoria/procesos.md#estados-de-un-proceso), sin gastar CPU; `signal` saca a uno de la cola y lo pasa a listo. Es lo normal.

### Cómo se puede usar mal

Los semáforos son poderosos, pero fáciles de usar mal:

- **Olvidar un `signal`:** el recurso queda tomado para siempre y todos los demás esperan eternamente.
- **Invertir el orden** (`signal` antes de `wait`): se rompe la exclusión mutua.
- **Interbloqueo:** P0 hace `wait(A)` y luego `wait(B)`, mientras P1 hace `wait(B)` y luego `wait(A)`. Si cada uno alcanza a tomar el primero, ambos esperan el segundo **para siempre**. Tiene su propio tema: [Interbloqueos](/archivo/sistemas-operativos/teoria/interbloqueos.md).
- **Inanición:** si la cola del semáforo no es justa (por ejemplo, no es FIFO), un proceso puede no ser despertado nunca.

## Problemas clásicos

Son problemas "de juguete" que resumen situaciones reales, y que se usan para probar cualquier mecanismo de sincronización nuevo.

### Productor y consumidor (búfer limitado)

Unos procesos producen datos y otros los consumen, a través de un búfer de capacidad fija. El productor debe esperar si el búfer está lleno, y el consumidor si está vacío. Lo simulamos en [Procesos](/archivo/sistemas-operativos/teoria/procesos.md#productor-y-consumidor-simulado). Con semáforos se resuelve con tres: un `mutex` para el búfer, un semáforo `vacíos` (parte en la capacidad) y uno `llenos` (parte en 0).

### Lectores y escritores

Un dato compartido (una base de datos, un archivo) lo usan **lectores**, que solo leen, y **escritores**, que lo modifican. Muchos lectores pueden leer a la vez sin problema, pero un escritor necesita acceso **exclusivo**: nadie más puede leer ni escribir mientras tanto.

La dificultad está en las prioridades. Si se prioriza a los lectores, un escritor puede esperar para siempre mientras sigan llegando lectores. Si se prioriza a los escritores, pasa lo mismo al revés. Existen cerrojos específicos para esto: los **cerrojos de lectura y escritura** (*read-write locks*).

### Los filósofos comensales

Cinco filósofos se sientan alrededor de una mesa redonda. Solo hacen dos cosas: pensar y comer. Entre cada par de filósofos hay **un** tenedor, y para comer se necesitan **los dos** tenedores que tiene al lado.

```plaintext
            F1
        T1      T2
     F5            F2
       T5        T3
         F4   T4   F3
```

La solución ingenua es representar cada tenedor con un semáforo, y que cada filósofo tome primero el tenedor de su izquierda y después el de su derecha. Garantiza que dos filósofos no usen el mismo tenedor... pero si **los cinco** toman su tenedor izquierdo al mismo tiempo, todos se quedan esperando el derecho, que tiene el vecino. **Interbloqueo**: nadie come nunca.

Algunas soluciones:

- Que **como máximo cuatro** filósofos puedan intentar comer a la vez.
- Que un filósofo tome los tenedores **solo si ambos están libres**, en una misma sección crítica.
- Que los filósofos impares tomen primero el izquierdo y los pares primero el derecho, lo que rompe la simetría.

Ojo: evitar el interbloqueo no garantiza evitar la **inanición**. Un filósofo puede tener tan mala suerte que sus vecinos siempre coman justo cuando él quiere.

### El barbero dormilón

Una barbería tiene un barbero, una silla para cortar y *n* sillas de espera. Si no hay clientes, el barbero se duerme. Cuando llega un cliente: si el barbero duerme, lo despierta; si está ocupado y hay sillas libres, se sienta a esperar; si no hay sillas, se va. Modela, por ejemplo, un servidor con un número limitado de conexiones en espera.

## Monitores

Los semáforos se usan mal con facilidad porque cada `wait` y `signal` está repartido por el código. Un **monitor** es una construcción de más alto nivel, propia del lenguaje de programación: un objeto que agrupa los datos compartidos con las funciones que los usan, y garantiza que **solo un proceso a la vez** ejecuta alguna de sus funciones. La exclusión mutua la pone el lenguaje, no el programador.

Para que un proceso pueda esperar **dentro** del monitor a que se cumpla una condición (por ejemplo, que el búfer tenga espacio), existen las **variables de condición**, con dos operaciones:

- `x.wait()`: el proceso se suspende y **suelta el monitor**, para que otros puedan entrar.
- `x.signal()`: despierta a **un** proceso que estaba esperando en `x`. Si no hay ninguno, no pasa nada (a diferencia de un semáforo, que "recuerda" las señales).

Hoy los monitores están en casi todos los lenguajes:

- Java los tiene integrados: métodos `synchronized`, con `wait()` y `notify()`.
- En C, POSIX ofrece `pthread_mutex` y `pthread_cond`, con los que se arma lo mismo a mano.
- Python y otros lenguajes tienen `Lock` y `Condition`.

(Las diapositivas antiguas mencionan también las **regiones críticas**, una construcción anterior que protegía una variable compartida dentro de un bloque `region v when B do`. Su idea sobrevive en los monitores y en los bloques `synchronized`.)

## Transacciones atómicas

Las bases de datos resolvieron hace mucho un problema parecido: un conjunto de operaciones que tienen que ocurrir **todas o ninguna**. Transferir dinero implica restar de una cuenta y sumar a otra; si el sistema se cae entre ambas cosas, el dinero no puede desaparecer.

Una **transacción** es un conjunto de operaciones que termina con:

- **commit** (confirmar): todas las operaciones quedan hechas;
- **rollback** o **abort** (descartar): se deshacen todas, como si nunca hubieran ocurrido.

Para poder deshacer o rehacer después de una caída, el sistema anota cada operación en un **registro** (*log*) **antes** de hacerla. Periódicamente marca **puntos de control** (*checkpoints*), para no tener que revisar el registro completo desde el principio al recuperarse. Y para aprovechar el tiempo, ejecuta varias transacciones a la vez, cuidando que el resultado sea el mismo que si hubieran ocurrido una tras otra (**serializabilidad**).

Los sistemas operativos tomaron prestada esta idea: es el [journaling](/archivo/sistemas-operativos/linux/sistema-de-archivos.md#sistemas-de-archivos) de los sistemas de archivos.

## En la práctica

- En **Linux**, los mutex de los programas se implementan con **futex** (*fast userspace mutex*): si nadie compite por el cerrojo, se toma y se suelta sin siquiera hacer una llamada al sistema, y solo si hay competencia se bloquea al hilo en el kernel.
- Los lenguajes ofrecen **operaciones atómicas** para los casos simples, como incrementar un contador compartido, basadas en compare-and-swap.
- La regla de oro: **compartir lo menos posible.** Pasar mensajes entre hilos, en vez de compartir memoria, evita la mayoría de estos problemas.

Más detalles en los capítulos de concurrencia de [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf).

## Ejercicios

<details>
<summary><span>¿Por qué <code>contador++</code> puede dar un resultado incorrecto si lo ejecutan dos hilos a la vez?</span></summary>

Porque no es una operación atómica: son tres pasos (leer, sumar, escribir), y el planificador puede cambiar de hilo entre cualquiera de ellos. Si ambos hilos leen el valor antes de que alguno escriba, ambos calculan el mismo resultado y uno de los incrementos se pierde.

</details>

<details>
<summary><span>¿Cuáles son los tres requisitos de una solución al problema de la sección crítica?</span></summary>

1. **Exclusión mutua:** nunca hay dos procesos en su sección crítica al mismo tiempo.
2. **Progreso:** si nadie está en la sección crítica y alguien quiere entrar, la decisión no se posterga indefinidamente.
3. **Espera limitada:** un proceso que pidió entrar no espera para siempre; hay un límite de cuántos pueden pasar antes que él.

</details>

<details>
<summary><span>¿Por qué deshabilitar las interrupciones no es una buena solución en un computador con varios núcleos?</span></summary>

Porque deshabilitar las interrupciones en un núcleo solo evita que **ese** núcleo cambie de proceso. Los demás núcleos siguen ejecutando, y cualquiera de ellos puede entrar a la misma sección crítica al mismo tiempo. Además, es peligroso: un proceso que no las vuelve a habilitar congela el sistema.

</details>

<details>
<summary><span>¿Qué es la espera activa? ¿Cuándo tiene sentido?</span></summary>

Es esperar girando en un ciclo que pregunta una y otra vez si ya se puede entrar, gastando CPU sin hacer nada útil.

Tiene sentido solo cuando la espera va a ser **muy corta** (más corta que lo que cuesta bloquear al proceso y hacer un cambio de contexto) y hay **varios núcleos**, de modo que el que tiene el cerrojo lo está usando en otro núcleo. Así funcionan los spinlocks dentro del kernel. En un solo núcleo, esperar activamente no tiene sentido: el que tiene el cerrojo no puede avanzar mientras el que espera usa la CPU.

</details>

<details>
<summary><span>Un estacionamiento tiene 3 lugares. ¿Cómo lo modelas con un semáforo?</span></summary>

Con un **semáforo contador** que parte en 3:

```plaintext
lugares = 3

// Cada auto
wait(lugares)        // si quedan lugares, toma uno; si no, espera
estacionarse
signal(lugares)      // deja el lugar libre y despierta a uno que espera
```

Los tres primeros autos entran; el cuarto espera en `wait` hasta que alguno salga.

</details>

<details>
<summary><span>En los filósofos comensales, ¿por qué la solución ingenua puede producir un interbloqueo?</span></summary>

Porque cada filósofo **toma un tenedor y espera el otro**. Si los cinco toman su tenedor izquierdo al mismo tiempo, cada uno espera el derecho, que lo tiene su vecino, que a su vez espera el suyo. Se forma una **espera circular** y nadie puede avanzar. Es exactamente la situación que se estudia en [Interbloqueos](/archivo/sistemas-operativos/teoria/interbloqueos.md).

</details>

<details>
<summary><span>¿Qué diferencia hay entre <code>signal</code> en un semáforo y <code>signal</code> en una variable de condición?</span></summary>

- En un **semáforo**, `signal` **incrementa el contador**. Si nadie estaba esperando, el valor queda guardado y el próximo `wait` pasa de largo: la señal no se pierde.
- En una **variable de condición**, `signal` solo despierta a un proceso **si hay alguno esperando**. Si no hay nadie, la señal se pierde, y un `wait` posterior se quedará esperando.

</details>

<details>
<summary><span>¿Qué garantiza una transacción atómica, y cómo se recupera el sistema después de una caída?</span></summary>

Garantiza que **todas** sus operaciones ocurren, o **ninguna**: termina con un commit, que las confirma, o con un rollback, que las deshace.

Para recuperarse, el sistema escribe cada operación en un **registro** antes de hacerla. Después de una caída, revisa el registro desde el último **punto de control**: rehace las transacciones que alcanzaron a confirmarse y deshace las que quedaron a medias.

</details>

---

Sigue con **[Interbloqueos](/archivo/sistemas-operativos/teoria/interbloqueos.md)**.
