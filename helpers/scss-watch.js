var fs = require('fs'),
  path = __dirname + '/../public/css/default/';
  
// sass watch hack for development :(
var sassfiles = fs.readdirSync(path);
for (var i = 0, len = sassfiles.length; i < len; i = i + 1) {
  if (sassfiles[i].match(/\.scss$/i)) {
    fs.watchFile(path + sassfiles[i], function () {
      console.log(path+'style.scss changed');
      require('child_process').spawn('touch', [path+'style.scss']);
    });
  }
}
// sass does not communicate well at all, so we just ignore sass output here -.-
var sass = require('child_process').spawn('/var/lib/gems/1.8/bin/sass', ['--debug-info', '--watch', path+'style.scss']);