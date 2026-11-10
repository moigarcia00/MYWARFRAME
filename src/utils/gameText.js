const PLACEHOLDERS = {
  DAMAGE: 'daño',
  DURATION: 'duración',
  RANGE: 'alcance',
  CHANCE: 'probabilidad',
  STRENGTH: 'fuerza',
  EFFICIENCY: 'eficiencia',
  HEALTH: 'salud',
  SHIELD: 'escudo',
  ARMOR: 'armadura',
  ENERGY: 'energía',
  SPEED: 'velocidad',
  TIME: 'tiempo',
  RADIUS: 'radio',
  VALUE: 'valor',
  VAL: 'valor',
  NUMBER: 'número',
  COUNT: 'cantidad',
  COST: 'coste'
};

export function formatGameText(value) {
  if (typeof value !== 'string') return value ?? '';

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\|([A-Za-z0-9_ ]+)\|/g, (_, key) => {
      const cleanKey = key.trim().toUpperCase();
      return PLACEHOLDERS[cleanKey] || key.trim().toLowerCase();
    })
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}
