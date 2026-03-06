const TABS = [
  { id: 'warehouses', label: 'Склады' },
  { id: 'positions', label: 'Позиции' },
  { id: 'map', label: 'Карта склада' }
];

export function TabNav({ activeTab, onChange }) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-nav__item ${activeTab === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
