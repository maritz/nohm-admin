var fs = require('fs'),
	child_process = require('child_process');

// sass watch hack for development :(
var sassfiles = fs.readdirSync(__dirname + '/public/css/default');
for (var i = 0, len = sassfiles.length; i < len; i = i + 1) {
  if (sassfiles[i].match(/\.scss$/i)) {
    fs.watchFile(__dirname + '/public/css/default/' + sassfiles[i], function () {
      child_process.spawn('touch', [__dirname + '/public/css/default/style.scss'])
    });
  }
}
// sass does not communicate well at all, so we just ignore sass output here -.-
var sass = child_process.spawn('/var/lib/gems/1.8/bin/sass', [/*'--debug-info',*/ '--watch', __dirname + '/public/css/default/style.scss']);