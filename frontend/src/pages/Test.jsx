
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { UserContext } from '../App';

function Test() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/generate-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `tma ${WebApp.initData}`,
          },
          body: JSON.stringify({ topic }),
        });
        if (!response.ok) throw new Error('Не удалось загрузить вопросы');
        const data = await response.json();
        setQuestions(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [topic]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
  };
  
  const handleSubmit = async () => {
      let score = 0;
      questions.forEach((q, index) => {
          if (selectedAnswers[index] === q.correctAnswer) {
              score++;
          }
      });
      const finalScore = Math.round((score / questions.length) * 100);

      setIsLoading(true);
      try {
          const response = await fetch('/api/submit-test', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `tma ${WebApp.initData}`,
              },
              body: JSON.stringify({ userId: user.id, topic, score: finalScore }),
          });
          if (!response.ok) throw new Error('Не удалось отправить результаты');
          const data = await response.json();
          setResult(data);
          
          // Отправка данных боту
          WebApp.sendData(JSON.stringify({
            topic,
            score: data.score,
            certificateUrl: data.certificateUrl
          }));
          
      } catch (e) {
          setError(e.message);
      } finally {
          setIsLoading(false);
      }
  };


  if (isLoading && !result) return <div className="text-center p-8">Генерация теста...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  if (result) {
    return (
      <div className="text-center p-6 bg-tg-secondary-bg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Тест завершен!</h2>
        <p className="text-lg mb-2">Тема: {topic}</p>
        <p className={`text-4xl font-bold mb-6 ${result.score >= 75 ? 'text-green-500' : 'text-red-500'}`}>
          Ваш результат: {result.score}%
        </p>
        {result.certificateUrl ? (
          <a
            href={result.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-tg-button text-tg-button-text font-bold py-2 px-4 rounded-lg"
          >
            📄 Скачать сертификат
          </a>
        ) : (
          <p className="text-tg-hint">К сожалению, вы не набрали достаточно баллов для получения сертификата (нужно ≥ 75%).</p>
        )}
        <button onClick={() => navigate('/')} className="mt-6 text-tg-link">Вернуться на главную</button>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{topic}</h1>
      <p className="text-tg-hint mb-6">Вопрос {currentQuestionIndex + 1} из {questions.length}</p>

      {currentQuestion && (
        <div className="bg-tg-secondary-bg p-4 rounded-lg">
          <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedAnswers[currentQuestionIndex] === index ? 'bg-tg-button text-tg-button-text border-tg-button' : 'bg-tg-bg border-tg-secondary-bg'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="w-full p-3 bg-green-500 text-white font-bold rounded-lg disabled:opacity-50"
          >
            Завершить тест
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="w-full p-3 bg-tg-button text-tg-button-text font-bold rounded-lg disabled:opacity-50"
          >
            Следующий вопрос
          </button>
        )}
      </div>
    </div>
  );
}

export default Test;
