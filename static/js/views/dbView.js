_r(function (app) {
  if ( ! window.app.views.hasOwnProperty('db')) {
    app.views.db = {};
  }
  
  /**
   * Database selection box
   */
  app.views.db.box = app.base.formView.extend({
    
    model: app.models.Db,
    module: 'db',
    action: 'box',
    
    auto_render: true,
    
    $el: $('<div id="db_box"></div>').appendTo('body > div.container'),
    
    events: {
      'click .show_form': 'showForm',
      'click .hide_form': 'hideForm'
    },
    
    afterRender: function () {
      if (app.user_self.get('name')) {
        this.$el.show();
      }
      app.base.formView.prototype.afterRender.apply(this, Array.prototype.slice.call(arguments));
    },
    
    load: function (callback) {
      this.model.fetch(function (db) {
        callback(null, db);
      });
    },
    
    showForm: function  () {
      this.$el.addClass('with_form');
    },
    
    hideForm: function  () {
      this.$el.removeClass('with_form');
      this.render();
    },
    
    saved: function () {
      this.hideForm();
      this.model.once('saved', this.saved);
      app.reload();
    }
  });
  
});