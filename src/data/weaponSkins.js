/* ══════════════════════════════════════════════════════
   WEAPONSKINS.JS — lista de skins por arma (rellenar a mano)
   ══════════════════════════════════════════════════════

   Mismo formato que src/data/skins.js (warframes):

     "Braton Prime": [
       { nombre: "Original", img: null, desc: "" },  // no tocar
       { nombre: "Skin X", img: "", desc: "" },        // ← rellena tú
     ],

   - nombre : se muestra en el selector.
   - img    : ruta dentro de img/skins/... (raíz del proyecto, al lado de
              src/) → aquí se referencia sin el prefijo "img/", ej. si el
              archivo vive en img/skins/Braton/Prisma.webp, pones
              "/skins/Braton/Prisma.webp". También vale una URL externa.
              Si la dejas en "", se ve un icono de placeholder.
   - desc   : descripción en español para el panel de detalle. Si la dejas
              en "", se usa la descripción del arma base.

   Las claves son el NOMBRE exacto que devuelve la API (item.name).
   Este archivo empieza vacío: no tenía el listado original de skins de
   armas (solo el de warframes), así que ve añadiendo aquí las que
   quieras — no hace falta tocar ningún componente para que aparezcan.
*/

export const SKINS = {};
