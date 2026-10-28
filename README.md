# 🛍️ E-Vitrina PMR — Единая витрина локальных магазинов Приднестровья

[![Next.js](https://img.shields.io/badge/Next.js-15_(App_Router)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-1B222D?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

Официальный сайт проекта: [**www.e-vitrina.com**](https://www.e-vitrina.com)

**E-Vitrina PMR** — современный локальный маркетплейс-агрегатор для брендов, бутиков и магазинов Приднестровья (Тирасполь, Бендеры, Рыбница, Дубоссары и др.). Платформа позволяет локальным продавцам вести онлайн-витрину и привлекать покупателей, а пользователям — находить и заказывать товары в своем городе.

---

## ✨ Основные возможности

### Для покупателей
- **⚡ Моментальные фильтры**: бесшовное переключение категорий, подкатегорий, городов, размеров (одежда/обувь), цен и скидок без перезагрузок и дерганий экрана.
- **🔍 Умный «живой» поиск**:
  - Автокомплит товаров, категорий и магазинов прямо в выпадающем меню.
  - Поддержка нечёткого поиска (опечатки, словоформы, русская стемматика, `pg_trgm` + `ILIKE` fallback).
  - Локальная история поиска для быстрого повторного ввода.
- **🏙️ Фильтрация по городам ПМР**: Тирасполь, Бендеры, Рыбница, Дубоссары, Григориополь, Слободзея, Каменка, Днестровск.
- **🛒 Корзина и Избранное**: быстрое сохранение понравившихся товаров и расчет стоимости с персистентным хранилищем.
- **💬 Прямая связь с продавцом**: связь в 1 клик через Telegram, Viber, WhatsApp, Instagram или по телефону.
- **📱 Адаптивный Mobile-first UI**: удобный интерфейс с быстрой нижней панелью навигации и плавными анимациями на Framer Motion.

### Для продавцов и бизнеса
- **🏪 Персональная страница магазина**: брендированный URL (`/shop/[username]`), логотип, баннер, описание и список товаров.
- **📊 Личный кабинет (Dashboard)**:
  - Управление каталогом (добавление, редактирование, архивация товаров).
  - Загрузка и оптимизация изображений через Cloudinary CDN.
  - Настройка параметров доставки, контактов и профиля магазина.
- **🏷️ Вариативность товаров**: поддержка указания размеров одежды и обуви, старой/новой цены, статусов наличия.

### SEO и производительность
- Полная поисковая оптимизация: OpenGraph, динамический `sitemap.xml`, `robots.txt`, микроразметка Schema.org.
- Подтвержденные права и интеграция в **Google Search Console** и **Яндекс.Вебмастер**.
- Высокая скорость за счет гибридного SSR/Client рендеринга и серверного кэширования через Upstash Redis.

---

## 🛠️ Стек технологий

- **Фронтенд**: Next.js 15 (App Router, Turbopack), React 19, TypeScript
- **Стилизация и анимации**: Tailwind CSS, Framer Motion, Lucide React
- **База данных**: PostgreSQL (Neon Cloud) + Prisma ORM
- **Кэширование и сессии**: Upstash Redis
- **Авторизация**: NextAuth.js (Credentials, Bcrypt)
- **Хранилище медиа**: Cloudinary CDN (`next-cloudinary`)
- **Управление состоянием**: Zustand
- **Валидация форм**: React Hook Form, Zod
- **Почта**: Nodemailer

---

## 📁 Структура проекта

```
src/
├── app/                        # App Router (страницы и API маршруты)
│   ├── api/                    # Serverless API endpoints
│   │   ├── products/           # Быстрая выборка и фильтрация каталога
│   │   ├── search-suggestions/ # Живой поиск и автокомплит
│   │   ├── auth/               # Маршруты NextAuth
│   │   └── ...
│   ├── (auth)/                 # Страницы входа и регистрации
│   ├── dashboard/              # Кабинет продавца
│   ├── product/[id]/           # Детальная страница товара
│   ├── shop/[username]/        # Страница конкретного магазина
│   ├── shops/                  # Каталог всех магазинов
│   ├── layout.tsx              # Корневой layout, SEO метатеги
│   ├── page.tsx                # Главная витрина
│   ├── sitemap.ts              # Генератор карты сайта
│   └── robots.ts               # Robots.txt
├── components/                 # UI компоненты
│   ├── home/                   # Компоненты главной (ProductCatalogClient, баннеры)
│   ├── product/                # Карточки, галерея, кнопки связи
│   ├── layout/                 # Хедер, навигация, корзина, избранное
│   ├── dashboard/              # Таблицы, формы добавления товаров
│   └── ui/                     # Модальные окна, тосты, скелетоны
├── lib/                        # Утилиты и конфигурации
│   ├── prisma.ts               # Prisma Client синглтон
│   ├── fuzzySearch.ts          # Нечеткий поиск и русский стеммер
│   ├── auth.ts                 # Конфигурация NextAuth
│   └── utils.ts                # Форматирование цен, Cloudinary loader
├── store/                      # Zustand хранилища (useCartStore, useFavoritesStore)
└── types/                      # TypeScript интерфейсы и типы
```

---

## 🚀 Локальная разработка

### 1. Клонирование репозитория

```bash
git clone https://github.com/Frostbyte220/Vitrina-PMR.git
cd Vitrina-PMR
```

### 2. Установка зависимостей

```bash
npm install
# или
pnpm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корневой директории:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (загрузка изображений)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis (кэширование)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

### 4. Подготовка базы данных

```bash
npx prisma generate
npx prisma db push
```

### 5. Запуск сервера разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## 📦 Сборка и деплой

Проект оптимизирован для развертывания на **Vercel**:

```bash
npm run build
npm run start
```

Все коммиты в ветку `main` автоматически деплоятся на production-домен [www.e-vitrina.com](https://www.e-vitrina.com).

---

## 📄 Лицензия

Все права защищены © 2026 E-Vitrina PMR.
