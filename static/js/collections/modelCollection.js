_r(function (app) {

  app.collections.Model = app.base.paginatedCollection.extend({
    model: app.models.Model,
    url: '/REST/Model/'
  });
  
  app.collections.Instance = app.base.paginatedCollection.extend({
    model: app.models.Instance,
    
    search: {},
    
    url: function () {
      var url = this.model.prototype.urlRoot;
      if (this.search.value) {
        return url+'find/'+this.model_name+'/'+this.search.property+'/'+this.search.value;
      } else {
        return url+'list/'+this.model_name;
      }
    }
  });
  
});