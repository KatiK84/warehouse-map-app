const STORAGE_KEYS = {
  warehouses: 'wms_light_warehouses',
  layouts: 'wms_light_layouts',
  positions: 'wms_light_positions'
};

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`Ошибка чтения localStorage (${key})`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Ошибка записи localStorage (${key})`, error);
  }
}

export function loadAllData() {
  return {
    warehouses: readJson(STORAGE_KEYS.warehouses, []),
    layouts: readJson(STORAGE_KEYS.layouts, {}),
    positions: readJson(STORAGE_KEYS.positions, [])
  };
}

export function saveWarehouses(value) {
  writeJson(STORAGE_KEYS.warehouses, value);
}

export function saveLayouts(value) {
  writeJson(STORAGE_KEYS.layouts, value);
}

export function savePositions(value) {
  writeJson(STORAGE_KEYS.positions, value);
}
