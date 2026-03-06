import { nowIso } from '../utils/date';
import { makeLayoutKey, LAYOUT_TYPES } from '../utils/layout';

export function createDemoData() {
  const timestamp = nowIso();
  const warehouseId = 'wh_demo_1';

  const warehouses = [
    {
      id: warehouseId,
      name: 'Демо склад',
      floorsCount: 2,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  const floor1Elements = [
    { id: 'e1', type: LAYOUT_TYPES.gate, label: 'Ворота / Зона отгрузки' },
    { id: 'e2', type: LAYOUT_TYPES.aisle, label: 'Главный проход' },
    {
      id: 'e3',
      type: LAYOUT_TYPES.rackRow,
      rowName: 'A',
      cellsCount: 12,
      label: 'Ряд A',
      direction: 'asc'
    },
    { id: 'e4', type: LAYOUT_TYPES.aisle, label: 'Проход 1' },
    {
      id: 'e5',
      type: LAYOUT_TYPES.rackRow,
      rowName: 'B',
      cellsCount: 12,
      label: 'Ряд B',
      direction: 'asc'
    },
    { id: 'e6', type: LAYOUT_TYPES.aisle, label: 'Проход 2' },
    {
      id: 'e7',
      type: LAYOUT_TYPES.rackRow,
      rowName: 'C',
      cellsCount: 10,
      label: 'Ряд C',
      direction: 'desc'
    },
    { id: 'e8', type: LAYOUT_TYPES.empty, label: 'Зона упаковки' },
    { id: 'e9', type: LAYOUT_TYPES.labelZone, label: 'Приемка / Контроль' }
  ];

  const floor2Elements = [
    { id: 'f1', type: LAYOUT_TYPES.labelZone, label: 'Второй этаж' },
    {
      id: 'f2',
      type: LAYOUT_TYPES.rackRow,
      rowName: 'D',
      cellsCount: 8,
      label: 'Ряд D',
      direction: 'asc'
    },
    { id: 'f3', type: LAYOUT_TYPES.aisle, label: 'Технический проход' },
    {
      id: 'f4',
      type: LAYOUT_TYPES.rackRow,
      rowName: 'E',
      cellsCount: 8,
      label: 'Ряд E',
      direction: 'asc'
    }
  ];

  const layouts = {
    [makeLayoutKey(warehouseId, 1)]: {
      warehouseId,
      floor: 1,
      elements: floor1Elements,
      updatedAt: timestamp
    },
    [makeLayoutKey(warehouseId, 2)]: {
      warehouseId,
      floor: 2,
      elements: floor2Elements,
      updatedAt: timestamp
    }
  };

  const positions = [
    {
      id: 'pos_1',
      article: 'SKU-1001',
      quantity: 14,
      warehouseId,
      warehouseName: 'Демо склад',
      floor: 1,
      row: 'A',
      cell: '01',
      comment: 'Паллеты с высоким спросом',
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: 'pos_2',
      article: 'SKU-2002',
      quantity: 8,
      warehouseId,
      warehouseName: 'Демо склад',
      floor: 1,
      row: 'B',
      cell: '03',
      comment: 'Резерв',
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: 'pos_3',
      article: 'SKU-7770',
      quantity: 22,
      warehouseId,
      warehouseName: 'Демо склад',
      floor: 1,
      row: 'C',
      cell: '10',
      comment: 'Сезонный товар',
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: 'pos_4',
      article: 'SKU-9001',
      quantity: 6,
      warehouseId,
      warehouseName: 'Демо склад',
      floor: 2,
      row: 'D',
      cell: '02',
      comment: 'Второй этаж',
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  return {
    warehouses,
    layouts,
    positions
  };
}
