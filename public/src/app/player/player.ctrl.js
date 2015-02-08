(function() {
  

  angular.module('app')
    .controller('PlayerController', playerController);


  //////////////////////////////////////


  function playerController($scope) {
    
    var vm = this;

    vm.status = {};
    vm.currentsong = {};
    vm.elapsed = 0;
    
    $scope.$on('change:player', function playerchange(e, data) {
      if (data) {
        vm.status = data[0].status;
        vm.currentsong = data[1].song;
        console.log('player change detected: ', vm.status, vm.currentsong);
      }
    });
  }



})();