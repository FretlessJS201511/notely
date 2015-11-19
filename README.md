# Notely

A simple note-taking app built with [AngularJS](https://angularjs.org/) and a REST API built with [NodeJS](https://nodejs.org)/[ExpressJS](http://expressjs.com/).

Authored and built by Dave Strus and David Jones of [Fretless](http://getfretless.com/) with a little help from the November 2015 cohort of the [Javascript with Angular and Node](https://elevenfifty.com/course/javascript-junior-coding/) course at [Eleven Fifty Academy](https://elevenfifty.com).

[![Code Climate](https://codeclimate.com/github/FretlessJS201511/notely/badges/gpa.svg)](https://codeclimate.com/github/FretlessJS201511/notely)

## Technical Overview

- AngularJS version 1.4.7
- ExpressJS version 4.x
- Database engine: MongoDB (with mongoose)
- Configuration: `.env` (see `.env.example` for sample configuration)
- CSS Framework: Bootstrap 3.x


## Getting Started

```shell
$ git clone https://github.com/FretlessJS201511/notely.git
$ cd notely
$ npm install
$ cp .env.example .env
```

Open up `.env` with your favorite editor, and replace the values from a trusted source and/or your own computer's configuration.

If you do not have a working installation of MongoDB, you can sign up for a free account at [MongoLab](https://mongolab.com/).

You can generate a bcrypt JWT secret with the command `node node_modules/bcryptjs/bin/bcrypt whateveryouwantrandomgibberish`

Once that is done, start the dev server and build process with the command:

```shell
$ npm run dev
```

The server should be running at [http://localhost:3000](http://localhost:3000)

If you do not have a working installation of Node or Git yet, you can find more detailed setup instructions [here for OSX](https://github.com/getfretless/js-installfest-mac/wiki) and [here for Windows](https://github.com/getfretless/js-installfest-windows/wiki)

## Deploy to [Heroku](https://heroku.com)

Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) if you don't already have it.

```shell
$ heroku login
$ heroku create whateverAppNameYouWantButMustBeUnique # or just `heroku create` to have a random app name assigned
$ git push heroku master
```
