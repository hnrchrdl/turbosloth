


(function() { 'use strict';

  angular.module('app.controller', [])
    .controller( 'MainController', MainController)
    .controller( 'QueueController', QueueController)
    .controller( 'SearchController', SearchController)
    .controller( 'PlaylistsController', PlaylistsController)
    .controller( 'BrowseController', BrowseController); 
  
  


  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  MainController.$inject = ['$rootScope', '$route', '$routeParams', '$location'];
  
  function MainController($rootScope, $route, $routeParams, $location) {
    $rootScope.location = 'queue';
    $rootScope.setLocation = setLocation;
    $location.path('/queue');    

    $rootScope.$watch('location', setLocation);

    function setLocation(location) {
      if (location) {
        console.log(location);
        $rootScope.location = location;
        $location.path("/" + location);
      }
    };

    $rootScope.$on('search:artistDetailsRequest', function(e, name) {
      console.log(name);
    });

    socket.on('change', function(system) {
      switch(system) {

        case 'player':
          console.log('player changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:player');
          break;

        case 'options':
          console.log('options changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:options');
          break;

        case 'playlist':
          console.log('queue changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:queue');
          break;
      
        case 'stored_playlist':
          console.log('a stored playlist changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:storedPlaylist');
          break;
      }

    });

  }



  /**
  *** Queue Controller
  *** 
  **/
  QueueController.$inject = [
    '$scope',
    'QueueFactory',
    'MpdFactory',
    'MsgFactory'
  ];
  
  function QueueController($scope, QueueFactory, MpdFactory, MsgFactory) {
    var vm = this;

    vm.queue = [];
    vm.update = update;

    $scope.$on('change:queue', function() {
      vm.update();
    });

    vm.dialogs = {
      id: false,
      show: showDialog,
      hideAll: hideAllDialogs
    };

    vm.select = {
      startPos : -1,
      endPos : -1,
      mode: 'select',
      start: start,
      end: end,
      batchSelect: batchSelect,
      playNext: playNext,
      addToPlaylist: addToPlaylist,
      crop: crop,
      remove: remove
    };

    vm.playSong = playSong;
    vm.save = save;
    vm.shuffle = shuffle;
    vm.clear = clear;

    vm.hasSelection = hasSelection;

    vm.update();

    //////////////////////////////////

    function update() {
      QueueFactory.getPromise().then(function(data) {
        console.log('updating Queue', data);
        vm.queue = data
      });
    }

    function getSongsFromSelection(state) {
      var selected = _.filter(getQueue(), function(song) {
        return song.selected === state;
      });
      return selected;
    }

    function hasSelection() {
      return getSongsFromSelection(true).length > 0;
    }

    function hideAllDialogs() {
      vm.dialogs.id = false;
    }

    function showDialog(id) {
      vm.dialogs.hideAll();
      vm.dialogs.id = id;
      console.log(vm.dialogs);
    }

    function batchSelect(mode) {
      _.map(getQueue(), function(song){
        return song.selected = mode;
      });
    }

    function start(pos, isSelected) {
      try {
        vm.select.startPos = parseInt(pos);
        vm.select.mode = isSelected ? 'unselect' : 'select';
        console.log()
      } catch(e) {
        vm.select.startPos = -1;
      }
    }

    function end(pos) {

      try {
        vm.select.endPos = parseInt(pos);
      } catch(e) {
        vm.select.endPos = -1;
      }

      if (vm.select.startPos > -1 && vm.select.endPos > -1) {

        if (vm.select.startPos > vm.select.endPos) { 
          // if start is greater than end, swap them
          var tmpPos = vm.select.startPos;
          vm.select.startPos = vm.select.endPos;
          vm.select.endPos = tmpPos;
        }

        processSelection({
          startPos: vm.select.startPos, 
          endPos: vm.select.endPos, 
          mode: vm.select.mode
        });
     
      } else {
        MsgFactory.error(200);
      }
    }

    function processSelection(options) {
      var select = true;
      if (options.mode === 'unselect') { select = false };

      for (var i = options.startPos; i <= options.endPos; i++) {
        getQueue()[i].selected = select;
      }
    }

    function getQueue() {
      return vm.queue.data;
    }

    function playSong(songId){
      MpdFactory.emitCommand('playid', [songId]);
    }

    function save() {
      MpdFactory.emitCommand('save', [vm.newplaylistname]);
    }

    function shuffle() {
      MpdFactory.emitCommand('shuffle', []);
    }

    function clear() {
      MpdFactory.emitCommand('clear', []);
    }

    function playNext() {
      var songsToPlayNext = getSongsFromSelection(true);
      _.sortBy(songsToPlayNext, function(song){ return -song.Pos; });

      $.each(songsToPlayNext, function(index, song) {
        MpdFactory.emitCommand('moveid', [song.Id, -1]);
      });
    }

    function addToPlaylist() {

    }

    function crop() {
      var songsToRemove = getSongsFromSelection(false);

      $.each(songsToRemove, function(index, song) { // iterate selection
        MpdFactory.emitCommand('deleteid', [song.Id]); // remove
      });
    }

    function remove() {
      var songsToRemove = getSongsFromSelection(true);

      $.each(songsToRemove, function(index, song) { // iterate selection
        MpdFactory.emitCommand('deleteid', [song.Id]); // remove
      });
    }

  }




  /**
  *** Search Controller
  ***
  **/

  SearchController.$inject = ['$scope', 'SearchRequestFactory'];

  function SearchController($scope, SearchRequestFactory) {
    var vm = this;

    vm.search = { 
      name: '',
      type: 'Artist',
      isFocused: false,
      selected: 0, // defaults to first item
      select: select
    };

    vm.artistDetailsRequest = artistDetailsRequest;

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
        
        var params = {
          name: vm.search.name,
          type: vm.search.type
        };

        SearchRequestFactory.getPromise(params).then(function(data) {
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
        artistDetailsRequest();
      }
    });

    $scope.$on('keydown:27', function() {
      if (vm.search.isFocused) {
        vm.search.isFocused = false;
        $('#search-input').blur();
      }
    });

    function artistDetailsRequest() {
      var artist = vm.search.results[vm.search.selected].name;
      $scope.$emit('search:artistDetailsRequest', artist);
      vm.search.isFocused = false;
      $('#search-input').blur();      
    }
  }





  /**
  *** Playlists Controller
  ***
  **/

  PlaylistsController.$inject = [ '$scope', '$http', '$compile']; 
  function PlaylistsController($scope, $http, $compile) {
    
    $scope.updateHtml = function() {
      $http.get( '/playlists' ).success(function( data ) {
        $scope.playlistsHtml = $compile( data )( $scope );
      }).error(function( err ) {
        $scope.playlistsHtml = err;
      });
    };
    
    $scope.updateHtml(); 
  }





  /**
  *** Browse Controller
  ***
  **/

  BrowseController.$inject = [ '$scope', '$http', '$compile'];

  function BrowseController($scope, $http, $compile) {
    
    $scope.path = '';
    
    $scope.updateHtml = function() {
      $http.get( '/browse', {
        params : {
          path : $scope.path
        }
      }).success(function( data ) {
        $scope.browseHtml = $compile( data )( $scope );
      }).error(function( err ) {
        $scope.browseHtml = err;
      });
    };
    
    $scope.updateHtml();
  }



})();
