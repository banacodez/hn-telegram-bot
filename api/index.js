const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { config } = require('../src/config/config');
const { fetchTopStories } = require('../src/services/hnService');
const { formatStoryMessage } = require('../src/utils/messageFormatter');
const { logger } = require('../src/utils/logger');

// We use the token but NO POLLING.
const bot = new TelegramBot(config.token);

// This sets the webhook to the Vercel URL. /api/index is the path to this file.
bot.setWebHook(`https://${process.env.VERCEL_URL}/api/index`);

const app = express();
app.use(express.json());

// We listen for POST requests to our webhook path
app.post('/api/index', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200); // Acknowledge the request to Telegram
});

// Your original command handlers are perfect and need no changes.
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `Welcome to Hacker News Bot! 🚀\n\n` +
    `Available commands:\n` +
    `/getnews - Get the latest top news\n` +
    `/help - Show this help message`;
  bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `Hacker News Bot Commands:\n\n` +
    `🔹 /getnews - Fetch top 10 stories from Hacker News\n` +
    `🔹 /help - Show this help message\n\n` +
    `The bot also automatically posts updates daily at 8:00 AM EAT.`;
  bot.sendMessage(msg.chat.id, helpMessage);
});

bot.onText(/\/getnews/, async (msg) => {
  try {
    const stories = await fetchTopStories();
    const messageObject = formatStoryMessage(stories);
    await bot.sendMessage(msg.chat.id, messageObject.text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: messageObject.reply_markup
    });
  } catch (error) {
    logger.error('Error handling /getnews command:', error);
    await bot.sendMessage(msg.chat.id, '⚠️ Failed to fetch stories. Please try again later.');
  }
});

// Export the Express app for Vercel
module.exports = app;
