function httpGetAsync(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            showTerminal(theUrl);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function showTerminal(theUrl)
{
  window.location.href = theUrl;
}

window.setInterval(function(){
  httpGetAsync("http://localhost:8080");
}, 10*1000);
