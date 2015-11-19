var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var supervisor = require('gulp-supervisor');

var javascriptFiles = [
  'client/app/**/*.js', // All files under app, with a `.js` extension
  '!client/app/bower_components/**/*', // But excluding files inside `bower_components`
  '!client/app/content/bundle.*' // and the built bundle.js & .js.map
];

gulp.task('bundle', function() {
  return gulp.src(javascriptFiles)
    .pipe(plumber()) // Restart gulp on error
    .pipe(sourcemaps.init()) // Let sourcemap watch what we are doing in this pipeline
    .pipe(babel()) // Convert files in pipeline to ES5 so the browser understands it
    .pipe(concat('bundle.js')) // Squish all files together into one file
    .pipe(sourcemaps.write('.')) // Emit sourcemap bundle.js.map for easier debugging
    .pipe(gulp.dest("client/app/content")); // Save the bundle.js and bundle.js.map in app/content
});

// Watch for changes to anything under `app`
gulp.task('watch', function() {
  gulp.watch('client/app/**/*', ['bundle']);
});

gulp.task('start-webserver', function() {
  supervisor('server/app.js');
});

// Default task when `gulp` runs: bundle, starts web server, then watches for changes
gulp.task('default', ['bundle', 'start-webserver', 'watch']);
