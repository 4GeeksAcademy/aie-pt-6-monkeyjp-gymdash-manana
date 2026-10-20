# Plan de implementación: Dashboard de gimnasio

## Referencia y alcance

Este plan desarrolla [la especificación del dashboard](spec.md) mediante HTML semántico, Tailwind CSS v4 y módulos JavaScript nativos. Define la arquitectura, las fases por bloques y su verificación; las tareas detalladas se documentarán por separado.

**No se crearán ni ejecutarán pruebas unitarias.** La validación de cálculos y comportamientos se realizará mediante pruebas de integración en navegador con Playwright y revisiones manuales. Esta decisión sustituye la propuesta anterior de utilizar `node:test`; no elimina los resultados esperados de la especificación.

La implementación conservará el servidor Flask existente y no incorporará un framework frontend ni un backend de negocio.

## Estado de partida

- `index.html` contiene la estructura básica, Tailwind CSS v4 por CDN y un cuerpo vacío. Falta configurar el idioma español y el título.
- `server.py` permite servir archivos en el puerto 3000 y no requiere cambios.
- No existen componentes, módulos de cálculo, estado de filtros ni infraestructura de pruebas del dashboard.
- La primera versión utilizará exclusivamente los datos de referencia de la especificación.

## Arquitectura propuesta

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura semántica, contexto temporal, filtros y contenedores de los tres bloques. |
| `js/data.js` | Fuente única de datos de membresías, clases y resumen mensual. |
| `js/dashboard.js` | Cálculos, filtros puros, ranking, modelo visible y formatos numéricos. |
| `js/components.js` | Tarjetas KPI, gráficos de barras CSS y tablas reutilizables. |
| `js/app.js` | Estado de filtros, eventos, coordinación del renderizado y anuncios accesibles. |
| `tests/dashboard.spec.js` | Pruebas de integración en navegador, interacción y comportamiento responsive. |
| `playwright.config.js` | Configuración del navegador y del servidor para las pruebas. |
| `package.json` y `package-lock.json` | Módulos ES y dependencia de desarrollo de Playwright; comando `test:e2e`. |
| `README.es.md` | Instrucciones de ejecución, estructura, filtros y verificaciones. |

Se mantendrá una organización pequeña: sin un archivo por tarjeta, sin un framework propio y sin duplicar datos de negocio en el HTML. Se excluirán de Git las dependencias y los informes generados, preservando las reglas existentes.

## Fase 1: Base compartida

Esta fase es necesaria antes de implementar los bloques visuales.

- Preparar el documento con `lang="es"`, título descriptivo, regiones semánticas y contenedores en orden: KPIs, drivers y detalles operacionales.
- Definir identificadores estables para membresías y clases, días como listas y precios en céntimos enteros. Registrar otros ingresos como 124.000 céntimos independientes.
- Centralizar los cálculos de ingresos, socios, crecimiento, ocupación ponderada y ranking. Mantener precisión interna y aplicar el formato `es-ES` y EUR solo en la presentación.
- Definir el estado inicial con todas las membresías, todos los días y todas las clases. Una función `deriveDashboard(data, filters)` producirá los conjuntos visibles y sus agregaciones sin mutar los datos originales ni depender del DOM.
- Representar la ocupación sin denominador como `null`, que se mostrará como «Sin datos». Mantener el orden original en empates del ranking.
- Establecer estilos mobile-first, números tabulares, contraste AA, foco visible y controles de al menos 44 × 44 px.
- Preparar Playwright como herramienta de pruebas de integración, sin configurar pruebas unitarias ni añadir un comando para ellas. Tailwind continuará por CDN, sin compilación del frontend.

**Verificación:** revisar las fórmulas y la separación de responsabilidades. Cuando exista la interfaz, comprobar desde el navegador 245 socios, 11.505 € de membresías, 1.240 € de otros ingresos, 12.745 € totales, +13 y ocupación 55/65 = 84,6 %. Los casos alternativos se verificarán mediante datos de prueba cargados solo en el navegador de pruebas, sin añadir controles de edición a la aplicación.

## Fase 2: Bloque superior, KPIs

Depende de la base compartida.

- Implementar una tarjeta reutilizable con etiqueta, valor y contexto para socios, ingresos, ocupación y crecimiento neto.
- Alimentar todas las tarjetas desde el modelo calculado, sin cifras de negocio duplicadas en el marcado.
- Identificar el crecimiento como dato global del mes y utilizar períodos de referencia, sin inventar fechas ni comparaciones históricas.
- Apilar las tarjetas en móvil y distribuirlas en columnas cuando exista espacio suficiente, sin truncar cifras o unidades.

**Verificación:** valores iniciales correctos, etiquetas accesibles y ausencia de desbordamiento a 320 px. Comprobar en navegador el comportamiento con valores cero y ocupación sin datos.

## Fase 3: Bloque intermedio, drivers

Depende de la base compartida. Puede desarrollarse de forma independiente de los KPIs una vez estabilizado el contrato del modelo.

- Implementar un gráfico de barras CSS reutilizable con categorías, valores, formato, escala y estado vacío.
- Mostrar Básica, Estándar, Premium y Otros ingresos con importes visibles y una escala común entre categorías monetarias.
- Comparar 18 altas con 5 bajas sobre una escala compartida y mostrar el saldo mensual de +13, sin denominarlo tasa de retención.
- Mostrar el top 3 de clases con escala fija de 0 a 100 %: HIIT, Pilates y Yoga Matinal. Conservar el orden de referencia en empates.
- Asegurar que valores y categorías se puedan interpretar sin depender del color ni del puntero. Evitar anuncios duplicados de barras decorativas a lectores de pantalla.

**Verificación:** importes y porcentajes correctos, orden del ranking, límites de las barras y comportamiento de series vacías o con ceros, mediante pruebas de navegador.

## Fase 4: Bloque inferior, detalles operacionales

Depende de la base compartida. Puede desarrollarse independientemente de los gráficos y KPIs, evitando modificaciones simultáneas del módulo común de componentes.

- Implementar una tabla reutilizable con título accesible, definición de columnas, filas, totales y estado vacío.
- Mostrar las cuatro clases con aforo, inscritos, ocupación y días. Identificar HIIT y Pilates como completas mediante texto.
- Mostrar las tres membresías con precio, socios e ingresos calculados. Los otros ingresos permanecerán fuera de esta tabla.
- Calcular totales sobre las filas visibles: no sumar precios ni porcentajes. En clases, mostrar ocupación agregada ponderada cuando corresponda.
- Incorporar regiones de desplazamiento horizontal con nombre accesible y acceso mediante teclado, sin ensanchar toda la página.

**Verificación:** cuatro clases y tres membresías en la vista inicial; 65 plazas, 55 inscritos, 245 socios y 11.505 € de membresías. Revisar encabezados, columnas conservadas en móvil y estados vacíos sin filas anteriores.

## Fase 5: Filtros e integración

Depende de los tres bloques visuales.

- Incorporar selectores nativos con etiquetas visibles para membresía, día y ocupación, junto con la acción de restablecimiento.
- Utilizar un flujo único: evento, nuevo estado, modelo derivado, actualización de bloques afectados y anuncio breve en una región de estado accesible.
- Mantener los controles fuera de las regiones reemplazadas para conservar foco y selección al actualizar resultados.
- El filtro de membresía actualizará socios, ingresos, desglose y tabla de membresías. Una selección específica excluirá otros ingresos y cambiará la etiqueta a «Ingresos de la membresía»; Todas restaurará «Ingresos mensuales» e incluirá los 1.240 €.
- Día y ocupación se combinarán por intersección y actualizarán el KPI de ocupación, el ranking y la tabla de clases. Cada clase aparecerá una sola vez.
- Mantener independientes los ámbitos de membresías y clases. Altas, bajas y crecimiento permanecerán globales y claramente identificados.
- Mostrar los filtros activos y estados vacíos explícitos, sin recargar la página ni mezclar resultados anteriores con nuevos.

**Verificación con Playwright:** Premium devuelve 40 socios y 3.160 € sin otros ingresos; lunes devuelve Yoga Matinal y Spinning con 69,7 %; completas devuelve HIIT y Pilates con 100 %; lunes y completas devuelve un estado vacío y «Sin datos». Comprobar independencia de ámbitos, conservación del foco y restablecimiento exacto de la vista inicial.

## Fase 6: Verificación integral y documentación

Depende de la integración de filtros.

- Ejecutar `npm run test:e2e`, sin pruebas unitarias. Configurar un servidor estático Python en un puerto de pruebas dedicado para no depender de un Flask activo; no modificar `server.py`.
- Verificar disponibilidad de Node, Playwright y su navegador antes de ejecutar las comprobaciones. La vista previa habitual continuará usando Flask.
- Revisar capturas y dimensiones en 320, 375, 768 y 1280 px. Comprobar que el ancho de la página no se desborde, permitiendo el desplazamiento interno de las tablas.
- Comprobar teclado, nombres accesibles, encabezados, foco, anuncios breves, controles táctiles, contraste AA, zoom real al 200 % y movimiento reducido. Complementar la automatización con revisión manual donde corresponda.
- Verificar también los casos de cero inscritos, cero aforo, series vacías y orden estable mediante la aplicación completa con datos alternativos de prueba.
- Hacer fallar las pruebas de navegador ante errores de JavaScript y comprobar que Tailwind CDN se carga correctamente.
- Documentar en `README.es.md` la ejecución, las pruebas de navegador, la estructura de módulos, las reglas de filtros y la necesidad de conectividad para cargar Tailwind por CDN.

## Dependencias y criterio de finalización

La base compartida precede a los tres bloques. Los bloques pueden desarrollarse de manera independiente una vez definidos sus contratos; la integración de filtros requiere los tres terminados. La verificación se realizará durante cada fase y se completará con la revisión integral.

El dashboard estará terminado cuando los tres bloques, filtros, estados vacíos y controles accesibles cumplan los criterios de la especificación, verificados mediante integración en navegador y revisión manual, sin pruebas unitarias.

## Decisiones y límites

- Ocupación inicial ponderada: 84,6 %. No utilizar promedios simples ni multiplicar aforos por días.
- Otros ingresos: 1.240 € explícitos, sin atribuirlos a una membresía ni recalcularlos como diferencia al filtrar.
- Cálculos monetarios en céntimos y porcentajes con hasta un decimal al mostrar resultados.
- Sin filtros de períodos inexistentes, horarios inventados ni relaciones no disponibles entre clases y membresías.
- Fuera de alcance: comisiones, autenticación, persistencia, reservas, cobros reales, exportaciones e históricos.
- Este documento no inicia la implementación ni sustituye el archivo independiente de tareas.