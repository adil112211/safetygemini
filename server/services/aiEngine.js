
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = process.env.PINECONE_INDEX;

// Функция для поиска релевантного контекста в Pinecone (заглушка)
async function searchRelevantContext(topic) {
    // В реальном приложении здесь будет логика для векторизации `topic`
    // и поиска релевантных документов в Pinecone
    console.log(`Searching context for: ${topic} in Pinecone index: ${indexName}`);
    // Возвращаем заглушку, так как база знаний не наполнена
    return "Электробезопасность — это система организационных и технических мероприятий и средств, обеспечивающих защиту людей от вредного и опасного воздействия электрического тока.";
}

/**
 * Генерирует тестовые вопросы по заданной теме
 * @param {string} topic - Тема для теста
 * @returns {Promise<Object>} - Объект с вопросами
 */
export async function generateTest(topic) {
    const context = await searchRelevantContext(topic);

    const prompt = `
    Создай 5 тестовых вопросов по технике безопасности на тему "${topic}".
    Используй следующий контекст для генерации вопросов: "${context}".
    
    Каждый вопрос должен иметь:
    1. "question": Текст вопроса (string).
    2. "options": Массив из 4 строк с вариантами ответов (array of strings).
    3. "correctAnswer": Индекс правильного ответа в массиве "options" (number, от 0 до 3).

    Верни результат в виде валидного JSON массива объектов. Пример:
    [
      {
        "question": "Что делать при обнаружении оголенного провода?",
        "options": ["Трогать", "Немедленно сообщить ответственному", "Починить самому", "Проигнорировать"],
        "correctAnswer": 1
      }
    ]
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text;
        // Очищаем от возможных ```json и ```
        const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Error generating test from Gemini:", error);
        throw new Error("Failed to parse AI response. The format might be incorrect.");
    }
}

/**
 * Отвечает на вопрос пользователя, используя контекст из Pinecone
 * @param {string} question - Вопрос пользователя
 * @returns {Promise<string>} - Ответ ИИ
 */
export async function askAI(question) {
    const context = await searchRelevantContext(question);

    const prompt = `
    Ты — ИИ-ассистент по технике безопасности на производстве.
    Ответь на вопрос пользователя, основываясь на предоставленном контексте.
    Будь кратким, точным и вежливым.

    Контекст: "${context}"
    Вопрос: "${question}"

    Ответ:
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
}
