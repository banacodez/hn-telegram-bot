require('dotenv').config();

const config = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  destinations: process.env.TELEGRAM_DESTINATIONS.split(',').map(dest => dest.trim()),
  defaultChannel: '@TopHackersNewsDaily'
};

module.exports = { config };
