(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);

  function SearchController($scope
        , SearchRequestFactory
        , ArtistInfoFactory
        , SearchAlbumsFactory
        , TopAlbumsFactory
        , SimilarArtistsFactory
        , $q
        , MpdFactory) {
    var vm = this;

    vm.search = { 
      name: '',
      type: 'Artist',
      isFocused: false,
      selected: 0, // defaults to first item
      select: select
    };
    
    vm.results = {
      artistinfo: null,
      abums: null,
      similar: null,
      topAlbums: null,
      process: process,
      addAll: addAll,
      playAll: playAll,
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
        $scope.$apply(function() {
          vm.search.selected--; // select next
        });
      }
    });
      
    $scope.$on('keydown:13', function() {
      if (vm.search.results && vm.search.isFocused) {
        vm.results.process();
      }
    });

    $scope.$on('keydown:27', function() {
      if (vm.search.isFocused) {
        vm.search.isFocused = false;
        $('#search-input').blur();
      }
    });

    function process(artistname) {

      vm.results.artistinfo = {};
      var artistname = vm.results.artistinfo.name = artistname || vm.search.results[vm.search.selected].name;

      ArtistInfoFactory.getArtistInfo(artistname)
      .then(function(results) {
        console.log('ArtistInfo: ', results.artist);
        vm.results.artistinfo = results.artist;
        vm.results.artistinfo.imageurl = results.artist.image[4]['#text'];
      });

      SimilarArtistsFactory.getArtists(artistname)
      .then(function(results) {
        console.log('SimilarArtist: ', results.similarartists.artist);
        var similarArtists = [];
        _.each(results.similarartists.artist, function(artist) {
          similarArtists.push({
            name: artist.name,
            imageUrl: artist.image[3]['#text']
          });
        });
        vm.results.similarArtists = similarArtists;
      });

      SearchAlbumsFactory.getJoinedAlbums(artistname)
      .then(function(results) {
        console.log('Albums: ', results);
        vm.results.joinedAlbums = results;
      });

      vm.search.isFocused = false;
      $('#search-input').blur();
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