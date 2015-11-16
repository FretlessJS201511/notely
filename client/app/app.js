(function() {
  var app = angular.module('notely', [
    'ui.router',
    'notely.notes',
    'flash'
  ]);

  function config($urlRouterProvider) {
    $urlRouterProvider.otherwise('/notes/');
  }

  config['$inject'] = ['$urlRouterProvider'];
  app.config(config);

  app.constant('API_BASE', '/api/v1/');
})();
