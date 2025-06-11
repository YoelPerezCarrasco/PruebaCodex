# Dashboard de alquileres

El mapa colorea las provincias según el Índice de Precios de Vivienda en Alquiler para cada provincia.

Usamos una paleta *Greys–Blues* de 7 clases para mayor contraste entre años.
El tooltip muestra el texto en negro sobre fondo blanco para mejorar la accesibilidad.
Los datos provienen del fichero "Índices provinciales: general y por tamaño de la vivienda" (tabla 59059 del INE). Se procesan con d3.dsv para normalizar valores numéricos y permiten seleccionar el **tamaño de la vivienda** (Total, <40 m², 40-80 m², >80 m²).

Los nombres de provincia se obtienen a partir de su código INE.

```bash
npm i
npm run dev
```

## Interacción temporal: deslizador + play

Ahora puedes elegir el año con un deslizador y reproducir la evolución automáticamente con el botón de play.

## Vista agregada por CCAA

Se incluye un treemap con el alquiler medio de cada comunidad autónoma.
Al hacer clic en una región del treemap, el mapa se filtra y se grisarán
las provincias que no pertenecen a la comunidad seleccionada.
