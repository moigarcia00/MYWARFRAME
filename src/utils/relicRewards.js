const PART_ES = {
  'Lower Limb': 'Pala Inferior',
  'Upper Limb': 'Pala Superior',
  Blueprint: 'Plano',
  Barrel: 'Cañón',
  Blade: 'Hoja',
  Blades: 'Hoja',
  Boot: 'Bota',
  Carapace: 'Caparazón',
  Cerebrum: 'Cerebro',
  Chain: 'Cadena',
  Chassis: 'Chasis',
  Disc: 'Disco',
  Gauntlet: 'Guante',
  Grip: 'Empuñadura',
  Guard: 'Escudo',
  Handle: 'Empuñadura',
  Harness: 'Arnés',
  Head: 'Cabeza',
  Hilt: 'Empuñadura',
  Link: 'Enlace',
  Neuroptics: 'Neurópticas',
  Ornament: 'Ornamento',
  Pouch: 'Cartuchera',
  Receiver: 'Receptor',
  Stars: 'Estrellas',
  Stock: 'Culata',
  String: 'Cuerda',
  Systems: 'Sistemas',
  Wings: 'Alas'
};

const PART_OVERRIDES = {
  'kogake prime gauntlet': 'Guantelete',
  'bo prime ornament': 'Adorno'
};

const BASE_OVERRIDES = {
  'dual kamas': 'Kamas Dobles',
  'dual keres': 'Keres Dobles',
  'dual zoren': 'Zoren Dobles',
  pangolin: 'Pangolín'
};

const SPECIAL_NAMES = {
  'forma blueprint': 'Plano de Forma'
};

const SUFFIXES = Object.keys(PART_ES).sort((a, b) => b.length - a.length);

function translateBase(base) {
  const lower = base.toLowerCase();
  const match = Object.entries(BASE_OVERRIDES).find(
    ([en]) => lower === en || lower.startsWith(`${en} `)
  );
  if (!match) return base;
  return match[1] + base.slice(match[0].length);
}

export function formatRewardName(nameEn) {
  const name = String(nameEn || '').trim();
  if (!name) return '';

  const lower = name.toLowerCase();

  const special = SPECIAL_NAMES[lower];
  if (special) return special;

  const suffix = SUFFIXES.find((s) => lower.endsWith(` ${s.toLowerCase()}`));
  if (!suffix) return name;

  const base = name.slice(0, name.length - suffix.length).trim();
  if (!base) return PART_ES[suffix];

  const type = PART_OVERRIDES[lower] || PART_ES[suffix];
  return `${type} de ${translateBase(base)}`;
}
