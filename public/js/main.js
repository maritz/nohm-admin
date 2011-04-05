$(document).ready(function () {
  var model = $('[data-model]').attr('data-model');
  $('dd[data-json] a').click(function(e) {
    var dd = $(this).closest('dd');
    var json = dd.attr('data-json');
    var content = $(this).html();
    dd.attr('data-json', content);
    $(this).html(json);
  });
  
  var getObjectDetails = function (type, e) {
    var a = type === 'object' ? $(this).find('a') : $(this),
    content = a.next('div.' + type),
    id = a.closest('[data-id]').attr('data-id');
    if (content.length > 0 && (type === 'relations' || e.target.nodeName !== 'A') ) {
      content.toggle();
    } else if (type !== 'object' || e.target.nodeName !== 'A') {
      relModel = model;
      if (!model) {
        // we're not on a model page
        var relModel = a.closest('[data-model-rel]').attr('data-model-rel');
      }
      var url = '/Models/get' + type.charAt(0).toUpperCase() + type.slice(1) + '/' + relModel + '/' + id;
      $.get(url, null, function(html, status) {
        a.after(html);
      }, 'html');
    }
  }
  $('a.objectId').closest('li').click(function(e) {
    getObjectDetails.apply(this, ['object', e]);
  });
  
  $('div.relations > a').live('click', function (e) {
    getObjectDetails.apply(this, ['relations', e]);
  });
  
});






