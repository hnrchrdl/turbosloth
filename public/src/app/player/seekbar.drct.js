(function() {
  

  angular.module('app')
    .directive('seekbar', seekbarDirective);

  ///////////////////////7

  function seekbarDirective($rootScope, $interval, socket) {
    
    return {
      restrict: 'A',
      scope: {
        currentsong: '=',
        status: '=',
        elapsed: '='
      },
      link: link
    };

    function link(scope, element, attr) {

      var seeker, ratio, time, elapsed;

      scope.$watch('[currentsong, status]', function(watch) {
        
        try {
          time = parseFloat(watch[0].Time);
          elapsed = parseFloat(watch[1].elapsed);
        }
        catch(e) {
          time = null;
          elapsed = null;
        }
        scope.time = time;

        if (time && elapsed) {

          ratio = (elapsed / time * 100).toString();
          element.width(ratio + '%');
          
          //stop any interval
          if (angular.isDefined(seeker)) {
            $interval.cancel(seeker);
          }

          //start new interval
          if (watch[1].state === 'play') {

            seeker = $interval(function() {
              elapsed += 1;
              ratio = (elapsed / time * 100).toString();
              element.width(ratio + '%');
              scope.elapsed = time * ratio / 100;
            }, 1000);  
          }

        } else {
          //stop any interval
          if (angular.isDefined(seeker)) {
            $interval.cancel(seeker);
          }

          element.width('0%');
        }

      }, true);

      // seekbarContainer click behaviour
      var seekcontainer = element.parent();
      seekcontainer.on('click', function(e) {
        console.log('click');
        var seekRatio = e.offsetX / seekcontainer.width() * 100;
        if (scope.time) {
          var seekTime = parseFloat(time * seekRatio / 100);
          console.log('broadcast');
          socket.emitMpdCommand({cmd: 'seekcur', args: seekTime});
        }
      });
    }
  }


})();