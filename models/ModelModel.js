var nohm = require('nohm').Nohm;

// this is just for ACL purposes
module.exports = nohm.model('Model', {
  properties: {
    name: {
      type: 'string'
    }
  }
});
