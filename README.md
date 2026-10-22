# Regalo · Feliz cumple Nico

Web de una sola página con pantallas que se mueven en bloque de derecha a izquierda
(scroll hacia abajo = avanza, hacia arriba = vuelve; también swipe, flechas del teclado y botones).
Incluye un panel `/admin` para sumar o borrar discos: cada disco agrega una pantalla al final.

## Estructura

```
index.html        → la web
styles.css        → estilos y animaciones
app.js            → navegación + carga de discos
config.js         → nombre, links de "+ info"/AIMP y datos de Supabase  ← lo único que hay que editar
discos.json       → respaldo si no configurás Supabase
assets/           → dac.png, iem.png, aimp.png
admin/            → panel para cargar/borrar discos
supabase.sql      → script para crear la base
```

## 1. Subir a GitHub

Subí todo el contenido de la carpeta a un repo nuevo y publicalo con **GitHub Pages**
(Settings → Pages → Deploy from branch → `main` / root) o importalo en **Vercel** (sin build, sitio estático).

- Web: `https://TU-SITIO/`
- Panel: `https://TU-SITIO/admin/`

## 2. Base de datos para el panel (Supabase, gratis)

Sin esto la web funciona igual, pero el panel no puede guardar discos.

1. Creá un proyecto en supabase.com.
2. SQL Editor → pegá `supabase.sql`, **cambiá `CAMBIAME` por tu clave** y ejecutalo.
3. Project Settings → API → copiá la **Project URL** y la **anon public key** en `config.js`.
4. Commit y listo: entrás a `/admin/` con esa clave.

La clave queda encriptada en la base; desde la web solo se puede leer la lista de discos.
Para cambiar la clave, volvé a correr solo el bloque `insert into public.admin_clave …` con la nueva.

## 3. Cargar un disco

- **título del disco**
- **link imagen de portada y fondo** (link directo a la imagen, idealmente cuadrada; se ve la vista previa)
- **comentario** (máx. 3 líneas)
- **link de descarga**

Para borrar uno mal cargado: botón **borrar** en la lista de "discos cargados".

## Sin Supabase (alternativa)

Podés cargar los discos a mano en `discos.json`:

```json
[
  { "titulo": "Nombre del disco", "imagen": "https://…/portada.jpg", "comentario": "texto corto", "link": "https://…" }
]
```
