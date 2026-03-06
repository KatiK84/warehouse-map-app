import { useEffect, useMemo, useState } from 'react';
import { createDemoData } from '../data/demoData';
import { nowIso } from '../utils/date';
import { createId } from '../utils/id';
import {
  getPalletPlacesFromElements,
  getRowsFromElements,
  getCellsByRow,
  makeLayoutKey,
  normalizeRowName,
  toAddressKey
} from '../utils/layout';
import { loadAllData, saveLayouts, savePositions, saveWarehouses } from '../utils/storage';

function hasSavedData(payload) {
  if (!payload) {
    return false;
  }

  return Array.isArray(payload.warehouses) && payload.warehouses.length > 0;
}

export function useAppData() {
  const initialData = useMemo(() => {
    const stored = loadAllData();
    if (hasSavedData(stored)) {
      return stored;
    }

    return createDemoData();
  }, []);

  const [warehouses, setWarehouses] = useState(initialData.warehouses || []);
  const [layouts, setLayouts] = useState(initialData.layouts || {});
  const [positions, setPositions] = useState(initialData.positions || []);
  const [message, setMessage] = useState(null);

  function pushMessage(type, text) {
    setMessage({ id: Date.now(), type, text });
  }

  useEffect(() => {
    saveWarehouses(warehouses);
  }, [warehouses]);

  useEffect(() => {
    saveLayouts(layouts);
  }, [layouts]);

  useEffect(() => {
    savePositions(positions);
  }, [positions]);

  function getWarehouseById(warehouseId) {
    return warehouses.find((item) => item.id === warehouseId) || null;
  }

  function getLayoutEntry(warehouseId, floor) {
    if (!warehouseId || !floor) {
      return null;
    }

    return layouts[makeLayoutKey(warehouseId, floor)] || null;
  }

  function getLayoutElements(warehouseId, floor) {
    return getLayoutEntry(warehouseId, floor)?.elements || [];
  }

  function getPalletPlaces(warehouseId, floor) {
    return getPalletPlacesFromElements(getLayoutElements(warehouseId, floor), warehouseId, Number(floor));
  }

  function getRows(warehouseId, floor) {
    return getRowsFromElements(getLayoutElements(warehouseId, floor));
  }

  function getCells(warehouseId, floor, row) {
    return getCellsByRow(getLayoutElements(warehouseId, floor), warehouseId, Number(floor), row);
  }

  function isExistingAddress(address) {
    const key = toAddressKey(address);
    const places = getPalletPlaces(address.warehouseId, address.floor);

    return places.some((place) => place.addressKey === key);
  }

  function addWarehouse(input) {
    const timestamp = nowIso();
    const name = String(input.name || '').trim();
    const floorsCount = Math.max(1, Number(input.floorsCount) || 1);

    if (!name) {
      pushMessage('error', 'Введите название склада.');
      return { ok: false };
    }

    const newWarehouse = {
      id: createId('wh'),
      name,
      floorsCount,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setWarehouses((prev) => [newWarehouse, ...prev]);
    pushMessage('success', `Склад "${name}" создан.`);
    return { ok: true, warehouse: newWarehouse };
  }

  function updateWarehouse(warehouseId, input) {
    const current = getWarehouseById(warehouseId);

    if (!current) {
      pushMessage('error', 'Склад не найден.');
      return { ok: false };
    }

    const timestamp = nowIso();
    const name = String(input.name || '').trim();
    const floorsCount = Math.max(1, Number(input.floorsCount) || 1);

    if (!name) {
      pushMessage('error', 'Введите название склада.');
      return { ok: false };
    }

    setWarehouses((prev) =>
      prev.map((item) =>
        item.id === warehouseId
          ? {
              ...item,
              name,
              floorsCount,
              updatedAt: timestamp
            }
          : item
      )
    );

    setPositions((prev) =>
      prev
        .filter((position) => !(position.warehouseId === warehouseId && Number(position.floor) > floorsCount))
        .map((position) =>
          position.warehouseId === warehouseId
            ? {
                ...position,
                warehouseName: name,
                updatedAt: timestamp
              }
            : position
        )
    );

    setLayouts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const entry = next[key];
        if (entry.warehouseId === warehouseId && Number(entry.floor) > floorsCount) {
          delete next[key];
        }
      });
      return next;
    });

    pushMessage('success', `Склад "${name}" обновлен.`);
    return { ok: true };
  }

  function deleteWarehouse(warehouseId) {
    const target = getWarehouseById(warehouseId);
    if (!target) {
      return;
    }

    setWarehouses((prev) => prev.filter((item) => item.id !== warehouseId));
    setPositions((prev) => prev.filter((position) => position.warehouseId !== warehouseId));
    setLayouts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const entry = next[key];
        if (entry.warehouseId === warehouseId) {
          delete next[key];
        }
      });
      return next;
    });

    pushMessage('success', `Склад "${target.name}" удален.`);
  }

  function saveLayout(warehouseId, floor, elements) {
    const warehouse = getWarehouseById(warehouseId);

    if (!warehouse) {
      pushMessage('error', 'Выберите склад перед сохранением схемы.');
      return { ok: false };
    }

    const floorNumber = Number(floor);
    const timestamp = nowIso();
    const key = makeLayoutKey(warehouseId, floorNumber);

    setLayouts((prev) => ({
      ...prev,
      [key]: {
        warehouseId,
        floor: floorNumber,
        elements,
        updatedAt: timestamp
      }
    }));

    setPositions((prev) => {
      const validPlaces = getPalletPlacesFromElements(elements, warehouseId, floorNumber);
      const validSet = new Set(validPlaces.map((place) => place.addressKey));

      return prev.filter((item) => {
        if (item.warehouseId !== warehouseId || Number(item.floor) !== floorNumber) {
          return true;
        }

        return validSet.has(
          toAddressKey({
            warehouseId,
            floor: floorNumber,
            row: item.row,
            cell: item.cell
          })
        );
      });
    });

    pushMessage('success', `Схема сохранена: ${warehouse.name}, этаж ${floorNumber}.`);
    return { ok: true };
  }

  function addPosition(input) {
    const warehouse = getWarehouseById(input.warehouseId);
    const floor = Number(input.floor);
    const row = normalizeRowName(input.row);
    const cell = String(input.cell || '').trim();

    if (!warehouse) {
      pushMessage('error', 'Выберите склад.');
      return { ok: false };
    }

    if (!input.article || !String(input.article).trim()) {
      pushMessage('error', 'Введите артикул.');
      return { ok: false };
    }

    if (!isExistingAddress({ warehouseId: warehouse.id, floor, row, cell })) {
      pushMessage('error', 'Нельзя сохранить позицию в несуществующее паллетное место.');
      return { ok: false };
    }

    const timestamp = nowIso();
    const newPosition = {
      id: createId('pos'),
      article: String(input.article).trim(),
      quantity: Math.max(1, Number(input.quantity) || 1),
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      floor,
      row,
      cell,
      comment: String(input.comment || '').trim(),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setPositions((prev) => [newPosition, ...prev]);
    pushMessage('success', 'Позиция добавлена.');
    return { ok: true, position: newPosition };
  }

  function updatePosition(positionId, input) {
    const current = positions.find((item) => item.id === positionId);

    if (!current) {
      pushMessage('error', 'Позиция не найдена.');
      return { ok: false };
    }

    const warehouse = getWarehouseById(input.warehouseId);
    const floor = Number(input.floor);
    const row = normalizeRowName(input.row);
    const cell = String(input.cell || '').trim();

    if (!warehouse) {
      pushMessage('error', 'Выберите склад.');
      return { ok: false };
    }

    if (!input.article || !String(input.article).trim()) {
      pushMessage('error', 'Введите артикул.');
      return { ok: false };
    }

    if (!isExistingAddress({ warehouseId: warehouse.id, floor, row, cell })) {
      pushMessage('error', 'Нельзя сохранить позицию в несуществующее паллетное место.');
      return { ok: false };
    }

    const timestamp = nowIso();

    setPositions((prev) =>
      prev.map((item) =>
        item.id === positionId
          ? {
              ...item,
              article: String(input.article).trim(),
              quantity: Math.max(1, Number(input.quantity) || 1),
              warehouseId: warehouse.id,
              warehouseName: warehouse.name,
              floor,
              row,
              cell,
              comment: String(input.comment || '').trim(),
              updatedAt: timestamp
            }
          : item
      )
    );

    pushMessage('success', 'Позиция обновлена.');
    return { ok: true };
  }

  function deletePosition(positionId) {
    setPositions((prev) => prev.filter((item) => item.id !== positionId));
    pushMessage('success', 'Позиция удалена.');
  }

  function replaceAllData(payload) {
    if (!Array.isArray(payload.warehouses) || !payload.layouts || !Array.isArray(payload.positions)) {
      pushMessage('error', 'Импорт отклонен: неверная структура.');
      return { ok: false };
    }

    setWarehouses(payload.warehouses);
    setLayouts(payload.layouts);
    setPositions(payload.positions);
    pushMessage('success', 'Данные успешно импортированы.');
    return { ok: true };
  }

  return {
    warehouses,
    layouts,
    positions,
    message,
    setMessage,
    pushMessage,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    saveLayout,
    addPosition,
    updatePosition,
    deletePosition,
    replaceAllData,
    getWarehouseById,
    getLayoutEntry,
    getLayoutElements,
    getPalletPlaces,
    getRows,
    getCells
  };
}
