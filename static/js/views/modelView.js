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
  
  /**
   * Model details (properties and meta values)
   */
  app.views.model.details = app.base.pageView.extend({
    
    auto_render: true,
    model: app.models.Model,
    required_params: 1,
    
    events: {
      'click .fake_link.load_instances': 'loadInstances'
    },
    
    init: function () {
      var self = this;
      
      this.seasons = {};
      
      if (this.params[1]) {
        // page in url
        
      }
    },
    
    afterRender: function () {
      app.base.pageView.prototype.afterRender.apply(this, Array.prototype.slice.apply(arguments));
      if (this.model.get('cardinality') < 1000) {
        this.loadInstances();
      }
    },
    
    load: function (callback) {
      var self = this;
      self.model.set({id: self.params[0]});
      self.model.fetch(function () {
        callback(null, self.model);
      });
    },
    
    loadInstances: function () {
      this.instance_list = new InstanceList(null, null, this.$el.find('.instance_list'), [this.model]);
      this.$el.find('.fake_link.load_instances').hide();
    }
    
  });
  
  /**
   * Instance list
   */
  var InstanceList = app.base.paginatedListView.extend({
    
    auto_render: true,
    collection: app.collections.Instance,
    module: 'model',
    action: 'instance_list',
    
    init: function () {
      this.model_definition = this.params[0];
      this.collection.model_name = this.model_definition.get('id');
      this.addLocals({model_definition: this.model_definition});
    },
    
    // automatically fetch the additional data for each model on the current page.
    successRender: function () {
      var self = this;
      var num_models = this.locals.data.length;
      var loaded_models = 0;
      var args_array = Array.prototype.slice.call(arguments);
      var original_fn = app.base.paginatedListView.prototype.successRender;
      if (num_models > 0) {
        this.locals.data.each(function (model) {
          if (model.get('properties')) {
            if (--num_models <= 0) {
              original_fn.apply(self, args_array);
            }
          } else {
            model.fetch(function () {
              if (++loaded_models === num_models) {
                original_fn.apply(self, args_array);
              }
            });
          }
        });
      } else {
        original_fn.apply(this, args_array);
      }
    }
    
  });
  
});