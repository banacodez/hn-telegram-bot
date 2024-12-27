require('dotenv').config();

const config = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  destinations: process.env.TELEGRAM_DESTINATIONS ? 
    process.env.TELEGRAM_DESTINATIONS.split(',').map(dest => dest.trim()) : 
    [],
  defaultChannel: '@TopHackersNewsDaily'
};

// Add some validation
if (!config.token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

module.exports = { config };
