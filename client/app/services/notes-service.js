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
    .success(function(notesData) {
      self.notes = notesData;
      if (callback) {
        callback();
      }
    });
  };

  self.get = function() {
    return self.notes;
  };
}
