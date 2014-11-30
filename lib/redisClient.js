var redis = require('redis')
var config = require('../app').config;

redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);

module.exports = {
  getClient : function() {
    return redisClient;
  }
}
