/**
 * telegram bot notify
 * how to create a telegram bot: https://core.telegram.org/bots#3-how-do-i-create-a-bot
 * usage: https://github.com/yagop/node-telegram-bot-api
 */
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

class Bot {
  constructor() {
    this.bot = null;
    this.config = config.notify || {};
    this.init();
  }

  init() {
    if (!this.config.enable) {
      return;
    }
    this.bot = new TelegramBot(this.config.token, { polling: true });
    // this.bot.onText(/\/echo (.+)/, (msg, match) => {
    //   const chatId = msg.chat.id;
    //   const resp = match[1]; // the captured "whatever"`
    //   bot.sendMessage(chatId, resp);
    // });

    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, `Current chatId: ${chatId}`);
    });

    this.bot.on('error', (msg) => {
      console.log(`error: ${msg}`);
    });
  }

  sendMessage(text) {
    if (!this.bot) {
      return;
    }
    this.bot.sendMessage(this.config.chatId, `${this.config.prefix}: ${text}`);
  }
}

module.exports = new Bot();
