_r(function (app) {
  if ( ! window.app.views.hasOwnProperty('model')) {
    app.views.model = {};
  }
  
  /**
   * Model list
   */
  app.views.model.index = app.base.listView.extend({
    
    collection: app.collections.Model,
    auto_render: true
    
  });
  
});