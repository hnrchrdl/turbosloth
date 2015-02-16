(function() {

  angular.module('app')
    .directive('loading', loadingDirective);
    
  //////////////////////////////////////
  
  function loadingDirective() {
    
    return {
      restrict: 'E',
      scope: true,
      link: link,
      template: '<i class='fa fa-spinner fa-spin></i>'
    };
    
    //---------------------------
    
    function link(scope, element, attr) {
      scope.$on('loading', function(e, state) {
        state ?
          element.show() :
          element.hide();
      });
    }
  }
  

})();
