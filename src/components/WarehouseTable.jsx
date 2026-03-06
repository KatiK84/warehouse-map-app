import { formatDateTime } from '../utils/date';

export function WarehouseTable({ warehouses, onEdit, onDelete, onConfigure }) {
  if (warehouses.length === 0) {
    return (
      <div className="card empty-state">
        Нет складов. Создайте первый склад, затем настройте схему этажей.
      </div>
    );
  }

  return (
    <div className="card table-wrap">
      <h2>Список складов</h2>

      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Этажей</th>
            <th>Создан</th>
            <th>Обновлен</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td>{warehouse.name}</td>
              <td>{warehouse.floorsCount}</td>
              <td>{formatDateTime(warehouse.createdAt)}</td>
              <td>{formatDateTime(warehouse.updatedAt)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onConfigure(warehouse.id)}>
                    Настроить схему
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => onEdit(warehouse)}>
                    Редактировать
                  </button>
                  <button type="button" className="btn-danger" onClick={() => onDelete(warehouse)}>
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
