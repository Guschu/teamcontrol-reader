var socket = io.connect( "http://localhost:8080" );

socket.on("terminalContent", function(content) {
  document.getElementById('status').className = content['status'];
  document.getElementById('status').innerHTML = content['message'];
  title = document.getElementById('title');
  if(content['title'] != null && content['title'].length > 0) {
    title.innerHTML = content['title'];
    title.className = content['status'];
    title.style.visibility = 'visible';
  } else {
    title.style.visibility = 'hidden';
  }
});

socket.on('disconnect', function() {
  document.getElementById('status').className = 'error';
  document.getElementById('status').innerHTML = 'Bitte neu starten';
  document.getElementById('title').style.visibility = 'hidden';
});
