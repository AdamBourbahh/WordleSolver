# WordleSolver

Este proyecto nace como una implementación de resolución de Wordle basada en lógica, filtrado de candidatos y optimización por entropía. La idea central es la estrategia: elegir la palabra que maximiza la información que nos ayuda a reducir rápidamente el conjunto de soluciones posibles.

>La parte de lógica y algoritmo ha sido desarrollada por mí. La web, en cambio, es una implementación vibecoded: útil, y bastante funcional, pero no la base técnica ni la parte más importante del proyecto desde el punto de vista del razonamiento lógico.

## 1. Lógica del proyecto

La clave del proyecto es tratar cada intento como una reducción del espacio de soluciones.

Para cada palabra candidata, el programa:

- evalúa el patrón de acierto frente a una solución hipotética
- clasifica cada letra como gris, amarillo o verde
- descarta las palabras que no cumplen ese patrón
- calcula cuánta información aporta cada posible palabra
- recomienda la siguiente palabra con mayor entropía esperada

Esto convierte al problema en una búsqueda informativa: no se prueba cualquier palabra, sino la que más reduce la incertidumbre.

### Funciones clave de la lógica

En la parte del motor se encuentran elementos esenciales como:

- `evaluar_intento`: compara una palabra candidata con una solución y devuelve el patrón Wordle
- `codificar_intento`: transforma el patrón a una representación compacta para operar internamente
- filtrado de soluciones: elimina candidatos incompatibles con el patrón observado
- cálculo de entropía: mide cuánta información aporta cada posible palabra
- elección del mejor guess: selecciona la palabra con mayor valor informativo

Estas funciones están diseñadas para trabajar con listas grandes de palabras y reducir el conjunto repetidamente hasta llegar a la solución o a un conjunto mínimo de candidatos.

## 2. Estructura del proyecto

El repositorio está organizado de forma clara para separar la parte algorítmica de la parte visual:

- `Source/`: implementación principal del solver en C++
- `Header/`: declaraciones de clases y funciones de la lógica
- `wasm/`: bindings y capa de integración WebAssembly
- `solver-worker.js`: puente entre la UI y la lógica del motor
- `app.js`: comportamiento de la capa web y flujo de estado de la partida
- `index.html`: estructura de la interfaz
- `styles.css`: diseño y visualización de la aplicación
- `data/`: diccionarios con palabras válidas y soluciones posibles
- `notebook/`: documentación, experimentación y explicación del proyecto

## 3. Documentación y explicación

La documentación del proyecto está en la carpeta `notebook/`.

Allí se recoge la parte conceptual y explicativa del desarrollo:

- estructura del proyecto
- evolución de la lógica
- experimentación con distintos enfoques
- análisis de entropía y criterio de decisión
- descomposición de la solución paso a paso

Es importante tener en cuenta que `notebook/` no es “extra”; es la parte de explicación y entendimiento del proyecto, donde queda documentado el razonamiento detrás de la implementación.

## 4. Cómo se compone la solución

La solución se puede entender en dos capas:

### Capa lógica / algoritmo

Es la parte más importante del proyecto. Aquí está la verdadera inteligencia del solver:

- evaluación de patrones
- reducción del espacio de candidatos
- cálculo de entropía
- selección de la mejor palabra
- implementación optimizada para funcionar en C++ y WebAssembly

### Capa web / interfaz

La web es una capa de interacción y visualización. Sirve para:

- mostrar las palabras sugeridas
- permitir introducir el feedback del juego
- representar visualmente cada intento
- mostrar el número de candidatos restantes
- ofrecer un entorno amigable para usar el solver

> Esta capa es vibecoded: útil, visual y funcional, pero no es la parte nuclear del proyecto ni la que aporta la lógica de resolución.

## 5. Flujo de funcionamiento

El programa funciona de la siguiente manera:

1. carga las listas de palabras válidas y respuestas posibles
2. inicializa el motor de resolución
3. recibe el patrón de un intento
4. filtra los candidatos incompatibles
5. calcula la mejor siguiente palabra según entropía
6. muestra la recomendación en la interfaz
7. repite el proceso hasta resolver la palabra o agotar intentos

## 6. Archivos principales

Algunos ficheros clave del proyecto son:

- `Source/main.cpp`: punto de entrada del motor en C++
- `Source/Conjunto.cpp`: carga y gestión de diccionarios
- `Source/Entropia.cpp`: cálculo de información y mejor palabra
- `Source/Logica.cpp`: lógica de evaluación y codificación del patrón
- `Header/Logica.h`: interfaz de la lógica principal
- `Header/Entropia.h`: declaración del sistema de entropía
- `solver-worker.js`: motor que decide entre WebAssembly o fallback JavaScript
- `app.js`: lógica de la UI y flujo de la partida

## 7. Ejecución

Para abrir la aplicación web de forma local:

```bash
python3 -m http.server 8000
```

Luego en el navegador:

```text
http://localhost:8000
```

## 8. Nota final

Este proyecto tiene dos caras:

- la lógica y estrategia del solver, que es la parte realmente desarrollada por mí
- la web, que actúa como capa de interacción y que se ha construido de forma vibecoded

La parte “inteligente” no es la página bonita; es la forma en la que el programa decide qué palabra es la mejor siguiente para resolver el Wordle.
