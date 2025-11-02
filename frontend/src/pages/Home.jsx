import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const testModules = [
  { id: 'electro', name: 'Электробезопасность', emoji: '⚡️' },
  { id: 'fire', name: 'Пожарная безопасность', emoji: '🔥' },
  { id: 'first-aid', name: 'Первая помощь', emoji: '🩹' },
  { id: 'height', name: 'Работа на высоте', emoji: '🏗️' },
];

function Home() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleModuleClick = (topic) => {
    navigate(`/test/${topic}`);
  };
  
  const handleAIAssistantClick = () => {
    navigate('/ai-assistant');
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-tg-secondary-bg rounded-lg shadow">
        <h1 className="text-xl font-bold text-tg-text">
          Здравствуйте, {user?.first_name || 'Пользователь'}!
        </h1>
        <p className="text-tg-hint mt-1">
          Готовы проверить свои знания по технике безопасности?
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-tg-text">Выберите модуль для тестирования:</h2>
        {testModules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.name)}
            className="w-full flex items-center p-4 bg-tg-secondary-bg rounded-lg shadow-sm hover:bg-opacity-80 transition-all duration-200 text-left"
          >
            <span className="text-2xl mr-4">{module.emoji}</span>
            <span className="font-medium text-tg-text">{module.name}</span>
          </button>
        ))}
      </div>
      
      <div className="pt-4 space-y-3">
        <button
          onClick={handleAIAssistantClick}
          className="w-full p-4 bg-tg-button text-tg-button-text rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          🤖 Задать вопрос ИИ-ассистенту
        </button>
        <button
          onClick={() => navigate('/results')}
          className="w-full p-4 bg-tg-secondary-bg text-tg-text rounded-lg font-semibold shadow-md hover:bg-opacity-80 transition-all"
        >
          🏆 Мои результаты
        </button>
         <button
          onClick={() => navigate('/settings')}
          className="w-full p-4 bg-tg-secondary-bg text-tg-text rounded-lg font-semibold shadow-md hover:bg-opacity-80 transition-all"
        >
          ⚙️ Настройки
        </button>
      </div>
    </div>
  );
}

export default Home;