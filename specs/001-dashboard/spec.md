# Especificación: Dashboard de gimnasio

## Objetivo

Ofrecer una vista operativa del gimnasio que permita comparar socios, ingresos y ocupación de clases, consultar sus detalles y filtrar la información sin inconsistencias entre tarjetas, gráficos y tablas.

## Contexto y alcance

- El proyecto contiene un `index.html` con el cuerpo vacío y Tailwind CSS v4 por CDN, un servidor estático basado en Flask (`server.py`) y documentación de la plantilla.
- No existen componentes, gráficos, lógica de negocio ni pruebas del dashboard. Todos forman parte de la implementación requerida.
- La interfaz utilizará HTML semántico, Tailwind CSS v4 y JavaScript para cálculos, renderizado y filtros. No requiere un framework de interfaz ni un backend de negocio.
- La primera versión trabajará con los datos de referencia incluidos en esta especificación, sin persistencia ni conexión a servicios externos.
- La interfaz estará en español y utilizará formato numérico `es-ES` y moneda EUR.
- Este documento define requisitos y criterios de aceptación; el plan y las tareas se documentarán por separado.

## Datos de referencia

### Membresías

| Tipo | Precio mensual | Socios activos | Ingresos mensuales calculados |
| --- | ---: | ---: | ---: |
| Básica | 29 € | 85 | 2.465 € |
| Estándar | 49 € | 120 | 5.880 € |
| Premium | 79 € | 40 | 3.160 € |
| Total | No aplica | 245 | 11.505 € |

### Clases de la semana de referencia

| Clase | Aforo | Inscritos | Días | Ocupación |
| --- | ---: | ---: | --- | ---: |
| Yoga Matinal | 15 | 14 | Lun / Mié / Vie | 93,3 % |
| HIIT | 20 | 20 | Mar / Jue | 100 % |
| Spinning | 18 | 9 | Lun / Mié | 50 % |
| Pilates | 12 | 12 | Mar / Vie | 100 % |

Los inscritos y el aforo corresponden a cada clase listada, no a registros independientes por sesión. No hay horas de inicio o fin disponibles y no se inventarán.

### Resumen del mes de referencia

| Concepto | Valor |
| --- | ---: |
| Nuevos socios | 18 |
| Bajas | 5 |
| Crecimiento neto | +13 |
| Ingresos por membresías | 11.505 € |
| Otros ingresos | 1.240 € |
| Ingresos totales | 12.745 € |

Los otros ingresos son un importe explícito del conjunto de datos, sin desglose adicional. No se atribuyen a ninguna membresía.

## Estructura de la interfaz

El contenido principal tendrá tres bloques verticales, en este orden, con encabezados y un contexto temporal visible. Al no existir fechas concretas, se identificarán el mes y la semana como períodos de referencia, sin inventar fechas ni ofrecer períodos sin datos.

### Bloque 1: Indicadores principales

- Mostrará al menos tres tarjetas: socios activos, ingresos mensuales y ocupación ponderada de clases.
- En la vista inicial mostrará 245 socios, 12.745 € y 84,6 %, respectivamente.
- Mostrará también el crecimiento neto mensual de +13, como indicador adicional o información complementaria.
- Cada indicador tendrá un nombre, valor, unidad y contexto suficiente para distinguir datos globales de datos filtrados.
- No mostrará variaciones respecto a meses anteriores, pues no hay datos históricos.

### Bloque 2: Factores de resultado

- Desglose de ingresos: visualizará Básica, Estándar, Premium y Otros ingresos mediante barras CSS con importes y categorías visibles.
- Movimiento de socios: comparará 18 altas frente a 5 bajas y mostrará el saldo neto de +13. No lo presentará como porcentaje de retención.
- Ocupación: mostrará las tres clases con mayor porcentaje; inicialmente HIIT, Pilates y Yoga Matinal, en ese orden.
- Las comparaciones de una misma magnitud compartirán escala y unidades. Las barras de ocupación tendrán una escala fija de 0 a 100 %.
- Los importes se compararán sobre una escala común entre las categorías visibles; las altas y las bajas compartirán otra escala común.
- Los gráficos incluirán valores textuales y no dependerán exclusivamente del color, de animaciones ni de información al pasar el puntero.

### Bloque 3: Detalles operacionales

- Tabla de clases con nombre, aforo, inscritos, porcentaje de ocupación y días.
- Las clases con inscritos iguales al aforo se identificarán como completas mediante texto visible.
- Tabla de membresías con tipo, precio mensual, socios activos e ingresos calculados.
- Cada tabla mostrará totales del conjunto visible cuando correspondan. No se sumarán precios ni porcentajes de ocupación.
- Los otros ingresos se identificarán en el resumen o desglose de ingresos, no como una membresía ficticia.
- En móvil, las tablas conservarán todas sus columnas mediante una región de desplazamiento horizontal identificada y accesible por teclado, sin desbordar la página.

## Componentes y bloques reutilizables

- Las tarjetas KPI, barras comparativas y tablas tendrán estructuras reutilizables y parametrizadas por datos, etiquetas, unidades y estados.
- Las filas, tarjetas y barras repetidas no mantendrán copias independientes de valores de negocio en el HTML.
- La presentación, los cálculos y el estado de filtros tendrán responsabilidades separadas, sin requerir una librería de componentes.
- Una misma fuente de datos y funciones de cálculo alimentarán los indicadores, gráficos y tablas relacionados.
- Los componentes contemplarán datos vacíos y valores cero sin errores visuales ni numéricos.

## Reglas de cálculo

- Ingresos de membresía = precio mensual multiplicado por socios activos.
- Socios activos = suma de socios de las membresías incluidas.
- Ingresos totales iniciales = ingresos de todas las membresías + otros ingresos = 12.745 €.
- Otros ingresos = 1.240 €, registrados de forma independiente; no se recalculan como diferencia al filtrar membresías.
- Crecimiento neto = altas menos bajas = +13. Se conservará el signo cuando sea positivo o negativo.
- Ocupación por clase = inscritos / aforo × 100.
- Ocupación agregada = suma de inscritos / suma de aforos × 100 sobre las clases visibles. Inicialmente 55 / 65 × 100 = 84,6 % redondeado.
- No se usará el promedio simple de porcentajes ni se multiplicarán aforos e inscritos por el número de días.
- El ranking se ordenará por ocupación descendente. Los empates conservarán el orden del conjunto de referencia y se mostrarán como máximo tres resultados.
- Los cálculos conservarán su precisión interna; el redondeo se aplicará solo al mostrar resultados, con hasta un decimal para porcentajes.
- Los importes se calcularán en céntimos enteros y se formatearán en euros al mostrarlos.
- Una agregación sin plazas disponibles mostrará «Sin datos», nunca `NaN`, infinito ni un porcentaje engañoso. Un conjunto con plazas pero sin inscritos mostrará 0 %.
- Las ventas disponibles en esta versión son los ingresos descritos. No se inventarán ventas adicionales, impuestos, descuentos ni comisiones.
- Las comisiones quedan fuera del cálculo hasta disponer de base, porcentaje, beneficiario y regla de aplicación definidos. La lógica monetaria reutilizable deberá permitir incorporar nuevas reglas sin duplicar los cálculos existentes.

## Filtros y sincronización

- La vista inicial incluirá todas las membresías y todas las clases.
- Habrá un filtro de membresía con las opciones Todas, Básica, Estándar y Premium.
- Al seleccionar una membresía, se actualizarán sus socios activos, el indicador de ingresos, el desglose monetario y la tabla de membresías.
- Con una membresía seleccionada, el indicador se titulará «Ingresos de la membresía» y excluirá los otros ingresos. Con Todas, volverá a «Ingresos mensuales» e incluirá los 1.240 €.
- Habrá filtros de día y ocupación para las clases. El filtro de ocupación ofrecerá Todas, Con plazas y Completas; ambos filtros se combinarán mediante intersección.
- El filtro de día incluirá Todos y los días disponibles. Cada clase coincidente aparecerá una sola vez, aunque se imparta varios días.
- Los filtros de clases actualizarán simultáneamente el KPI de ocupación, el ranking y la tabla de clases, calculados sobre el mismo conjunto visible.
- Los filtros no se propagarán a dominios sin relación en los datos: una membresía no filtrará clases y un día no filtrará ingresos.
- Las altas, bajas y crecimiento neto permanecerán globales, identificados como correspondientes al total del mes, porque no existe desglose por membresía ni por clase.
- Los controles reflejarán los filtros activos y habrá una acción para restablecer todos los valores iniciales.
- Los cambios se aplicarán sin recargar la página y sin dejar cifras anteriores mezcladas con resultados nuevos.
- Cuando no existan coincidencias, la tabla y el ranking mostrarán un estado vacío explícito y el KPI de ocupación mostrará «Sin datos».

## Diseño responsive y accesibilidad

- El diseño será mobile-first y utilitario: una columna en pantallas pequeñas y columnas adicionales cuando haya espacio suficiente.
- Se priorizará la comparación de cifras, con unidades consistentes, etiquetas legibles y números alineados en las tablas.
- A partir de 320 px de ancho no habrá solapamientos, contenido truncado esencial ni desplazamiento horizontal de toda la página.
- Se utilizarán regiones semánticas, jerarquía coherente de títulos, `lang="es"`, encabezados de tabla asociados y nombres accesibles para controles.
- Todos los filtros y acciones funcionarán con teclado, tendrán etiquetas visibles y mostrarán un foco perceptible.
- Los controles táctiles tendrán un área mínima de 44 × 44 px.
- El contraste cumplirá WCAG 2.2 AA: al menos 4,5:1 para texto normal y 3:1 para texto grande y elementos de interfaz pertinentes.
- Los cambios de resultados tendrán un anuncio breve mediante una región de estado accesible, sin mover el foco ni anunciar toda la página.
- El estado de clase completa y las diferencias entre series no se comunicarán únicamente mediante color.
- Se respetará la preferencia de movimiento reducido y la interfaz seguirá siendo utilizable con zoom del 200 %.

## Criterios de aceptación y pruebas

- La carga inicial presenta los tres bloques, al menos tres KPIs, tres visualizaciones y las dos tablas completas.
- Las pruebas automatizadas de cálculo verifican 245 socios, 11.505 € de membresías, 1.240 € de otros ingresos, 12.745 € totales, +13 de crecimiento y 84,6 % de ocupación inicial.
- Las pruebas verifican los porcentajes individuales, el orden del ranking y los casos de cero inscritos, cero aforo y conjuntos vacíos.
- Al filtrar Premium, se muestran 40 socios y 3.160 € de ingresos de membresía; el desglose y la tabla coinciden, sin sumar otros ingresos.
- Al filtrar lunes, aparecen Yoga Matinal y Spinning y la ocupación es 23 / 33 = 69,7 %.
- Al filtrar clases completas, aparecen HIIT y Pilates y la ocupación es 100 %.
- Al combinar lunes con clases completas, se muestran estados vacíos y «Sin datos», sin errores de ejecución.
- Las pruebas de interacción comprueban la sincronización de los bloques afectados, la independencia de los no relacionados y el restablecimiento de filtros.
- Restablecer filtros devuelve exactamente los valores y conjuntos iniciales.
- La revisión responsive cubre anchos de 320, 375, 768 y 1280 px, incluyendo desplazamiento de tablas y ausencia de solapamientos.
- La verificación de accesibilidad cubre navegación solo con teclado, etiquetas, foco, anuncios de resultados, contraste y zoom al 200 %.
- No hay errores de JavaScript durante la carga ni al cambiar filtros. Los cálculos y filtros se prueban con herramientas ejecutables, no solo mediante inspección visual.

## Límites de esta versión

No incluye autenticación, gestión o edición de socios, reservas, cobros reales, exportaciones, datos históricos, cálculo de comisiones ni persistencia. Tampoco incluye una tasa de retención real ni métricas inventadas para suplir datos ausentes.