import { useRef } from 'react';

export function DataToolbar({ onExportJson, onImportJson, onExportCsv }) {
  const fileInputRef = useRef(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      onImportJson(file);
    }

    event.target.value = '';
  }

  return (
    <div className="data-toolbar card">
      <button type="button" onClick={onExportJson}>
        Экспорт всех данных (JSON)
      </button>
      <button type="button" onClick={handleImportClick}>
        Импорт данных (JSON)
      </button>
      <button type="button" onClick={onExportCsv}>
        Экспорт позиций (CSV)
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
