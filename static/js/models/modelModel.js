_r(function (app) {

  app.models.Model = app.base.model.extend({
    urlRoot: '/REST/Model/'
  });

  app.models.Instance = app.base.model.extend({
    urlRoot: '/REST/Instance/',
    url: function () {
      return this.urlRoot+'properties/'+this.model_name+'/'+this.get('id');
    }
  });
  
});