const schedule = require('node-schedule');
const { logger } = require('./logger');

const SCHEDULED_HOUR = process.env.SCHEDULED_HOUR ? parseInt(process.env.SCHEDULED_HOUR) : 8;
const SCHEDULED_MINUTE = process.env.SCHEDULED_MINUTE ? parseInt(process.env.SCHEDULED_MINUTE) : 0;

const scheduleDaily = (taskFn) => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = SCHEDULED_HOUR;
  rule.minute = SCHEDULED_MINUTE;
  
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
