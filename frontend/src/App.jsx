import React, { createContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import Home from './pages/Home';
import Test from './pages/Test';
import AI from './pages/AI';
import Results from './pages/Results';
import Settings from './pages/Settings';
import apiRequest from './api'; // Импортируем нашу новую утилиту

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      if (WebApp.initData && import.meta.env.VITE_API_URL) {
        try {
          const userData = await apiRequest('/api/user/auth', 'POST');
          setUser(userData);
          WebApp.expand(); // Раскрываем приложение на весь экран
        } catch (e) {
          setError(`Ошибка аутентификации: ${e.message}`);
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
         if (!WebApp.initData) {
            setError('Не удалось получить данные Telegram. Пожалуйста, откройте приложение через Telegram.');
         } else {
            setError('URL для API не настроен. Проверьте переменные окружения.');
         }
         setLoading(false);
      }
    };
    
    WebApp.ready();
    authenticateUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-tg-bg text-tg-text">Загрузка...</div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen bg-tg-bg text-tg-text p-4 text-center">{error}</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-tg-bg text-tg-text font-sans">
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test/:topic" element={<Test />} />
            <Route path="/ai-assistant" element={<AI />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default App;
