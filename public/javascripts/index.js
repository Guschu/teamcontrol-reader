var socket = io.connect( "http://localhost:8080" );

socket.on("foo", function(foo) {
  document.getElementsByClassName('content')[0].innerHTML = foo;
});
