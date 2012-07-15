_r(function (app) {

  app.models.Model = app.base.model.extend({
    urlRoot: '/REST/Model/'
  });

  app.models.Instance = app.base.model.extend({
    urlRoot: '/REST/Instance/',
    url: function () {
      return this.urlRoot+'properties/'+this.model_name+'/'+this.get('id');
    },
    
    remove: function (callback) {
      var self = this;
      app.getCsrf(function (token) {
        $.ajax({
          data: {
            _csrf: token
          },
          url: self.urlRoot+self.model_name+'/'+self.get('id'),
          type: 'DELETE'
        }).success(callback);
      });
    }
  });

  app.models.Relation = app.base.model.extend({
    urlRoot: '/REST/Instance/',
    
    url: function () {
      return this.urlRoot+'relations/'+this.model_name+'/'+this.instance_id;
    }
  });

  app.models.EditProperty = app.base.model.extend({
    urlRoot: '/REST/Instance/',
    
    url: function () {
      return this.urlRoot+'property/'+this.get('model_name')+'/'+this.id;
    }
  });
  
});