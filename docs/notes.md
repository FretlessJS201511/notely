# Separate client and server directories

* Move existing stuff (except `.gitignore` and `LICENSE`) into `client` directory.
* Create `server` directory

# Node

> Make sure your server is stopped.

* `npm init` in server directory

name: notelyserver
version: [default]
description: Node backend for a note-taking app.
entry point: app.js
test:
git repository:
keywords:
author: Dave Strus
license: MIT
Is this ok? (yes)

# [Express](http://expressjs.com/)

> Fast, unopinionated, minimalist web framework for Node.js

`$ npm install express --save`

Create `app.js`

```js
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('I <3 Express!');
})

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
```

Add `"start"` script.
```json
  "start": "node app.js"
```

> Add `npm-debug.log` to .gitignore.

# Serve static notes JSON

```js
app.get('/', function(req, res) {
  res.json([
    {
      title: 'Hardcoded note',
      body_html: 'Cool note.'
    },
    {
      title: 'Super-cool',
      body_html: 'Read it and weep.'
    }
  ]);
});
```

# Client: NotesService

* Create `services` folder.
* Create `services/notes-service.js`

```js
(function() {
  angular.module('notely')
    .service('NotesService', NotesService);

    NotesService.$inject = ['$http'];
    function NotesService($http) {
      var self = this;
      self.notes = [];

      self.fetch = function(callback) {
        $http.get('http://localhost:3000')
        .success(function(notesData) {
          self.notes = notesData;
          if (callback) {
            callback();
          }
        });
      };

      self.get = function() {
        return self.notes;
      }
    }
})();
```

* Add `<script>` to `index.html`

```html
<script src="services/notes-service.js"></script>
```

* Invoke NotesService from NotesController

```js
NotesController['$inject'] = ['$state', 'NotesService'];
function NotesController($state, NotesService) {
  NotesService.fetch(function() {
    console.log(NotesService.get().length);
  });
  $state.go('notes.form');
}
```

# DB

[mongolab](https://mongolab.com/)
