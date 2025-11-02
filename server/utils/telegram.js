import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Validates the initData string from Telegram
 * @param {string} initData - The initData string from `WebApp.initData`
 * @returns {boolean} - True if validation is successful, false otherwise
 */
export function validateInitData(initData) {
    if (!BOT_TOKEN) {
        // Эта ошибка будет поймана в authMiddleware и отправлена на фронтенд
        throw new Error("TELEGRAM_BOT_TOKEN is not configured on the server.");
    }
    if (!initData) {
        return false;
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckArr = [];
    for (const [key, value] of params.entries()) {
        dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    try {
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        return calculatedHash === hash;
    } catch (error) {
        console.error('Error during validation:', error);
        return false;
    }
}
