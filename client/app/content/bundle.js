(function () {
  var app = angular.module('notely', ['ui.router', 'notely.notes']);

  function config($urlRouterProvider) {
    $urlRouterProvider.otherwise('/notes/');
  }

  config['$inject'] = ['$urlRouterProvider'];
  app.config(config);

  app.constant('API_BASE', 'http://localhost:3001/');
})();
angular.module('notely').directive('flashMessages', function () {
  return {
    template: '<div class="alert alert-success">FLAAAAAASH AAAAAHHH</div>'
  };
});
(function () {
  angular.module('notely.notes', ['ui.router']).config(notesConfig);

  notesConfig['$inject'] = ['$stateProvider'];
  function notesConfig($stateProvider) {
    $stateProvider.state('notes', {
      url: '/notes',
      resolve: {
        notesLoaded: function (NotesService) {
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
//# sourceMappingURL=bundle.js.map
