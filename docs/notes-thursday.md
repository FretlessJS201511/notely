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

> We no longer need to require the Note model in _app.js_.

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

# ECMAScript 6!

Let's use ES6!

To use ES6 today, we need to transpile it down to old fashioned ES5. That means introducing build tools to prepare our code for delivery to actual browsers.

# Build Tools

Follow the instructions app [Babel Gulp setup](https://babeljs.io/docs/setup/#gulp).

```shell
cd client
npm install --save-dev gulp gulp-babel gulp-sourcemaps gulp-concat
```

And add this to a new file named `gulpfile.js`:

__client/gulpfile.js__
```js
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var javascriptFiles = [
  'app/**/*.js', // All files under app, with a `.js` extension
  '!app/bower_components/**/*', // But excluding files inside `bower_components`
  '!app/content/bundle.js' // and the built bundle.js
];

gulp.task('bundle', function() {
  return gulp.src(javascriptFiles)
    .pipe(sourcemaps.init()) // Let sourcemap watch what we are doing in this pipeline
    .pipe(babel()) // Convert files in pipeline to ES5 so the browser understands it
    .pipe(concat('bundle.js')) // Squish all files together into one file
    .pipe(sourcemaps.write('.')) // Emit sourcemap bundle.js.map for easier debugging
    .pipe(gulp.dest("app/content")); // Save the bundle.js and bundle.js.map in app/content
});
```

Now, fingers crossed, we can run `gulp bundle`, and it will compile and emit that bundle file.

```shell
$ gulp # (or node_modules/.bin/gulp)
```

Let's open up bundle.js.map and take a look:

__app/content/bundle.js__

You'll see that `gulp` has concat'ed all our javascript files into one.

At this point, we can point to the `bundle.js` file in our `index.html` file:

```html
<!-- <script src="app.js"></script>
<script src="notes/notes.js"></script>
<script src="services/notes-service.js"></script> -->
<script src="content/bundle.js"></script>
```

If we reload the page, it should continue to work just fine, however, if we make any kind of change, we'd have to run `gulp` again, which isn't very much fun to do every time we save. Let's make it so that it re-bundles every time a file we care about changes.

Let's add another task to `watch` for file changes, and another `default` task to run both `bundle` and `watch` with one command.

Add this to the bottom of `gulpfile.js`

_gulpfile.js_
```js
// other stuff...

// Watch for changes to anything under `app`
gulp.task('watch', function() {
  gulp.watch('app/**/*', ['bundle']);
});

// Default task when `gulp` runs: bundle and then watch for changes
gulp.task('default', ['bundle', 'watch']);
```

Now, when we run just `gulp`, it will both bundle and keep watching files. When a file it's watching changes, the `watch` task will kick off another bundle.

We don't want to commit the bundle to our git repository (unless you do), so I'd like to add them to the `.gitignore`

_.gitignore_
```
# other stuff
client/app/content/bundle.*
```

And let's commit, since we have something working.

## Web server

It'd be nice if this also ran automatically when we start the app. We can either add the `npm start` stuff to a `gulp` task (if you really love Gulp), but I would prefer to have `npm start` also start `gulp`, but since `gulp` is going to run and keep running, and `http-server` is also doing the same thing, it makes sense (to me anyway, to let `gulp` handle the web serving, too).

Let's add a new task to handle the web-serving part, too.

```shell
$ cd client
$ npm install --save-dev gulp-connect
```

__gulpfile.js__
```js
// other requires ...
var connect = require('gulp-connect');

// other tasks ...
gulp.task('start-webserver', function() {
  connect.server({ root: 'app' });
});

// change default task ...
// Default task when `gulp` runs: bundle, starts web server, then watches for changes
gulp.task('default', ['bundle', 'start-webserver', 'watch']);
```

If `gulp` now does all the things...We can make `npm start` run `gulp` instead of the `http-server` stuff.

_client/package.json_
```json
  "start": "node_modules/.bin/gulp",
```

Now, `npm start` is still our main entry point to kick off everything else, and you have a good base to add other tasks or processes or transformogrifiers in the future.

Yay!!

We've been talking about minification-safe dependency injection for a while now, let's see if it holds water.

```shell
cd client
npm install --save-dev gulp-uglify
```

_gulpfile.js_
```js
var uglify = require('gulp-uglify');
// other stuff in `bundle`
.pipe(uglify())
```

Now, if you run `npm start`, the resulting `bundle.js` should look like garbage. This reduces the filesize, which makes the app download and run faster on slower internet connections (like cell phones), and if you care about this, it provides some small amount of obfuscation if you don't want people copying your secret sauce to writing awesome applications with Angular.

It also means we can completely omit our javascript source files from the deployed application if we choose to do so, and only serve from `content`.

## ES6/ES2015/ESNext

Hey! Because one of those things in that pipeline is [Babel](https://babeljs.io), we can write futuristic Javascript of tomorrow, and it will get transformed into dumb-old-javascript of today (or, to think of it another way, we can write the JavaScript of today, and it will still run on the browsers of yesterday - which is pretty much all of them à² _à² ).

Let's make a small change and make sure Babel is doing it's job.

(change `var` to `let` or `const` or something simple like that and check the bundle).
(create a class with a constructor and take a look at that)












# Authentication

## Sign Up Page

Create a _components_ folder under _client/app_.





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
