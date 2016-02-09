var socket = io.connect( "http://localhost:8080" );

socket.on("terminalContent", function(content) {
  document.getElementsByClassName('feedback')[0].className = content['feedback'];
  document.getElementsByClassName('content')[0].innerHTML = content['text'];
});
