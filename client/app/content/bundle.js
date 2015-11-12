'use strict';

(function () {
  var app = angular.module('notely', ['ui.router', 'notely.notes']);

  function config($urlRouterProvider) {
    $urlRouterProvider.otherwise('/notes/');
  }

  config['$inject'] = ['$urlRouterProvider'];
  app.config(config);

  app.constant('API_BASE', 'http://localhost:3001/');
})();
'use strict';

angular.module('notely').directive('flashMessages', function () {
  return {
    template: '<div class="alert alert-success">FLAAAAAASH AAAAAHHH</div>'
  };
});
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').directive('signUp', ['UsersService', function (UsersService) {
  var SignUpController = (function () {
    function SignUpController() {
      _classCallCheck(this, SignUpController);

      this.user = {};
    }

    _createClass(SignUpController, [{
      key: 'submit',
      value: function submit() {
        UsersService.create(this.user);
      }
    }]);

    return SignUpController;
  })();

  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
}]);
'use strict';

(function () {
  angular.module('notely').service('NotesService', NotesService);

  NotesService.$inject = ['$http', '$state', 'API_BASE'];
  function NotesService($http, $state, API_BASE) {
    var self = this;
    self.notes = [];

    self.fetch = function (callback) {
      return $http.get(API_BASE + 'notes').success(function (notesData) {
        self.notes = notesData;
      });
    };

    self.findById = function (noteId) {
      for (var i = 0; i < self.notes.length; i++) {
        if (self.notes[i]._id === noteId) {
          return angular.copy(self.notes[i]);
        }
      }
      return {};
    };

    self.get = function () {
      return self.notes;
    };

    self.create = function (note) {
      return $http.post(API_BASE + 'notes', {
        note: note
      }).then(function (response) {
        self.notes.unshift(response.data.note);
        $state.go('notes.form', { noteId: response.data.note._id });
      });
    };

    self.update = function (note) {
      return $http.put(API_BASE + 'notes/' + note._id, {
        note: {
          title: note.title,
          body_html: note.body_html
        }
      }).then(function (response) {
        self.replaceNote(response.data.note);
        $state.go('notes.form', { noteId: response.data.note._id });
      });
    };

    self.replaceNote = function (note) {
      for (var i = 0; i < self.notes.length; i++) {
        if (self.notes[i]._id === note._id) {
          self.notes[i] = note;
          break;
        }
      }
    };
  }
})();
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').service('UsersService', ['$http', 'API_BASE', function ($http, API_BASE) {
  var UsersService = (function () {
    function UsersService() {
      _classCallCheck(this, UsersService);
    }

    _createClass(UsersService, [{
      key: 'create',
      value: function create(user) {
        return $http.post(API_BASE + 'users', {
          user: user
        }).then(function (response) {
          alert(response.data.message);
        });
      }
    }]);

    return UsersService;
  })();

  return new UsersService();
}]);
'use strict';

(function () {
  angular.module('notely.notes', ['ui.router']).config(notesConfig);

  notesConfig['$inject'] = ['$stateProvider'];
  function notesConfig($stateProvider) {
    $stateProvider.state('notes', {
      url: '/notes',
      resolve: {
        notesLoaded: function notesLoaded(NotesService) {
          return NotesService.fetch();
        }
      },
      templateUrl: '/notes/notes.html',
      controller: NotesController
    }).state('notes.form', {
      url: '/:noteId',
      templateUrl: '/notes/notes-form.html',
      controller: NotesFormController
    });
  }

  NotesController['$inject'] = ['$state', '$scope', 'NotesService'];
  function NotesController($state, $scope, NotesService) {
    $scope.note = {};
    $scope.notes = NotesService.get();
  }

  NotesFormController.$inject = ['$scope', '$state', 'NotesService'];
  function NotesFormController($scope, $state, NotesService) {
    $scope.note = NotesService.findById($state.params.noteId);
    $scope.save = function () {
      if ($scope.note._id) {
        NotesService.update($scope.note);
      } else {
        NotesService.create($scope.note);
      }
    };
  }
})();

//
'use strict';

{
  var usersConfig = function usersConfig($stateProvider) {
    $stateProvider.state('sign-up', {
      url: '/sign-up',
      template: '<sign-up></sign-up>'
    });
  };

  angular.module('notely').config(usersConfig);

  usersConfig.$inject = ['$stateProvider'];
}
//# sourceMappingURL=bundle.js.map
