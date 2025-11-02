
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Safety TMA Backend is running!');
});

// Этот листенер будет использоваться для локальной разработки, Vercel его проигнорирует
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// Экспортируем app для Vercel
export default app;
