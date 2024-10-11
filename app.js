const { chromium } = require('playwright');
const { UserManager } = require('./user');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const userManager = new UserManager();
  const processedMessages = new Set();
  const channelName = 'sneakylol';
  console.log("loading...");

  try {
    await page.goto(`https://www.twitch.tv/popout/${channelName}/chat?popout=`);

    let isBrowserOpen = true;

    const checkForNewMessages = async () => {
      if (!isBrowserOpen) return;

      console.log('Checking...');

      try {
        // Scrape messages from the chat
        const newMessages = await page.$$eval('.chat-line__message', (messages) => {
          return messages.map((message) => {
            const username = message.querySelector('.chat-author__display-name')?.textContent;
            const messageText = message.querySelector('.text-fragment')?.textContent;
            const messageId = `${username}-${messageText}`;
            return { username, messageText, messageId };
          });
        });

        // Filters new messages with content
        newMessages.forEach((message) => {
          if (message.username && message.messageText?.trim() && !processedMessages.has(message.messageId)) {
            userManager.addMessage(message.username, message.messageText, Date.now());
            processedMessages.add(message.messageId);
          }
        });

        // Check again in 1 sec
        setTimeout(checkForNewMessages, 1000);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    checkForNewMessages();

    // Runs 10 sec
    await new Promise((resolve) => {
      setTimeout(async () => {
        isBrowserOpen = false;
        await browser.close();
        resolve();
      }, 10000);
    });

    // Temp log 
    printMessages(userManager.getAllMessages());

  } catch (error) {
    console.error('Error occurred in main block:', error);
  } finally {
    await browser.close();
  }
})();

function printMessages(messages) {
  messages.forEach((message) => {
    console.log(`${message.username}: ${message.message} (${new Date(message.timestamp).toLocaleTimeString()})`);
  });
}
