require('bluebird');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config').notify;

// replace the value below with the Telegram token you receive from @BotFather


let bot = {
  sendMessage() {
    console.log('请正确配置 notify');
  }
};

if (config.enable) {
  bot = new TelegramBot(config.token, { polling: true });

  bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `当前chatId: ${chatId}`);
  });

  bot.on('error', (msg) => {
    console.log(`通知服务错误: ${msg}`);
  })
}

module.exports = {
  sendMessage(text) {
    bot.sendMessage(config.chatId, `wenglou: ${text}`)
  }
}
