(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);




  function SearchController($scope, $timeout, SearchFactory) {
    var vm = this;

    vm.searchRequest = searchRequest;
    vm.reset = reset;
    vm.focus = focus;

    vm.reset();

    $scope.$watch(function() { return vm.input; }, _.debounce(function() {
        searchRequest();
      }, 500));

    //--------------------------------

    function searchRequest() {

      vm.loading = true;

      if (vm.input.length === 0) {
        //vm.isFocused = false;
      } else if (vm.input.length < 3) {
        //vm.isFocused = false;
      } else {
        
        $timeout(function() {
          vm.isFocused = true;
        });
        //$('#searchinput').focus();

        SearchFactory.getArtistsAndAlbums(vm.input).then(function(data) {

          vm.loading = false;
          
          vm.artists = {
            results: data[0].results,
            error: data[0].error
          };
          vm.albums = {
            results: data[1].results,
            error: data[1].error
          };
        });
      }
    }

    function reset() {
      vm.artists = {};
      vm.albums = {};
      vm.isFocused = false;
      vm.input = '';
      vm.loading = false;
    }

    function focus(state) {
      if (state === true) {
        vm.isFocused = true;
      } else {
        $timeout(function() {
          vm.isFocused = false;
          //$('#searchinput').blur();
        },150);
      }
    }

  }




  

})();
