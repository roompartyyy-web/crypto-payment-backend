const TelegramBot = require('node-telegram-bot-api');

// Ton token de bot Telegram (lu depuis les variables d'environnement sur Render)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// --- Fonction pour envoyer une notification ---
async function sendTelegramNotification(chatId, message) {
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log(`Notification sent to ${chatId}`);
    } catch (error) {
        console.error(`Failed to send notification to ${chatId}:`, error.response.body);
    }
}

// --- Fonction pour t'avertir, TOI, l'admin ---
async function notifyAdmin(parrainName, usdAmount, usdtAmount) {
    const adminChatId = process.env.TELEGRAM_CHAT_ID;
    const message = `
✅ *Nouvel achat validé !*

*Parrain :* ${parrainName || 'Aucun'}
*Valeur :* ${usdAmount}$
*USDT envoyés :* ${usdtAmount}
`;
    await sendTelegramNotification(adminChatId, message);
}

// --- Fonction pour avertir le parrain ---
async function notifyParrain(parrainTelegramId, usdtAmount) {
    const message = `
🎉 *Félicitations ! Un de vos filleuls a effectué un achat !*

*USDT achetés :* ${usdtAmount}

Merci pour votre confiance !
`;
    await sendTelegramNotification(parrainTelegramId, message);
}

module.exports = {
    notifyAdmin,
    notifyParrain
};
