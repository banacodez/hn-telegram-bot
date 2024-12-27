const TelegramBot = require('node-telegram-bot-api');
const { config } = require('./config/config');
const { fetchTopStories } = require('./services/hnService');
const { formatStoryMessage } = require('./utils/messageFormatter');
const { logger } = require('./utils/logger');
const { sendToDestinations } = require('./services/messageService');
const { scheduleDaily } = require('./utils/scheduler');

// Initialize bot with simple polling
const bot = new TelegramBot(config.token, { 
  polling: true,
  onlyFirstMatch: true
});

// Add error handlers
bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('401')) {
    logger.error('Bot token is invalid. Please check your TELEGRAM_BOT_TOKEN environment variable.');
    process.exit(1); // Exit the process to trigger a restart
  }
  logger.error('Polling error:', error);
});

bot.on('error', (error) => {
  logger.error('Bot error:', error);
});

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const welcomeMessage = `Welcome to Hacker News Bot! 🚀\n\n` +
    `Available commands:\n` +
    `/getnews - Get the latest top news\n` +
    `/help - Show this help message`;
    
  await bot.sendMessage(msg.chat.id, welcomeMessage);
});

// Help command handler
bot.onText(/\/help/, async (msg) => {
  const helpMessage = `Hacker News Bot Commands:\n\n` +
    `🔹 /getnews - Fetch top 10 stories from Hacker News\n` +
    `🔹 /help - Show this help message\n\n` +
    `The bot also automatically posts updates daily at 8:00 AM EAT.`;
    
  await bot.sendMessage(msg.chat.id, helpMessage);
});

// Command handlers
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

// Daily task function
const dailyUpdateTask = async () => {
  try {
    const stories = await fetchTopStories();
    const message = formatStoryMessage(stories);
    await sendToDestinations(bot, message, config.destinations);
  } catch (error) {
    logger.error('Error in scheduled task:', error);
  }
};

// Start the bot
const startBot = async () => {
  try {
    logger.info('Bot is starting...');
    scheduleDaily(dailyUpdateTask);
    logger.info('Bot is running and scheduled tasks are set up for 8:00 AM EAT');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
};

startBot();
