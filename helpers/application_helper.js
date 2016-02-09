var exec = require("child_process").exec;

var ApplicationHelper = function() { };

ApplicationHelper.prototype.ifconfig = function(callback){
  exec("ifconfig", function (err, stdout, stderr) {
    if (err) {
      callback(err, stderr);
    } else {
      // ifconfig emits a kind of mish-mash formats, the following gobbledygook turns that into nested objects in
      // a (hopefully) intuitive way (see sample below). 
      var results = stdout.split('\n').reduce(function (a, line) {
          if (/^\t/.test(line)) { // tabs indicate "features" of previous unindented line
            a[a.length - 1].push(line.replace(/^\t/,'').trim());
          } else if (line) {
            a.push(line.split(':').map(function (s) { return s.trim(); })); // unindented lines start with a name followed by a :
          }
          return a;
        }, []).reduce(function (o, a) {
          o[a.shift()] = a.map(function (l) {
            return l.match(/^([^ =:]+)[ =:](?:[ ]?)(.*)$/).slice(1,3); // indented lines start with a name followed by a space, :, or =
          }).reduce(function (p,b) {
            p[b[0]] = b[1];
            return p;
          }, {});
          return o;
          }, {});
      callback(null, results);
    }
  });

};
var apphelper = new ApplicationHelper();
module.exports = apphelper;
