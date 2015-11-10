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

# Display notes in the sidebar.

```html
<ul id="notes">
  <li ng-repeat="note in notes">
    {{ note.title }}
  </li>
</ul>
```

_notes.js_
```js
NotesService.fetch(function() {
  $scope.notes = NotesService.get();
});
```

# Pass `notesData` into callback.

_notes-service.js_
```js
if (callback) {
  callback(self.notes);
}
```

_notes.js_
```js
NotesService.fetch(function(notesData) {
  $scope.notes = notesData;
});
```

# Return promise from service

_notes-service.js_
```js
self.fetch = function(callback) {
  return $http.get('http://localhost:3000/notes')
    .success(function(notesData) {
      self.notes = notesData;
    });
};
```

_notes.js_
```js
NotesService.fetch().success(function(notesData) {
  $scope.notes = notesData;
});
```

# Auto-reload dev server

Use supervisor to detect file changes and reload node/express.

`$ npm install supervisor --save-dev`

```json
"scripts": {
  "start": "node app.js",
  "dev": "node_modules/.bin/supervisor app.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

`$ npm run dev`

> Change JSON and watch server output

# DB

[mongolab](https://mongolab.com/)

* Sign up for mongolab
* Create a db
* Create a user
* Create a `notes` collection

Collections are like tables. Documents are like rows, but they're just JSON-like data.

* Install mongoose.

`$ npm install mongoose --save`

* Connect to db
* Define schema
* Create model
* Retrieve notes

_app.js_
```js
var db = require('mongoose');

db.connect('mongodb://mongo:ilove1150@ds051534.mongolab.com:51534/notely');

var NoteSchema = db.Schema({
  title: String,
  body_html: String,
  body_text: String,
  updated_at: { type: Date, default: Date.now }
});

var Note = db.model('Note', NoteSchema);

app.get('/notes', function(req, res) {
  Note.find().then(function(notes) {
    res.json(notes);
  });
});
```

# Separate db config, schema, and model into separate files.

_config/db.js_
```js
var db = require('mongoose');
db.connect('mongodb://mongo:ilove1150@ds051534.mongolab.com:51534/notely');

module.exports = db;
```

_models/note-schema.js_
```js
var db = require('../config/db');

var NoteSchema = db.Schema({
  title: String,
  body_html: String,
  body_text: String,
  updated_at: { type: Date, default: Date.now }
});

module.exports = NoteSchema;
```

_models/note.js_
```js
var db = require('../config/db');
var NoteSchema = require('./note-schema');

var Note = db.model('Note', NoteSchema);

module.exports = Note;
```

_app.js_
```js
var Note = require('./models/note');
```
