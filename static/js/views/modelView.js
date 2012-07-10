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
   * Displays the version warning overlay and handles the overwriting process.
   * This must be bound to a view, because it needs to access `this´
   */
  var version_warning_overlay = function (e) {
    e.stopPropagation();
    app.overlay({
      view: 'version_warning_overlay',
      module: 'model'
    });
  }
  
  /**
   * Instance list
   */
  var InstanceList = app.base.paginatedListView.extend({
    
    auto_render: true,
    collection: app.collections.Instance,
    module: 'model',
    action: 'instance_list',
    
    events: {
      'click td:has(.version_warning)': 'showVersionWarning',
      'click tr[data-id]': 'openInstance'
    },
    
    init: function () {
      this.model_definition = this.params[0];
      this.collection.model_name = this.model_definition.get('id');
      this.addLocals({model_definition: this.model_definition});
      _.bind(this);
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
            model.model_name = self.collection.model_name;
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
    },
    
    showVersionWarning: version_warning_overlay,
    
    openInstance: function (e) {
      var id = $(e.target).closest('tr').data('id');
      app.go('model/instance/'+this.model_definition.get('id')+'/'+id);
    }
    
  });
  
  /**
   * Instance details
   */
  app.views.model.instance = app.base.pageView.extend({
    
    auto_render: true,
    model: app.models.Instance,
    required_params: 2,
    
    events: {
      'click .version_warning': 'showVersionWarning',
      'click ..version_error': 'showVersionError'
    },
    
    load: function (callback) {
      var self = this;
      self.model.set({id: self.params[1]});
      self.model.model_name = self.params[0];
      self.model.fetch(function () {
        
        self.model_definition = new app.models.Model();
        self.model_definition.set({id: self.params[0]});
        self.model_definition.fetch(function () {
          self.addLocals({model_definition: self.model_definition});
          callback(null, self.model);
        });
      });
    },
    
    showVersionWarning: function () {
      app.overlay({
        view: 'version_warning_overlay',
        module: 'model'
      });
    },
    
    showVersionError: function (e) {
      var prop_name = $(e.target).closest('tr').find('td:first').text();
      app.overlay({
        view: 'version_error_overlay',
        module: 'model',
        locals: {
          property_name: prop_name
        }
      });
    }
    
  });
  
});