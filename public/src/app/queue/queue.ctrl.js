
(function() { 'use strict';

  angular.module('app')
    .controller('QueueController', QueueController);
  


  /* Queue Controller */

  function QueueController($scope, MsgFactory) {
    var vm = this;

    vm.queue = [];

    vm.currentSongId = false;

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
    };

    vm.hasSelection = hasSelection;
    vm.selected = [];


    //----------------------------
    
    
    $scope.$on('change:queue', function(e, data) {
      if (data.err || !_.has(data.data[0], 'file')) vm.queue = null; 
      else vm.queue = data;
    });

    $scope.$on('change:player', function(e, data) {
      vm.currentSongId = data[1].song.Id;
    });

    //////////////////////////////////


    $scope.$watch(function() { return vm.selected; }, function(c) {
      console.log(c);
    });


    function hasSelection() {
      return vm.selected.length > 0;
    }

    function hideAllDialogs() {
      vm.dialogs.id = false;
    }

    function showDialog(id) {
      vm.dialogs.hideAll();
      vm.dialogs.id = id;
    }

    function batchSelect(mode) {
      _.map(vm.queue.data, function(song){
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
      var select = options.mode === 'unselect' ?
        false:
        true;

      for (var i = options.startPos; i <= options.endPos; i++) {
        vm.queue.data[i].selected = select;
      }
      
      vm.selected = _.filter(vm.queue.data, function(song) {
        return song.selected === true ;
      });
    }

  }

})();
