const TelegramBot = require('node-telegram-bot-api');
const { config } = require('../src/config/config');
const { fetchTopStories } = require('../src/services/hnService');
const { formatStoryMessage } = require('../src/utils/messageFormatter');
const { sendToDestinations } = require('../src/services/messageService');
const { logger } = require('../src/utils/logger');

// This is a Vercel Serverless Function
module.exports = async (request, response) => {
  try {
    logger.info('CRON: Starting daily update task.');
    const bot = new TelegramBot(config.token);

    const stories = await fetchTopStories();
    const message = formatStoryMessage(stories);
    await sendToDestinations(bot, message, config.destinations);

    logger.info('CRON: Daily update task completed successfully.');
    response.status(200).send('Daily update sent successfully.');
  } catch (error) {
    logger.error('CRON: Error in daily update task:', error);
    response.status(500).json({ error: 'Failed to send daily update.' });
  }
};
