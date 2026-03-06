import { useMemo, useState } from 'react';
import { PositionForm } from '../components/PositionForm';
import { PositionTable } from '../components/PositionTable';
import { filterPositions } from '../utils/position';

export function PositionsPage({
  warehouses,
  positions,
  addPosition,
  updatePosition,
  deletePosition,
  getRows,
  getCells
}) {
  const [editingPosition, setEditingPosition] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    warehouseId: '',
    floor: '',
    row: ''
  });

  const selectedWarehouse = warehouses.find((item) => item.id === filters.warehouseId) || null;
  const floorOptions = selectedWarehouse
    ? Array.from({ length: selectedWarehouse.floorsCount }, (_, index) => index + 1)
    : [];

  const filterRows =
    filters.warehouseId && filters.floor
      ? getRows(filters.warehouseId, Number(filters.floor))
      : [];

  const filteredPositions = useMemo(() => filterPositions(positions, filters), [positions, filters]);

  function handleSubmit(form, editingId) {
    if (editingId) {
      return updatePosition(editingId, form);
    }

    return addPosition(form);
  }

  function handleDelete(position) {
    const approved = window.confirm(`Удалить позицию ${position.article} (${position.row}-${position.cell})?`);
    if (!approved) {
      return;
    }

    deletePosition(position.id);

    if (editingPosition?.id === position.id) {
      setEditingPosition(null);
    }
  }

  return (
    <div className="page-layout">
      <PositionForm
        warehouses={warehouses}
        editingPosition={editingPosition}
        getRows={getRows}
        getCells={getCells}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingPosition(null)}
      />

      <section className="card filters">
        <h2>Поиск и фильтры</h2>

        <div className="grid grid-4">
          <label>
            Поиск по артикулу
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Введите артикул"
            />
          </label>

          <label>
            Склад
            <select
              value={filters.warehouseId}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  warehouseId: event.target.value,
                  floor: '',
                  row: ''
                }))
              }
            >
              <option value="">Все склады</option>
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
              value={filters.floor}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  floor: event.target.value,
                  row: ''
                }))
              }
              disabled={!filters.warehouseId}
            >
              <option value="">Все этажи</option>
              {floorOptions.map((floor) => (
                <option key={floor} value={floor}>
                  Этаж {floor}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ряд
            <select
              value={filters.row}
              onChange={(event) => setFilters((prev) => ({ ...prev, row: event.target.value }))}
              disabled={!filters.floor}
            >
              <option value="">Все ряды</option>
              {filterRows.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <PositionTable
        positions={filteredPositions}
        onEdit={(position) => setEditingPosition(position)}
        onDelete={handleDelete}
      />
    </div>
  );
}
