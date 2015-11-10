angular.module('notely')
  .service('NotesService', NotesService);

// NotesService
// Handle CRUD operations against the server.
NotesService.$inject = ['$http'];
function NotesService($http) {
  var self = this;
  self.notes = [];

  // Get all notes from server
  self.fetch = function(callback) {
    $http.get('http://localhost:3000/notes')
    .then(
      // Success callback
      function(response) {
        self.notes = response.data;
        if (callback) {
          callback(self.notes);
        }
      },
      // Failure callback
      function(response) {
        // TODO: Handle failure
      }
    );
  };

  self.get = function() {
    return self.notes;
  };
}
