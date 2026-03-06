import { createRackCells, LAYOUT_TYPES } from '../utils/layout';

function getElementClass(type) {
  switch (type) {
    case LAYOUT_TYPES.gate:
      return 'map-zone map-zone--gate';
    case LAYOUT_TYPES.aisle:
      return 'map-zone map-zone--aisle';
    case LAYOUT_TYPES.empty:
      return 'map-zone map-zone--empty';
    case LAYOUT_TYPES.labelZone:
      return 'map-zone map-zone--label';
    default:
      return 'map-zone';
  }
}

export function WarehouseMap({
  layoutElements,
  warehouseId,
  floor,
  positionsByAddress,
  selectedAddressKey,
  highlightedAddresses,
  onCellSelect
}) {
  if (!layoutElements || layoutElements.length === 0) {
    return <div className="card empty-state">Для выбранного этажа схема не настроена.</div>;
  }

  return (
    <div className="map-layout card">
      {layoutElements.map((element) => {
        if (element.type !== LAYOUT_TYPES.rackRow) {
          return (
            <div key={element.id} className={getElementClass(element.type)}>
              {element.label || 'Зона'}
            </div>
          );
        }

        const cells = createRackCells(element, warehouseId, floor);

        return (
          <div key={element.id} className="map-rack-row">
            <div className="map-rack-row__title">{element.label || `Ряд ${element.rowName || '-'}`}</div>
            <div className="map-rack-row__cells">
              {cells.map((cell) => {
                const list = positionsByAddress[cell.addressKey] || [];
                const isOccupied = list.length > 0;
                const isSelected = selectedAddressKey === cell.addressKey;
                const isHighlighted = highlightedAddresses.has(cell.addressKey);

                return (
                  <button
                    key={cell.id}
                    type="button"
                    className={[
                      'pallet-cell',
                      isOccupied ? 'is-occupied' : 'is-free',
                      isSelected ? 'is-selected' : '',
                      isHighlighted ? 'is-highlighted' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={`${cell.displayLabel}`}
                    onClick={() => onCellSelect({ ...cell, positions: list })}
                  >
                    <span>{cell.cell}</span>
                    {list.length > 0 ? <small>{list.length}</small> : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
