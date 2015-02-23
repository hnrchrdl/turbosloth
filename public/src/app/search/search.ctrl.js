(function() { 'use strict';


  /* Search Controller */

  angular.module('app')
    .controller( 'SearchController', SearchController);




  function SearchController($scope, SearchFactory) {
    var vm = this;

    vm.artists = {};
    vm.albums = {};

    vm.searchRequest = searchRequest;

    //--------------------------------

    function searchRequest() {
      if (vm.input.length > 0) {
        //SearchFactory.getArtistsByType(vm.input, 'Artist').then(function(data) {
        //  vm.results = data.results;
        //  vm.error = data.error;
        //});
        SearchFactory.getArtistsAndAlbums(vm.input).then(function(data) {
          vm.artists.results = data[0].results;
          vm.artists.error = data[0].error;
          vm.albums.results = data[1].results;
          vm.albums.error = data[1].error;
        });
      }
    }
  }




  

})();
