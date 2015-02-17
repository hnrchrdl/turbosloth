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

    function albumCoverController($rootScope, $scope) {
      $scope.addAlbum = addSongs;
      $scope.playAlbum = playSongs;
      $scope.goToAlbum = goToAlbum;

      function addSongs(songs) {
        $rootScope.$broadcast({cmd: 'addSongs', args: songs});
      }

      function playSongs(songs) {
        $rootScope.$broadcast({cmd: 'playSongs', args: songs});
      }

      function goToAlbum(albumname, artistname) {
        var url = '/artist/' + artistname + '/album/' + albumname;
        console.log(url);
        $rootScope.setLocation(url);
      }
    }
  }

})();