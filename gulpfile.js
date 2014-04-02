var gulp = require('gulp'),
    browserify = require('gulp-browserify');

var ENV = require('minimist')(process.argv.slice(2)).env || 'development';

gulp.task('scripts', function() {
  gulp.src('./web/src/js/app.js')
    .pipe(browserify({
      insertGlobals: true,
      transform: ['debowerify'],
      debug: ENV === 'development'
    }))
    .pipe(gulp.dest('./web/dist/js'));
});
