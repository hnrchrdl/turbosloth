var komponist = require('komponist'),
komponist_clients = {},
_ = require('underscore');

module.exports = {
  checkURL: checkURL,
  register: register
}


////////////////////////////////////////////////


function checkURL(url) {
  return true;
}

function register(url, port, password, sessionID) {
  if (_.isEmpty(komponist_clients)) {
    komponist_clients.sessionID  = true;
  } else if (_.has(komponist_clients, sessionID)) {
    console.log('has');
  }
}
