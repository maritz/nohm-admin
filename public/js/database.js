$(document).ready(function () {
  if (app.controller === 'Database') {
    
    
    if (app.action === 'connect') {
      var $form = $('#connect_form');
      var $error = $form.find('#general_error');
      
      $form.submit(function (e) {
        e.preventDefault();
        var data = {
          host: $form.find('#host').val(),
          port: $form.find('#port').val(),
          password: $form.find('#password').val()
        };
        $.post('/Database/connect', data, function (response) {
          if (response.errors.general) {
            $error.text(response.errors.general);
          } else {
            window.location.pathname = '/Database';
          }
        }, 'json');
        
      });
    }
    
  }
});






