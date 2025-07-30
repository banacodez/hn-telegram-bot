const TelegramBot = require('node-telegram-bot-api');
const { config } = require('../src/config/config');
const { fetchTopStories } = require('../src/services/hnService');
const { formatStoryMessage } = require('../src/utils/messageFormatter');
const { logger } = require('../src/utils/logger');

// --- Helper Functions for Commands ---

const handleStart = (bot, chatId) => {
  const welcomeMessage = `Welcome to Hacker News Bot! 🚀\n\n` +
    `Available commands:\n` +
    `/getnews - Get the latest top news\n` +
    `/help - Show this help message`;
  bot.sendMessage(chatId, welcomeMessage);
};

const handleHelp = (bot, chatId) => {
  const helpMessage = `Hacker News Bot Commands:\n\n` +
    `🔹 /getnews - Fetch top 10 stories from Hacker News\n` +
    `🔹 /help - Show this help message\n\n` +
    `The bot also automatically posts updates daily at 8:00 AM EAT.`;
  bot.sendMessage(chatId, helpMessage);
};

const handleGetNews = async (bot, chatId) => {
  try {
    const stories = await fetchTopStories();
    const messageObject = formatStoryMessage(stories);
    await bot.sendMessage(chatId, messageObject.text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: messageObject.reply_markup
    });
  } catch (error) {
    logger.error('Error in handleGetNews:', error);
    await bot.sendMessage(chatId, '⚠️ Failed to fetch stories. Please try again later.');
  }
};

// --- Main Vercel Serverless Function ---

module.exports = async (request, response) => {
  try {
    const bot = new TelegramBot(config.token);
    const { message } = request.body;

    // Check if message and text exist
    if (message && message.text) {
      const chatId = message.chat.id;
      const command = message.text;
      
      logger.info(`Received command: "${command}" from chat ID: ${chatId}`);

      // Handle commands directly
      if (command === '/start') {
        handleStart(bot, chatId);
      } else if (command === '/help') {
        handleHelp(bot, chatId);
      } else if (command === '/getnews') {
        // We MUST await this because it's an async operation
        await handleGetNews(bot, chatId);
      }
    }
  } catch (error) {
    logger.error('Error in main function:', error);
  }

  // Respond to Telegram to acknowledge receipt of the message
  response.status(200).send('OK');
};
