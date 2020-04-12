'use strict';

let appPath = process.cwd();
let config = {
  port: 7000,
  env: process.env.NODE_ENV || "development", // development   production
  //mongodb
  mongodb: {
    uri: "mongodb://127.0.0.1:27017/cms",
    options: {},
  },
  //redis server，used to keep sessions, optional
  redis: {
    host: "", // Leave blank to disable
    port: 6379, // 6379
    pass: "",
  },
  //token time of forget password
  findPasswordTill: 24 * 60 * 60 * 1000,
  // session secret,
  sessionSecret: "SessionSecret",
  // jsonwebtoken config
  jwt: {
    secret: "JWTSecret",
    options: {
      expiresIn: "10h",
    },
  },
  title: "CMS",
  // admin config
  admin: {
    dir: "admin", // admin router, admin -> http://localhost/admin
    role: {
      //default roles
      admin: "admin",
      user: "user",
    },
  },
  upload: {
    tmpDir: appPath + "/public/uploaded/tmp/",
    uploadDir: appPath + "/public/uploaded/files/",
    uploadUrl: "/uploaded/files/",
    maxPostSize: 100 * 1024 * 1024, // 100M
    minFileSize: 1,
    maxFileSize: 50 * 1024 * 1024, // 50M
    acceptFileTypes: /.+/i,
    storage: {
      type: "local", //local: upload files to local  qiniu: use qiniu sdk <https://www.qiniu.com/>(not recommend)
      options: {
        // Depends on upload type
        accessKey: "your key",
        secretKey: "your secret",
        bucket: "your bucket",
        origin: "http://yourdomain.qiniudn.com",
        timeout: 3600000,
      },
    },
  },
  stopForumSpam: false,
  // email config, for login/forget password ...
  mail: {
    // mail service, [sendgrid](https://sendgrid.com/)(recommend) or [nodemailer](https://nodemailer.com/about/)
    type: "sendgrid",
    // Sender
    from: "username@domain.com",
    options: {
      // nodemailer options: https://nodemailer.com/smtp/
      service: "gmail",
      host: "",
      port: "",
      auth: {
        user: "",
        pass: "",
      },

      // sendgrid options: https://github.com/sendgrid/sendgrid-nodejs
      key: "",
    },
  },
  // google analytics
  ga: "",
  // Use telegram api to send messages to yourself
  // https://github.com/yagop/node-telegram-bot-api
  // https://core.telegram.org/bots/api
  notify: {
    enable: false, // you should set true to enable this feature
    token: "",
    chatId: "",
    prefix: "wenglou",
  },
};

module.exports = config;
