# WMS Light - Карта склада (MVP)

Локальное веб-приложение для складского учета без backend.

## Возможности MVP

- Управление складами (CRUD): название, количество этажей.
- Конструктор схемы по каждому этажу склада.
- Типы элементов схемы: `rackRow`, `aisle`, `gate`, `empty`, `labelZone`.
- Каждая ячейка в `rackRow` - отдельное паллетное место с адресом:
  - `warehouseId + floor + row + cell`
- Управление позициями (CRUD): артикул, количество, адрес, комментарий.
- Зависимые поля в форме позиции: склад -> этаж -> ряд -> ячейка.
- Нельзя сохранить позицию в несуществующее место.
- Карта склада с кликабельными ячейками и боковой панелью деталей.
- Поиск по артикулу на карте с подсветкой нужных ячеек.
- Счетчики мест: всего / занято / свободно.
- Экспорт всех данных в JSON.
- Импорт данных из JSON.
- Экспорт позиций в CSV.
- Хранение данных в `localStorage`.

## Технологии

- React
- Vite
- JavaScript
- CSS

## Структура проекта

```text
warehouse-map-app/
  index.html
  package.json
  vite.config.js
  README.md
  public/
  src/
    App.jsx
    main.jsx
    components/
      CellDetailsPanel.jsx
      DataToolbar.jsx
      LayoutBuilder.jsx
      Notification.jsx
      PositionForm.jsx
      PositionTable.jsx
      TabNav.jsx
      WarehouseForm.jsx
      WarehouseMap.jsx
      WarehouseTable.jsx
    data/
      demoData.js
    hooks/
      useAppData.js
    pages/
      MapPage.jsx
      PositionsPage.jsx
      WarehousesPage.jsx
    styles/
      global.css
    utils/
      date.js
      id.js
      importExport.js
      layout.js
      position.js
      storage.js
```

## 1. Установка зависимостей

```bash
npm install
```

## 2. Локальный запуск

```bash
npm run dev
```

После запуска откройте URL из терминала (обычно `http://localhost:5173`).

## 3. Сборка проекта

```bash
npm run build
```

Результат будет в папке `dist/`.

## 4. Локальный preview production-сборки

```bash
npm run preview
```

## 5. Как загрузить в GitHub

```bash
git init
git add .
git commit -m "init wms light mvp"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 6. Как включить GitHub Pages

1. Откройте репозиторий на GitHub.
2. Перейдите в `Settings` -> `Pages`.
3. В `Build and deployment` выберите `Deploy from a branch`.
4. Выберите ветку `main` и папку `/docs` или используйте GitHub Actions для `dist`.
5. Для простого варианта можно собирать и выкладывать содержимое `dist` в отдельную ветку `gh-pages`.

Примечание: в `vite.config.js` установлен `base: './'`, что удобно для локального открытия сборки и простого деплоя.

## 7. Где лежат данные

Данные хранятся в `localStorage` браузера, ключи:

- `wms_light_warehouses`
- `wms_light_layouts`
- `wms_light_positions`

## 8. Как работает localStorage

- При первом запуске, если данных нет, автоматически создаются demo-данные:
  - 1 demo-склад,
  - 2 этажа,
  - demo-схема,
  - demo-позиции.
- Любые изменения в UI сразу сохраняются в `localStorage`.
- После перезагрузки страницы данные остаются.

## 9. Импорт / Экспорт данных

### Экспорт всех данных в JSON

Кнопка: `Экспорт всех данных (JSON)`.

JSON содержит три корневые сущности:

```json
{
  "warehouses": [],
  "layouts": {},
  "positions": []
}
```

### Импорт данных из JSON

Кнопка: `Импорт данных (JSON)`.

- Выберите JSON-файл с такой же структурой.
- Данные заменят текущие значения в `localStorage`.

### Экспорт позиций в CSV

Кнопка: `Экспорт позиций (CSV)`.

- CSV включает артикул, количество, адрес, комментарии и даты.

## Модель данных

### Склад

```js
{
  id,
  name,
  floorsCount,
  createdAt,
  updatedAt
}
```

### Layout (схема)

Хранится в объекте `layouts` по ключу `warehouseId::floor`:

```js
{
  warehouseId,
  floor,
  elements: [
    {
      id,
      type, // rackRow | aisle | gate | empty | labelZone
      rowName,
      cellsCount,
      label,
      direction
    }
  ],
  updatedAt
}
```

### Позиция

```js
{
  id,
  article,
  quantity,
  warehouseId,
  warehouseName,
  floor,
  row,
  cell,
  comment,
  createdAt,
  updatedAt
}
```

## Проверки и ограничения

- Позицию нельзя сохранить, если адреса ячейки нет в текущей схеме.
- При удалении склада удаляются его layout и позиции.
- При уменьшении количества этажей у склада удаляются данные этажей выше нового лимита.
- При сохранении схемы этажа удаляются позиции, которых больше нет на новой схеме.
