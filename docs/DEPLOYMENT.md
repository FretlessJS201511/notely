# Deployment

Because we separated our code into `client` and `server` directories, we could easily deploy the server-side API one place, and the client-side code anywhere that can serve static assets, but for simplicity, we could also deploy them together.

To do this, let's rearrange the app a little bit, and move `server/package.json`, `server/node_modules`, `.env`, and `.env.example` to the top-level directory:

```shell
$ mv server/package.json .
$ mv server/node_modules/ .
$ mv server/.env .
$ mv server/.env.example .
```

Then edit `package.json`'s `script` section to look like this:

_package.json_
```json
"postinstall": "node_modules/.bin/bower install",
"start": "node server/app.js",
"dev": "node_modules/.bin/supervisor server/app.js",
```

And add `bower` to our server's depedencies:
```shell
$ npm install bower --save
```

Then add a `.bowerrc` file that tells bower to use our existing client configuration:

_.bowerrc_
```json
{
  "cwd": "client",
  "directory": "app/bower_components"
}
```

To allow ExpressJS to serve static content, we need to tell it where to serve from, so add this to `server/app.js` before the middlewares:

_server/app.js_
```js
// Serve assets in /public
var path = require('path');
app.use(express.static(path.join(__dirname, '../client/app')));
```

The `path` is a `nodejs` built-in, so we don't need to add it to `package.json` or `npm install` it, and `__dirname` is a special node variable that expands to the full server path of the current directory.

Now if you start your server from the top-level `notely` directory with `npm start` (or dev server with `npm run dev`), you'll be able to load the app at `http://localhost:3000`, but API interactions (like loading notes) won't work until we change the `API_BASE` constant in `client/app.js`, and re-bundle our client-side code.

_client/app.js_
```js
  // app.constant('API_BASE', 'http://localhost:3000/api/v1/');
  app.constant('API_BASE', '/api/v1/');
```

```shell
$ cd client
$ npm start (or ./node_modules/.bin/gulp bundle)
```

You should now be able to access the whole app (not just the backend API) at [http://localhost:3000](http://localhost:3000)!

## Heroku

A good place to quickly put a NodeJS (or Ruby) app online for free is [Heroku.com](https://heroku.com).

Sign up for an account on [Heroku.com](https://heroku.com) and install the [Heroku Toolbelt](https://toolbelt.heroku.com/) so you can create new subdomains and push your apps to Heroku's Platform-as-a-service though `git`.

Once it's installed, log in and create a new app from the `notely` directory.
```shell
$ heroku login # and answer questions
$ heroku create <whateverAppNameYouWantButMustBeUnique> # or just `heroku create` to have a random app name assigned
```

This will create an app at `whateverappnameyouwantbutmustbeuniqe.herokuapp.com` and add a new `git` "remote" named "heroku".

After this, you can deploy by pushing to that git remote like this:

```shell
$ git push heroku master
```

However, the app will probably not work until we make a few very small changes.

Heroku will randomly assign a port for your app to run on, so get the port to run on from the `PORT` environment variable, if it is available, or use `3000` if it isn't.

_server/app.js_
```js
var port = (process.env.PORT || 3000);
app.listen(port, function() {
  console.log('Listening on http://localhost:'+port);
});
```

We'll also need to set environment variables in place of our `.env` configuration (which isn't pushed to Heroku).
Open up your `.env` file for reference and run these commands (you can also do this in the Heroku web interface if you prefer).

```shell
$ heroku config:add DB_URI=mongodb://[user]:[password]@[host]:[port]/[db]
$ heroku config:add JWT_SECRET='$2ablahblahblahblahblahblahblahblahblahblahblah'
```

(Note that I used quotes around the secret because it has a dollar sign in it, and omitted the escaping backslash, which is a `dotenv` thing to say that it isn't a variable.)

After committing your changes and pushing to Heroku again with:

```shell
$ git push heroku master
```

Hopefully, you'll have a fully deployed and functional web-hosted app to keep notes with!

If you have trouble with it, you can try to debug with one of these commands:
```shell
$ heroku logs
$ heroku config
$ heroku run bash
```
