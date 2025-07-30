const TelegramBot = require('node-telegram-bot-api');
const { config } = require('../src/config/config');
const { fetchTopStories } = require('../src/services/hnService');
const { formatStoryMessage } = require('../src/utils/messageFormatter');
const { logger } = require('../src/utils/logger');

// This is the main Vercel serverless function
module.exports = async (request, response) => {
  try {
    // Create a new bot instance for every request
    const bot = new TelegramBot(config.token);

    // Define command handlers inside the main function
    bot.onText(/\/start/, (msg) => {
      logger.info('Received /start command');
      const welcomeMessage = `Welcome to Hacker News Bot! 🚀\n\n` +
        `Available commands:\n` +
        `/getnews - Get the latest top news\n` +
        `/help - Show this help message`;
      bot.sendMessage(msg.chat.id, welcomeMessage);
    });

    bot.onText(/\/help/, (msg) => {
      logger.info('Received /help command');
      const helpMessage = `Hacker News Bot Commands:\n\n` +
        `🔹 /getnews - Fetch top 10 stories from Hacker News\n` +
        `🔹 /help - Show this help message\n\n` +
        `The bot also automatically posts updates daily at 8:00 AM EAT.`;
      bot.sendMessage(msg.chat.id, helpMessage);
    });

    bot.onText(/\/getnews/, async (msg) => {
      logger.info('Received /getnews command');
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

    // We process the update from Telegram here
    await bot.processUpdate(request.body);

  } catch (error) {
    logger.error('Error processing update:', error);
  }
  
  // Send a 200 OK response to Telegram
  response.status(200).send('OK');
};
