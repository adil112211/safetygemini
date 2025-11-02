
# Telegram Mini App: Тесты по Технике Безопасности

Это полнофункциональное веб-приложение (Telegram Mini App) для тестирования знаний по технике безопасности на производстве. Приложение интегрировано с Supabase для хранения данных, OpenAI для генерации контента и Pinecone для контекстного поиска.

## Технологический стек

- **Frontend**: React, Vite, Tailwind CSS, Telegram Web Apps SDK
- **Backend**: Node.js, Express (развертывается как Serverless Functions)
- **База данных**: Supabase (PostgreSQL)
- **AI**: OpenAI (GPT-4o-mini), Pinecone
- **Telegram Бот**: node-telegram-bot-api (через Webhooks)
- **Платформа**: Vercel

## Структура проекта

```
/
├── frontend/
│   ├── src/
│   └── ...
├── server/
│   ├── db/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── package.json
├── .env.example
└── README.md
```

## 1. Предварительные требования

- Node.js (v18+)
- npm / yarn
- Аккаунты:
  - [Telegram](https://telegram.org/) (и созданный бот через @BotFather)
  - [Supabase](https://supabase.com/)
  - [OpenAI](https://platform.openai.com/)
  - [Pinecone](https://www.pinecone.io/)
  - [Vercel](https://vercel.com/)

## 2. Настройка

1.  **Клонируйте репозиторий:**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    ```

2.  **Создайте файл `.env`** в корне проекта, скопировав `.env.example`, и заполните все переменные. `BACKEND_URL` и `FRONTEND_URL` вы получите после деплоя.
    ```ini
    # Telegram
    TELEGRAM_BOT_TOKEN=...

    # Supabase
    SUPABASE_URL=...
    SUPABASE_KEY=...

    # AI
    OPENAI_API_KEY=...
    PINECONE_API_KEY=...
    PINECONE_INDEX=...

    # Deployment URLs (заполняются после деплоя)
    FRONTEND_URL=...
    BACKEND_URL=...
    ```

3.  **Настройте таблицы в Supabase**, выполнив SQL-запрос из [предыдущей версии README](<ссылка на коммит или старый файл>).

## 3. Установка зависимостей

```bash
# Установка для Backend
cd server
npm install

# Установка для Frontend
cd ../frontend
npm install
```

## 4. Локальный запуск

```bash
# Терминал 1: Backend
cd server
npm run dev

# Терминал 2: Frontend
cd frontend
npm run dev
```
*Frontend будет доступен по адресу `http://localhost:5173`.*
*Backend будет доступен по адресу `http://localhost:8080`.*

**Важно:** Логика бота (веб-хук) локально работать не будет без специальных инструментов, таких как `ngrok`. Рекомендуется тестировать ее после деплоя.

## 5. Деплой на Vercel

Этот проект оптимизирован для полного развертывания на платформе Vercel.

1.  **Подключите ваш GitHub репозиторий к Vercel.**

2.  **Деплой Frontend:**
    - Создайте новый проект в Vercel.
    - В настройках **Build & Development Settings** укажите **Root Directory**: `frontend`.
    - Vercel автоматически определит Vite. Запустите деплой.
    - После завершения вы получите URL (например, `https://your-app.vercel.app`). **Скопируйте его**.

3.  **Деплой Backend:**
    - Создайте еще один проект в Vercel.
    - В настройках **Build & Development Settings** укажите **Root Directory**: `server`.
    - Перейдите в раздел **Environment Variables** и добавьте все переменные из вашего `.env` файла.
    - **Важно:** В переменную `FRONTEND_URL` вставьте URL, полученный на предыдущем шаге.
    - Запустите деплой. После завершения **скопируйте URL вашего бэкенда**.

4.  **Настройка Telegram Webhook:**
    - После успешного деплоя бэкенда вам нужно *один раз* сообщить Telegram, куда отправлять обновления для вашего бота.
    - Для этого откройте в браузере следующую ссылку, подставив в нее ваш токен бота и URL бэкенда:
      ```
      https://api.telegram.org/bot<ВАШ_TELEGRAM_BOT_TOKEN>/setWebhook?url=<ВАШ_BACKEND_URL>/api/telegram/webhook
      ```
    - Пример: `https://api.telegram.org/bot12345:ABC-DEF/setWebhook?url=https://my-backend.vercel.app/api/telegram/webhook`
    - Если вы увидите `{"ok":true,"result":true,"description":"Webhook was set"}`, значит все прошло успешно.

5.  **Настройка кнопки в боте:**
    - Откройте `@BotFather` в Telegram.
    - Выберите вашего бота и перейдите в `Bot Settings` -> `Menu Button`.
    - Настройте кнопку меню для запуска Web App, указав ваш `FRONTEND_URL`.

✅ Ваш проект полностью развернут и готов к работе!
