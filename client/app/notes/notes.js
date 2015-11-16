(function() {

  angular.module('notely.notes', [
    'ui.router',
    'textAngular',
    'flash'
  ])
  .config(notesConfig);

  notesLoadedAndUserLoggedIn.$inject = ['$state', '$q', '$timeout', 'NotesService', 'CurrentUser'];
  function notesLoadedAndUserLoggedIn($state, $q, $timeout, NotesService , CurrentUser) {
    let deferred = $q.defer();
    $timeout(function() {
      if (CurrentUser.isSignedIn()) {
        NotesService.fetch().then(
          function() {
            deferred.resolve();
          },
          function() {
            deferred.reject();
            $state.go('sign-in');
          }
        );
      }
      else {
        deferred.reject();
        $state.go('sign-in');
      }
    });
    return deferred.promise;
  }

  notesConfig['$inject'] = ['$stateProvider'];
  function notesConfig($stateProvider) {
    $stateProvider

      .state('notes', {
        url: '/notes',
        resolve: {
          notesLoaded: notesLoadedAndUserLoggedIn
        },
        templateUrl: '/notes/notes.html',
        controller: NotesController
      })

      .state('notes.form', {
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

    $scope.save = function() {
      // Decide whether to call create or update...
      if ($scope.note._id) {
        NotesService.update($scope.note).then(function(response) {
          $scope.note = angular.copy(response.data.note);
          Flash.create('success', response.data.message);
        },
        function(response) {
          Flash.create('danger', response.data);
        });
      }
      else {
        NotesService.create($scope.note).then(function(response) {
          $state.go('notes.form', { noteId: response.data.note._id });
        });
      }
    };

    $scope.delete = function() {
      NotesService.delete($scope.note).then(function() {
        $state.go('notes.form', { noteId: undefined });
      });
    };

    $scope.buttonText = function() {
      if ($scope.note._id) {
        return 'Save Changes';
      }
      return 'Save';
    }
  }
})();
