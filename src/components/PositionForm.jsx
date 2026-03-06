import { useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  article: '',
  quantity: 1,
  warehouseId: '',
  floor: '',
  row: '',
  cell: '',
  comment: ''
};

function toEditForm(position) {
  if (!position) {
    return EMPTY_FORM;
  }

  return {
    article: position.article,
    quantity: position.quantity,
    warehouseId: position.warehouseId,
    floor: position.floor,
    row: position.row,
    cell: position.cell,
    comment: position.comment || ''
  };
}

export function PositionForm({ warehouses, editingPosition, getRows, getCells, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(toEditForm(editingPosition));
  }, [editingPosition]);

  const selectedWarehouse = useMemo(
    () => warehouses.find((item) => item.id === form.warehouseId) || null,
    [warehouses, form.warehouseId]
  );

  const floors = selectedWarehouse
    ? Array.from({ length: selectedWarehouse.floorsCount }, (_, index) => index + 1)
    : [];

  const rows = form.warehouseId && form.floor ? getRows(form.warehouseId, Number(form.floor)) : [];
  const cells = form.warehouseId && form.floor && form.row
    ? getCells(form.warehouseId, Number(form.floor), form.row)
    : [];

  useEffect(() => {
    if (form.floor && !floors.includes(Number(form.floor))) {
      setForm((prev) => ({ ...prev, floor: '', row: '', cell: '' }));
    }
  }, [floors, form.floor]);

  useEffect(() => {
    if (form.row && !rows.includes(form.row)) {
      setForm((prev) => ({ ...prev, row: '', cell: '' }));
    }
  }, [rows, form.row]);

  useEffect(() => {
    if (form.cell && !cells.includes(form.cell)) {
      setForm((prev) => ({ ...prev, cell: '' }));
    }
  }, [cells, form.cell]);

  function handleSubmit(event) {
    event.preventDefault();

    const result = onSubmit(form, editingPosition?.id);
    if (result?.ok && !editingPosition) {
      setForm(EMPTY_FORM);
    }

    if (result?.ok && editingPosition) {
      onCancelEdit();
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editingPosition ? 'Редактировать позицию' : 'Добавить позицию'}</h2>

      <div className="grid grid-4">
        <label>
          Артикул
          <input
            type="text"
            value={form.article}
            onChange={(event) => setForm((prev) => ({ ...prev, article: event.target.value }))}
            required
          />
        </label>

        <label>
          Количество
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                quantity: Math.max(1, Number(event.target.value) || 1)
              }))
            }
            required
          />
        </label>

        <label>
          Склад
          <select
            value={form.warehouseId}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                warehouseId: event.target.value,
                floor: '',
                row: '',
                cell: ''
              }))
            }
            required
          >
            <option value="">Выберите склад</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Этаж
          <select
            value={form.floor}
            onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value, row: '', cell: '' }))}
            disabled={!form.warehouseId}
            required
          >
            <option value="">Выберите этаж</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                Этаж {floor}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-3">
        <label>
          Ряд
          <select
            value={form.row}
            onChange={(event) => setForm((prev) => ({ ...prev, row: event.target.value, cell: '' }))}
            disabled={!form.floor}
            required
          >
            <option value="">Выберите ряд</option>
            {rows.map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ячейка
          <select
            value={form.cell}
            onChange={(event) => setForm((prev) => ({ ...prev, cell: event.target.value }))}
            disabled={!form.row}
            required
          >
            <option value="">Выберите ячейку</option>
            {cells.map((cell) => (
              <option key={cell} value={cell}>
                {cell}
              </option>
            ))}
          </select>
        </label>

        <label>
          Комментарий
          <input
            type="text"
            value={form.comment}
            onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
            placeholder="Опционально"
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit">{editingPosition ? 'Сохранить позицию' : 'Добавить позицию'}</button>
        {editingPosition ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Отмена
          </button>
        ) : null}
      </div>

      {form.warehouseId && form.floor && rows.length === 0 ? (
        <p className="hint warning">
          Для выбранного склада и этажа нет паллетных мест. Сначала настройте схему в разделе «Склады».
        </p>
      ) : null}
    </form>
  );
}
