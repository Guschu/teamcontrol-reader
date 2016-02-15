var request = require('request');

function Terminal(){
  this.statusRequestAddress = "http://teamcontrol.apps.software-consultant.net/api/v1/ping";
  this.tagRequestAddress = "http://teamcontrol.apps.software-consultant.net/api/v1/event";
  var macAddress = "";
  var authenticated = false;
  var timeToShow = 5 * 1000;

  // StandardServer oder eigener?
  var a = process.env.tcr_statusRequestAddress;
  if(a != undefined && a.length > 0){
    this.statusRequestAddress = a;
  }

  a = process.env.tcr_tagRequestAddress;
  if(a != undefined && a.length > 0){
    this.tagRequestAddress = a;
  }

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
        'X-Tc-Token': this.macAddress,
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
          //timeout = 10 * 60 * 1000;
          that.authenticated = true;
          content['status'] = 'info';
          content['message'] = "Bereit zum Scannen";
        } else {
          //timeout = 10 * 1000;
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

    request.post(options, function(error, httpResponse, body){
        if(!error && httpResponse.statusCode != 500){
          content = httpResponse.body;
        }else {
          if(!error && httpResponse.statusCode == 500)
          {
            content = {
              status: 'error',
              message: "Ein Fehler ist aufgetreten"
            }
          }
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