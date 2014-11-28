var redis = require('redis')
var config = require('./config.json')[app.get('env')];
  
redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);

module.exports = {
  getClient : function() {
    return redisClient;
  }
}
