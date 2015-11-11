(function() {
  angular.module('notely')
    .service('NotesService', NotesService);

    NotesService.$inject = ['$http'];
    function NotesService($http) {
      var self = this;
      self.notes = [];

      self.fetch = function(callback) {
        return $http.get('http://localhost:3001/notes')
          .success(function(notesData) {
            self.notes = notesData;
          });
      };

      self.findById = function(noteId) {
        for (var i = 0; i < self.notes.length; i++) {
          if (self.notes[i]._id === noteId) {
            return self.notes[i];
          }
        }
        return {};
      };

      self.get = function() {
        return self.notes;
      };

      self.save = function(note) {
        return $http.post('http://localhost:3001/notes', {
          note: note
        })
          .success(function(result) {
            self.notes.unshift(result.note);
          });
      };
    }
})();
