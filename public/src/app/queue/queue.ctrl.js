
(function() { 'use strict';

  angular.module('app')
    .controller('QueueController', QueueController);
  


  /* Queue Controller */

  function QueueController($rootScope, $scope, MsgFactory) {
    var vm = this;

    vm.queue = null;

    vm.currentSongId = false;

    vm.select = {
      start: start,
      end: end,
      batchSelect: batchSelect,
      get: get
    };

    var startPos = -1;
    var endPos = -1;
    var mode = "select";



    //----------------------------
    
    
    $scope.$on('change:queue', function(e, data) {
      console.log(vm.queue);
      if (data.err || !_.has(data.data[0], 'file')) vm.queue = []; 
      else vm.queue = data;
      console.log(vm.queue);
    });

    $scope.$on('change:player', function(e, data) {
      vm.currentSongId = data[1].song.Id;
    });

    //////////////////////////////////


    function batchSelect(mode) {
      _.map(vm.queue.data, function(song){
        return song.selected = mode;
      });
    }

    function start(pos, isSelected) {
      try {
        startPos = parseInt(pos);
        mode = isSelected ? 'unselect' : 'select';
      } catch(e) {

        startPos = -1;
      }
    }

    function end(pos) {
      try {
        endPos = parseInt(pos);
      } catch(e) {
        endPos = -1;
      }

      if (startPos > -1 && endPos > -1) {

        if (startPos > endPos) { 
          // if start is greater than end, swap them
          var tmpPos = startPos;
          startPos = endPos;
          endPos = tmpPos;
        }

        processSelection({
          startPos: startPos, 
          endPos: endPos, 
          mode: mode
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
      $rootScope.selected = _.filter(vm.queue.data, function(song) {
        return song.selected;
      });
      console.log($rootScope.selected);
    }

    function get() {
      if (vm.queue) {
        return _.filter(vm.queue.data, function(song) {
          return song.selected;
        });
      } else return false;
    }

  }

})();
