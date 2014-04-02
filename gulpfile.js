var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    ngmin = require('gulp-ngmin'),
    uglify = require('gulp-uglify');

var ENV = require('minimist')(process.argv.slice(2)).env || 'development';

gulp.task('scripts', function() {
  var proc = gulp.src('./web/src/js/app.js')
    .pipe(browserify({
      insertGlobals: true,
      transform: ['debowerify'],
      debug: ENV === 'development'
    }));

  if (ENV !== 'development') {
    proc.pipe(ngmin())
        .pipe(uglify());
  }

  proc.pipe(gulp.dest('./web/dist/js'));
});
