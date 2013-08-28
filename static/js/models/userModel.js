_r(function (app) {

  app.models.Self = app.base.model.extend({
    logout: function () {
    },

    load: function () {
      this.set({
        name: 'user'
      });
      this.loaded = true;
      app.trigger('user_loaded', true);
    },

    may: function (action, subject) {
      return true;
    }
  });
  app.user_self = new app.models.Self();

});