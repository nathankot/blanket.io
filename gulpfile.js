var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    ngmin = require('gulp-ngmin'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    rev = require('gulp-rev-all'),
    clean = require('gulp-clean'),
    Q = require('q'),

    ENV,
    BUILD_PATH;

gulp.task('scripts', function() {
  var proc = gulp.src('web/src/js/app.js')
                .pipe(browserify({
                  insertGlobals: true,
                  transform: ['debowerify'],
                  debug: ENV === 'development'
                }));

  if (ENV !== 'development') {
    proc.pipe(ngmin()).pipe(uglify());
  }

  proc.pipe(gulp.dest(BUILD_PATH + '/js'));
});

gulp.task('styles', function() {
  gulp.src('web/src/styl/*.styl')
      .pipe(stylus({
        paths: ['web/components/'],
        use: ['nib'],
        import: ['nib'],
        set: ['linenos']
      }))
      .pipe(csso(ENV === 'development'))
      .pipe(gulp.dest(BUILD_PATH + '/css'));
});

gulp.task('views', function() {
  gulp.src('web/src/views/**/*.html')
      .pipe(gulp.dest(BUILD_PATH + '/views'));
});

gulp.task('images', function() {
  gulp.src('web/src/images/**/*.(png|jpg|gif|svg)')
      .pipe(imagemin())
      .pipe(gulp.dest(BUILD_PATH + '/images'));
});

gulp.task('setProduction', function() {
  ENV = 'production';
  BUILD_PATH = 'web/dist';
});

gulp.task('setDevelopment', function() {
  ENV = 'development';
  BUILD_PATH = 'web/dev';
});

gulp.task('rev', function() {
  gulp.src(BUILD_PATH + '/**', { base: BUILD_PATH })
      .pipe(rev())
      .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('clean', function() {
  gulp.src([
    BUILD_PATH + '/js/**',
    BUILD_PATH + '/css/**',
    BUILD_PATH + '/views/**',
    BUILD_PATH + '/images/**'
  ], { read: false  }).pipe(clean());
});

gulp.task('all', ['scripts', 'styles', 'views', 'images']);
gulp.task('dev', ['setDevelopment', 'clean', 'scripts', 'styles', 'views', 'images']);
gulp.task('dist', ['setProduction', 'clean', 'scripts', 'styles', 'views', 'images', 'rev']);

gulp.task('default', ['dev'], function() {
  gulp.watch('web/src/js/**/*.js', ['scripts']);
  gulp.watch('web/src/styl/**/*/styl', ['styles']);
  gulp.watch('web/stc/views/**/*.html', ['views']);
  gulp.watch('web/stc/images/**/*.html', ['images']);
});
