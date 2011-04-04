var Ni = require('ni'),
    nohm = require('nohm').Nohm;

module.exports = nohm.model('UserMockup', {
  properties: {
    name: {
      type: 'string',
      unique: true,
      validations: [
        'notEmpty'
      ]
    },
    email: {
      type: 'string',
      unique:true,
      validations: [
        'notEmpty',
        'email'
      ]
    }
  }
});