# Dashboard de alquileres

El mapa colorea las provincias según el alquiler medio (€) del último año disponible.

Usamos la paleta Brewer **YlOrRd** de 7 pasos para resaltar mejor los cambios entre años.
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
