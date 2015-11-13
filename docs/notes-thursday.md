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

It's not a bad idea to change our mount point to reflect a versioned API actually. Let's do it!

```js
// Routes
app.use('/api/v1/notes', require('./routes/notes'));
```

And thankfully we only need to update one file in the client to reflect this change.

_client/app.js_
```js
app.constant('API_BASE', 'http://localhost:3000/api/v1/');
```

> We no longer need to require the Note model in _app.js_.

## Extract middleware into separate file.

_server/app.js_
```js
// Middleware
app.use(require('./middleware/headers'));
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

Follow the instructions app [Babel Gulp setup](https://babeljs.io/docs/setup/#gulp).

```shell
cd client
npm install gulp gulp-babel gulp-sourcemaps gulp-concat gulp-connect gulp-plumber --save-dev
```

> Babel 6 is not currently playing nice with our build, so let's manually specify Babel 5.3.x in _package.json_.
```json
"gulp-babel": "^5.3",
```

And add this to a new file named `gulpfile.js`:

```js
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');

var javascriptFiles = [
  'app/**/*.js', // All files under app, with a `.js` extension
  '!app/bower_components/**/*', // But excluding files inside `bower_components`
  '!app/content/bundle.js' // and the built bundle.js
];

gulp.task('bundle', function() {
  return gulp.src(javascriptFiles)
    .pipe(plumber()) // Restart gulp on error
    .pipe(sourcemaps.init()) // Let sourcemap watch what we are doing in this pipeline
    .pipe(babel()) // Convert files in pipeline to ES5 so the browser understands it
    .pipe(concat('bundle.js')) // Squish all files together into one file
    .pipe(sourcemaps.write('.')) // Emit sourcemap bundle.js.map for easier debugging
    .pipe(gulp.dest("app/content")); // Save the bundle.js and bundle.js.map in app/content
});

// Watch for changes to anything under `app`
gulp.task('watch', function() {
  gulp.watch('app/**/*', ['bundle']);
});

gulp.task('start-webserver', function() {
  connect.server({ root: 'app' });
});

// Default task when `gulp` runs: bundle, starts web server, then watches for changes
gulp.task('default', ['bundle', 'start-webserver', 'watch']);
```

Now, fingers crossed, we can run `gulp bundle`, and it will compile and emit that bundle file.

```shell
$ node_modules/.bin/gulp
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

We also added something to watch for changes, so gulp will automatically update `bundle.js`.

We don't want to commit the bundle to our git repository (unless you do), so I'd like to add them to the `.gitignore`

_.gitignore_
```
# other stuff
client/app/content/bundle.*
```

## Web server

It'd be nice if this also ran automatically when we start the app. We can either add the `npm start` stuff to a `gulp` task (if you really love Gulp), but I would prefer to have `npm start` also start `gulp`, but since `gulp` is going to run and keep running, and `http-server` is also doing the same thing, it makes sense (to me anyway), to let `gulp` handle the web serving, too.

If `gulp` now does all the things...We can make `npm start` run `gulp` instead of the `http-server` stuff.

_client/package.json_
```json
  "start": "node_modules/.bin/gulp",
```

Now, `npm start` is still our main entry point to kick off everything else, and you have a good base to add other tasks or processes or transformogrifiers in the future.

Yay!!

And let's commit, since we have something working.


# Users

## Sign Up Page

> Note that we're wrapping this code in an object to avoid adding things to the global scope.

_client/app/users/users.js_
```js
{
  angular.module('notely')
  .config(usersConfig);

  usersConfig.$inject = ['$stateProvider'];
  let usersConfig = function($stateProvider) {
    $stateProvider
      .state('sign-up', {
        url: '/sign-up',
        template: '<sign-up></sign-up>'
      });
  }
}
```

What's up with that funky `<sign-up>` business? It's a directive, but it's not one that Angular gives us. We're going to write it ourselves!

# Custom Directives

Let's create our first custom directive.

From the official documentation:

> At a high level, directives are markers on a DOM element (such as an attribute, element name, comment or CSS class) that tell AngularJS's HTML compiler ($compile) to attach a specified behavior to that DOM element (e.g. via event listeners), or even to transform the DOM element and its children.

Our first custom directive is going to start out doing nothing more than replacing a DOM element with the contents of a template string that we specify.

_client/app/components/sign-up.js_
```js
angular.module('notely')
.directive('signUp', function() {
  return {
    templateUrl: '/components/sign-up.html'
  };
});
```

_client/app/components/sign-up.html_
```html
<div class="container">
  <div class="row">
    <div class="col-xs-6 col-xs-offset-4">
      <h3>Sign up for Notely</h3>
      <form id="new_user">
        <p>
          <label for="name">Full Name</label><br>
          <input type="text" name="name" autofocus="autofocus" required>
        </p>
        <p>
          <label for="username">Username</label><br>
          <input type="text" name="username" required>
        </p>
        <p>
          <label for="password">Password</label><br>
          <input type="password" name="password" required>
        </p>
        <input type="submit" name="commit" value="Sign Up" class="btn btn-default">
        <span class="login">
          Already have an account?
          <a href="#">Log in.</a>
        </span>
      </form>
    </div>
  </div>
</div>
```

Navigate to _/sign-up_ and check it out!

To do anything with the contents of the form, we need to hook it up to something in our code. Since we're designing this as a component, we go about things a little differently.

_client/app/components/sign-up.js_
```js
angular.module('notely')
.directive('signUp', function() {
  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
});
```

Let's break this down.

```js
scope: {}
```

This isolates the scope of our component. It helps make our component self-contained and allows us to use this directive more than once in a given scope.

```js
controllerAs: 'ctrl'
```

`controllerAs` specifies how our controller will be exposed to the template. So we can add properties to the controller itself and access them in the template as properties of `ctrl`, rather than having to inject `$scope` and add properties to it.

We can use it together with `bindToController`, introduced in Angular 1.3, and it basically makes the scope of our component as isolated as possible. This becomes important when we have several on the same page.

> [Read more](http://blog.thoughtram.io/angularjs/2015/01/02/exploring-angular-1.3-bindToController.html)

Hey, let's take advantage of some new ES6 syntax!

## The fat arrow: `=>`

We pass a lot of anonymous functions around in JavaScript...

```js
.directive('signUp', () => {
});
```

> Mention special binding of `this`.

Now we need to write `SignUpController`. We can define it inside our anonymous function, and keep things local. Now is also a good time to introduce ES6 class syntax.

> Mention that it calls it with `new` if the controller is a class.

```js
angular.module('notely')
.directive('signUp', () => {

  class SignUpController {
    constructor() {
      this.user = {};
    }
    submit() {
      console.log(this.user);
    }
  }

  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
});
```

Now we can bind to `ctrl.user` and `ctrl.submit` in the template.

```html
<div class="container">
  <div class="row">
    <div class="col-xs-6 col-xs-offset-4">
      <h3>Sign up for Notely</h3>
      <form id="new_user" ng-submit="ctrl.submit()">
        <p>
          <label for="name">Full Name</label><br>
          <input type="text" name="name" autofocus="autofocus" ng-model="ctrl.user.name" required>
        </p>
        <p>
          <label for="username">Username</label><br>
          <input type="text" name="username" ng-model="ctrl.user.username" required>
        </p>
        <p>
          <label for="password">Password</label><br>
          <input type="password" name="password" ng-model="ctrl.user.password" required>
        </p>
        <input type="submit" name="commit" value="Sign Up" class="btn btn-default">
        <span class="login">
          Already have an account?
          <a href="#">Log in.</a>
        </span>
      </form>
    </div>
  </div>
</div>
```

Now let's hook this rascal up to a service.

# UsersService

_client/app/services/users-service.js_
```js
angular.module('notely')
  .service('UsersService', ['$http', 'API_BASE', ($http, API_BASE) => {

    class UsersService {
      create(user) {
        let userPromise = $http.post(`${API_BASE}users`, {
          user: user
        });
        userPromise.then((response) => {
          console.log(response.data.user);
        });
        return userPromise;
      }
    }
    return new UsersService();

  }]);
```

Let's inject it into our component's controller, and pass along our user object to the service.

_client/app/components/sign-up.js_
```js
angular.module('notely')
.directive('signUp', ['UsersService', (UsersService) => {

  class SignUpController {
    constructor() {
      this.user = {};
    }
    submit() {
      UsersService.create(this.user);
    }
  }

  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
}]);
```

Now back to the backend!

Following the pattern of notes, let's add a routes file with a single route for posting to _/users_. We'll respond with a simple JSON object for the moment.

_server/routes/users.js_
```js
var router = require('express').Router();

router.post('/', function(req, res) {
  res.json({
    message: 'Thanks for signing up!',
    user: { username: 'hardcoded' }
  });
});

module.exports = router;
```

_server/app.js_
```js
app.use('/users', require('./routes/users'));
```

Try it out!

## Saving the user to the database.

Add a schema and a model.

_server/models/user-schema.js_
```js
var db = require('../config/db');

var UserSchema = db.Schema({
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  // password_digest: { type: String, required: true },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = UserSchema;
```

_server/models/user.js_
```js
var db = require('../config/db');
var UserSchema = require('./user-schema');
var User = db.model('User', UserSchema);

module.exports = User;
```

Now require the model in the route, and make it work!

_server/routes/users.js_
```js
var router = require('express').Router();
var User = require('../models/user');

router.post('/', function(req, res) {
  var user = new User({
    username: req.body.user.username,
    name: req.body.user.name
  });

  user.save().then(function(userData) {
    res.json({
      message: 'Thanks for signing up!',
      user: userData
    });
  },
  function(err) {
    console.log(err);
  });
});

module.exports = router;
```

# Add an encrypted password digest.

## Add it to the schema.

Uncomment the line defining the `password_digest` field.

_server/models/user-schema.js_
```js
  password_digest: { type: String, required: true },
```

## Install bcryptjs in the server.

Time-based one-way hashing blah blah blah.

```shell
$ npm install bcryptjs --save
```

Require bcryptjs in the routes file...

_server/routes/users.js_
```js
var bcrypt = require('bcryptjs');
```

and encrypt the submitted password.

_server/routes/users.js_
```js
var user = new User({
  username: req.body.user.username,
  name: req.body.user.name,
  password_digest: bcrypt.hashSync(req.body.user.password)
});
```

Let's not return the encrypted password in our JSON. We can strip it out before sending the response from the server.

While we're at it, let's get rid of the `__v` property, which is just something that Mongo uses internally. It's of no use to us.

_server/models/user-schema.js_
```js
// Override toJSON to exclude fields from Express res.json()
UserSchema.methods.toJSON = function() {
  var object = this.toObject();
  delete object.password_digest;
  delete object.__v;
  return object;
}
```



# JSON Web Token (JWT) authentication

From [https://self-issued.info/docs/draft-ietf-oauth-json-web-token.html](https://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted.

Install the `jsonwebtoken` package.

```shell
npm install jsonwebtoken --save
```

Generate a random secret key to sign your server's tokens.

From your server directory:

```shell
$ node node_modules/bcryptjs/bin/bcrypt [some random garbage]
```

Copy and paste the output to an environment variable in _.env_ and update your _.env.example_ while you're at it.

```
JWT_SECRET=\[generate secret key with bcrypt] # keep the leading '\' character to escape the string

```

Require JWT in the users routes file.

_server/routes/users.js_
```js
var jwt = require('jsonwebtoken');
```

Now let's send a token back in our response after we log the user in. We'll set the token to expire in 24 hours.

_server/routes/users.js_
```js
user.save().then(function(userData) {
  var token = jwt.sign(userData._id, process.env.JWT_SECRET, { expiresIn: 24*60*60 });
  res.json({
    message: 'Thanks for signing up!',
    user: userData,
    auth_token: token
  });
},
```

Back to the client!

## AuthToken service

Let's make that auth token persist on the client.

_client/app/services/auth-token.js_
```js
angular.module('notely')
  .service('AuthToken', ['$window', ($window) => {

    class AuthToken {
      constructor() {
        this.authToken = $window.localStorage.getItem('authToken');
      }
      set(token) {
        this.authToken = token;
        $window.localStorage.setItem('authToken', this.authToken);
      }
      get() {
        return this.authToken;
      }
      clear() {
        this.authToken = undefined;
        $window.localStorage.removeItem('authToken');
      }
    }
    return new AuthToken();

  }]);
```

Back in `UsersService`, inject `AuthToken` and set it with the token you got back from the server.

```js
.service('UsersService', ['$http', 'API_BASE', 'AuthToken', ($http, API_BASE, AuthToken) => {

// ...

  .then((response) => {
    AuthToken.set(response.data.auth_token);
    console.log(`Gotten: ${AuthToken.get()}`);
  });
```

Let's persist the current user via local storage as well.

_client/app/services/current-user.js_
```js
angular.module('notely')
  .service('CurrentUser', ['$window', ($window) => {

  class CurrentUser {
    constructor() {
      this.currentUser = JSON.parse($window.localStorage.getItem('currentUser'));
    }

    set(user) {
      this.currentUser = user;
      $window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    get() {
      return this.currentUser || {};
    }

    clear() {
      this.currentUser = undefined;
      $window.localStorage.removeItem('currentUser');
    }
  }
  return new CurrentUser();

}]);
```

# Do the interceptor

_client/app/services/auth-interceptor.js_
```js
    angular.module('notely')
      .factory('AuthInterceptor', ['AuthToken', 'API_BASE',
        function(AuthToken, API_BASE) {
          return {
            request: function(config) {
              var token = AuthToken.get();
              if (token && config.url.indexOf(API_BASE) > -1) {
                config.headers['Authorization'] = token;
              }
              return config;
            }
          };
        }]);

    angular.module('notely')
      .config(['$httpProvider', function($httpProvider) {
        return $httpProvider.interceptors.push('AuthInterceptor');
      }]);
```

# Do the server side middleware for the user

_server/middleware/add_user_to_request.js_
```js
var jwt = require('jsonwebtoken');
var User = require('../models/user');

module.exports = function(req, res, next) {
  var authToken = req.headers.authorization;
  var isLoggingInOrRegistering = req.body.user;

  if (authToken && !isLoggingInOrRegistering) {
    // Decode user ID from JWT token, and find user
    jwt.verify(authToken, process.env.JWT_SECRET,
      function(err, decodedId) {
        if (decodedId) {
          User.findOne({ _id: decodedId }).then(function(user) {
            req['user'] = user;
            next();
          });
        }
        else {
          res.sendStatus(401);
        }
     });
  }
  else {
    next();
  }
};
```

Require in in _app.js_.

_server/app.js_
```js
app.use(require('./middleware/add-user-to-request'));
```

# scope notes by user

_server/models/note-schema.js_
```js
user: { type: db.Schema.Types.ObjectId, ref: 'User' },
```
_server/routes/notes.js_
```js
var router = require('express').Router();
var Note = require('../models/note');

// List all notes
router.get('/', function(req, res) {
  Note.find({ user: req.user }).sort({ updated_at: -1 }).then(function(notes) {
    res.json(notes);
  });
});

// Create a new note
router.post('/', function(req, res) {
  var note = new Note({
    title: req.body.note.title,
    body_html: req.body.note.body_html,
    user: req.user
  });

  note.save().then(function(noteData) {
    res.json({
      message: 'Saved!',
      note: noteData
    });
  });
});

// Update an existing note
router.put('/:id', function(req, res) {
  Note.findOne({ _id: req.params.id, user: req.user }).then(function(note) {
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

router.delete('/:id', function(req, res) {
  Note.findOne({ _id: req.params.id, user: req.user }).then(function(note) {
    note.remove().then(function() {
      res.json({
        message: 'That note has been deleted.',
        note: note
      });
    });
  });
});
module.exports = router;

```

# logout

# login

# user signed in promises

# Write focusOn directive.

# Turn Notes layout into a component/directive.
# Turn Sidebar into a component/directive.





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
