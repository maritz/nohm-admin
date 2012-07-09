_r(function (app) {

  app.collections.Model = app.base.paginatedCollection.extend({
    model: app.models.Model,
    url: '/REST/Model/'
  });
  
  app.collections.Instance = app.base.paginatedCollection.extend({
    model: app.models.Instance,
    
    url: function () {
      return this.model.prototype.urlRoot+'list/'+this.model_name;
    }
  });
  
});