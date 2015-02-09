(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope
        , SearchRequestFactory
        , MpdFactory
        , $location) {

    var vm = this;

    vm.search = { 
      name: '',
      type: 'Artist',
      isFocused: false,
      selected: 0, // defaults to first item
      select: select
    };
    
    vm.processSearch = processSearch;

    vm.artist = false;
    vm.album = false;
    vm.mode = false;

    $scope.$watch(getSearchName, searchRequest);
    $scope.$watch(getSearchType, searchRequest);

    ////////////////////////////////////////////

    function getSearchName() { 
      return vm.search.name;
    }

    function getSearchType() {
      return vm.search.type;
    }
    
    function searchRequest() {

      if (vm.search.name.length > 0) {
        
        var type = vm.search.type;
        var name = vm.search.name;

        SearchRequestFactory.getArtistSearch(type, name).then(function(data) {
          vm.search.results = data.results;
          vm.search.error = data.error;
          vm.selected = 0;
        });

      } else {
        vm.search.results = null; //blank search field
      }
    }

    function select (index) {
      vm.search.selected = index;
    }

    $scope.$on('keydown:40', function() {

      if (vm.search.results && vm.search.isFocused &&
      vm.search.selected < vm.search.results.length - 1) {
        
        $scope.$apply(function() {
          vm.search.selected++; // select next
        });
      }
    });
      
    $scope.$on('keydown:38', function() {
      
      if (vm.search.results && vm.search.isFocused &&
      vm.search.selected > 0) {
        
        $scope.$apply(function() {
          vm.search.selected--; // select next
        });
      }
    });

    $scope.$on('keydown:13', function() {

      if (vm.search.results && vm.search.isFocused) {        
        $location.path('/search/' + 'artist' + '/' + vm.search.results[vm.search.selected].name);
      }
    });

    $scope.$on('keydown:27', function() {

      if (vm.search.isFocused) {
        vm.search.isFocused = false;
        $('#search-input').blur();
      }
    });


    $scope.$on('search:artist', function(e, params) {
      
      processSearch(params);
    });


    $scope.$on('search:album', function(e, params) {
      
      processSearch(params);
    });




    function processSearch(params) {

      vm.search.isFocused = false;
      $('#search-input').blur();

      vm.mode = params.mode;
      vm.artist = params.artist;
      if (vm.mode === 'album')  {
        vm.album = params.album;
      }


    }

    function addAll() {
      MpdFactory.addAlbumsToQueue(vm.results.albums);
    }

    function playAll() {
      MpdFactory.emitCommand('clear', [], function() {
        MpdFactory.addAlbumsToQueue(vm.results.albums);
      });
    }

  }

})();