_r(function (app) {

  app.collections.Model = app.base.paginatedCollection.extend({
    model: app.models.Model,
    url: '/REST/Model/'
  });
  
});