// ══════════════════════════════════════════════════════════
// Traducciones manuales para campos que la API de WFCD
// NO traduce automáticamente (polaridades, facciones, tipos
// de aura, etiquetas de estadísticas, etc).
// ══════════════════════════════════════════════════════════

export const POLARITY_ES = {
  madurai: 'Madurai',
  vazarin: 'Vazarin',
  naramon: 'Naramon',
  zenurik: 'Zenurik',
  penjaga: 'Penjaga',
  umbra: 'Umbra',
  unairu: 'Unairu',
  any: 'Cualquiera'
};

export const POLARITY_SYMBOL = {
  madurai: '▲',
  vazarin: '◐',
  naramon: '◇',
  zenurik: '⊃',
  penjaga: '⬡',
  umbra: '✳',
  unairu: '⬢',
  any: '•'
};

export const FACTION_ES = {
  Grineer: 'Grineer',
  Corpus: 'Corpus',
  Infested: 'Infestados',
  'Orokin/Sentient': 'Orokin / Sensibles',
  Sentients: 'Sensibles',
  Corrupted: 'Corruptos',
  Orokin: 'Orokin',
  Tenno: 'Tenno',
  Narmer: 'Narmer',
  Murmur: 'Murmullo'
};

export const STAT_LABELS = {
  health: 'Salud',
  shield: 'Escudo',
  armor: 'Blindaje',
  power: 'Energía',
  energy: 'Energía',
  sprintSpeed: 'Velocidad de sprint',
  masteryReq: 'Rango de maestría',
  stamina: 'Aguante',
  aura: 'Ranura de aura',
  conclave: 'Conclave',
  passive: 'Pasiva',
  criticalChance: 'Probabilidad crítica',
  criticalMultiplier: 'Multiplicador crítico',
  procChance: 'Probabilidad de estado',
  statusChance: 'Probabilidad de estado',
  fireRate: 'Cadencia de disparo',
  attackSpeed: 'Velocidad de ataque',
  magazineSize: 'Tamaño de cargador',
  reloadTime: 'Tiempo de recarga',
  totalDamage: 'Daño total',
  slam: 'Daño de golpe',
  slamRadialDamage: 'Daño radial de golpe',
  disposition: 'Disposición de mods',
  accuracy: 'Precisión',
  followThrough: 'Continuidad de golpe',
  range: 'Alcance',
  windUp: 'Tiempo de carga'
};

export const CATEGORY_ES = {
  Warframes: 'Warframes',
  Archwing: 'Archwing',
  Necramech: 'Necramech',
  Primary: 'Primarias',
  Secondary: 'Secundarias',
  Melee: 'Cuerpo a cuerpo',
  'Arch-Gun': 'Archwing (armas)',
  'Arch-Melee': 'Archmelee',
  Robotic: 'Robótico',
  Amp: 'Amps'
};

// Orden preferido de las pestañas de categoría en Armas. Cualquier
// categoría que aparezca en la API y no esté aquí se añade igualmente al
// final (usando CATEGORY_ES si existe, o el nombre tal cual si no).
export const WEAPON_CATEGORY_ORDER = [
  'Primary',
  'Secondary',
  'Melee',
  'Arch-Gun',
  'Archwing',
  'Arch-Melee',
  'Robotic',
  'Amp'
];

export const DAMAGE_TYPE_ES = {
  impact: 'Impacto',
  puncture: 'Perforante',
  slash: 'Cortante',
  heat: 'Calor',
  cold: 'Frío',
  electricity: 'Electricidad',
  toxin: 'Toxina',
  blast: 'Explosivo',
  radiation: 'Radiación',
  gas: 'Gas',
  magnetic: 'Magnético',
  viral: 'Viral',
  corrosive: 'Corrosivo',
  void: 'Vacío',
  tau: 'Tau',
  true: 'Verdadero'
};

export function categoryLabel(category) {
  return CATEGORY_ES[category] || category;
}

export function damageTypeLabel(type) {
  const key = String(type || '').toLowerCase();
  return DAMAGE_TYPE_ES[key] || type;
}

// Claves de estadísticas de armas que mostramos en el panel de detalle, en
// el orden en que queremos que aparezcan si existen en el item.
export const WEAPON_STAT_KEYS = [
  'criticalChance',
  'criticalMultiplier',
  'procChance',
  'statusChance',
  'fireRate',
  'attackSpeed',
  'magazineSize',
  'reloadTime',
  'accuracy',
  'range',
  'disposition',
  'slam',
  'slamRadialDamage',
  'windUp',
  'followThrough'
];

const PERCENT_KEYS = new Set(['criticalChance', 'procChance', 'statusChance', 'accuracy']);
const MULTIPLIER_KEYS = new Set(['criticalMultiplier']);

// Da formato legible a una estadística de arma según su tipo (porcentaje,
// multiplicador o número plano). La API suele dar los porcentajes como
// fracción (0.25 = 25%), así que solo se multiplica por 100 si el valor
// parece ser una fracción (<= 1.5, con margen por si acaso).
export function formatWeaponStat(key, value) {
  if (typeof value !== 'number') return value;
  if (PERCENT_KEYS.has(key)) {
    const pct = value <= 1.5 ? value * 100 : value;
    return `${Math.round(pct * 10) / 10}%`;
  }
  if (MULTIPLIER_KEYS.has(key)) {
    return `x${Math.round(value * 100) / 100}`;
  }
  return Math.round(value * 100) / 100;
}

export function translatePolarities(polarities) {
  if (!Array.isArray(polarities)) return [];
  return polarities.map((p) => {
    const key = String(p).toLowerCase();
    return {
      key,
      label: POLARITY_ES[key] || p,
      symbol: POLARITY_SYMBOL[key] || '•'
    };
  });
}

export function translateFaction(faction) {
  if (!faction) return null;
  return FACTION_ES[faction] || faction;
}

export function statLabel(key) {
  return STAT_LABELS[key] || key;
}

// Tipos de salud/armadura/escudo que aparecen en las resistencias de los
// enemigos de la API (suelen venir en inglés).
export const RESISTANCE_TYPE_ES = {
  Shield: 'Escudo',
  'Proto Shield': 'Protocasco',
  'Ferrite Armor': 'Blindaje de ferrita',
  'Alloy Armor': 'Blindaje de aleación',
  Flesh: 'Carne',
  'Cloned Flesh': 'Carne clonada',
  Robotic: 'Robótico',
  Machinery: 'Maquinaria',
  Infested: 'Infestado',
  'Infested Flesh': 'Carne infestada',
  Fossilized: 'Fosilizado',
  'Infested Sinew': 'Tendón infestado',
  Object: 'Objeto'
};

export function resistanceTypeLabel(type) {
  return RESISTANCE_TYPE_ES[type] || type;
}

// ── Rango de maestría máximo ──
// La mayoría de warframes/armas se forjan hasta rango 30, pero las armas
// Kuva/Tenet/Coda y los Necramechs (Voidrig, Bonewidow...) llegan a 40.
const HIGH_MASTERY_NAME_PREFIXES = ['kuva', 'tenet', 'coda'];
const KNOWN_NECRAMECHS = ['voidrig', 'bonewidow'];

export function maxMasteryFor(item) {
  const name = String(item?.name || '').toLowerCase();
  if (HIGH_MASTERY_NAME_PREFIXES.some((prefix) => name.startsWith(prefix))) return 40;
  if (
    item?.type === 'Necramech' ||
    item?.productCategory === 'MechSuits' ||
    KNOWN_NECRAMECHS.includes(name)
  ) {
    return 40;
  }
  return 30;
}

// ── Nombre de arma para mostrar ──
// Algunas armas de Archwing/Archmelee traen el nombre con un "(Archwing)"
// añadido de la propia API — redundante ya que la categoría del catálogo
// ya deja claro que es de Archwing. Se recorta solo para esas categorías,
// solo en la parte visual (no afecta a la búsqueda ni a los datos).
const ARCHWING_FAMILY_CATEGORIES = new Set(['Arch-Gun', 'Arch-Melee', 'Archwing']);

export function displayWeaponName(item) {
  const name = item?.name || '';
  if (!ARCHWING_FAMILY_CATEGORIES.has(item?.category)) return name;
  return (
    name
      .replace(/^<[^>]+>\s*/i, '') // p.ej. "<ARCHWING> Onorix" → "Onorix"
      .replace(/\s*\(archwing\)\s*$/i, '') // por si alguna trae "(Archwing)" al final
      .trim() || name
  );
}

// ══════════════════════════════════════════════════════════
// MODS — categorías, rareza
// ══════════════════════════════════════════════════════════

// Traducción de compatName (a qué se puede equipar el mod) tal y como lo
// da la API. No he podido probar la API en vivo, así que esta lista está
// hecha con lo que se sabe en general de WFCD — si alguna categoría sale
// en inglés sin traducir, es solo cuestión de añadirla aquí.
export const MOD_COMPAT_ES = {
  WARFRAME: 'Warframe',
  RIFLE: 'Primaria',
  'ASSAULT RIFLE': 'Primaria',
  SHOTGUN: 'Primaria (escopeta)',
  SNIPER: 'Primaria (francotirador)',
  BOW: 'Primaria (arco)',
  PISTOL: 'Secundaria',
  MELEE: 'Cuerpo a cuerpo',
  SENTINEL: 'Compañero',
  COMPANION: 'Compañero',
  'SENTINEL WEAPON': 'Arma de compañero',
  KUBROW: 'Compañero',
  KAVAT: 'Compañero',
  BEAST: 'Compañero',
  MOA: 'Robótico',
  ARCHWING: 'Archwing',
  ARCHGUN: 'Archwing (armas)',
  ARCH_GUN: 'Archwing (armas)',
  'ARCH-GUN': 'Archwing (armas)',
  ARCHMELEE: 'Archmelee',
  ARCH_MELEE: 'Archmelee',
  'ARCH-MELEE': 'Archmelee',
  AURA: 'Auras',
  STANCE: 'Posturas',
  RAILJACK: 'Railjack',
  'TENNO ROBOTIC': 'Robótico',
  ROBOTIC: 'Robótico',
  NECRAMECH: 'Robótico',
  PARAZON: 'Parazon',
  'PARAZON MOD': 'Parazon',
  ZAW: 'Cuerpo a cuerpo',
  KITGUN: 'Secundaria',
  AMP: 'Amps',
  MECH: 'Robótico',
  ANY: 'Tecnolist'
};

// Pistas para detectar mods de Railjack cuando compatName/type no es
// literalmente "RAILJACK" sino algo más específico del árbol de
// intrínsecas (Táctica, Artillería, Pilotaje, Ingeniería, Mando...).
// También se mira uniqueName (la ruta interna del juego, ej.
// "/Lotus/Types/.../Railjack/...") porque es un dato mucho más estable
// que compatName/type, que a veces varía o no está traducido igual.
const RAILJACK_HINTS = [
  'RAILJACK',
  'TACTICAL',
  'GUNNERY',
  'PILOTING',
  'ENGINEERING',
  'COMMAND',
  'CREWSHIP',
  'PARTICLE RAM',
  'DRYDOCK',
  'TENNOGEN RAILJACK'
];

function isRailjackMod(mod, compatUpper) {
  const type = String(mod?.type || '').toUpperCase();
  const uniqueName = String(mod?.uniqueName || '').toUpperCase();
  return RAILJACK_HINTS.some(
    (hint) => compatUpper.includes(hint) || type.includes(hint) || uniqueName.includes(hint)
  );
}

// Mismo razonamiento para Exilus: además de los nombres de campo típicos
// (isExilus/exilus), se comprueba compatName/type/uniqueName por si la
// API marca los mods Exilus de otra forma (p.ej. dentro de la ruta
// interna del mod, o con la palabra "Utility", que es como el juego
// llama internamente a la ranura Exilus). "PVPMODS" se añadió a partir
// de un ejemplo real que diste: /Lotus/Upgrades/Mods/PvPMods/Warframe/...
const EXILUS_HINTS = ['EXILUS', 'UTILITY', 'PVPMODS'];

function isExilusMod(mod) {
  if (mod?.isExilus === true || mod?.exilus === true) return true;
  if (mod?.isUtility === true || mod?.utility === true) return true;
  const haystack = [mod?.compatName, mod?.type, mod?.uniqueName, mod?.polarity]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();
  return EXILUS_HINTS.some((hint) => haystack.includes(hint));
}

// Nombres de compañeros conocidos (sentinels, kubrows, kavats,
// predasites/vulpaphylas...) para cuando un mod "exclusivo" trae el
// nombre propio del compañero en vez de una categoría genérica. Esta
// lista es best-effort con lo que sé del juego — si falta alguno, es
// cuestión de añadirlo aquí.
const KNOWN_COMPANION_NAMES = new Set(
  [
    'djinn',
    'helios',
    'helios prime',
    'wyrm',
    'wyrm prime',
    'shade',
    'shade prime',
    'carrier',
    'carrier prime',
    'dethcube',
    'dethcube prime',
    'diriga',
    'taxon',
    'huras kubrow',
    'sunika kubrow',
    'chesa kubrow',
    'sahasa kubrow',
    'raksa kubrow',
    'adarza kavat',
    'smeeta kavat',
    'venari',
    'vasca kavat',
    'helminth charger',
    'predasite',
    'vulpaphyla',
    'crescent vulpaphyla',
    'sly vulpaphyla',
    'medjay predasite',
    'vasca predasite'
  ].map((s) => s.toLowerCase())
);

const COMPANION_TYPE_HINTS = [
  'SENTINEL',
  'KUBROW',
  'KAVAT',
  'MOA',
  'PREDASITE',
  'VULPAPHYLA',
  'BEAST',
  'COMPANION',
  'PET'
];

function isCompanionExclusive(mod, compatRaw) {
  const type = String(mod?.type || '').toUpperCase();
  if (COMPANION_TYPE_HINTS.some((hint) => type.includes(hint))) return true;
  return KNOWN_COMPANION_NAMES.has(compatRaw.toLowerCase());
}

// Orden preferido de las pestañas de categoría en Mods. Cualquier categoría
// de la API que no esté aquí se añade igualmente al final del todo.
export const MOD_CATEGORY_ORDER = [
  'Aumentos',
  'Exilus',
  'Auras',
  'Warframe',
  'Primaria',
  'Secundaria',
  'Cuerpo a cuerpo',
  'Compañero',
  'Robótico',
  'Archwing',
  'Archwing (armas)',
  'Archmelee',
  'Posturas',
  'Parazon',
  'Railjack',
  'Amps',
  'Genéricos',
  'Tecnolist',
  'Exclusivos armas',
  'Exclusivos compañeros',
  'Agrietados'
];

export const RARITY_ES = {
  common: 'Común',
  uncommon: 'Poco común',
  rare: 'Raro',
  legendary: 'Legendario',
  riven: 'Agrietado'
};

export function rarityLabel(rarity) {
  const key = String(rarity || '').toLowerCase();
  return RARITY_ES[key] || rarity;
}

// Los mods con niveles heredados (Básico/Intermedio/Avanzado, tipo "Warm
// Coat") ya se deduplican de raíz en modsApi.js (se confirmó contra la
// wiki oficial que solo existe una versión real de cada uno), así que
// aquí ya no hace falta añadir ningún sufijo — se deja tal cual.
export function displayModName(mod) {
  return mod?.name || '';
}

// Determina TODAS las categorías/pestañas a las que pertenece un mod.
// Usa varios campos con respaldo por si la API no trae siempre el mismo
// nombre de campo.
//
// Los mods "exclusivos" (compatibles solo con un arma o compañero
// concreto, tipo "solo para la Burston" o "solo para Djinn") traen en
// compatName el nombre propio de ese arma/compañero en vez de una
// categoría genérica — si a cada uno le diéramos su propia pestaña
// saldrían decenas de pestañas con 1-2 mods cada una. Así que se separan
// en dos cajones: "Exclusivos armas" y "Exclusivos compañeros" (según si
// el propio mod parece ser de un compañero robótico/bestia o no).
//
// `warframeNames` es opcional: un Set con nombres de warframe en
// minúsculas (sin acentos) que se le pasa desde la página, para detectar
// "Habilidades" — mods cuyo compatName es literalmente el nombre de un
// warframe. Esto incluye los augments de verdad (isAugment: true, como
// "Wrath Of Ukko" con compatName "Kullervo" — confirmado con un ejemplo
// real) y también cualquier otro mod exclusivo de habilidad que no esté
// marcado como augment. Por eso esta comprobación va ANTES de mirar
// isAugment: si el compatName es un warframe conocido, siempre cae en
// "Aumentos" (como se llama en el propio juego) en vez de quedarse
// suelto. "Genéricos" queda como cajón de respaldo solo para augments
// cuyo compatName no reconozcamos como warframe (p. ej. un warframe
// nuevo que la API de warframes aún no tenga listado).
//
// El orden importa: Auras se comprueba ANTES que isAugment porque hay
// mods de aura marcados como isAugment: true en los datos de WFCD (tu
// ejemplo real, "Ready Steel" — confirmado como mod de Aura en la wiki
// de Warframe) — si isAugment se mirara antes, esos acababan en el
// cajón de augments en vez de en "Auras".
export function modCategories(mod, warframeNames) {
  if (isExilusMod(mod)) return ['Exilus'];

  const compatRaw = String(mod?.compatName || mod?.type || '').trim();
  const compatUpper = compatRaw.toUpperCase();

  if (compatUpper.includes('AURA')) return ['Auras'];

  if (warframeNames && warframeNames.size > 0) {
    const compatLower = compatRaw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (warframeNames.has(compatLower)) return ['Aumentos'];
  }

  if (mod?.isAugment) return ['Genéricos'];

  let base;
  if (isRailjackMod(mod, compatUpper)) base = 'Railjack';
  else if (MOD_COMPAT_ES[compatUpper]) base = MOD_COMPAT_ES[compatUpper];
  else if (compatRaw) base = isCompanionExclusive(mod, compatRaw) ? 'Exclusivos compañeros' : 'Exclusivos armas';
  else base = 'Otros';

  return [base];
}

// Versión de una sola categoría (para sitios donde solo cabe una
// etiqueta, como el tag principal del modal de detalle).
export function modCategory(mod, warframeNames) {
  return modCategories(mod, warframeNames)[0];
}

// ══════════════════════════════════════════════════════════
// RELIQUIAS
// ══════════════════════════════════════════════════════════
export const REFINEMENT_ES = {
  intact: 'Intacta',
  exceptional: 'Excepcional',
  flawless: 'Impecable',
  radiant: 'Radiante'
};

export const REFINEMENT_SHORT_ES = {
  intact: 'I',
  exceptional: 'E',
  flawless: 'Im',
  radiant: 'R'
};

export const DROP_RARITY_ES = {
  common: 'Común',
  uncommon: 'Poco común',
  rare: 'Rara'
};

export const TIER_ES = {
  Lith: 'Lith',
  Meso: 'Meso',
  Neo: 'Neo',
  Axi: 'Axi',
  Requiem: 'Requiem'
};

// ══════════════════════════════════════════════════════════
// OBJETOS (recursos, planos, gear...)
// ══════════════════════════════════════════════════════════
export const OBJECT_CATEGORY_ES = {
  RESOURCES: 'Recursos',
  GEAR: 'Gear',
  SKINS: 'Skins',
  ARCANES: 'Arcanes',
  EMOTES: 'Emotes',
  DECORATIONS: 'Decoraciones',
  QUESTS: 'Misiones',
  KEYS: 'Llaves',
  FISH: 'Peces',
  PLANTS: 'Plantas'
};

export const OBJECT_CATEGORY_ORDER = [
  'Recursos',
  'Planos',
  'Gear',
  'Arcanes',
  'Skins',
  'Decoraciones',
  'Otros'
];

// Los planos no siempre tienen su propia categoría en los datos — muchas
// veces se detectan por el propio nombre ("... Blueprint" / "... Plano").
// Las armas Kuva/Tenet/Coda se consiguen directamente al derrotar al
// Sicario/Hermana/jefe correspondiente, no construyendo un plano como
// las Prime — así que aunque su nombre termine en "Blueprint", no se
// clasifican como "Planos" (confirmado por el propio jugador).
const NOT_A_REAL_BLUEPRINT = /^(kuva|tenet|coda)\s/i;

function looksLikeBlueprint(item) {
  const name = String(item?.name || item?.nameEn || '');
  if (NOT_A_REAL_BLUEPRINT.test(name)) return false;
  return /blueprint|plano$/i.test(name);
}

export function objectCategory(item) {
  if (looksLikeBlueprint(item)) return 'Planos';
  const category = String(item?.category || item?.type || '').toUpperCase();
  return OBJECT_CATEGORY_ES[category] || 'Otros';
}
