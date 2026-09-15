# Локальная Витрина — MVP

Локальный маркетплейс-агрегатор на Next.js 14+ (App Router).

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Стек

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Lucide React

## Структура

```
src/
  app/           — роутинг и страницы
  components/
    ui/          — Toast, Modal
    product/     — ProductCard, ProductGrid, ContactSellerButton
    layout/      — Header
  lib/           — mockData, utils
  types/         — TypeScript интерфейсы
```
