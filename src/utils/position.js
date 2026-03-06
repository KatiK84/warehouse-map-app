import { toAddressKey } from './layout';

export function positionAddressKey(position) {
  return toAddressKey({
    warehouseId: position.warehouseId,
    floor: position.floor,
    row: position.row,
    cell: position.cell
  });
}

export function groupPositionsByAddress(positions) {
  return positions.reduce((acc, position) => {
    const key = positionAddressKey(position);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(position);
    return acc;
  }, {});
}

export function findPositionsForAddress(positions, address) {
  const key = toAddressKey(address);
  return positions.filter((position) => positionAddressKey(position) === key);
}

export function countQuantity(positions) {
  return positions.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function filterPositions(positions, filters) {
  return positions.filter((position) => {
    const matchesSearch = filters.search
      ? String(position.article).toLowerCase().includes(String(filters.search).toLowerCase())
      : true;

    const matchesWarehouse = filters.warehouseId ? position.warehouseId === filters.warehouseId : true;
    const matchesFloor = filters.floor ? Number(position.floor) === Number(filters.floor) : true;
    const matchesRow = filters.row ? position.row === filters.row : true;

    return matchesSearch && matchesWarehouse && matchesFloor && matchesRow;
  });
}
