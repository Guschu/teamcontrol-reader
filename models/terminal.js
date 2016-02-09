var request = require('request');

function Terminal(){
  this.statusRequestAddress = "http://127.0.0.1:3000/api/v1/ping";
  this.tagRequestAddress = "";

  var macAddress = "";
  var authenticated = false;

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
      text: that.macAddress
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