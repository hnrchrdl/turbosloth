
(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'BrowseController', BrowseController); 


  /**
  *** Browse Controller
  ***
  **/
  function BrowseController($scope, BrowseFactory) {
    var vm = this;

    vm.directories = [];
    vm.files = [];

    $scope.$on('browse', function(e, folder) {
      BrowseFactory.browseFolder(folder).then(function(data) {
        vm.directories = _.filter(data.contents, function(item) {
          return _.has(item, 'directory');
        });
        vm.files = _.filter(data.contents, function(item) {
          return _.has(item, 'file');
        });
        if (!folder) {
          vm.directories = _.groupBy(vm.directories, function(dir) {
            if (dir && dir.directory[0] && dir.directory !== "") return dir.directory[0].toUpperCase();
          });
        }
        console.log(vm.directories);
        console.log(vm.files);
      });
    });
  }

})();
