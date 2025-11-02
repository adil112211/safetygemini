import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../api';

function AI() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setAnswer('');
    try {
      const data = await apiRequest('/api/ask-ai', 'POST', { question });
      setAnswer(data.answer);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh]">
      <div className="flex-1 overflow-y-auto p-4 bg-tg-secondary-bg rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-4">ИИ-ассистент</h2>
        {answer ? (
          <div className="p-3 bg-tg-bg rounded-md whitespace-pre-wrap">{answer}</div>
        ) : (
          <p className="text-tg-hint">Задайте свой вопрос по технике безопасности, и я постараюсь на него ответить.</p>
        )}
         {isLoading && <p className="text-tg-hint mt-4">Ассистент думает...</p>}
         {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      
      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Например: что делать при пожаре?"
          className="flex-1 p-3 rounded-lg bg-tg-secondary-bg text-tg-text border border-tg-hint focus:outline-none focus:border-tg-link"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="p-3 bg-tg-button text-tg-button-text font-bold rounded-lg disabled:opacity-50"
        >
          {isLoading ? '...' : '➤'}
        </button>
      </form>
       <button onClick={() => navigate('/')} className="mt-4 text-tg-link text-center w-full">Вернуться на главную</button>
    </div>
  );
}

export default AI;
