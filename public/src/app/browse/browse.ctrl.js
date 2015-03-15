
(function() { 'use strict';

  
  angular.module('app')
    .controller('browseController', browseController); 


  /**
  *** Browse Directive
  ***
  **/
  function browseController($rootScope, $scope, BrowseFactory) {

    var vm = this;

    vm.base_directories = [];

    vm.directories = [];
    vm.files = [];

    vm.folder = '';

    vm.breadcrumbs = [];

    update_base();

    //------------------------


    function update_base() {

      var folder = '';

      BrowseFactory.browseFolder(folder).then(function(data) {
        vm.base_directories = _.filter(data.contents, function(item) {
          return _.has(item, 'directory');
        });
        
        vm.base_directories = _.groupBy(vm.base_directories, function(dir) {
          if (dir && dir.directory[0] && dir.directory !== "") {
            return dir.directory[0].toUpperCase();
          }
        });

      });
    }
    
    $rootScope.$watch('browseParams.folder', function(folder) {
      
      if (folder) {

        console.log(folder);
        vm.folder = folder;

        var foldersplit = folder.split('/');
        var tmp = [];
        vm.breadcrumbs = [];
        _.each(foldersplit, function(folder) {
          tmp.push(folder);
          vm.breadcrumbs.push({
            name: folder,
            path: tmp.join('/')
          });
        });
        BrowseFactory.browseFolder(folder).then(function(data) {

          var contents = data.contents;
          
          if (!_.isArray(contents)) {
            contents = [contents]; // wrap in Array
          }

          vm.directories = _.filter(contents, function(item) {
            return _.has(item, 'directory');
          });

          vm.files = _.filter(contents, function(item) {
            return _.has(item, 'file');
          });
    
        });
      }
  
    });

  }

})();
