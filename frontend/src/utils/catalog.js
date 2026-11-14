import { normalize } from './normalize';

export function groupByLetter(items, getName = (item) => item.name) {
  const map = new Map();
  items.forEach((item) => {
    const letter = normalize(getName(item))[0]?.toUpperCase() || '#';
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(item);
  });
  return new Map([...map.entries()].sort());
}

export function getAvailableLetters(items, getName = (item) => item.name) {
  return new Set(items.map((item) => normalize(getName(item))[0]?.toUpperCase()));
}
