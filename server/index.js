
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---

// Более надежная настройка CORS для исправления ошибки "Failed to fetch"
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173' // Для локальной разработки
].filter(Boolean); // Удаляем пустые значения, если FRONTEND_URL не установлен

if (!process.env.FRONTEND_URL) {
    console.warn('⚠️ WARNING: FRONTEND_URL is not set. CORS might not work in production.');
}

const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем запросы, если их источник есть в белом списке,
        // или если это запросы без источника (например, Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin '${origin}' not allowed by CORS.`));
        }
    },
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// --- Routes ---
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Safety TMA Backend is running!');
});

// Этот листенер будет использоваться для локальной разработки, Vercel его проигнорирует
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running locally on port ${PORT}`);
    });
}

// Экспортируем app для Vercel
export default app;
