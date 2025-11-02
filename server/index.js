
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---

// Настраиваем CORS, чтобы разрешить запросы только с нашего фронтенда
// Это критически важно для исправления ошибки "failed to fetch"
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200, // для совместимости со старыми браузерами
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
