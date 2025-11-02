import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ключ для хранения настроек в localStorage
const PREFERENCES_KEY = 'userPreferences';

// Функция для получения настроек
const getPreferences = () => {
  try {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    return prefs ? JSON.parse(prefs) : { notificationsEnabled: true }; // Значение по умолчанию
  } catch (error) {
    console.error("Error reading preferences from localStorage", error);
    return { notificationsEnabled: true };
  }
};

// Функция для сохранения настроек
const savePreferences = (prefs) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Error saving preferences to localStorage", error);
  }
};


function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => getPreferences().notificationsEnabled
  );
  const navigate = useNavigate();

  // Эффект для сохранения изменений в localStorage
  useEffect(() => {
    savePreferences({ notificationsEnabled });
  }, [notificationsEnabled]);
  
  const handleToggle = () => {
    setNotificationsEnabled(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-tg-text">Настройки</h1>
      
      <div className="p-4 bg-tg-secondary-bg rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-tg-text">Получать уведомления</h2>
            <p className="text-sm text-tg-hint">Уведомления о новых тестах и результатах.</p>
          </div>
          <label htmlFor="toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="toggle" 
                type="checkbox" 
                className="sr-only" 
                checked={notificationsEnabled}
                onChange={handleToggle}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${notificationsEnabled ? 'transform translate-x-6 bg-green-400' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      <div className="text-center text-tg-hint text-sm p-4">
        Ваши предпочтения сохраняются на этом устройстве.
      </div>
      
      <button 
        onClick={() => navigate('/')} 
        className="w-full mt-4 p-3 bg-tg-button text-tg-button-text font-bold rounded-lg hover:opacity-90 transition-opacity"
      >
        На главную
      </button>
    </div>
  );
}

export default Settings;