import { useEffect, useMemo, useState } from 'react';
import { CellDetailsPanel } from '../components/CellDetailsPanel';
import { WarehouseMap } from '../components/WarehouseMap';
import { groupPositionsByAddress, positionAddressKey } from '../utils/position';

export function MapPage({ warehouses, positions, getLayoutElements, getPalletPlaces }) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);

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
      setSelectedCell(null);
    }
  }, [warehouses, selectedWarehouseId]);

  useEffect(() => {
    if (selectedWarehouse && selectedFloor > selectedWarehouse.floorsCount) {
      setSelectedFloor(selectedWarehouse.floorsCount);
      setSelectedCell(null);
    }
  }, [selectedWarehouse, selectedFloor]);

  useEffect(() => {
    setSelectedCell(null);
  }, [selectedWarehouseId, selectedFloor]);

  const layoutElements = getLayoutElements(selectedWarehouseId, selectedFloor);
  const places = getPalletPlaces(selectedWarehouseId, selectedFloor);

  const floorPositions = positions.filter(
    (item) => item.warehouseId === selectedWarehouseId && Number(item.floor) === Number(selectedFloor)
  );

  const positionsByAddress = useMemo(() => groupPositionsByAddress(floorPositions), [floorPositions]);

  const highlightedAddresses = useMemo(() => {
    if (!search.trim()) {
      return new Set();
    }

    const matched = floorPositions.filter((position) =>
      String(position.article).toLowerCase().includes(search.trim().toLowerCase())
    );

    return new Set(matched.map((item) => positionAddressKey(item)));
  }, [floorPositions, search]);

  const occupiedCount = useMemo(() => {
    const set = new Set(floorPositions.map((item) => positionAddressKey(item)));
    return set.size;
  }, [floorPositions]);

  const totalPlaces = places.length;
  const freePlaces = Math.max(0, totalPlaces - occupiedCount);

  const selectedAddressKey = selectedCell?.addressKey || '';

  return (
    <div className="page-layout">
      <section className="card map-controls">
        <h2>Карта склада</h2>

        <div className="grid grid-4">
          <label>
            Склад
            <select
              value={selectedWarehouseId}
              onChange={(event) => {
                setSelectedWarehouseId(event.target.value);
                setSelectedFloor(1);
              }}
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
              value={selectedFloor}
              onChange={(event) => setSelectedFloor(Number(event.target.value))}
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

          <label>
            Поиск по артикулу
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Например: SKU-1001"
            />
          </label>

          <div className="stats-grid">
            <div>
              <strong>{totalPlaces}</strong>
              <span>Паллетных мест</span>
            </div>
            <div>
              <strong>{occupiedCount}</strong>
              <span>Занято</span>
            </div>
            <div>
              <strong>{freePlaces}</strong>
              <span>Свободно</span>
            </div>
          </div>
        </div>

        <div className="legend">
          <span><i className="legend-box legend-box--free" />Свободно</span>
          <span><i className="legend-box legend-box--occupied" />Занято</span>
          <span><i className="legend-box legend-box--highlight" />Найдено по артикулу</span>
          <span><i className="legend-box legend-box--zone" />Проход / зона</span>
        </div>
      </section>

      <div className="map-grid">
        <WarehouseMap
          layoutElements={layoutElements}
          warehouseId={selectedWarehouseId}
          floor={selectedFloor}
          positionsByAddress={positionsByAddress}
          selectedAddressKey={selectedAddressKey}
          highlightedAddresses={highlightedAddresses}
          onCellSelect={setSelectedCell}
        />

        <CellDetailsPanel
          selectedCell={selectedCell}
          warehouseName={selectedWarehouse?.name}
          floor={selectedFloor}
        />
      </div>
    </div>
  );
}
