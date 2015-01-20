
(function () { 'use strict';
  
  //angular.module('app.factories', [])
  angular.module('app')
    .factory('MsgFactory', MsgFactory);



  /* Message Factory */

  function MsgFactory() {
    return {
      error: error,
      info: info 
    };

    ////////////////////////////////

    function error(code) {
      console.log(code);
    }

    function info(code) {
      console.log(code);
    }
  }


})();