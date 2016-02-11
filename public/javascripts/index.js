var socket = io.connect( "http://localhost:8080" );

socket.on("terminalContent", function(content) {
  document.getElementById('status').className = content['status'];
  document.getElementById('message').innerHTML = content['message'];
});
