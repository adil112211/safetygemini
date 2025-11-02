import WebApp from '@twa-dev/sdk';

// Получаем базовый URL для API из переменных окружения Vite
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // Это сообщение будет видно в консоли разработчика, если переменная не установлена
  console.error("VITE_API_URL is not defined. Please check your .env file or Vercel environment variables.");
}

/**
 * Универсальная функция для выполнения запросов к API.
 * @param {string} endpoint - Конечная точка API (например, '/api/user/auth').
 * @param {string} method - HTTP метод (GET, POST, etc.).
 * @param {Object|null} body - Тело запроса для POST/PUT.
 * @returns {Promise<any>} - Распарсенный JSON ответ.
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Добавляем заголовок авторизации, если есть данные от Telegram
  if (WebApp.initData) {
    headers['Authorization'] = `tma ${WebApp.initData}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Обработка ошибок
  if (!response.ok) {
    // Пытаемся получить текст ошибки из ответа, если это JSON
    const errorData = await response.json().catch(() => {
        // Если ответ не JSON, возвращаем текстовую ошибку
        return { message: `HTTP error! Status: ${response.status}. The response was not valid JSON.` };
    });
    throw new Error(errorData.message || `An unknown error occurred.`);
  }

  // Если все хорошо, возвращаем JSON
  return response.json();
};

export default apiRequest;
