var socket = io.connect( "http://localhost:8080" );

socket.on("terminalContent", function(content) {
  document.getElementById('status').className = content['status'];
  document.getElementById('status').innerHTML = content['message'];
});

socket.on('disconnect', function() {
  document.getElementById('status').className = 'error';
  document.getElementById('status').innerHTML = 'Node-Server inaktiv.';  
});
