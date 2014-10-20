var socket = io();

socket.on('connect', function (){
  console.log('established socket connection');
});
socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});
socket.on('change', function(system) {
  console.log('subsystem changed: ' + system);
  var init = false;
  playerHasChanged(init);
});
