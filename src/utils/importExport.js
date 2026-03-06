import { formatDateTime } from './date';

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportDataToJson(data) {
  const payload = JSON.stringify(data, null, 2);
  const filename = `wms-light-backup-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(filename, payload, 'application/json;charset=utf-8');
}

function escapeCsv(value) {
  const normalized = String(value ?? '');
  if (normalized.includes(';') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function exportPositionsToCsv(positions) {
  const headers = [
    'Артикул',
    'Количество',
    'Склад',
    'Этаж',
    'Ряд',
    'Ячейка',
    'Комментарий',
    'Создано',
    'Обновлено'
  ];

  const rows = positions.map((item) => [
    item.article,
    item.quantity,
    item.warehouseName,
    item.floor,
    item.row,
    item.cell,
    item.comment,
    formatDateTime(item.createdAt),
    formatDateTime(item.updatedAt)
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n');
  const filename = `wms-light-positions-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(filename, csv, 'text/csv;charset=utf-8');
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(parsed);
      } catch (error) {
        reject(new Error('Невалидный JSON-файл.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл.'));
    };

    reader.readAsText(file, 'utf-8');
  });
}

export function validateImportedData(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Файл не содержит объект данных.' };
  }

  if (!Array.isArray(payload.warehouses)) {
    return { ok: false, message: 'Отсутствует массив warehouses.' };
  }

  if (!payload.layouts || typeof payload.layouts !== 'object') {
    return { ok: false, message: 'Отсутствует объект layouts.' };
  }

  if (!Array.isArray(payload.positions)) {
    return { ok: false, message: 'Отсутствует массив positions.' };
  }

  return {
    ok: true,
    data: {
      warehouses: payload.warehouses,
      layouts: payload.layouts,
      positions: payload.positions
    }
  };
}
