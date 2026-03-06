import { formatDateTime } from '../utils/date';

export function PositionTable({ positions, onEdit, onDelete }) {
  if (positions.length === 0) {
    return <div className="card empty-state">По заданным фильтрам позиции не найдены.</div>;
  }

  return (
    <div className="card table-wrap">
      <h2>Позиции на складе</h2>

      <table>
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Кол-во</th>
            <th>Склад</th>
            <th>Этаж</th>
            <th>Ряд</th>
            <th>Ячейка</th>
            <th>Комментарий</th>
            <th>Создано</th>
            <th>Обновлено</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id}>
              <td>{position.article}</td>
              <td>{position.quantity}</td>
              <td>{position.warehouseName}</td>
              <td>{position.floor}</td>
              <td>{position.row}</td>
              <td>{position.cell}</td>
              <td>{position.comment || '-'}</td>
              <td>{formatDateTime(position.createdAt)}</td>
              <td>{formatDateTime(position.updatedAt)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" className="btn-secondary" onClick={() => onEdit(position)}>
                    Редактировать
                  </button>
                  <button type="button" className="btn-danger" onClick={() => onDelete(position)}>
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
