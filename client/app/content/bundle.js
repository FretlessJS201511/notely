'use strict';

(function () {
  var app = angular.module('notely', ['ui.router', 'notely.notes', 'flash']);

  function config($urlRouterProvider) {
    $urlRouterProvider.otherwise('/notes/');
  }

  config['$inject'] = ['$urlRouterProvider'];
  app.config(config);

  app.constant('API_BASE', '/api/v1/');
})();
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').directive('signIn', ['$state', 'UsersService', function ($state, UsersService) {
  var SignInController = (function () {
    function SignInController() {
      _classCallCheck(this, SignInController);

      this.user = {};
    }

    _createClass(SignInController, [{
      key: 'login',
      value: function login() {
        UsersService.login(this.user).then(function (response) {
          $state.go('notes.form', { noteId: undefined });
        });
      }
    }]);

    return SignInController;
  })();

  return {
    scope: {},
    controller: SignInController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-in.html'
  };
}]);
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').directive('signUp', ['$state', 'Flash', 'UsersService', function ($state, Flash, UsersService) {
  var SignUpController = (function () {
    function SignUpController() {
      _classCallCheck(this, SignUpController);

      this.user = {};
    }

    _createClass(SignUpController, [{
      key: 'submit',
      value: function submit() {
        UsersService.create(this.user).then(function (response) {
          $state.go('notes.form', { noteId: undefined });
          Flash.create('success', response.data.message);
        }, function (response) {
          Flash.create('danger', response.data);
        });
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').directive('userLinks', function () {
  var UserLinksController = (function () {
    function UserLinksController($state, CurrentUser, AuthToken) {
      _classCallCheck(this, UserLinksController);

      this.$state = $state;
      this.CurrentUser = CurrentUser;
      this.AuthToken = AuthToken;
    }

    _createClass(UserLinksController, [{
      key: 'user',
      value: function user() {
        return this.CurrentUser.get();
      }
    }, {
      key: 'signedIn',
      value: function signedIn() {
        return !!this.user()._id;
      }
    }, {
      key: 'logout',
      value: function logout() {
        this.CurrentUser.clear();
        this.AuthToken.clear();
        this.$state.go('sign-in');
      }
    }]);

    return UserLinksController;
  })();

  UserLinksController.$inject = ['$state', 'CurrentUser', 'AuthToken'];

  return {
    scope: {},
    controller: UserLinksController,
    controllerAs: 'ctrl',
    bindToController: true,
    template: '\n      <div class="user-links">\n        <div ng-show="ctrl.signedIn()">\n          Signed in as {{ ctrl.user().name }}\n          |\n          <a href="#" ng-click="ctrl.logout()">Logout</a>\n        </div>\n      </div>\n    '
  };
});
'use strict';

(function () {

  angular.module('notely.notes', ['ui.router', 'textAngular', 'flash']).config(notesConfig);

  notesLoadedAndUserLoggedIn.$inject = ['$state', '$q', '$timeout', 'NotesService', 'CurrentUser'];
  function notesLoadedAndUserLoggedIn($state, $q, $timeout, NotesService, CurrentUser) {
    var deferred = $q.defer();
    $timeout(function () {
      if (CurrentUser.isSignedIn()) {
        NotesService.fetch().then(function () {
          deferred.resolve();
        }, function () {
          deferred.reject();
          $state.go('sign-in');
        });
      } else {
        deferred.reject();
        $state.go('sign-in');
      }
    });
    return deferred.promise;
  }

  notesConfig['$inject'] = ['$stateProvider'];
  function notesConfig($stateProvider) {
    $stateProvider.state('notes', {
      url: '/notes',
      resolve: {
        notesLoaded: notesLoadedAndUserLoggedIn
      },
      templateUrl: '/notes/notes.html',
      controller: NotesController
    }).state('notes.form', {
      url: '/:noteId',
      templateUrl: '/notes/notes-form.html',
      controller: NotesFormController
    });
  }

  NotesController.$inject = ['$state', '$scope', 'NotesService'];
  function NotesController($state, $scope, NotesService) {
    $scope.note = {};
    $scope.notes = NotesService.get();
  }

  NotesFormController.$inject = ['$scope', '$state', 'Flash', 'NotesService'];
  function NotesFormController($scope, $state, Flash, NotesService) {
    $scope.note = NotesService.findById($state.params.noteId);

    $scope.save = function () {
      // Decide whether to call create or update...
      if ($scope.note._id) {
        NotesService.update($scope.note).then(function (response) {
          $scope.note = angular.copy(response.data.note);
          Flash.create('success', response.data.message);
        }, function (response) {
          Flash.create('danger', response.data);
        });
      } else {
        NotesService.create($scope.note).then(function (response) {
          $state.go('notes.form', { noteId: response.data.note._id });
        });
      }
    };

    $scope['delete'] = function () {
      NotesService['delete']($scope.note).then(function () {
        $state.go('notes.form', { noteId: undefined });
      });
    };

    $scope.buttonText = function () {
      if ($scope.note._id) {
        return 'Save Changes';
      }
      return 'Save';
    };
  }
})();
'use strict';

angular.module('notely').factory('AuthInterceptor', ['AuthToken', 'API_BASE', function (AuthToken, API_BASE) {
  return {
    request: function request(config) {
      var token = AuthToken.get();
      if (token && config.url.indexOf(API_BASE) > -1) {
        config.headers['Authorization'] = token;
      }
      return config;
    }
  };
}]);

angular.module('notely').config(['$httpProvider', function ($httpProvider) {
  return $httpProvider.interceptors.push('AuthInterceptor');
}]);
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').service('AuthToken', ['$window', function ($window) {
  var AuthToken = (function () {
    function AuthToken() {
      _classCallCheck(this, AuthToken);

      this.authToken = $window.localStorage.getItem('authToken');
    }

    _createClass(AuthToken, [{
      key: 'set',
      value: function set(token) {
        this.authToken = token;
        $window.localStorage.setItem('authToken', this.authToken);
      }
    }, {
      key: 'get',
      value: function get() {
        return this.authToken;
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.authToken = undefined;
        $window.localStorage.removeItem('authToken');
      }
    }]);

    return AuthToken;
  })();

  return new AuthToken();
}]);
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').service('CurrentUser', ['$window', function ($window) {
  var CurrentUser = (function () {
    function CurrentUser() {
      _classCallCheck(this, CurrentUser);

      this.currentUser = JSON.parse($window.localStorage.getItem('currentUser'));
    }

    _createClass(CurrentUser, [{
      key: 'set',
      value: function set(user) {
        this.currentUser = user;
        $window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
    }, {
      key: 'get',
      value: function get() {
        return this.currentUser || {};
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.currentUser = undefined;
        $window.localStorage.removeItem('currentUser');
      }
    }, {
      key: 'isSignedIn',
      value: function isSignedIn() {
        return !!this.get()._id;
      }
    }]);

    return CurrentUser;
  })();

  return new CurrentUser();
}]);
'use strict';

angular.module('notely').service('NotesService', NotesService);

// NotesService
// Handle CRUD operations against the server.
NotesService.$inject = ['$http', 'API_BASE'];
function NotesService($http, API_BASE) {
  var self = this;
  self.notes = [];

  // Get all notes from server
  self.fetch = function () {
    return $http.get(API_BASE + 'notes').then(
    // Success callback
    function (response) {
      self.notes = response.data;
    },
    // Failure callback
    function (response) {
      // TODO: Handle failure
    });
  };

  self.get = function () {
    return self.notes;
  };

  self.findById = function (noteId) {
    // Look through `self.notes` for a note with a matching _id.
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === noteId) {
        return angular.copy(self.notes[i]);
      }
    }
    return {};
  };

  self.create = function (note) {
    var noteCreatePromise = $http.post(API_BASE + 'notes', {
      note: note
    });
    noteCreatePromise.then(function (response) {
      self.notes.unshift(response.data.note);
    });
    return noteCreatePromise;
  };

  self.update = function (note) {
    var noteUpdatePromise = $http.put(API_BASE + 'notes/' + note._id, {
      note: {
        title: note.title,
        body_html: note.body_html
      }
    });
    noteUpdatePromise.then(function (response) {
      self.replaceNote(response.data.note);
    });
    return noteUpdatePromise;
  };

  self.replaceNote = function (note) {
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === note._id) {
        self.notes[i] = note;
      }
    }
  };

  self['delete'] = function (note) {
    var noteDeletePromise = $http['delete'](API_BASE + 'notes/' + note._id);
    noteDeletePromise.then(function (response) {
      self.remove(response.data.note);
    });
    return noteDeletePromise;
  };

  self.remove = function (note) {
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === note._id) {
        self.notes.splice(i, 1);
        break;
      }
    }
  };
}

//
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('notely').service('UsersService', ['$http', 'API_BASE', 'AuthToken', 'CurrentUser', function ($http, API_BASE, AuthToken, CurrentUser) {
  var UsersService = (function () {
    function UsersService() {
      _classCallCheck(this, UsersService);
    }

    _createClass(UsersService, [{
      key: 'create',
      value: function create(user) {
        var userPromise = $http.post(API_BASE + 'users', {
          user: user
        });
        userPromise.then(function (response) {
          AuthToken.set(response.data.auth_token);
          CurrentUser.set(response.data.user);
        });
        return userPromise;
      }
    }, {
      key: 'login',
      value: function login(user) {
        var loginPromise = $http.post(API_BASE + 'sessions', {
          user: user
        });
        loginPromise.then(function (response) {
          AuthToken.set(response.data.auth_token);
          CurrentUser.set(response.data.user);
        });
        return loginPromise;
      }
    }]);

    return UsersService;
  })();

  return new UsersService();
}]);
'use strict';

(function () {
  angular.module('notely').config(usersConfig);

  usersConfig.$inject = ['$stateProvider'];
  function usersConfig($stateProvider) {
    $stateProvider.state('sign-up', {
      url: '/sign-up',
      template: '<sign-up></sign-up>'
    }).state('sign-in', {
      url: '/sign-in',
      template: '<sign-in></sign-in>'
    });
  };
})();
//# sourceMappingURL=bundle.js.map
