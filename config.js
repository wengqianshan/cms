var config = {
    mongodb: {
        uri: 'mongodb://localhost/cms',
        options: {}
    },
    admin: {
        dir: 'admin',
        role: {
            admin: 'admin',
            user: 'user'
        }
    }
};

module.exports = config;