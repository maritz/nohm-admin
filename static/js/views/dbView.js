_r(function (app) {
  if ( ! window.app.views.hasOwnProperty('db')) {
    app.views.db = {};
  }
  
  /**
   * Database selection box
   */
  app.views.db.box = app.base.formView.extend({
    
    requires_login: true,
    reload_on_login: true,
    
    model: app.models.Db,
    module: 'db',
    action: 'box',
    
    auto_render: true,
    
    $el: $('<div id="db_box"></div>').appendTo('body > div.container'),
    
    events: {
      'click .current .fake_link': 'showForm',
      'click form button[name="cancel"]': 'hideForm'
    },
    
    afterRender: function () {
      if (app.user_self.get('name')) {
        this.$el.show();
      } else {
        debugger;
      }
      app.base.formView.prototype.afterRender.apply(this, Array.prototype.slice.call(arguments));
    },
    
    load: function (callback) {
      this.model.fetch(function (db) {
        callback(null, db);
      });
    },
    
    showForm: function  () {
      this.$el.find('.current .fake_link').fadeOut();
      this.$el.find('form').addClass('show');
    },
    
    hideForm: function  () {
      this.render();
    },
    
    saved: function () {
      this.render();
      this.model.once('saved', this.saved);
    }
  });
  
});