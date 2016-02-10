var request = require('request');

function Terminal(){
  this.statusRequestAddress = "http://teamcontrol.apps.software-consultant.net/api/v1/ping";
  this.tagRequestAddress = "http://teamcontrol.apps.software-consultant.net/api/v1/event";
  
  var a = process.env.tcr_statusRequestAddress;
  if(a != undefined && a.length > 0){
    this.statusRequestAddress = a;
  }

  a = process.env.tcr_tagRequestAddress;
  if(a != undefined && a.length > 0){
    this.tagRequestAddress = a;
  }

  var macAddress = "";
  var authenticated = false;

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
      feedback: 'feedback wait',
      text: this.blocksOfTwo(this.macAddress)
    }

    request(options, function(error, httpResponse, body){
        if(!error && httpResponse.statusCode == 200){
          timeout = 10 * 60 * 1000;
          that.authenticated = true;
          content['feedback'] = 'feedback ok';
          content['text'] = "Bereit zum Scannen";
        } else {
          timeout = 10 * 1000;
          that.authenticated = false;
        }
        callback(content);
        setTimeout(function(){
          that.authenticate(callback);
        }, timeout);
      }
    );
  };

  this.sendTag = function(tagID, callback){
    request.post( {url:this.tagRequestAddress, form: {token: that.macAddress, tag: tagID}},
      function(error, httpResponse, body){
        if(!error && httpResponse.statusCode == 200){

        }else {

        }
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