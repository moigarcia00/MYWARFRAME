/* ══════════════════════════════════════════════════════
   REQUIEM RELICS — datos curados a mano (no vienen en la
   API pública). Sacados de tu propio reliquias.js, que ya
   tenías verificado.

   Los mods Requiem no siguen la tabla estándar de
   común/poco común/raro de las reliquias normales — cada
   recompensa trae su propio "prob" (probabilidad exacta en
   %), así que no se usa DROP_CHANCES para estas.
══════════════════════════════════════════════════════ */

export const REQUIEM_RELICS = [
  {
    id: 'Requiem-I',
    era: 'Requiem',
    code: 'I',
    name: 'Requiem I',
    special: true,
    rewards: [
      { item: 'Plano de Adaptador de Arma Exilus', prob: 10 },
      { item: 'Lohk', prob: 20 },
      { item: 'Xata', prob: 20 },
      { item: '1200 Kuva', prob: 16.67 },
      { item: 'Estrella Ámbar Ayatan', prob: 16.67 },
      { item: 'Fragmento de Riven', prob: 16.67 }
    ]
  },
  {
    id: 'Requiem-II',
    era: 'Requiem',
    code: 'II',
    name: 'Requiem II',
    special: true,
    rewards: [
      { item: 'Plano de Adaptador de Arma Exilus', prob: 10 },
      { item: 'Jahu', prob: 20 },
      { item: 'Vome', prob: 20 },
      { item: '1200 Kuva', prob: 16.67 },
      { item: 'Estrella Ámbar Ayatan', prob: 16.67 },
      { item: 'Fragmento de Riven', prob: 16.67 }
    ]
  },
  {
    id: 'Requiem-III',
    era: 'Requiem',
    code: 'III',
    name: 'Requiem III',
    special: true,
    rewards: [
      { item: 'Plano de Adaptador de Arma Exilus', prob: 10 },
      { item: 'Ris', prob: 20 },
      { item: 'Fass', prob: 20 },
      { item: '1200 Kuva', prob: 16.67 },
      { item: 'Estrella Ámbar Ayatan', prob: 16.67 },
      { item: 'Fragmento de Riven', prob: 16.67 }
    ]
  },
  {
    id: 'Requiem-IV',
    era: 'Requiem',
    code: 'IV',
    name: 'Requiem IV',
    special: true,
    rewards: [
      { item: 'Plano de Adaptador de Arma Exilus', prob: 10 },
      { item: 'Netra', prob: 20 },
      { item: 'Khra', prob: 20 },
      { item: '1200 Kuva', prob: 16.67 },
      { item: 'Estrella Ámbar Ayatan', prob: 16.67 },
      { item: 'Fragmento de Riven', prob: 16.67 }
    ]
  }
];
