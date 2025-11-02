
import { Router } from 'express';
import { supabase } from '../db/supabaseClient.js';
import { generateTest, askAI } from '../services/aiEngine.js';
import { generateCertificate } from '../utils/certificates.js';
import { validateInitData } from '../utils/telegram.js';
import TelegramBot from 'node-telegram-bot-api';

const router = Router();

// --- Bot Webhook Logic ---
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.FRONTEND_URL;

router.post('/telegram/webhook', (req, res) => {
    // В stateless окружении Vercel мы создаем экземпляр бота для каждого запроса
    const bot = new TelegramBot(token);
    const msg = req.body;

    // Обработка команды /start
    if (msg.message && msg.message.text && msg.message.text.startsWith('/start')) {
        const chatId = msg.message.chat.id;
        bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы начать тестирование по технике безопасности.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Начать тест', web_app: { url: webAppUrl } }]
                ]
            }
        });
    } 
    // Обработка данных из Web App
    else if (msg.message && msg.message.web_app_data) {
        const chatId = msg.message.chat.id;
        try {
            const data = JSON.parse(msg.message.web_app_data.data);
            bot.sendMessage(chatId, `Поздравляем! Вы завершили тест по теме "${data.topic}" с результатом ${data.score}%.`);
            if (data.certificateUrl) {
                bot.sendMessage(chatId, `Ваш сертификат доступен по ссылке: ${data.certificateUrl}`);
            }
        } catch (e) {
            console.error('Error parsing web_app_data:', e);
        }
    }

    res.sendStatus(200); // Отвечаем Telegram, что все в порядке
});


// --- Mini App API Logic ---

// Middleware для валидации данных от Telegram
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('tma ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing TMA token' });
    }

    const initData = authHeader.split(' ')[1];
    if (validateInitData(initData)) {
        req.user = JSON.parse(new URLSearchParams(initData).get('user'));
        next();
    } else {
        return res.status(403).json({ message: 'Forbidden: Invalid data' });
    }
};


// Маршрут для аутентификации пользователя и получения его данных
router.post('/user/auth', authMiddleware, async (req, res) => {
    try {
        const tgUser = req.user;
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', tgUser.id)
            .single();

        if (error && error.code === 'PGRST116') { // Not found
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    telegram_id: tgUser.id,
                    first_name: tgUser.first_name,
                    last_name: tgUser.last_name,
                    username: tgUser.username,
                })
                .select()
                .single();
            if (insertError) throw insertError;
            user = newUser;
        } else if (error) {
            throw error;
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


// Генерация теста
router.post('/generate-test', authMiddleware, async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ message: 'Topic is required' });
    }
    try {
        const questions = await generateTest(topic);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate test', error: error.message });
    }
});

// Отправка результатов теста
router.post('/submit-test', authMiddleware, async (req, res) => {
    const { userId, topic, score, answers, correctAnswers } = req.body;
    
    // В реальном приложении оценка должна происходить на бэкенде
    // let calculatedScore = 0;
    // answers.forEach((answer, index) => {
    //     if(answer === correctAnswers[index]) calculatedScore++;
    // });
    // const finalScore = Math.round((calculatedScore / correctAnswers.length) * 100);

    const finalScore = score; // Для простоты пока доверяем фронтенду

    try {
        let certificateUrl = null;
        if (finalScore >= 75) {
            const pdfBytes = await generateCertificate(req.user.first_name, finalScore, topic);
            const fileName = `certificates/${userId}_${topic.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            
            const { error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(fileName, pdfBytes, {
                    contentType: 'application/pdf',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('certificates')
                .getPublicUrl(fileName);
            
            certificateUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase.from('results').insert({
            user_id: userId,
            topic,
            score: finalScore,
            certificate_url: certificateUrl,
        });

        if (error) throw error;
        
        res.status(201).json({ score: finalScore, certificateUrl });

    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Failed to submit test', error: error.message });
    }
});

// Запрос к ИИ-ассистенту
router.post('/ask-ai', authMiddleware, async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }
    try {
        const answer = await askAI(question);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get answer from AI', error: error.message });
    }
});

// Получение истории результатов пользователя
router.get('/user/results', authMiddleware, async (req, res) => {
    try {
        const tgUser = req.user;
        
        // 1. Находим нашего пользователя в БД, чтобы получить его внутренний ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', tgUser.id)
            .single();

        if (userError || !user) {
            // Если пользователь не найден, возвращаем 404, хотя это маловероятно при authMiddleware
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Получаем все результаты для этого пользователя
        const { data: results, error: resultsError } = await supabase
            .from('results')
            .select('topic, score, certificate_url, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (resultsError) {
            throw resultsError;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching user results:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

export default router;
