---
title: Redes en Linux
description: Cómo hacen los datos para llegar de un punto a otro
eleventyNavigation:
    order: 70
tags:
    - linux
    - redes
---
¿Cómo hacen los datos para llegar de tu computador a un servidor al otro lado del mundo? ¿Por qué el WiFi se corta justo cuando más lo necesitas? La segunda pregunta no tiene respuesta, pero la primera sí.

## Interfaces de red

Una **interfaz** es una conexión de red del equipo: una tarjeta cableada, una inalámbrica, o una virtual. Cada una tiene un nombre:

| Nombre | Qué es |
|---|---|
| `lo` | *Loopback*: una red interna del propio equipo, para hablar consigo mismo |
| `enp3s0`, `eno1` | Una tarjeta cableada (Ethernet) |
| `wlp2s0` | Una tarjeta inalámbrica (WiFi) |

Los nombres como `enp3s0` dependen de dónde está conectada la tarjeta en la placa, así no cambian de un arranque a otro.

```bash
ip link           # las interfaces y su estado
ip -brief addr    # las interfaces con sus direcciones, en forma resumida
```

{% alert 'Antes las interfaces cableadas se llamaban eth0, eth1, y las inalámbricas wlan0. El problema era que el orden podía cambiar al reiniciar. Los nombres actuales, basados en la ubicación del hardware, se adoptaron alrededor de 2014.', 'info', 'Nota histórica' %}

### La dirección MAC

Cada tarjeta de red trae de fábrica una **dirección MAC**: un identificador de 48 bits, escrito como seis pares de dígitos hexadecimales:

```plaintext
00:1a:2b:3c:4d:5e
```

La MAC identifica a la tarjeta dentro de la red local. Se ve con `ip link`, en la línea `link/ether`.

## Capas: el modelo TCP/IP

Enviar datos por una red involucra muchos problemas distintos: la señal eléctrica o de radio, llegar al equipo correcto, no perder pedazos, entender lo que llega. Para ordenarlo, se divide en **capas**, y cada una se apoya en la de abajo:

| Capa | Se preocupa de | Ejemplos |
|---|---|---|
| Aplicación | Qué significan los datos | HTTP, DNS, SSH, SMTP |
| Transporte | Que lleguen completos, al programa correcto | TCP, UDP |
| Internet | Llegar al equipo correcto, atravesando redes | IP |
| Acceso a la red | Transmitir en el medio físico | Ethernet, WiFi |

Los datos viajan en **paquetes**: pedazos con un **encabezado** (origen, destino, protocolo, etc.) y la **carga útil** con los datos en sí.

El **modelo OSI** describe lo mismo, pero en siete capas. Se usa mucho para enseñar y para hablar de redes ("es un problema de capa 2").

## Direcciones IPv4

Una **dirección IP** identifica a un equipo en una red. En IPv4 son 32 bits, que se escriben como cuatro números del 0 al 255:

```plaintext
193.146.85.34  =  11000001.10010010.01010101.00100010
```

Una dirección tiene dos partes: la de **red** (a qué red pertenece) y la de **equipo** (*host*, cuál es dentro de esa red). Dónde se corta entre una y otra lo dice el **prefijo**, que se escribe después de una barra:

```plaintext
192.168.1.25/24
```

`/24` significa que los primeros 24 bits son la red (`192.168.1`) y los 8 restantes identifican al equipo (`25`). Esto se llama notación **CIDR**.

### La máscara de red

La misma información se puede escribir como una **máscara**: 32 bits con unos en la parte de red y ceros en la de equipo.

| Prefijo | Máscara | Equipos posibles |
|---|---|---|
| `/8` | 255.0.0.0 | 16.777.214 |
| `/16` | 255.255.0.0 | 65.534 |
| `/24` | 255.255.255.0 | 254 |
| `/25` | 255.255.255.128 | 126 |
| `/26` | 255.255.255.192 | 62 |

¿Por qué 254 y no 256 en una `/24`? Porque en cada red hay dos direcciones reservadas:

- **Dirección de red:** todos los bits de equipo en 0 (`192.168.1.0`). Identifica a la red misma.
- **Broadcast:** todos en 1 (`192.168.1.255`). Un paquete enviado ahí les llega a todos los equipos de la red.

### Direcciones especiales

- **Privadas:** `10.0.0.0/8`, `172.16.0.0/12` y `192.168.0.0/16`. Se usan dentro de casas y empresas, y no circulan por internet. Muchas redes privadas pueden usar las mismas direcciones sin problema.
- **Loopback:** `127.0.0.0/8`, y en particular `127.0.0.1` (*localhost*): el propio equipo.

Tu computador casi seguro tiene una dirección privada. Para salir a internet, el router la traduce a su dirección **pública**, compartida por toda la red de la casa. Eso se llama **NAT**.

{% alert 'Hasta 1993 las direcciones se dividían en clases fijas: clase A (red de 8 bits, 1.0.0.0 a 127.255.255.255), clase B (16 bits, 128.0.0.0 a 191.255.255.255) y clase C (24 bits, 192.0.0.0 a 223.255.255.255). Era un sistema rígido que desperdiciaba direcciones, y CIDR lo reemplazó. Todavía se escucha hablar de redes clase C para referirse a una /24.', 'info', 'Nota histórica' %}

### IPv6

Las direcciones IPv4 se agotaron: 32 bits dan para unos 4.300 millones, y no alcanzan. **IPv6** usa 128 bits, escritos en hexadecimal (`2001:db8::1`), y ya convive con IPv4 en la mayoría de las redes. Si en `ip addr` ves direcciones que parten con `fe80::`, son IPv6 locales.

## Subredes

Una red se puede dividir en **subredes** más pequeñas, tomando bits de la parte de equipo para la parte de red. Sirve para ordenar (una subred por piso o por departamento), separar tráfico y aprovechar mejor las direcciones.

Cada bit que se toma **duplica** la cantidad de subredes y **reduce a la mitad** su tamaño. Por ejemplo, `192.168.0.0/24` dividida en dos queda:

| Subred | Máscara | Equipos | Broadcast |
|---|---|---|---|
| `192.168.0.0/25` | 255.255.255.128 | .1 a .126 | .127 |
| `192.168.0.128/25` | 255.255.255.128 | .129 a .254 | .255 |

Y en cuatro, con `/26` (máscara 255.255.255.192): `.0`, `.64`, `.128` y `.192`, cada una con 62 equipos.

Una forma rápida de calcular el último número de la máscara: **256 − (256 ÷ cantidad de subredes)**. Para cuatro subredes: 256 − 64 = **192**.

### ¿El destino está en mi red?

Para decidir a dónde mandar un paquete, el equipo hace un **AND** bit a bit entre la dirección de destino y **su propia** máscara. Si el resultado es su misma red, el destino es un vecino y se le envía directamente. Si no, el paquete va al **gateway**.

## Rutas y gateway

El **gateway** (o puerta de enlace) es el router que conecta tu red con las demás. Todo lo que no es para tu red local se le entrega a él, y él decide cómo seguir.

```bash
ip route
```

```plaintext
default via 192.168.1.1 dev wlp2s0
192.168.1.0/24 dev wlp2s0 proto kernel scope link src 192.168.1.25
```

Se lee así:

- "lo que sea para `192.168.1.0/24`, mándalo directo por `wlp2s0`";
- "todo lo demás (`default`), entrégaselo a `192.168.1.1`", el gateway.

## DNS: nombres en vez de números

Es mucho más fácil recordar `www.usm.cl` que una dirección IP. El **DNS** (*Domain Name System*) es el servicio que traduce nombres a direcciones:

1. Tu equipo pregunta a su servidor DNS: "¿cuál es la IP de `www.usm.cl`?".
2. El servidor responde (buscando en otros servidores DNS si no lo sabe).
3. Tu equipo se conecta a esa IP.

```bash
dig +short www.usm.cl     # la IP de un nombre
host www.usm.cl           # lo mismo, en otro formato
resolvectl status         # qué servidores DNS estás usando
```

Antes de preguntar al DNS, el sistema revisa `/etc/hosts`, donde se pueden fijar nombres a mano.

## ¿Qué necesita un equipo para conectarse?

Cuatro datos:

1. Su **dirección IP**.
2. La **máscara** (o prefijo).
3. El **gateway**.
4. Al menos un **servidor DNS**.

Casi siempre los entrega automáticamente un servidor **DHCP** (en una casa, el mismo router) al conectarse a la red. En los escritorios y en la mayoría de los servidores, la configuración la administra **NetworkManager**, que se maneja desde la interfaz gráfica o con `nmcli`.

## Herramientas

| Para | Comando |
|---|---|
| Ver interfaces y direcciones | `ip addr`, `ip -brief addr` |
| Ver la tabla de rutas | `ip route` |
| Probar si un equipo responde | `ping -c 4 1.1.1.1` |
| Ver por dónde pasan los paquetes | `traceroute www.usm.cl` o `tracepath www.usm.cl` |
| Resolver nombres | `dig`, `host` |
| Ver conexiones y puertos abiertos | `ss -tuln`, `sudo ss -tulpn` |
| Configurar la red | `nmcli` |
| Conectarse a otro equipo | `ssh usuario@equipo` |
| Copiar archivos a otro equipo | `scp`, `rsync` |
| Capturar tráfico | `sudo tcpdump -i wlp2s0` |

{% alert 'Durante años las herramientas de red fueron ifconfig (interfaces), route (rutas) y netstat (conexiones). Siguen existiendo en muchas distribuciones dentro del paquete net-tools, pero ya no se desarrollan: fueron reemplazadas por ip y ss.', 'info', 'Nota histórica' %}

La [página de configuración de red de la ArchWiki](https://wiki.archlinux.org/title/Network_configuration) es una muy buena referencia (en inglés).

## Ejercicios

<details>
<summary><span>¿Cómo obtienes la dirección MAC de tu interfaz de red?</span></summary>

```bash
ip link
```

Aparece en la línea `link/ether` de cada interfaz, por ejemplo `link/ether 00:1a:2b:3c:4d:5e`.

</details>

<details>
<summary><span>¿Por cuántos routers pasan los paquetes para llegar a <code>www.usm.cl</code>?</span></summary>

```bash
traceroute www.usm.cl
```

Cada línea de la salida es un router (un "salto") en el camino. Si `traceroute` no está instalado, `tracepath www.usm.cl` hace algo similar sin necesitar permisos especiales. Algunos routers no responden y aparecen como `* * *`.

</details>

<details>
<summary><span>¿Qué conexiones de red tiene establecidas tu computador en este momento?</span></summary>

```bash
ss -t state established
```

Muestra las conexiones TCP establecidas, con la dirección y el puerto local y remoto de cada una.

</details>

<details>
<summary><span>¿Qué puertos tiene abiertos tu equipo, y qué programas los atienden?</span></summary>

```bash
sudo ss -tulpn
```

- `-t` y `-u`: conexiones TCP y UDP.
- `-l`: solo los que están escuchando (esperando conexiones).
- `-p`: el proceso que atiende cada uno (por eso `sudo`, para ver los de todos los usuarios).
- `-n`: números en vez de nombres.

</details>

<details>
<summary><span>¿Cuál es la dirección IP de <code>www.usm.cl</code>? ¿Y la de tu computador? ¿Qué diferencias encuentras?</span></summary>

```bash
dig +short www.usm.cl
ip -brief addr
```

La de `www.usm.cl` es una dirección **pública**, alcanzable desde cualquier parte de internet (y un sitio grande puede tener varias).

La de tu computador probablemente es **privada** (`192.168.x.x`, `10.x.x.x` o `172.16.x.x` a `172.31.x.x`): solo tiene sentido dentro de tu red local. Hacia internet, sales con la dirección pública de tu router, gracias a NAT. Además, verás `127.0.0.1` en la interfaz `lo`, que es el propio equipo.

</details>

<details>
<summary><span>Muestra en pantalla la información de la interfaz <em>loopback</em>.</span></summary>

```bash
ip addr show lo
```

Tiene la dirección `127.0.0.1/8` (y `::1/128` en IPv6). Es la red interna del equipo: lo que se envía ahí nunca sale a la red.

</details>

<details>
<summary><span>¿Cómo copias un archivo desde tu cuenta a una cuenta en otro computador?</span></summary>

Con `scp`, que copia a través de SSH:

```bash
scp informe.pdf ana@servidor.ejemplo.cl:/home/ana/documentos/
```

Para copiar directorios completos, o sincronizar copiando solo lo que cambió, [`rsync`](https://rsync.samba.org) es mejor:

```bash
rsync -av proyecto/ ana@servidor.ejemplo.cl:/home/ana/proyecto/
```

</details>

<details>
<summary><span>¿Qué máscara necesitas para dividir <code>192.168.0.0/24</code> en 4 subredes? ¿Cuáles son?</span></summary>

Para 4 subredes se toman 2 bits (2² = 4), así que el prefijo pasa de `/24` a `/26`. La máscara es **255.255.255.192** (256 − 256 ÷ 4 = 192).

| Subred | Equipos | Broadcast |
|---|---|---|
| `192.168.0.0/26` | .1 a .62 | .63 |
| `192.168.0.64/26` | .65 a .126 | .127 |
| `192.168.0.128/26` | .129 a .190 | .191 |
| `192.168.0.192/26` | .193 a .254 | .255 |

</details>

<details>
<summary><span>El equipo A (<code>192.168.0.25</code>, máscara <code>255.255.255.128</code>) quiere enviar un paquete al equipo B (<code>192.168.0.160</code>). ¿Lo envía directo o al gateway?</span></summary>

A hace un AND entre la dirección de B y **su propia** máscara:

```plaintext
192.168.0.160  AND  255.255.255.128  =  192.168.0.128
```

Y lo compara con su propia red:

```plaintext
192.168.0.25   AND  255.255.255.128  =  192.168.0.0
```

No coinciden: B está en otra subred (`192.168.0.128/25`). Así que A **no puede entregarlo directo**, y se lo manda a su **gateway**, el router que conecta ambas subredes.

</details>

<details>
<summary><span>Para el equipo <code>200.1.19.66/24</code>, ¿cuál es la dirección de red y cuál la de broadcast?</span></summary>

Con `/24`, los tres primeros números son la red:

- **Dirección de red:** `200.1.19.0`.
- **Broadcast:** `200.1.19.255`.
- **Equipos posibles:** de `200.1.19.1` a `200.1.19.254`.

</details>

---

Sigue con **[Repaso](/archivo/sistemas-operativos/linux/repaso.md)**.
