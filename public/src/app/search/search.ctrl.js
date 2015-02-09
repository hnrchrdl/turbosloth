(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope
        , SearchRequestFactory
        , MpdFactory
        , $location) {

    var vm = this;

    vm.searchRequest = { 
      name: '',
      type: 'Artist',
      results: null,
      error: null,
      selected: 0, // defaults to first item
      isFocused: false,
      select: select,
    };
    
    vm.displayDetails = {
      type: false,
      artist: null,
      album: null
    };
    
    
    //watch the search request parameters, and execute a search Request when something changes
    $scope.$watch(function() { return vm.searchRequest.name, vm.searchRequest.type; }, searchRequest);


    ////////////////////////////////////////////

    
    function searchRequest() {

      if (vm.searchRequest.name.length > 0) {
        
        var type = vm.searchRequest.type;
        var name = vm.searchRequest.name;

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

      if (vm.searchRequest.results && vm.searchRequest.isFocused &&
      vm.searchRequest.selected < vm.search.results.length - 1) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected++; // select next
        });
      }
    });
      
    $scope.$on('keydown:38', function() {
      
      if (vm.searchRequest.results && vm.searchRequest.isFocused &&
      vm.searchRequest.selected > 0) {
        
        $scope.$apply(function() {
          vm.searchRequest.selected--; // select previous
        });
      }
    });

    $scope.$on('keydown:13', function() {

      if (vm.searchRequest.results && vm.searchRequest.isFocused) {
        $location.path('/search/' + 'artist' + '/' + vm.search.results[vm.search.selected].name);
      }
    });

    $scope.$on('keydown:27', function() {

      if (vm.searchRequest.isFocused) {
        vm.searchRequest.isFocused = false;
        $('#search-input').blur();
      }
    });
    
    
    //------------------------------------------


    $scope.$on('search:displayDetails:artist', function(e, searchParams) {
      vm.searchRequest.isFocused = false;
      $('#search-input').blur();
      vm.displayDetails.type = 'artist';
      vm.displayDetails.artist.name = searchParams.artistname;
    });
    
     $scope.$on('search:displayDetails:album', function(e, searchParams) {
      vm.searchRequest.isFocused = false;
      $('#search-input').blur();
      vm.displayDetails.type = 'album';
      vm.displayDetails.album.name = searchParams.albumname;
      vm.displayDetails.album.artist = searchParams.artistname;
    });
    
    $scope.$on('search:displayDetails:none', function(e, searchParams) {
      vm.searchRequest.isFocused = true;
      $('#search-input').blur();
      vm.displayDetails.type = false;
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
