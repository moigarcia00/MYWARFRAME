/* ══════════════════════════════════════════════════════
   HELMETS.JS — lista de helmets por warframe (rellenar a mano)
   ══════════════════════════════════════════════════════

   Mismo formato que skins.js:
     { nombre: "Locust Helmet", img: "/helmets/Ash/AshLocust.webp", desc: "" }

   Solo se incluyen aquí los warframes que ya tenían nombres reales de
   helmet en tu helmets.js original (Ash, Atlas, Banshee, Baruuk, Caliban,
   Chroma, Citrine, Cyte-09, Dagath, Dante, Ember, Equinox, Excalibur,
   Excalibur Umbra, Follie). El resto de warframes no tenía datos reales
   (tu archivo original los dejaba con placeholders "xd"/"Kogu"/
   "Honorbound" sin rellenar) — para esos, añade aquí una nueva entrada
   con el mismo formato cuando tengas los nombres/imágenes reales.

   Las claves son el NOMBRE exacto que devuelve la API (item.name).

   img: pon el archivo en img/helmets/Ash/AshLocust.webp (raíz del proyecto,
   al lado de src/) y aquí escribe "/helmets/Ash/AshLocust.webp" — Vite
   sirve esa carpeta como raíz (ver vite.config.js → publicDir: 'img').
*/

export const HELMETS = {
  "Ash": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Locust Helmet", img: "", desc: "" },
    { nombre: "Scorpion Helmet", img: "", desc: "" },
    { nombre: "Carabid Helmet", img: "", desc: "" },
  ],
  "Ash Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Locust Helmet", img: "", desc: "" },
    { nombre: "Scorpion Helmet", img: "", desc: "" },
    { nombre: "Carabid Helmet", img: "", desc: "" },
  ],
  "Atlas": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Arhat", img: "", desc: "" },
    { nombre: "Tartarus", img: "", desc: "" },
    { nombre: "Shikoro", img: "", desc: "" },
    { nombre: "Telamon", img: "", desc: "" },
  ],
  "Atlas Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Arhat", img: "", desc: "" },
    { nombre: "Tartarus", img: "", desc: "" },
    { nombre: "Shikoro", img: "", desc: "" },
    { nombre: "Telamon", img: "", desc: "" },
  ],
  "Banshee": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Reverb", img: "", desc: "" },
    { nombre: "Chorus", img: "", desc: "" },
    { nombre: "dominia", img: "", desc: "" },
    { nombre: "Echo", img: "", desc: "" },
  ],
  "Banshee Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Reverb", img: "", desc: "" },
    { nombre: "Chorus", img: "", desc: "" },
    { nombre: "dominia", img: "", desc: "" },
    { nombre: "Echo", img: "", desc: "" },
  ],
  "Baruuk": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Meroe", img: "", desc: "" },
  ],
  "Baruuk Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Meroe", img: "", desc: "" },
  ],
  "Caliban": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Scion", img: "", desc: "" },
    { nombre: "Caliban Cranion", img: "", desc: "" },
  ],
  "Caliban Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Scion", img: "", desc: "" },
    { nombre: "Caliban Cranion", img: "", desc: "" },
  ],
  "Chroma": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Drac", img: "", desc: "" },
    { nombre: "Amaru", img: "", desc: "" },
    { nombre: "Tarrasque", img: "", desc: "" },
    { nombre: "Kaiju", img: "", desc: "" },
  ],
  "Chroma Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Drac", img: "", desc: "" },
    { nombre: "Amaru", img: "", desc: "" },
    { nombre: "Tarrasque", img: "", desc: "" },
    { nombre: "Kaiju", img: "", desc: "" },
  ],
  "Citrine": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Kalite", img: "", desc: "" },
  ],
  "Cyte-09": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Espricor", img: "", desc: "" },
  ],
  "Dagath": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Voiddax", img: "", desc: "" },
    { nombre: "Ganceann", img: "", desc: "" },
  ],
  "Dante": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Cantist", img: "", desc: "" },
  ],
  "Ember": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Brackdraft", img: "", desc: "" },
    { nombre: "Phoenix", img: "", desc: "" },
  ],
  "Ember Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Brackdraft", img: "", desc: "" },
    { nombre: "Phoenix", img: "", desc: "" },
  ],
  "Equinox": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Solstice", img: "", desc: "" },
    { nombre: "Omni", img: "", desc: "" },
    { nombre: "Clisther", img: "", desc: "" },
  ],
  "Equinox Prime": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Solstice", img: "", desc: "" },
    { nombre: "Omni", img: "", desc: "" },
    { nombre: "Clisther", img: "", desc: "" },
  ],
  "Excalibur": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Mordred", img: "", desc: "" },
    { nombre: "Pendragon", img: "", desc: "" },
    { nombre: "Avalon", img: "", desc: "" },
    { nombre: "Ogrant", img: "", desc: "" },
    { nombre: "Isurus", img: "", desc: "" },
    { nombre: "Arturius", img: "", desc: "" },
    { nombre: "Prsma Avalon", img: "", desc: "" },
    { nombre: "Prisma Pendragon", img: "", desc: "" },
  ],
  "Excalibur Umbra": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Mordred", img: "", desc: "" },
    { nombre: "Pendragon", img: "", desc: "" },
    { nombre: "Avalon", img: "", desc: "" },
    { nombre: "Ogrant", img: "", desc: "" },
    { nombre: "Isurus", img: "", desc: "" },
    { nombre: "Arturius", img: "", desc: "" },
    { nombre: "Prsma Avalon", img: "", desc: "" },
    { nombre: "Prisma Pendragon", img: "", desc: "" },
  ],
  "Follie": [
    { nombre: "Original", img: null, desc: "" },
    { nombre: "Sfumato", img: "", desc: "" },
  ],
};
