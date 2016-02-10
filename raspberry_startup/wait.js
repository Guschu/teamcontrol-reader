loadServer = function(bool){
  if(bool){
    window.location.href = "http://localhost:8080";
  }  
};

function imageExists(url, callback) {
  var img = new Image();
  img.onload = function() { callback(true); };
  img.onerror = function() { callback(false); };
  img.src = url;
};

window.setInterval(function(){
  imageExists("http://localhost:8080/images/swc_logo.svg", loadServer);
}, 10*1000);
