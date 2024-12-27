const schedule = require('node-schedule');
const { logger } = require('./logger');

const EAST_AFRICAN_TIMEZONE = 'Africa/Addis_Ababa';

const scheduleDaily = (taskFn) => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 12;
  rule.minute = 30;
  rule.tz = EAST_AFRICAN_TIMEZONE;

  return schedule.scheduleJob(rule, async () => {
    try {
      await taskFn();
      logger.info('Daily scheduled task completed successfully');
    } catch (error) {
      logger.error('Error in scheduled task:', error);
    }
  });
};
module.exports = { scheduleDaily };
