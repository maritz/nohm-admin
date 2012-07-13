var nohm = require('nohm').Nohm;
var connector = require(__dirname+'/../helpers/redisConnector');

var db = 2;

nohm.model('Test', {
  properties: {
    name: {
      type: 'string',
      unique: true
    },
    hurg: {
      type: 'integer',
      defaultValue: db
    }
  }
});

nohm.model('Related', {
  properties: {
    name: {
      type: 'string',
      index: true
    }
  }
});

connector.connect(function (err) {
  nohm.client.select(db, function () {
    
    var test = nohm.factory('Test');
    var rel1 = nohm.factory('Related');
    var rel2 = nohm.factory('Related');
    var rel3 = nohm.factory('Related');
    
    test.link(rel1);
    rel1.p('name', 'rel1');
    test.link(rel2);
    rel2.p('name', 'rel2');
    test.link(rel3, 'uncle');
    rel3.p('name', 'rel3');
    test.save(function (err) {
      if (err) {
        console.log('error:', err);
      }  else {
        console.log('success');
      }
      connector.quit();
    });
  });
});

