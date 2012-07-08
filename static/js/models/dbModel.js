_r(function (app) {

  app.models.Db = app.base.model.extend({
    urlRoot: '/REST/Db/',
    
    save: function (attrs, options) {
      var self = this;
      var errHandler = function (response) {
        self.trigger('error', self, {
          general: JSON.parse(response.responseText).data.error.msg
        });
        options.error(self, response);
      };
      app.getCsrf(function (csrf) {
        $.post(self.urlRoot+'connection', {
          host: self.get('host'),
          port: self.get('port'),
          pw: self.get('pw'),
          _csrf: csrf
        }).success(function (response) {
          $.post(self.urlRoot+'select', {
            db: self.get('selected'),
            _csrf: csrf
          }).success(function () {
            $.post(self.urlRoot+'prefix', {
              prefix: self.get('prefix'),
              _csrf: csrf
            }).success(function () {
              self.set(response.meta.db);
              options.success(self);
            }).error(errHandler);
          });
        }).error(errHandler);
      });
    }
  });
  
});