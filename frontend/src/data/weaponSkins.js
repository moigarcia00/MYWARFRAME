/* ══════════════════════════════════════════════════════
   WEAPONSKINS.JS — lista de skins por arma (catálogo manual)
   ══════════════════════════════════════════════════════

   Mismo formato que src/data/skins.js (warframes):

     "Braton Prime": [
       { nombre: "Original", img: null, desc: "" },  // no tocar
       { nombre: "Skin X", img: "", desc: "" },        // ← rellena tú
     ],

   - nombre : se muestra en el selector.
   - img    : URL completa de la imagen (CDN, hosting propio o la que
              devuelva el backend FastAPI). Ya no se usan carpetas locales
              `img/skins/`: se borraron y las imágenes pasarán al backend.
              Si la dejas en "", se ve el icono de placeholder.
   - desc   : descripción en español para el panel de detalle. Si la dejas
              en "", se usa la descripción del arma base.

   Las claves son el NOMBRE exacto que devuelve la API (item.name).
   Este archivo empieza vacío: no tenía el listado original de skins de
   armas (solo el de warframes), así que ve añadiendo aquí las que
   quieras — no hace falta tocar ningún componente para que aparezcan.
   Cuando el backend normalice las skins de armas, este catálogo podrá
   sustituirse por la respuesta de la API.
 */

export const SKINS = {};
