angular.module('notely')
  .service('NotesService', NotesService);

// NotesService
// Handle CRUD operations against the server.
NotesService.$inject = ['$http', 'API_BASE'];
function NotesService($http, API_BASE) {
  var self = this;
  self.notes = [];

  // Get all notes from server
  self.fetch = function() {
    return $http.get(API_BASE + 'notes')
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

  self.findById = function(noteId) {
    // Look through `self.notes` for a note with a matching _id.
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === noteId) {
        return angular.copy(self.notes[i]);
      }
    }
    return {};
  };

  self.create = function(note) {
    var noteCreatePromise = $http.post(API_BASE + 'notes', {
      note: note
    });
    noteCreatePromise.then(function(response) {
      self.notes.unshift(response.data.note);
    });
    return noteCreatePromise;
  };

  self.update = function(note) {
    var noteUpdatePromise = $http.put(API_BASE + 'notes/' + note._id, {
      note: {
        title: note.title,
        body_html: note.body_html
      }
    });
    noteUpdatePromise.then(function(response) {
      self.replaceNote(response.data.note);
    });
    return noteUpdatePromise;
  };

  self.replaceNote = function(note) {
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === note._id) {
        self.notes[i] = note;
      }
    }
  };

  self.delete = function(note) {
    var noteDeletePromise = $http.delete(API_BASE + 'notes/' + note._id);
    noteDeletePromise.then(function(response) {
      self.remove(response.data.note);
    });
    return noteDeletePromise;
  };

  self.remove = function(note) {
    for (var i = 0; i < self.notes.length; i++) {
      if (self.notes[i]._id === note._id) {
        self.notes.splice(i, 1);
        break;
      }
    }
  };
}













//
