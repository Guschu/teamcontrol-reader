var request = require('request');

function Terminal(){
  this.statusRequestAddress = "";
  this.tagRequestAddress = "";

  var macAddress = "";
  var authenticated = false;

  this.authenticate = function(callback) {
    var that = this;
    request.post( { url:this.statusRequestAddress, form: {token: that.macAddress} },
      function(error, httpResponse, body){
        if(!error && httpResponse.statusCode == 200){
          timeout = 10*60*1000;
          this.authenticated = true;
          callback(httpResponse); 
        }else {
          timeout = 10 * 1000;
          this.authenticated = false;
          callback(that.macAddress);
        }
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
    return authenticated;
  };

  this.setMac = function(mac){
    this.macAddress = mac;
  }
}

module.exports = Terminal;