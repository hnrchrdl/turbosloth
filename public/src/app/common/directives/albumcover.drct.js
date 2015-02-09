(function() { 'use strict';
  
  angular.module('app')
    .directive('albumDirective', AlbumDirective);

  ///////////////////////////////////////

  function AlbumDirective() {

    return {
      restrict: 'E',
      scope: '=',
      templateUrl: 'common/partials/albumcover.partial.html',
      link: link,
      controller: albumCoverController
    }

    //---------------------

    function link(scope, element, attr) {
      element.css('background-image', 'url(' + scope.album.imageUrl + ')');
      if (!scope.album.inDatabase) {
        element.find('.album').addClass('not-in-db');
        element.find('i').remove();
      }
    }

    function albumCoverController($rootScope, $scope, MpdFactory) {
      $scope.addAlbum = addSongs;
      $scope.playAlbum = playSongs;
      $scope.goToAlbum = goToAlbum;

      function addSongs(songs) {
        MpdFactory.addSongs(songs);
      }

      function playSongs(songs) {
        MpdFactory.addSongsAndReplace(songs);
      }

      function goToAlbum(albumname, artistname) {
        var url = 'search/album/' + artistname + '/' + albumname;
        console.log(url);
        $rootScope.setLocation(url);
      }
    }
  }

})();