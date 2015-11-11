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

# Wire up the form

_notes-form.html_
```html
<form ng-submit="save()">
  <p>
    <input type="text" name="title" id="note_title" placeholder="Title your note" ng-model="note.title">
  </p>
  <p>
    <textarea
      name="body_html"
      placeholder="Just start typing..."
      ng-model="note.body_html"></textarea>
  </p>
  <div class="form-actions">
    <input type="submit" name="commit" value="Save" class="btn btn-default">
  </div>
</form>
```

_notes.js_
```js
function NotesController($state, $scope, NotesService) {
  $scope.note = {};

  NotesService.fetch().success(function(notesData) {
    $scope.notes = notesData;
  });

  $scope.save = function() {
    debugger;
    // NotesService.save($scope.note)
  };

  $state.go('notes.form');
}
```

# Implement the service

_notes-service.js_
```js
self.save = function(note) {
  return $http.post('http://localhost:3000/notes', {
    note: note
  });
};
```

# Implement the backend

* Allow headers

```js
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

* Install body-parser

`$ npm install body-parser --save`

_app.js_
```js
// Body parsing for JSON POST payloads
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// ...

app.post('/notes', function(req, res) {
  var note = new Note({
    title: req.body.note.title,
    body_html: req.body.note.body_html
  });

  note.save().then(function(noteData) {
    res.json({ message: 'Successfully updated note', note: noteData });
  });
});
```

# Extract secrets

```shell
npm install dotenv --save
```

Create new file in `server/.env` with the following contents:

```
DB_URI=foobar
```

Then require and load that config as early as possible, so it is available everywhere, either at the very top of the file, or immediately after framework requires:

```js
require('dotenv').load();
// inside the app.listen callback function
console.log('DB_URI is: ', process.env.DB_URI);
```

You should be able to see that the variable was attached to `process.env` just like it was an environment variable passed in like this:
```shell
$ DB_URI=foobar node app.js
```

But without having to remember to add all that stuff every time, and these can be different in development and production (or staging).

Since we don't want to make the same mistake twice, let's add `.env` to our `.gitignore`:

__.gitignore__
```
# other stuff...
.env
```

And to be kind to other developers (and future you), let's also add a `.env.sample` file with the keys we expect, but no values (or garbage values we don't care about).

__server/.env.sample__
```
DB_URI=
```

And if you really love your team (and your future self), you should add a note to your `README` that you require this to be populated for the app to work. Something like this:
```markdown
## Setup

Copy and edit DOTENV configuration

    $ cp server/.env.sample server/.env
    $ nano/vi/atom server/.env
```







# END OF TUESDAY






# README


# Make notes.form the default route

## Update default route to include trailing slash

_client/app/app.js_
```js
function config($urlRouterProvider) {
  $urlRouterProvider.otherwise('/notes/');
}
```

## Remove unnecessary redirect in NotesController

_notes.js_
Remove `$state.go('notes.form');`

# Resolve fetch promise before loading NotesController

```js
.state('notes', {
  url: '/notes',
  resolve: {
    notesLoaded: function(NotesService) {
      return NotesService.fetch();
    }
  },
  templateUrl: '/notes/notes.html',
  controller: NotesController
})

// ...

NotesController['$inject'] = ['$state', '$scope', 'NotesService'];
function NotesController($state, $scope, NotesService) {
  $scope.note = {};
  $scope.notes = NotesService.get();

  $scope.save = function() {
    NotesService.save($scope.note);
  };
}
```

# Loading an existing note

## NotesService#findById

_notes-service.js_
```js
self.findById = function(noteId) {
  for (var i = 0; i < self.notes.length; i++) {
    if (self.notes[i]._id === noteId) {
      return self.notes[i];
    }
  }
  return {};
};
```

## NotesFormController

```js
.state('notes.form', {
  url: '/{noteId}',
  templateUrl: '/notes/notes-form.html',
  controller: NotesFormController
});

// ...

NotesFormController.$inject = ['$scope', '$state', 'NotesService'];
function NotesFormController($scope, $state, NotesService) {
  $scope.note = NotesService.findById($state.params.noteId);
}
```

# Make the sidebar links work

## ui-sref

```html
<a class="note" ui-sref="notes.form({noteId:note._id})">{{ note.title }}</a>
```

# Implement update on the server

## Set timestamp



# Authentication

## Install bcrypt

```shell
$ npm install bcryptjs --save
```
