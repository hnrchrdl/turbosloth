(function() { 'use strict';



  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope, SearchRequestFactory, ArtistInfoFactory, SearchAlbumsFactory) {
    var vm = this;

    vm.search = { 
      name: '',
      type: 'Artist',
      isFocused: false,
      selected: 0, // defaults to first item
      select: select
    };

    vm.processResults = processResults;
    
    vm.results = {
      artistinfo: null,
      abums: null,
      similar: null,
      topAlbums: null,
      addAll: addAll,
      playAll: playAll
    };

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
        $scope.$apply(function(){
          vm.search.selected--; // select next
        });
      }
    });
      
    $scope.$on('keydown:13', function() {
      if (vm.search.results && vm.search.isFocused) {
        processResults();
      }
    });

    $scope.$on('keydown:27', function() {
      if (vm.search.isFocused) {
        vm.search.isFocused = false;
        $('#search-input').blur();
      }
    });

    function processResults() {
      vm.results.artisinfo = {};
      var name = vm.results.artisinfo.name = vm.search.results[vm.search.selected].name;

      SearchAlbumsFactory.getAlbums(name).then(function(results) {
        console.log(results.albums);
        vm.results.albums = results.albums;
      });
      ArtistInfoFactory.getArtistInfo(name).then(function(results) {
        console.log(results.artist);
        vm.results.artistinfo = results.artist;
        vm.results.artistinfo.imageurl = results.artist.image[4]['#text'];
      });

      vm.search.isFocused = false;
      $('#search-input').blur();
    }

    function addAll() {}
    function playAll() {}
  }

})();