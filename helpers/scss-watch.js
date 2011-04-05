var fs = require('fs'),
  path = __dirname + '/../public/css/default/';
  
// sass does not communicate well at all, so we just ignore sass output here -.-
var sass = require('child_process').spawn('/var/lib/gems/1.8/bin/sass', [/*'--debug-info',*/ '--watch', path+'style.scss:'+path+'style.css']);