var exec = require("child_process").exec;
var os = require("os");
var ApplicationHelper = function() { };

ApplicationHelper.prototype.getMac = function(callback){
  switch(os.platform()){
    case 'darwin':
      exec("ifconfig", function (err, stdout, stderr) {
        if (err) {
          callback(err, stderr);
        } else {
          var results = stdout.split('\n').reduce(function (a, line) {
              if (/^\t/.test(line)) {
                a[a.length - 1].push(line.replace(/^\t/,'').trim());
              } else if (line) {
                a.push(line.split(':').map(function (s) { return s.trim(); })); 
              }
              return a;
            }, []).reduce(function (o, a) {
              o[a.shift()] = a.map(function (l) {
                return l.match(/^([^ =:]+)[ =:](?:[ ]?)(.*)$/).slice(1,3); 
              }).reduce(function (p,b) {
                p[b[0]] = b[1];
                return p;
              }, {});
              return o;
              }, {});
          callback(null, results['en0']['ether'].split(':').join('').toUpperCase());
        }
      });
      break;
    default:
      exec('ip link show eth0', function(err, stdout, stderr){
        if(err){
          callback(err, stderr);
        } else {
          matches = stdout.match(/(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)/);
          callback(null, matches[0].split(':').join('').toUpperCase());
        }
      });
  }
};


var apphelper = new ApplicationHelper();
module.exports = apphelper;
