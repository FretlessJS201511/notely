(function() {
  angular.module('notely')
    .service('NotesService', NotesService);

    NotesService.$inject = ['$http', '$state', 'API_BASE'];
    function NotesService($http, $state, API_BASE) {
      var self = this;
      self.notes = [];

      self.fetch = function(callback) {
        return $http.get(API_BASE + 'notes')
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
        return $http.post(API_BASE + 'notes', {
          note: note
        }).then(function(response) {
          self.notes.unshift(response.data.note);
          $state.go('notes.form', { noteId: response.data.note._id });
        });
      };

      self.update = function(note) {
        return $http.put(API_BASE + 'notes/' + note._id, {
          note: {
            title: note.title,
            body_html: note.body_html
          }
        })
          .then(function(response) {
            self.replaceNote(response.data.note);
            $state.go('notes.form', { noteId: response.data.note._id });
          });
      };

      self.replaceNote = function(note) {
        for (var i = 0; i < self.notes.length; i++) {
          if (self.notes[i]._id === note._id) {
            self.notes[i] = note;
            break;
          }
        }
      };
    }
})();
