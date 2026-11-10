export default function CategoryTabs({ categories, active, onSelect }) {
  return (
    <nav className="category-tabs">
      <button
        type="button"
        className={`category-tab ${active === 'Todas' ? 'active' : ''}`}
        onClick={() => onSelect('Todas')}
      >
        ⚡ Todas <span className="category-count">{categories.total}</span>
      </button>
      {categories.list.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`category-tab ${active === c.key ? 'active' : ''}`}
          onClick={() => onSelect(c.key)}
        >
          {c.label} <span className="category-count">{c.count}</span>
        </button>
      ))}
    </nav>
  );
}
