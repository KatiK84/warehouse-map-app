import { useEffect, useMemo, useState } from 'react';
import { createId } from '../utils/id';
import { LAYOUT_TYPES, validateLayoutElements } from '../utils/layout';

function createElementByType(type) {
  const base = {
    id: createId('el'),
    type,
    label: ''
  };

  if (type === LAYOUT_TYPES.rackRow) {
    return {
      ...base,
      rowName: '',
      cellsCount: 8,
      direction: 'asc',
      label: ''
    };
  }

  return base;
}

function elementTypeLabel(type) {
  switch (type) {
    case LAYOUT_TYPES.rackRow:
      return 'Ряд паллетных мест';
    case LAYOUT_TYPES.aisle:
      return 'Проход';
    case LAYOUT_TYPES.gate:
      return 'Ворота';
    case LAYOUT_TYPES.empty:
      return 'Пустая зона';
    case LAYOUT_TYPES.labelZone:
      return 'Зона с подписью';
    default:
      return type;
  }
}

export function LayoutBuilder({
  warehouses,
  selectedWarehouseId,
  selectedFloor,
  onSelectWarehouse,
  onSelectFloor,
  getLayoutElements,
  onSaveLayout
}) {
  const selectedWarehouse = useMemo(
    () => warehouses.find((item) => item.id === selectedWarehouseId) || null,
    [warehouses, selectedWarehouseId]
  );

  const [elements, setElements] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!selectedWarehouseId || !selectedFloor) {
      setElements([]);
      setErrors([]);
      return;
    }

    const currentElements = getLayoutElements(selectedWarehouseId, selectedFloor);
    setElements(currentElements.map((item) => ({ ...item })));
    setErrors([]);
  }, [selectedWarehouseId, selectedFloor, getLayoutElements]);

  function updateElement(elementId, field, value) {
    setElements((prev) =>
      prev.map((item) => (item.id === elementId ? { ...item, [field]: value } : item))
    );
  }

  function removeElement(elementId) {
    setElements((prev) => prev.filter((item) => item.id !== elementId));
  }

  function moveElement(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= elements.length) {
      return;
    }

    setElements((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function addElement(type) {
    setElements((prev) => [...prev, createElementByType(type)]);
  }

  function handleSaveLayout() {
    const validation = validateLayoutElements(elements);

    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    const result = onSaveLayout(selectedWarehouseId, Number(selectedFloor), elements);
    if (result?.ok) {
      setErrors([]);
    }
  }

  return (
    <section className="card">
      <h2>Конструктор схемы склада</h2>

      <div className="grid grid-3">
        <label>
          Склад
          <select
            value={selectedWarehouseId || ''}
            onChange={(event) => onSelectWarehouse(event.target.value)}
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
            value={selectedFloor || ''}
            onChange={(event) => onSelectFloor(Number(event.target.value))}
            disabled={!selectedWarehouse}
          >
            {!selectedWarehouse ? <option value="">Выберите склад</option> : null}
            {selectedWarehouse
              ? Array.from({ length: selectedWarehouse.floorsCount }, (_, index) => index + 1).map(
                  (floor) => (
                    <option key={floor} value={floor}>
                      Этаж {floor}
                    </option>
                  )
                )
              : null}
          </select>
        </label>

        <div className="layout-save-wrap">
          <button type="button" onClick={handleSaveLayout} disabled={!selectedWarehouseId || !selectedFloor}>
            Сохранить схему этажа
          </button>
        </div>
      </div>

      <div className="builder-add-panel">
        <span>Добавить элемент:</span>
        <button type="button" onClick={() => addElement(LAYOUT_TYPES.rackRow)}>
          Ряд паллет
        </button>
        <button type="button" className="btn-secondary" onClick={() => addElement(LAYOUT_TYPES.aisle)}>
          Проход
        </button>
        <button type="button" className="btn-secondary" onClick={() => addElement(LAYOUT_TYPES.gate)}>
          Ворота
        </button>
        <button type="button" className="btn-secondary" onClick={() => addElement(LAYOUT_TYPES.empty)}>
          Пустая зона
        </button>
        <button type="button" className="btn-secondary" onClick={() => addElement(LAYOUT_TYPES.labelZone)}>
          Label зона
        </button>
      </div>

      {errors.length > 0 ? (
        <div className="inline-errors">
          {errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      ) : null}

      {elements.length === 0 ? (
        <div className="empty-state">Добавьте элементы, чтобы собрать схему этажа.</div>
      ) : (
        <div className="builder-elements">
          {elements.map((element, index) => (
            <div key={element.id} className="builder-item">
              <div className="builder-item__head">
                <strong>
                  {index + 1}. {elementTypeLabel(element.type)}
                </strong>
                <div className="builder-item__actions">
                  <button type="button" className="btn-secondary" onClick={() => moveElement(index, -1)}>
                    ↑
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => moveElement(index, 1)}>
                    ↓
                  </button>
                  <button type="button" className="btn-danger" onClick={() => removeElement(element.id)}>
                    Удалить
                  </button>
                </div>
              </div>

              {element.type === LAYOUT_TYPES.rackRow ? (
                <div className="grid grid-4">
                  <label>
                    Ряд
                    <input
                      type="text"
                      placeholder="A"
                      value={element.rowName || ''}
                      onChange={(event) =>
                        updateElement(element.id, 'rowName', event.target.value.toUpperCase())
                      }
                    />
                  </label>

                  <label>
                    Паллетных мест
                    <input
                      type="number"
                      min="1"
                      value={element.cellsCount || 1}
                      onChange={(event) =>
                        updateElement(element.id, 'cellsCount', Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </label>

                  <label>
                    Направление нумерации
                    <select
                      value={element.direction || 'asc'}
                      onChange={(event) => updateElement(element.id, 'direction', event.target.value)}
                    >
                      <option value="asc">Слева направо (01→N)</option>
                      <option value="desc">Слева направо (N→01)</option>
                    </select>
                  </label>

                  <label>
                    Подпись (опционально)
                    <input
                      type="text"
                      value={element.label || ''}
                      onChange={(event) => updateElement(element.id, 'label', event.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <label>
                  Подпись / название зоны
                  <input
                    type="text"
                    value={element.label || ''}
                    onChange={(event) => updateElement(element.id, 'label', event.target.value)}
                    placeholder="Например: Ворота"
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
