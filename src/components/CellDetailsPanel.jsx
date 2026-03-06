import { countQuantity } from '../utils/position';

export function CellDetailsPanel({ selectedCell, warehouseName, floor }) {
  if (!selectedCell) {
    return (
      <aside className="card details-panel">
        <h3>Информация о месте</h3>
        <p>Выберите паллетное место на карте.</p>
      </aside>
    );
  }

  const positions = selectedCell.positions || [];
  const totalQuantity = countQuantity(positions);

  return (
    <aside className="card details-panel">
      <h3>Паллетное место</h3>

      <dl>
        <dt>Адрес</dt>
        <dd>{selectedCell.displayLabel}</dd>

        <dt>Склад</dt>
        <dd>{warehouseName || '-'}</dd>

        <dt>Этаж</dt>
        <dd>{floor}</dd>

        <dt>Ряд</dt>
        <dd>{selectedCell.row}</dd>

        <dt>Ячейка</dt>
        <dd>{selectedCell.cell}</dd>
      </dl>

      <div className="details-summary">
        <strong>Позиции: {positions.length}</strong>
        <strong>Суммарное количество: {totalQuantity}</strong>
      </div>

      {positions.length === 0 ? (
        <p className="hint">Место свободно.</p>
      ) : (
        <ul className="details-list">
          {positions.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.article}</strong> · {item.quantity} шт.
              </div>
              <div className="hint">{item.comment || 'Без комментария'}</div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
