(function() {
  angular.module('notely')
    .service('NotesService', NotesService);

    NotesService.$inject = ['$http'];
    function NotesService($http) {
      var self = this;
      self.notes = [];

      self.fetch = function(callback) {
        return $http.get('http://localhost:3000/notes')
          .success(function(notesData) {
            self.notes = notesData;
          });
      };

      self.get = function() {
        return self.notes;
      };

      self.save = function(note) {
        return $http.post('http://localhost:3000/notes', {
          note: note
        })
          .success(function(result) {
            self.notes.unshift(result.note);
          });
      };
    }
})();
