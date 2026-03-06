import { useState } from 'react';
import { DataToolbar } from './components/DataToolbar';
import { Notification } from './components/Notification';
import { TabNav } from './components/TabNav';
import { useAppData } from './hooks/useAppData';
import { MapPage } from './pages/MapPage';
import { PositionsPage } from './pages/PositionsPage';
import { WarehousesPage } from './pages/WarehousesPage';
import {
  exportDataToJson,
  exportPositionsToCsv,
  parseImportFile,
  validateImportedData
} from './utils/importExport';

function renderPage(activeTab, app) {
  if (activeTab === 'warehouses') {
    return (
      <WarehousesPage
        warehouses={app.warehouses}
        addWarehouse={app.addWarehouse}
        updateWarehouse={app.updateWarehouse}
        deleteWarehouse={app.deleteWarehouse}
        getLayoutElements={app.getLayoutElements}
        saveLayout={app.saveLayout}
      />
    );
  }

  if (activeTab === 'positions') {
    return (
      <PositionsPage
        warehouses={app.warehouses}
        positions={app.positions}
        addPosition={app.addPosition}
        updatePosition={app.updatePosition}
        deletePosition={app.deletePosition}
        getRows={app.getRows}
        getCells={app.getCells}
      />
    );
  }

  return (
    <MapPage
      warehouses={app.warehouses}
      positions={app.positions}
      getLayoutElements={app.getLayoutElements}
      getPalletPlaces={app.getPalletPlaces}
    />
  );
}

export default function App() {
  const app = useAppData();
  const [activeTab, setActiveTab] = useState('warehouses');

  async function handleImport(file) {
    try {
      const parsed = await parseImportFile(file);
      const validation = validateImportedData(parsed);

      if (!validation.ok) {
        app.pushMessage('error', validation.message);
        return;
      }

      app.replaceAllData(validation.data);
    } catch (error) {
      app.pushMessage('error', error.message || 'Ошибка импорта данных.');
    }
  }

  function handleExportJson() {
    exportDataToJson({
      warehouses: app.warehouses,
      layouts: app.layouts,
      positions: app.positions
    });

    app.pushMessage('success', 'JSON-файл с данными выгружен.');
  }

  function handleExportCsv() {
    exportPositionsToCsv(app.positions);
    app.pushMessage('success', 'CSV-файл с позициями выгружен.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>WMS Light · Карта склада</h1>
          <p>Локальный MVP без backend, хранение данных в localStorage.</p>
        </div>
        <DataToolbar
          onExportJson={handleExportJson}
          onImportJson={handleImport}
          onExportCsv={handleExportCsv}
        />
      </header>

      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      <Notification message={app.message} onClose={() => app.setMessage(null)} />

      <main>{renderPage(activeTab, app)}</main>
    </div>
  );
}
