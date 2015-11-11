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
            return angular.copy(self.notes[i]);
          }
        }
        return {};
      };

      self.get = function() {
        return self.notes;
      };

      self.create = function(note) {
        return $http.post('http://localhost:3001/notes', {
          note: note
        })
          .success(function(result) {
            self.notes.unshift(result.note);
          });
      };

      self.update = function(note) {
        return $http.put('http://localhost:3001/notes/' + note._id, {
          note: {
            title: note.title,
            body_html: note.body_html
          }
        })
          .then(function(response) {
            self.replaceNote(response.data.note);
          });
      };

      self.replaceNote = function(note) {
        for (var i = 0; i < self.notes.length; i++) {
          if (self.notes[i]._id === note._id) {
            self.notes[i] = note;
            // self.notes.splice(i, 1);
            // self.notes.unshift(note);
            break;
          }
        }
      };
    }
})();
