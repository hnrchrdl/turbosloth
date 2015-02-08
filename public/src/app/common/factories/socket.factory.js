(function() { 'use sctrict';


  angular.module('app')
    .factory('socket', SocketFactory);


  function SocketFactory($rootScope) {

    var socket = io.connect();

    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      },
      emitMpdCommand: function(cmd, data, cb) {
        socket.emit('mpd', cmd, data, function() {
          if (cb) return cb;
        });
      }
    };
  }
  

})();