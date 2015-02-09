(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope
        , SearchRequestFactory
        , MpdFactory
        , $location) {

    var vm = this;

    vm.searchRequestParams = { 
      name: '',
      type: 'Artist',
      isFocused: false,
    };
    
    vm.searchRequest = {
      results: null,
      error: null,
      selected: 0, // defaults to first item
      select: select,
    }
    
    processSearch = processSearch;

    vm.artist = false;
    vm.album = false;
    vm.mode = false;

    //watch the search request parameters, and execute a search Request when something changes
    $scope.$watch(function() { return vm.searchRequestParams; }, searchRequest);


    ////////////////////////////////////////////

    
    function searchRequest(searchRequestParams) {

      if (searchRequestParams.name.length > 0) {
        
        var type = searchRequestParams.type;
        var name = searchRequestParams.name;

        SearchRequestFactory.getArtistSearch(type, name).then(function(data) {
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

    $scope.$on('keydown:40', function() {

      if (vm.searchRequest.results && vm.searchRequestParams.isFocused &&
      vm.searchRequest.selected < vm.search.results.length - 1) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected++; // select next
        });
      }
    });
      
    $scope.$on('keydown:38', function() {
      
      if (vm.searchRequest.results && vm.searchRequestParams.isFocused &&
      vm.searchRequest.selected > 0) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected--; // select next
        });
      }
    });

    $scope.$on('keydown:13', function() {

      if (vm.searchRequest.results && vm.searchRequestParams.isFocused) {
        $location.path('/search/' + 'artist' + '/' + vm.search.results[vm.search.selected].name);
      }
    });

    $scope.$on('keydown:27', function() {

      if (vm.searchRequestParams.isFocused) {
        vm.searchRequestParams.isFocused = false;
        $('#search-input').blur();
      }
    });
    
    
    //------------------------------------------


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
