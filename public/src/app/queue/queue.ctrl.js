
(function() { 'use strict';

  angular.module('app')
    .controller('QueueController', QueueController);
  


  /* Queue Controller */

  function QueueController($scope, QueueFactory, MpdFactory, MsgFactory) {
    var vm = this;

    vm.queue = [];
    vm.update = update;

    vm.currentSongId = '16824';

    $scope.$on('change:queue', function() {
      vm.update();
    });

    $scope.$on('change:player', function(e, data) {
      vm.currentSongId = data[1].song.Id;
      console.log(vm.currentSongId);
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
      QueueFactory.getQueue().then(function(data) {
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

    function playSong(id){
      MpdFactory.playSong(id);
    }

    function save() {
      MpdFactory.savePlaylist(vm.newplaylistname);
    }

    function shuffle() {
      MpdFactory.shufflePlaylist();
    }

    function clear() {
      MpdFactory.clearPlaylist();
    }

    function playNext() {
      var songsToPlayNext = getSongsFromSelection(true);
      _.sortBy(songsToPlayNext, function(song){ return -song.Pos; });
      MpdFactory.playNext(songsToPlayNext);
    }

    function addToPlaylist() {

    }

    function crop() {
      var songsToRemove = getSongsFromSelection(false);
      MpdFactory.removeFromPlaylist(songsToRemove);
    }

    function remove() {
      var songsToRemove = getSongsFromSelection(true);
      MpdFactory.removeFromPlaylist(songsToRemove);
    }

  }

})();