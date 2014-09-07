var appPath = process.cwd();
var config = {
    //mongodb配置信息
    mongodb: {
        uri: 'mongodb://localhost/cms',
        options: {}
    },
    //找回密码hash过期时间
    findPasswordTill: 24 * 60 * 60 * 1000,
    //后台相关配置
    admin: {
        dir: 'admin',
        role: {//默认角色名,后期可修改
            admin: 'admin',
            user: 'user'
        }
    },
    upload: {
        tmpDir:  appPath + '/public/uploaded/tmp',
        uploadDir: appPath + '/public/uploaded/files',
        uploadUrl:  '/uploaded/files/',
        maxPostSize: 100000000, // 100M
        minFileSize:  1,
        maxFileSize:  50000000, // 50M
        acceptFileTypes:  /.+/i,
        storage: {
            type: 'local',//保存类型，如果保存到本地可省略或local, 目前支持7牛：qiniu
            options: {
                accessKey: 'your key',
                secretKey: 'your secret',
                bucket: 'your bucket',
                domain: 'your domain',
                timeout: 3600000, // default rpc timeout: one hour, optional
            }
        }
    },
    mail: {
        from: 'username<username@domain.com>',
        //service: '',
        options: {
            host: '10.1.1.1',
            auth: {
                user: 'username',
                pass: 'password'
            }    
        }
        
    }
};

module.exports = config;