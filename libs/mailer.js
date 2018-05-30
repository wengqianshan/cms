const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail');
const config = require('../config')

class Mailer {
    constructor() {}
    /**
     * 描述
    from: '',
    to: '',
    subject: '',
    html: '',
     **/
    send(params) {
        const type = config.mail.type
        if (!type || !this[type]) {
            return new Promise((resolve, reject) => {
                reject('邮件服务类型错误')
            })
        }
        return this[type](params)
    }
    nodemailer(params) {
        const { to, from, subject, html } = params;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(config.mail.options)
            transporter.sendMail({
                from,
                to,
                subject,
                html,
            }, (err, info) => {
                if (!err) {
                    resolve()
                } else {
                    reject(err)
                }
                console.log(err, info, 'nodemailer')
            })
        })
    }
    sendgrid(params) {
        const {to, from, subject, html} = params;
        return new Promise((resolve, reject) => {
            sgMail.setApiKey(config.mail.options.key);
            const msg = {
                from,
                to,
                subject,
                html,
            };
            sgMail.send(msg, (err, res) => {
                if (!err) {
                    resolve()
                } else {
                    reject(err)
                }
            });
        })
    }
}

module.exports = Mailer