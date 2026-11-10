# MyWarframe

Tracker y coleccionable **fan, no oficial** de [Warframe](https://www.warframe.com/): consulta warframes, armas, mods, reliquias, compañeros, objetos y facciones, y lleva el control de lo que ya has obtenido.

> Proyecto personal sin ánimo de lucro, no afiliado a Digital Extremes.

## Características

- **7 secciones**: Warframes, Armas, Mods (incluye Agrietados), Reliquias, Compañeros, Objetos y Facciones/Enemigos.
- **Seguimiento de colección**: marca lo obtenido y consulta el progreso con contadores y barra de maestría.
- **Persistencia local**: tu colección se guarda en el navegador (`localStorage`), sin cuentas ni servidores.
- **Copia de seguridad**: exporta e importa toda tu colección en un archivo `.json`.
- **Búsqueda, filtros, pestañas y paginación** en los catálogos principales.
- **Imágenes** desde el CDN de WFCD y recursos locales, con carga diferida.
- Interfaz en **español**, con datos combinados ES/EN.

## Tecnologías

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- ESLint 10

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en modo desarrollo (http://localhost:5173)
npm run dev

# 3. Compilar para producción
npm run build

# 4. Previsualizar la compilación
npm run preview
```

Otros comandos:

```bash
npm run lint                # Revisa el código con ESLint
npm run generate:mod-stats  # Regenera las estadísticas ES de mods
```

## Estructura del proyecto

```
src/
  api/         Peticiones a la API de WFCD y configuración central
  components/  Componentes reutilizables (cartas, modales, paginación...)
  data/        Datos locales (traducciones, skins, estadísticas de mods)
  hooks/       Lógica de datos, colecciones y persistencia
  pages/       Una página por sección
  utils/       Utilidades (backup, normalización, claves de almacenamiento...)
img/           Recursos estáticos: logo, skins y cascos
scripts/       Scripts de generación de datos
```

## Datos y créditos

- Los datos provienen de la API pública de **WFCD**: [api.warframestat.us](https://api.warframestat.us).
- Proyectos de WFCD utilizados: [warframe-items](https://github.com/WFCD/warframe-items) y [warframestat](https://github.com/WFCD/warframestat), publicados bajo licencia **MIT**.
- **Warframe** y todas sus imágenes, nombres y datos son propiedad de **Digital Extremes Ltd.** Este proyecto es una creación fan sin ánimo de lucro y no está afiliado ni respaldado por Digital Extremes.
- Las imágenes se enlazan desde el CDN de WFCD siempre que es posible; no se reclama su propiedad.

## Aviso legal

Proyecto fan no oficial y sin ánimo de lucro, no afiliado a Digital Extremes. Warframe y sus imágenes/datos pertenecen a Digital Extremes Ltd. Si eres titular de derechos y quieres solicitar la retirada de algún contenido, abre un issue en el repositorio.

## Estado

En desarrollo activo. Actualmente el frontend funciona de forma independiente contra la API de WFCD; está previsto añadir un backend propio (FastAPI) para normalizar datos y servir catálogos de skins y cascos.
