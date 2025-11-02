import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../api';

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await apiRequest('/api/user/results');
        setResults(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Загрузка результатов...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-tg-text">Мои результаты</h1>
      
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-tg-secondary-bg rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">{result.topic}</h2>
                  <p className="text-sm text-tg-hint">
                    {new Date(result.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <p className={`font-bold text-xl ${result.score >= 75 ? 'text-green-500' : 'text-red-500'}`}>
                  {result.score}%
                </p>
              </div>
              {result.certificate_url && (
                <a 
                  href={result.certificate_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-tg-link font-semibold mt-2 inline-block"
                >
                  📄 Посмотреть сертификат
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-tg-secondary-bg rounded-lg">
            <p className="text-tg-hint">Вы еще не прошли ни одного теста.</p>
        </div>
      )}

      <button onClick={() => navigate('/')} className="w-full mt-4 p-3 bg-tg-button text-tg-button-text font-bold rounded-lg hover:opacity-90 transition-opacity">
        На главную
      </button>
    </div>
  );
}

export default Results;
