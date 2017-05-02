const sendmail = require('sendmail')()
const nodemailer = require('nodemailer')
const config = require('../config')

class Mailer {
    constructor(options = {}) {
      if (options.nodemailer) {
        this.transporter = nodemailer.createTransport(config.mail.nodemailer)
      }
    }
    /**
     * 描述
    from: '',
    to: '',
    subject: '',
    html: '',
     **/
    send(obj, callback) {
        return new Promise((resolve, reject) => {
            if (this.transporter) {
                this.transporter.sendMail({
                    from: obj.from,
                    to: obj.to,
                    subject: obj.subject,
                    html: obj.html
                }, function(err, info) {
                    if (!err) {
                        resolve(info)
                    } else {
                        reject(err)
                    }
                    if (callback) {
                        callback(err, info)
                    }
                    console.log(err, info, 'nodemailer')
                })
            } else {
                sendmail({
                    from: obj.from,
                    to: obj.to,
                    subject: obj.subject,
                    html: obj.html
                }, function(err, info) {
                    if (!err) {
                        resolve(info)
                    } else {
                        reject(err)
                    }
                    if (callback) {
                        callback(err, info)
                    }
                    console.log(err, info, 'sendmail')
                })
            }
        })
        
    }
}

module.exports = Mailer