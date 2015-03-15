

(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'PlaylistController', PlaylistController); 



  /**
  *** Playlists Controller
  ***
  **/
  function PlaylistController($rootScope, $scope, PlaylistFactory) {

    $scope.playlists = {};
    $scope.playlistdetails = false;

    $scope.sort = sortPlaylists;

    update_base();


    $rootScope.$watch('playlistsParams.playlistname', function(playlistname) {
      
      if (playlistname) {
        update_playlistdetails(playlistname);
      }
    });

    $rootScope.$on('change:stored_playlist', function(e, data) {
      update_base();
      if ($rootScope.selectedPlaylist) {
        update_playlistdetails($rootScope.selectedPlaylist);
      }
    });



    ////////////////////////////////////////////////////

    function update_base() {

      PlaylistFactory.getPlaylist().then(function(resp) {
        $scope.playlists = resp.playlists;
        sortPlaylists('playlist');
      }, function(reason) { //failure
        console.log('failed to load playlists: ', reason);
        $scope.playlists = [];
      });
    }

    function sortPlaylists(arg) {
      var sorted = _.sortBy($scope.playlists, function(playlist) {
        if (playlist) return playlist[arg]; 
      });
      $scope.playlists = sorted;
    }


    function update_playlistdetails(playlistname) {

      $scope.playlistdetails = false;
        
        PlaylistFactory.getPlaylist(playlistname).then(function(data) {

          console.log(data);

          if (!_.isArray(data.playlists)) {
            data.playlists = [data.playlists];
          }
          
          var albumarts = _.toArray(_.indexBy(data.playlists, function(playlist) {
            return playlist.Artist + playlist.Album;
          }));

          $scope.playlistdetails = {
            playlistname: playlistname,
            data: data.playlists,
            albumarts: albumarts
          };

        }, function(reason) { //failure
          console.log('failed to load playlistdetails: ', reason);
          $scope.playlistdetails = [];
        });

        $rootScope.selectedPlaylist = $rootScope.playlistrename = playlistname;

    }


    
  }


})();
