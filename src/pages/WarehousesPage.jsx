import { useEffect, useMemo, useState } from 'react';
import { LayoutBuilder } from '../components/LayoutBuilder';
import { WarehouseForm } from '../components/WarehouseForm';
import { WarehouseTable } from '../components/WarehouseTable';

export function WarehousesPage({
  warehouses,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getLayoutElements,
  saveLayout
}) {
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(1);

  const selectedWarehouse = useMemo(
    () => warehouses.find((item) => item.id === selectedWarehouseId) || null,
    [warehouses, selectedWarehouseId]
  );

  useEffect(() => {
    if (warehouses.length === 0) {
      setSelectedWarehouseId('');
      setSelectedFloor(1);
      return;
    }

    if (!selectedWarehouseId || !warehouses.some((item) => item.id === selectedWarehouseId)) {
      setSelectedWarehouseId(warehouses[0].id);
      setSelectedFloor(1);
    }
  }, [warehouses, selectedWarehouseId]);

  useEffect(() => {
    if (selectedWarehouse && selectedFloor > selectedWarehouse.floorsCount) {
      setSelectedFloor(selectedWarehouse.floorsCount);
    }
  }, [selectedWarehouse, selectedFloor]);

  function handleDelete(warehouse) {
    const approved = window.confirm(
      `Удалить склад "${warehouse.name}"? Будут удалены его схемы и все позиции.`
    );

    if (!approved) {
      return;
    }

    deleteWarehouse(warehouse.id);

    if (editingWarehouse?.id === warehouse.id) {
      setEditingWarehouse(null);
    }
  }

  function handleConfigure(warehouseId) {
    setSelectedWarehouseId(warehouseId);
    setSelectedFloor(1);
  }

  return (
    <div className="page-layout">
      <div className="stack">
        <WarehouseForm
          editingWarehouse={editingWarehouse}
          onCreate={addWarehouse}
          onUpdate={updateWarehouse}
          onCancelEdit={() => setEditingWarehouse(null)}
        />

        <WarehouseTable
          warehouses={warehouses}
          onEdit={(warehouse) => setEditingWarehouse(warehouse)}
          onDelete={handleDelete}
          onConfigure={handleConfigure}
        />
      </div>

      <LayoutBuilder
        warehouses={warehouses}
        selectedWarehouseId={selectedWarehouseId}
        selectedFloor={selectedFloor}
        onSelectWarehouse={(warehouseId) => {
          setSelectedWarehouseId(warehouseId);
          setSelectedFloor(1);
        }}
        onSelectFloor={setSelectedFloor}
        getLayoutElements={getLayoutElements}
        onSaveLayout={saveLayout}
      />
    </div>
  );
}
