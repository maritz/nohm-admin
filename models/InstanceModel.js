var nohm = require('nohm').Nohm;

// this is just for ACL purposes
module.exports = nohm.model('Instance', {
  properties: {
    name: {
      type: 'string'
    }
  }
});
