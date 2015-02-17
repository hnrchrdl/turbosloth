(function() {

  angular.module('app')
    .directive('loading', loadingDirective);
    
  //////////////////////////////////////
  
  function loadingDirective() {
    
    return {
      restrict: 'E',
      scope: true,
      link: link,
      template: '<i class="fa fa-spinner fa-spin"></i>'
    };
    
    //---------------------------
    
    function link(scope, element, attr) {
      scope.$on('loading:on', function() {
        element.show() :
      });
      scope.$on('loading:off', function() {
        element.hide() :
      });
    }
  }
  

})();
