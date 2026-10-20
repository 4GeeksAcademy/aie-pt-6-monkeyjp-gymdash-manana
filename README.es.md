# HTML Hello

El boilerplate más básico para cualquier estudiante de 4Geeks Academy, empieza tu primer sitio web desde cero.

> Tienes un video tutorial sobre [cómo usar esta plantilla para crear tu primer sitio web aquí](https://youtu.be/dfbDCMu_p-0).

## ¿Qué hacer a continuación?

Crea un archivo `index.html` con [la estructura básica de HTML](https://4geeks.com/es/lesson/what-is-html-learn-html-es#estructura-de-pgina) y ve el resultado en vivo corriendo un servidor web utilizando el siguiente comando:

```bash
$ pip3 install flask && python3 server.py
```

- Puedes crear tantos archivos HTML cómo desees.
- También puedes crear archivos CSS e importarlos en tu página web utilizando una etiqueta `<link>` ubicándola entre las etiquetas `<head></head>`, de la siguiente manera:

```html
<head>
  ...
  <link rel="stylesheet" type="text/css" href="styles.css">
  ...
</head>
```

- Si deseas usar Tailwind CSS, agrégalo de forma opcional mediante el CDN oficial de Tailwind CSS v4 dentro del mismo `<head>`:

```html
<head>
  ...
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="stylesheet" type="text/css" href="styles.css">
  ...
</head>
```


## Dashboard del gimnasio

Inicia la vista previa con Flask:

```bash
pip3 install flask
python3 server.py
```

Abre `http://localhost:3000` en el navegador. Para ejecutar las pruebas de integración:

```bash
npm install
npm run test:e2e
```

Playwright utiliza el navegador Chromium incluido como dependencia de desarrollo y un servidor estático local en el puerto 4173 durante las pruebas.

El código cliente se separa en `js/data.js` (datos), `js/dashboard.js` (cálculos y filtros), `js/components.js` (tarjetas, barras y tablas) y `js/app.js` (estado y renderizado). Los filtros de membresía afectan socios e ingresos; los filtros de día y ocupación afectan clases. El movimiento de altas y bajas permanece global.

Tailwind CSS v4 y la tipografía DM Sans se cargan por CDN y necesitan conectividad para mostrarse. Sin conexión, el HTML conserva sus datos, aunque los estilos remotos y la fuente pueden no estar disponibles.

## Agradecimientos

Esta y otras plantillas son utilizadas para [aprender a programar](https://4geeksacademy.com/es/aprender-a-programar/aprender-a-programar-desde-cero) por parte de los alumnos de 4Geeks Academy [Coding Bootcamp](https://4geeksacademy.com/us/coding-bootcamp). 

Realizado por [Alejandro Sánchez](https://twitter.com/alesanchezr) y muchos otros contribuyentes. 

Conoce más sobre nuestros [Cursos de Programación](https://4geeksacademy.com/es/curso-de-programacion-desde-cero/?lang=es) para convertirte en [Full Stack Developer](https://4geeksacademy.com/es/desarrollador-full-stack/desarrollador-full-stack), o nuestro [Data Science Bootcamp](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning).
