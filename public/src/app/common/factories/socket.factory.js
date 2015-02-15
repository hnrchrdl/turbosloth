(function() { 'use sctrict';


  angular.module('app')
    .factory('socket', SocketFactory);


  function SocketFactory($rootScope) {

    var socket = io.connect();

    return {
      on: on,
      emit: emit,
      emitMpdCommand: emitMpdCommand
    };

    /////////////////////////////////////////7

    function on(eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }
    

    function emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
    

    function emitMpdCommand(command_or_list, callback) {
      // command_or_list can be a single command object with
      // cmd and args
      // or an array with list of command objects
      console.log(command_or_list);
      socket.emit('mpd', command_or_list, function(err, msg) {
        if (callback) {
          callback(err, msg);
        }
      });
    }

    
  }
  

})();
