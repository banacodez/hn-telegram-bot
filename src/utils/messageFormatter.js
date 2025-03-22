function formatStoryMessage(stories) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const header = `🔥 Top Hacker News - ${date}\n\n`;

  if (!stories || stories.length === 0) {
    return {
      text: `${header}No top stories available at the moment. Please try again later.`,
      reply_markup: {
        inline_keyboard: [[{ text: "Visit Hacker News", url: 'https://news.ycombinator.com' }]]
      }
    };
  }

  const formattedStories = stories.map((story, index) => {
    const title = story.title;
    const url = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
    const points = story.score || 0;
    const commentsCount = story.descendants || 0;
    const commentsUrl = `https://news.ycombinator.com/item?id=${story.id}`; // Specific discussion link

    return `${index + 1}. <a href="${url}">${title}</a>\n` +
           `📊 ${points} points | 💬 <a href="${commentsUrl}">comments</a> (${commentsCount})\n`;
  }).join('\n');

  const reply_markup = {
    inline_keyboard: [[{ text: "Visit Hacker News", url: 'https://news.ycombinator.com' }]]
  };

  return {
    text: `${header}${formattedStories}`,
    reply_markup: reply_markup
  };
}

module.exports = { formatStoryMessage };
