(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope, $location, $timeout, SearchFactory) {

    var vm = this;

    vm.searchRequest = { 
      name: '',
      type: 'Artist',
      results: null,
      error: null,
      selected: 0, // defaults to first item
      isFocused: false,
      select: select,
      blur: blur
    };
    
    vm.processResults = processResults;
    
    
    //watch the search request parameters, and execute a search Request when something changes
    $scope.$watchGroup([
      function() { return vm.searchRequest.name; },
      function() { return vm.searchRequest.type; }
    ], searchRequest);


    ////////////////////////////////////////////

    
    function searchRequest() {


      if (vm.searchRequest.name.length > 0) {
        
        var type = vm.searchRequest.type;
        var name = vm.searchRequest.name;

        SearchFactory.getArtistsByType(name, type).then(function(data) {
          vm.searchRequest.results = data.results;
          vm.searchRequest.error = data.error;
          vm.searchRequest.selected = 0;
        });

      } else {
        vm.searchRequest.results = null; //blank search field
      }
    }

    function select (index) {
      vm.searchRequest.selected = index;
    }

    function processResults() {
      vm.searchRequest.isFocused = false;
      $('#search-input').blur();
      $location.path('/artist/' + vm.searchRequest.results[vm.searchRequest.selected].name);
    }
    
    function blur() {
      $timeout(function(){
        vm.searchRequest.isFocused = false;
      }, 50);
    }

    // on arrow down
    $scope.$on('keydown:40', function() {

      if (vm.searchRequest.results && vm.searchRequest.isFocused &&
      vm.searchRequest.selected < vm.searchRequest.results.length - 1) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected++; // select next
        });
      }
    });
    
    // on arrow up
    $scope.$on('keydown:38', function() {
      
      if (vm.searchRequest.results && vm.searchRequest.isFocused &&
      vm.searchRequest.selected > 0) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected--; // select previous
        });
      }
    });
  
    // on enter
    $scope.$on('keydown:13', function() {

      if (vm.searchRequest.results && vm.searchRequest.isFocused) {
        $location.path('/artist/' + vm.searchRequest.results[vm.searchRequest.selected].name);
      }
    });
  
    // on escape
    $scope.$on('keydown:27', function() {

      if (vm.searchRequest.isFocused) {
        vm.searchRequest.isFocused = false;
        $('#search-input').blur();
      }
    });
    
  }

})();
