var redis = require('redis')
var config = require('../app').config;

/**
** create a new redis client and pass it to the export
** get the port and host from the configuration json in app folder
*/
redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);

module.exports = redisClient;
