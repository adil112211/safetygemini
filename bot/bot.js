
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.FRONTEND_URL;

if (!token || !webAppUrl) {
    console.error("TELEGRAM_BOT_TOKEN or FRONTEND_URL is not defined in .env file");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('✅ Bot has been started...');

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы начать тестирование по технике безопасности.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Начать тест', web_app: { url: webAppUrl } }]
            ]
        }
    });
});

bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    try {
        const data = JSON.parse(msg.web_app_data.data);
        bot.sendMessage(chatId, `Поздравляем! Вы завершили тест по теме "${data.topic}" с результатом ${data.score}%.`);
        if (data.certificateUrl) {
            bot.sendMessage(chatId, `Ваш сертификат доступен по ссылке: ${data.certificateUrl}`);
        }
    } catch (e) {
        console.error('Error parsing web_app_data:', e);
    }
});
