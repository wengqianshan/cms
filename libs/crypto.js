'use strict';

//加密组件
let crypto = require('crypto');
/**
 * md5 hash
 *
 * @param str
 * @returns md5 str
 */
exports.md5 = function md5(str) {
    let md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};


/**
 * 加密函数
 * @param str 源串
 * @param secret  因子
 * @returns str
 */
exports.encrypt = function encrypt(str, secret) {
    let cipher = crypto.createCipher('aes192', secret);
    let enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * 解密
 * @param str
 * @param secret
 * @returns str
 */
exports.decrypt = function decrypt(str, secret) {
    let decipher = crypto.createDecipher('aes192', secret);
    let dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

exports.random = function(len) {
    return crypto.randomBytes(len || 16).toString('hex');
}

exports.hashPassword = function(password, secret) {
    if (!password) return '';
    let encrypred;
    try {
        encrypred = crypto.createHmac('sha1', secret).update(password).digest('hex');
        return encrypred;
    } catch (err) {
        return '';
    }
};