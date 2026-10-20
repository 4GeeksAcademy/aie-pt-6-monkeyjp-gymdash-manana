# Tareas: Dashboard de gimnasio

## Referencias y reglas

- Basado en el [plan de implementación](plan.md) y la [especificación](spec.md).
- Todas las tareas están pendientes. Crear este documento no inicia la implementación.
- No crear ni ejecutar pruebas unitarias. Usar pruebas de integración en navegador con Playwright y revisiones manuales.
- Mantener HTML semántico, Tailwind CSS v4 por CDN y JavaScript nativo, sin framework frontend ni backend de negocio adicional.
- No modificar `server.py` ni incorporar funcionalidades fuera del alcance aprobado.

## Fase 1: Base compartida

Dependencias: ninguna. Completar esta base antes de los bloques visuales.

- [x] T001 Configurar `lang="es"` y un título descriptivo en `index.html`.
- [x] T002 Añadir encabezado, contenido principal y secciones semánticas para KPIs, drivers y detalles operacionales, en ese orden.
- [x] T003 Mostrar el mes y la semana de referencia sin inventar fechas.
- [x] T004 Crear `js/data.js` con las tres membresías, identificadores estables y precios en céntimos enteros.
- [x] T005 Incorporar las cuatro clases con identificadores, aforo, inscritos y listas de días, conservando el orden de referencia.
- [x] T006 Incorporar 18 altas, 5 bajas y otros ingresos de 124.000 céntimos como datos independientes.
- [x] T007 Crear `js/dashboard.js` con funciones de ingresos por membresía y suma de socios activos.
- [x] T008 Añadir el cálculo de ingresos totales con inclusión explícita de otros ingresos solo cuando corresponda.
- [x] T009 Añadir el cálculo de crecimiento neto como altas menos bajas.
- [x] T010 Añadir cálculos de ocupación individual y agregada ponderada, devolviendo `null` cuando no exista aforo.
- [x] T011 Añadir el filtro de membresía y la intersección de filtros de día y ocupación, sin duplicar clases.
- [x] T012 Añadir el ranking descendente de ocupación, limitado a tres resultados y con orden estable en empates.
- [x] T013 Centralizar el formato `es-ES`, moneda EUR, signos del crecimiento y porcentajes con hasta un decimal.
- [x] T014 Implementar `deriveDashboard(data, filters)` con conjuntos visibles, totales, categorías de ingresos y ranking, sin dependencias del DOM.
- [x] T015 Crear `js/app.js` con estado inicial de todos los filtros y carga como módulo desde `index.html`.
- [x] T016 Definir estilos compartidos mobile-first, números tabulares, contraste AA y foco visible.
- [x] T017 Inicializar la configuración de módulos ES y Playwright como dependencia de desarrollo, con comando `test:e2e` y sin herramientas de pruebas unitarias.
- [x] T018 Configurar Playwright con servidor estático Python y puerto de pruebas dedicado, sin depender del servidor Flask activo.
- [x] T019 Excluir dependencias e informes generados de Git, preservando las reglas de exclusión existentes.
- [x] T020 Revisar manualmente las fórmulas, la precisión interna y la ausencia de mutaciones de los datos originales.

## Fase 2: Bloque superior, KPIs

Dependencias: fase 1. Las comprobaciones de navegador requieren el arranque funcional de la aplicación.

- [x] T021 Crear en `js/components.js` una tarjeta KPI reutilizable con etiqueta, valor y contexto.
- [x] T022 Renderizar las tarjetas de socios, ingresos, ocupación y crecimiento desde el modelo calculado.
- [x] T023 Identificar el crecimiento como global del mes y distinguir el contexto global del filtrado en las tarjetas pertinentes.
- [x] T024 Distribuir las tarjetas en una columna móvil y añadir columnas según el espacio disponible.
- [x] T025 Comprobar en navegador 245 socios, 12.745 €, 84,6 % y +13, con nombres accesibles.
- [x] T026 Comprobar a 320 px que ninguna cifra, etiqueta o unidad quede truncada ni desborde la página.
- [x] T027 Verificar en la aplicación completa los KPIs con valores cero y ocupación «Sin datos», usando datos alternativos exclusivos de pruebas.

## Fase 3: Bloque intermedio, drivers

Dependencias: fase 1 y contrato del modelo definido. No depende de completar los KPIs; coordinar los cambios en el módulo compartido de componentes.

- [x] T028 Crear un gráfico de barras CSS reutilizable con categorías, valores, formateador y escala común configurable.
- [x] T029 Añadir al gráfico el estado vacío y el tratamiento de series con todos sus valores a cero.
- [x] T030 Renderizar ingresos de Básica, Estándar, Premium y Otros ingresos con importes visibles y escala monetaria compartida.
- [x] T031 Renderizar 18 altas frente a 5 bajas con escala compartida y saldo global de +13.
- [x] T032 Renderizar el top 3 de clases con porcentajes visibles y escala fija de 0 a 100 %.
- [x] T033 Hacer interpretables categorías y valores sin color ni hover y ocultar las barras puramente decorativas a lectores de pantalla.
- [x] T034 Verificar en navegador los importes 2.465 €, 5.880 €, 3.160 € y 1.240 €, y el ranking HIIT, Pilates y Yoga Matinal.
- [x] T035 Verificar en navegador porcentajes 100 %, 100 % y 93,3 %, límites de barras y series vacías o con ceros.

## Fase 4: Bloque inferior, detalles operacionales

Dependencias: fase 1 y contrato del modelo definido. No depende de completar KPIs o gráficos; coordinar cambios en los componentes compartidos.

- [x] T036 Crear una tabla reutilizable con título accesible, columnas, filas, pie de totales y estado vacío.
- [x] T037 Asociar encabezados con sus celdas y alinear numéricamente las columnas de cantidades.
- [x] T038 Renderizar la tabla de clases con nombre, aforo, inscritos, ocupación y días.
- [x] T039 Identificar las clases completas mediante texto visible, sin depender exclusivamente del color.
- [x] T040 Incorporar los totales de clases visibles y su ocupación ponderada, sin sumar porcentajes.
- [x] T041 Renderizar la tabla de membresías con tipo, precio, socios e ingresos calculados.
- [x] T042 Incorporar los totales de socios e ingresos de las membresías visibles, sin sumar precios ni añadir otros ingresos como membresía.
- [x] T043 Envolver cada tabla en una región de desplazamiento horizontal con nombre accesible y acceso por teclado.
- [x] T044 Verificar en navegador cuatro clases, tres membresías, 65 plazas, 55 inscritos, 245 socios y 11.505 € de ingresos por membresías.
- [x] T045 Revisar en móvil la conservación de columnas y el desplazamiento interno sin desbordamiento de página.
- [x] T046 Comprobar con datos alternativos que las tablas vacías muestran su estado explícito y no conservan filas anteriores.

## Fase 5: Filtros e integración

Dependencias: los tres bloques visuales completados.

- [x] T047 Añadir un selector de membresía con etiqueta visible y opciones Todas, Básica, Estándar y Premium.
- [x] T048 Añadir un selector de día con etiqueta visible y opciones Todos y los días disponibles.
- [x] T049 Añadir un selector de ocupación con etiqueta visible y opciones Todas, Con plazas y Completas.
- [x] T050 Añadir la acción de restablecimiento de filtros y la identificación de las selecciones activas.
- [x] T051 Conectar los eventos a un único flujo de estado, derivación del modelo y actualización de regiones afectadas.
- [x] T052 Conectar membresía con los KPIs de socios e ingresos, el desglose monetario y la tabla de membresías.
- [x] T053 Excluir otros ingresos al seleccionar una membresía y cambiar la etiqueta a «Ingresos de la membresía»; restaurar importe y etiqueta globales con Todas.
- [x] T054 Conectar día y ocupación con el KPI de ocupación, el ranking y la tabla de clases mediante intersección de filtros.
- [x] T055 Mantener independientes membresías y clases, y conservar altas, bajas y crecimiento como datos globales del mes.
- [x] T056 Mantener controles fuera de regiones reemplazadas para conservar foco y selección al renderizar.
- [x] T057 Añadir anuncios breves de resultados mediante una región de estado accesible, sin mover el foco.
- [x] T058 Mostrar «Sin datos» en el KPI de ocupación y estados vacíos en ranking y tabla cuando no existan clases coincidentes.
- [x] T059 Añadir una prueba de navegador para Premium: 40 socios, 3.160 € y coherencia de todos los bloques de membresías, sin otros ingresos.
- [x] T060 Añadir una prueba de navegador para lunes: Yoga Matinal y Spinning, sin duplicados y con 69,7 % agregado.
- [x] T061 Añadir una prueba de navegador para Completas: HIIT y Pilates y ocupación agregada del 100 %.
- [x] T062 Añadir una prueba de navegador para lunes y Completas: tabla y ranking vacíos y KPI «Sin datos».
- [x] T063 Añadir pruebas de navegador para independencia de ámbitos y permanencia de los valores globales de movimiento.
- [x] T064 Añadir una prueba de navegador que compruebe la restauración exacta de filtros, etiquetas, filas y valores iniciales.
- [x] T065 Comprobar que las actualizaciones no recargan la página, no mezclan valores anteriores y conservan el foco.

## Fase 6: Verificación integral y documentación

Dependencias: filtros integrados y pruebas de navegador de los bloques disponibles.

- [x] T066 Verificar la disponibilidad de Node, Python, Playwright y su navegador para ejecutar la suite de integración.
- [x] T067 Incorporar datos alternativos exclusivos de pruebas para comprobar desde la aplicación completa cero inscritos, cero aforo, series vacías y empates, sin controles de edición en producción.
- [x] T068 Configurar las pruebas de navegador para fallar ante errores de JavaScript durante la carga y los cambios de filtros.
- [x] T069 Comprobar que Tailwind CSS v4 por CDN carga y aplica los estilos correctamente.
- [x] T070 Capturar y revisar la interfaz en anchos de 320, 375, 768 y 1280 px, incluyendo filtros y estados vacíos.
- [x] T071 Verificar que el ancho de la página no se desborda y que solo las regiones de tablas permiten desplazamiento horizontal interno.
- [x] T072 Recorrer filtros, restablecimiento y tablas usando solo teclado y comprobar etiquetas, encabezados y foco visible.
- [x] T073 Verificar anuncios breves de resultados sin anuncios duplicados ni cambios involuntarios de foco.
- [x] T074 Medir áreas de control de al menos 44 × 44 px y comprobar contraste AA de textos y elementos de interfaz pertinentes.
- [x] T075 Revisar escala visual emulada al 200 % y viewport CSS equivalente de 640 px; el zoom de interfaz real requiere revisión manual en navegador gráfico.
- [x] T076 Revisar el comportamiento con preferencia de movimiento reducido.
- [x] T077 Ejecutar `npm run test:e2e` y registrar los resultados y las verificaciones manuales pendientes, si las hubiera.
- [x] T078 Documentar en `README.es.md` cómo ejecutar la aplicación y las pruebas de navegador.
- [x] T079 Documentar la estructura de módulos, los ámbitos de filtros y la dependencia de conectividad para Tailwind por CDN.
- [x] T080 Revisar el resultado contra los criterios de la especificación, confirmando que no se incorporaron pruebas unitarias ni funcionalidades fuera de alcance; dejar anotada la revisión manual de zoom de interfaz real pendiente por limitación del navegador headless.

## Criterio de cierre

Marcar cada tarea solo cuando se haya realizado y verificado. La implementación estará completa cuando los tres bloques, los filtros, los cálculos visibles, los estados vacíos y la accesibilidad cumplan los criterios acordados. Las pruebas automatizadas serán de integración en navegador, complementadas con revisión manual, nunca unitarias.