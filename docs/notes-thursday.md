# Thursday

# Change button text between create and update

_notes-form.html_
```html
<input type="submit" name="commit" value="{{ form.buttonText() }}" class="btn btn-default">
```

_notes.js_
```js
buttonText() {
  if ($scope.note._id) {
    return 'Save Changes';
  }
  return 'Save';
}
```

# Separating server/app.js into multiple files

Create `routes` folder under `server`

_server/routes/notes.js_
```js
var router = require('express').Router();
var Note = require('../models/note');

// List all notes
router.get('/', function(req, res) {

// ...

// Create a new note
router.post('/', function(req, res) {

// ...

// Update an existing note
router.put('/:id', function(req, res) {

// ...

router.delete('/:id', function(req, res) {

// ...

module.exports = router;
```

Require it back in _server/app.js_.
```js
// Routes
app.use('/notes', require('./routes/notes'));
```

> We no longer need to require the note model in _app.js_.

## Extract middleware into separate file.

_server/app.js_
```js
// Middlewares
app.use(require('./middlewares/headers'));
```

_server/middlewares/headers.js_
```js
// Allow CORS, more headers, and more HTTP verbs
module.exports = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
};
```

# Authentication


## Install bcrypt

```shell
$ npm install bcryptjs --save
```









# Turn Notes layout into a component/directive.
# Turn Sidebar into a component/directive.

# Write focusOn directive.



# Deploy to Heroku

# README
* dotenv


# Do something with flash messages.

_notes.html_
```html
<main>
  <flash-messages></flash-messages>
  <div ui-view></div>
</main>
```

Create a directives folder under _client/app_.
