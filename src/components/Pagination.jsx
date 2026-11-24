export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const numbers = new Set([1, totalPages]);
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
    numbers.add(p);
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        ‹ Anterior
      </button>

      <div className="page-numbers">
        {items.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`page-btn ${item === page ? 'active' : ''}`}
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Siguiente ›
      </button>
    </nav>
  );
}
