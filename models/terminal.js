var request = require('request');

function Terminal(){
  Terminal.host = "http://teamcontrol.apps.software-consultant.net"
  this.statusRequestAddress = "/api/v1/ping";
  this.tagRequestAddress = "/api/v1/event";
  var macAddress = "";
  var authenticated = false;
  var timeToShow = 5 * 1000;
  var lastscans = [];
  // StandardServer oder eigener?
  var a = process.env.TCR_HOST;
  if(a != undefined && a.length > 0){
    Terminal.host = a;
  }

  this.statusRequestAddress = Terminal.host + this.statusRequestAddress;
  this.tagRequestAddress = Terminal.host + this.tagRequestAddress;

  // Splittet einen String in Blöcke von 2 mit Leerzeichen
  this.blocksOfTwo = function(textToSplit) {
    if(!textToSplit || textToSplit.length === 0){
      return textToSplit;
    }
    var splitted = textToSplit.split('');
    var merged = [];
    for( var i = 0; i < splitted.length; i+=2 ){
      merged.push(splitted[i]+splitted[i+1]);
    }
    return merged.join(' ');
  }

  // Authenticate Request an Server
  this.authenticate = function(callback) {
    var that = this;
    
    options = {
      url: this.statusRequestAddress,
      headers: {
        'X-Tc-Token': that.macAddress,
        'Content-Type': 'application/json'
      }
    }
    
    content = {
      status: 'wait',
      message: this.blocksOfTwo(this.macAddress)
    }

    var wasAuthenticated = that.authenticated;
    request(options, function(error, httpResponse, body){
        if(!error && httpResponse.statusCode == 200){
          that.authenticated = true;
          content['status'] = 'info';
          content['message'] = "Bereit zum Scannen";
        } else {
          that.authenticated = false;
        }
        if(wasAuthenticated && that.authenticated){
          callback(null);
        }else{
          callback(content);
        }
      }
    );
  };

  this.sendTag = function(tagID, callback){
    var that = this;

    options = {
      url: this.tagRequestAddress,
      headers: {
        'X-Tc-Token': this.macAddress,
        'Content-Type': 'application/json'
      },
      form: {
        id: tagID
      }
    }

    content = {
      status: 'wait',
      message: this.blocksOfTwo(this.macAddress)
    }
    // 401 = Nicht auth, 404 = Kein Rennen, 406 = Keine Aktivierung
    request.post(options, function(error, httpResponse, body){
        if(!error && httpResponse.statusCode != 401){
          content = httpResponse.body;
        }else {
          content['status'] = 'wait';
          content['message'] = that.blocksOfTwo(that.macAddress);
        }
        callback(content);
      }
    );
  };

  this.isAuthenticated = function() {
    return this.authenticated;
  };

  this.setMac = function(mac){
    this.macAddress = mac;
  }

  this.getMac = function(){
    return this.macAddress;
  }
}

module.exports = Terminal;