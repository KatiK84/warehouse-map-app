import { useEffect, useState } from 'react';

const DEFAULT_FORM = {
  name: '',
  floorsCount: 1
};

export function WarehouseForm({ editingWarehouse, onCreate, onUpdate, onCancelEdit }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!editingWarehouse) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      name: editingWarehouse.name,
      floorsCount: editingWarehouse.floorsCount
    });
  }, [editingWarehouse]);

  function handleSubmit(event) {
    event.preventDefault();

    if (editingWarehouse) {
      const result = onUpdate(editingWarehouse.id, form);
      if (result?.ok) {
        onCancelEdit();
      }
      return;
    }

    const result = onCreate(form);
    if (result?.ok) {
      setForm(DEFAULT_FORM);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editingWarehouse ? 'Редактирование склада' : 'Создать склад'}</h2>

      <label>
        Название склада
        <input
          type="text"
          value={form.name}
          placeholder="Например: Центральный склад"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </label>

      <label>
        Количество этажей
        <input
          type="number"
          min="1"
          step="1"
          value={form.floorsCount}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              floorsCount: Math.max(1, Number(event.target.value) || 1)
            }))
          }
          required
        />
      </label>

      <div className="form-actions">
        <button type="submit">{editingWarehouse ? 'Сохранить изменения' : 'Создать склад'}</button>
        {editingWarehouse ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}
