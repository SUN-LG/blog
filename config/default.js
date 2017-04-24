const configFile = process.env.NODE_ENV === 'dev' ? './dev' : 'production'
const config = require(configFile)

module.exports = {
  port: config.port,
  session: {
    secret: config.secret,
    key: 'myblog',
    maxAge: 2592000000
  },
  mongodb: config.mongodb
};
