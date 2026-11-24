const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AlphabetNav({ availableLetters, activeLetter, onSelect }) {
  return (
    <nav className="alpha-nav">
      <a
        href="#top"
        data-letter="*"
        className={activeLetter === '*' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          onSelect('*');
        }}
      >
        Todos
      </a>
      {LETTERS.map((letter) => {
        const enabled = availableLetters.has(letter);
        return (
          <a
            key={letter}
            href={enabled ? `#letra-${letter}` : undefined}
            className={`${activeLetter === letter ? 'active' : ''} ${
              !enabled ? 'alpha-disabled' : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (enabled) onSelect(letter);
            }}
          >
            {letter}
          </a>
        );
      })}
    </nav>
  );
}
