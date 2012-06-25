var nohm = require('nohm').Nohm;

// this is just for ACL purposes
module.exports = nohm.model('Db', {
  properties: {
    host: {
      type: 'string',
      validations: [
        'notEmpty',
        ['length', {
          min: 4
        }]
      ]
    },
    port: {
      type: 'integer'
    }
  }
});
