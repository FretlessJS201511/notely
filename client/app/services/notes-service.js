angular.module('notely')
  .service('NotesService', NotesService);

// NotesService
// Handle CRUD operations against the server.
NotesService.$inject = ['$http'];
function NotesService($http) {
  var self = this;
  self.notes = [];

  // Get all notes from server
  self.fetch = function() {
    return $http.get('http://localhost:3000/notes')
    .then(
      // Success callback
      function(response) {
        self.notes = response.data;
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

  self.save = function(note) {
    $http.post('http://localhost:3000/notes', {
      note: note
    }).then(function(response) {
      self.notes.unshift(response.data.note);
    });
  }
}













//
