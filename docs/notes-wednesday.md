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


# Find an individual note on the client side.

_notes-service.js_
```js
self.findById = function(noteId) {
  // Look through `self.notes` for a note with a matching _id.
  for (var i = 0; i < self.notes.length; i++) {
    if (self.notes[i]._id === noteId) {
      return self.notes[i];
    }
  }
  return {};
};
```

# Resolve fetch promise before loading NotesController

```js
.state('notes', {
  url: '/notes',
  resolve: {
    notesLoaded: ['NotesService', function(NotesService) {
      return NotesService.fetch();
    }
  }],
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

# Refactor `findById`

Right now, the sidebar gets updated in real time as we make changes in the form. That won't do.

## angular.copy

```js
self.findById = function(noteId) {
  for (var i = 0; i < self.notes.length; i++) {
    if (self.notes[i]._id === noteId) {
      return angular.copy(self.notes[i]);
    }
  }
  return {};
};
```

# Link sidebar items to state for individual notes.

## ui-sref

_notes.html_
```html
<a class="note" ui-sref="notes.form({ noteId:note._id })">
  {{ note.title }}
</a>
```

# _New Note_ button: Clear the form, change the URL.

_notes.html_
```html
<button class="new-note btn btn-default"
  ui-sref="notes.form({noteId: undefined})">
  New Note
</button>
```

This works, unless you click it after creating a new note.

## Update state after note creation.

Let's return the _original_ promise from `save`, rather than the one returned by `then`. That way, we still have that response object to work with.

_notes-service.js_
```js
self.save = function(note) {
  var noteCreatePromise = $http.post(API_BASE + 'notes', {
    note: note
  });
  noteCreatePromise.then(function(response) {
    self.notes.unshift(response.data.note);
  });
  return noteCreatePromise;
};
```

_notes.js_
```js
NotesService.create($scope.note).then(function(response) {
  $state.go('notes.form', { noteId: response.data.note._id });
});
```

# Sort notes by updated_at on the client side.

```html
<li ng-repeat="note in notes | orderBy: '-updated_at'">
```

> Note: If you have records with no value for `updated_at`, they may not appear exactly like you expected.

# Use track by to more efficiently handle duplicate checking.

```html
<li ng-repeat="note in notes | orderBy:'-updated_at' track by note._id">
```

# Sort notes on the server

```js
app.get('/notes', function(req, res) {
  Note.find().sort({ updated_at: 'desc' }).then(function(notes) {
    res.json(notes);
  });
});
```

> With Mongo, we can use `-1` in place of `'desc'`.

# Update notes

## Client side

* Rename `save` to `create`
* Update controller to determine whether to call `create` or `update`

_notes.js_
```js
$scope.save = function() {
  // Decide whether to call create or update...
  if ($scope.note._id) {
    NotesService.update($scope.note).then(function(response) {
      $scope.note = angular.copy(response.data.note);
    });
  }
  else {
    NotesService.create($scope.note).then(function(response) {
      $state.go('notes.form', { noteId: response.data.note._id });
    });
  }
};
```

_notes-service.js_
```js
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
```

## Server side

> Note: You might want to try returning a static JSON object first, just to make sure your client is hitting the right endpoint on your server.

```js
// Update an existing note
app.put('/notes/:id', function(req, res) {
  Note.findOne({ _id: req.params.id }).then(function(note) {
    note.title = req.body.note.title;
    note.body_html = req.body.note.body_html;
    note.save().then(function() {
      res.json({
        message: 'Your changes have been saved.',
        note: note
      });
    });
  });
});
```

Allow PUT requests in middleware

```js
// Allow CORS, more headers, and more HTTP verbs
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});
```

## Set timestamp

```js
NoteSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});
```

# Sanitize body_html and set body_text

```shell
$ npm install sanitize-html html-to-text --save
```

_note-schema.js_
```js
var sanitizeHtml = require('sanitize-html');
var htmlToText = require('html-to-text');

// ...

NoteSchema.pre('save', function(next) {
  this.body_html = sanitizeHtml(this.body_html);
  this.body_text = htmlToText.fromString(this.body_html);
  this.updated_at = Date.now();
  next();
});
```

## Update form with values altered on the server side.
_notes.js_
```js
NotesService.update($scope.note).then(function(response) {
  $scope.note = angular.copy(response.data.note);
});
```

# Implement delete

First, let's make sure we can get the form talking to the controller, the controller talking to the services, and the service talking to the server.

_notes-form.html_
```html
<div class="form-actions">
  <input type="submit" name="commit" value="Save" class="btn btn-default">
  <button type="button" class="btn btn-danger" ng-click="delete()">Delete</button>
</div>
```

_notes.js_
```js
$scope.delete = function() {
  NotesService.delete($scope.note);
};
```

_notes-service.js_
```js
self.delete = function(note) {
  var noteDeletePromise = $http.delete('http://localhost:3000/notes/' + note._id);
  noteDeletePromise.then(function(response) {
    alert(response.data.message);
  });
  return noteDeletePromise;
};
```

_server/app.js_
```js
app.delete('/notes/:id', function(req, res) {
  res.json({
    message: 'BALEETED'
  });
});
```

Now let's make it actually work.

_server/app.js_
```js
app.delete('/notes/:id', function(req, res) {
  Note.findOne({ _id: req.params.id }).then(function(note) {
    note.remove().then(function() {
      res.json({
        message: 'That note has been deleted.',
        note: note
      });
    });
  });
});
```

_notes-service.js_
```js
self.delete = function(note) {
  var noteDeletePromise = $http.delete('http://localhost:3000/notes/' + note._id);
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
```

_notes.js_
```js
$scope.delete = function() {
  NotesService.delete($scope.note).then(function() {
    $state.go('notes.form', { noteId: undefined });
  });
};
```

# Add Font-Awesome and use a trash icon for delete.

It would be nice if we had a nice little icon to complement the text on our "New Note" button.

Let's add another dependency to our project: [Font-Awesome](http://fortawesome.github.io/Font-Awesome/), a popular icon webfont.

First, let's see if bower can find it:
```shell
$ bower info font-awesome
```

Looks like we are in business. Let's install it! Add it to `bower.json`

_bower.json_

```javascript
    "font-awesome": "4.4.x"
```

Again, don't forget to add a comma to the line above.

Now run:

```shell
npm install
```

Then, you should be able to add this to `index.html`:

_app/index.html_

```html
  <link rel="stylesheet" href="bower_components/font-awesome/css/font-awesome.min.css">
```

Add the trash icon.

_notes-form.html_
```html
<a ng-click="delete()" ng-show="note._id" class="btn">
  <i class="fa fa-trash-o"></i>
</a>
```

# Only show the delete button on existing notes.

```html
<a ng-click="delete()" ng-show="note._id" class="btn">
```

# Store `API_BASE` in a constant.

_client/app.js_
```js
app.constant('API_BASE', 'http://localhost:3001/');
```

## Dependency-inject it into the service

```js
NotesService.$inject = ['$http', 'API_BASE'];
function NotesService($http, API_BASE) {
```

## and use it!

```js
self.fetch = function(callback) {
  return $http.get(API_BASE + 'notes')

// ...

self.create = function(note) {
  return $http.post(API_BASE + 'notes', {

// ...

self.update = function(note) {
  return $http.put(API_BASE + 'notes/' + note._id, {
```

# [Use textAngular for rich-text editing](https://github.com/getfretless/notely-summer2015/wiki/13-Rich-text-editing)

A simple `<textarea>` is a little limiting for the kind of semi-rich notes we want to create.

Let's add a JavaScript richtext editor!

After a little Googling, we found textAngular, which looks nice and works with Angular. Rich text editors usually replace the contents of a textarea with a new element with certain behaviors, so it's important to check for Angular compatibility. We tried using `wysihtml5-bootstrap`, but the AngularJS binding didn't work and instead showed up as the literal text string `{{ note.body_html }}`. We could update wysihtml5-bootstrap to be compatible, but using textAngular give us an opportunity to look at custom html elements with Angular.

_bower.json_

```javascript
    "font-awesome": "4.4.x",
    "textAngular": "1.4.x"
```

We specified version `1.4.x` since that's the latest according to the [README on GitHub](https://github.com/fraywing/textAngular) as of this writing. Run `npm install` and you should see something like this:

```shell
textAngular#1.4.3 app/bower_components/textAngular
├── angular#1.4.3
├── font-awesome#4.4.0
└── rangy#1.3.0
```

That means it installed version `1.4.3` into `app/bower_components/textAngular`.

This also installed some dependencies to [textAngular](https://github.com/fraywing/textAngular), amd we need to find their paths under `app/bower_components` and include them in our HTML document.

To find out what exactly we need to specify, and in what order, let's [look at the documentation here on GitHub](https://github.com/fraywing/textAngular).

We'll need to remove the leading slash from the examples, since we are using a relative path to `bower_components`. So this should work:

_index.html_
```html
...
  <!-- just after font-awesome in the <head> -->
  <link rel="stylesheet" href="bower_components/textAngular/src/textAngular.css">

  <!-- just before closing </body> tag -->
  <script src="bower_components/textAngular/dist/textAngular-rangy.min.js"></script>
  <script src="bower_components/textAngular/dist/textAngular-sanitize.min.js"></script>
  <script src="bower_components/textAngular/dist/textAngular.min.js"></script>
```

We also need to replace the `<textarea>` tag with the special `<text-angular>` tag as also shown on the README.

_notes-form.html_
```html
<text-angular name="body_html" ng-model="note.body_html" placeholder="Just start typing..."></text-angular>
```

We also need to inject the dependency to `textAngular` to our module. This mixes in the behavior to transform the non-standard HTML `<text-angular>` tag. AngularJS will replace this with a `<textarea>` that works the way the textAngular javascript library sets it up, with the two-way data binding we know and love.

_notes.js_
```javascript
angular.module('notely.notes', [
  'ui.router',
  'textAngular'
])
```

If we reload the page, hopefully we'll see a nice row of buttons to make things bold or underlined or change font sizes, etc. If you click notes in the sidebar, you'll see that our bindings remain intact.

Let's customize the toolbar, since we don't want or need all those things. If you check out [textAngular's wiki](https://github.com/fraywing/textAngular/wiki/Customising-The-Toolbar), you'll see that the buttons are customizable. So let's strip that toolbar down to just the essentials.

_notes-form.html_
```html
    <text-angular
      name="body_html"
      ng-model="note.body_html"
      ta-toolbar="[
        ['bold', 'italics', 'underline'],
        ['ul', 'ol', 'indent', 'outdent'],
        ['html'],
        ['insertLink']]"
      placeholder="Just start typing..."></text-angular>
```

# END OF WEDNESDAY
