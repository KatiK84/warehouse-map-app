export const LAYOUT_TYPES = {
  rackRow: 'rackRow',
  aisle: 'aisle',
  gate: 'gate',
  empty: 'empty',
  labelZone: 'labelZone'
};

export const LAYOUT_TYPE_OPTIONS = [
  { value: LAYOUT_TYPES.rackRow, label: 'Ряд паллетных мест' },
  { value: LAYOUT_TYPES.aisle, label: 'Проход' },
  { value: LAYOUT_TYPES.gate, label: 'Ворота' },
  { value: LAYOUT_TYPES.empty, label: 'Пустая зона' },
  { value: LAYOUT_TYPES.labelZone, label: 'Зона с подписью' }
];

export function makeLayoutKey(warehouseId, floor) {
  return `${warehouseId}::${floor}`;
}

export function normalizeRowName(value) {
  return String(value || '').trim().toUpperCase();
}

export function formatCellNumber(value) {
  return String(value).padStart(2, '0');
}

export function toAddressKey({ warehouseId, floor, row, cell }) {
  return `${warehouseId}|${floor}|${row}|${cell}`;
}

export function createRackCells(element, warehouseId, floor) {
  if (!element || element.type !== LAYOUT_TYPES.rackRow) {
    return [];
  }

  const cellsCount = Math.max(1, Number(element.cellsCount) || 1);
  const direction = element.direction === 'desc' ? 'desc' : 'asc';
  const row = normalizeRowName(element.rowName || 'ROW');
  const numbers = Array.from({ length: cellsCount }, (_, index) => index + 1);
  const ordered = direction === 'asc' ? numbers : numbers.reverse();

  return ordered.map((number, index) => {
    const cell = formatCellNumber(number);
    const address = {
      warehouseId,
      floor,
      row,
      cell
    };

    return {
      id: `${element.id}_${index}`,
      row,
      rowLabel: element.rowName || row,
      cell,
      displayLabel: `${row}-${cell}`,
      address,
      addressKey: toAddressKey(address)
    };
  });
}

export function getPalletPlacesFromElements(elements, warehouseId, floor) {
  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.flatMap((element) => {
    if (element.type !== LAYOUT_TYPES.rackRow) {
      return [];
    }

    return createRackCells(element, warehouseId, floor);
  });
}

export function getRowsFromElements(elements) {
  if (!Array.isArray(elements)) {
    return [];
  }

  return elements
    .filter((element) => element.type === LAYOUT_TYPES.rackRow)
    .map((element) => normalizeRowName(element.rowName))
    .filter(Boolean)
    .filter((value, index, source) => source.indexOf(value) === index);
}

export function getCellsByRow(elements, warehouseId, floor, rowName) {
  const row = normalizeRowName(rowName);
  const places = getPalletPlacesFromElements(elements, warehouseId, floor);

  return places.filter((place) => place.row === row).map((place) => place.cell);
}

export function validateLayoutElements(elements) {
  const errors = [];
  const rowNames = new Set();

  if (!Array.isArray(elements) || elements.length === 0) {
    errors.push('Добавьте хотя бы один элемент схемы.');
    return errors;
  }

  elements.forEach((element, index) => {
    if (!element.type) {
      errors.push(`Элемент #${index + 1}: не указан тип.`);
      return;
    }

    if (element.type === LAYOUT_TYPES.rackRow) {
      const rowName = normalizeRowName(element.rowName);

      if (!rowName) {
        errors.push(`Ряд #${index + 1}: заполните название ряда.`);
      }

      if (rowNames.has(rowName)) {
        errors.push(`Ряд ${rowName} повторяется. Названия рядов должны быть уникальны.`);
      } else if (rowName) {
        rowNames.add(rowName);
      }

      const cellsCount = Number(element.cellsCount);
      if (!Number.isFinite(cellsCount) || cellsCount < 1) {
        errors.push(`Ряд ${rowName || '#' + (index + 1)}: количество мест должно быть больше 0.`);
      }
    }
  });

  return errors;
}
