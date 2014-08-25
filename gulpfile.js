var ENV = 'development',
    BUILD_PATH = './web/tmp',
    DIST_PATH = './web/dist',
    gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    ngmin = require('gulp-ngmin'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    rev = require('gulp-rev-all'),
    clean = require('gulp-clean'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence'),
    through = require('through2');

gulp.task('setProduction', function() { ENV = 'production'; });

gulp.task('scripts', function() {
  var proc = gulp.src('web/src/js/app.js')
                .pipe(browserify({
                  transform: ['debowerify'],
                  debug: ENV === 'development'
                }));

  if (ENV !== 'development') {
    proc.pipe(ngmin()).pipe(uglify());
  }

  return proc.pipe(gulp.dest(BUILD_PATH + '/js'));
});

gulp.task('testScripts', function() {
  return gulp.src('web/src/js/spec/bootstrap.js', { base: 'web/src/js' })
        .pipe(browserify({
          transform: ['debowerify'],
          debug: ENV === 'development'
        }))
        .pipe(gulp.dest(BUILD_PATH + '/js'));
});

gulp.task('styles', function() {
  var x = gulp.src('web/src/styl/app.styl')
      .pipe(stylus({
        paths: ['web/components/'],
        use: ['nib', 'axis-css'],
        import: ['nib'],
        set: ['linenos']
      }))
      .pipe(csso(ENV === 'development'))
      .pipe(gulp.dest(BUILD_PATH + '/css'));

  if (ENV === 'development') {
    x = x.pipe(livereload());
  }

  return x;
});

gulp.task('views', function() {
  return gulp.src([
    'web/src/views/**/*.html',
    'web/src/index.html',
    'web/src/robots.txt'
  ], { base: 'web/src' })
  .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('images', function() {
  return gulp.src('web/src/images/**/*.(png|jpg|gif|svg)')
        .pipe(imagemin())
        .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('rev', function(cb) {
  if (ENV === 'production') {
    gulp.src(BUILD_PATH + '/**/*.{html,js,css,svg,png,jpg,gif}')
        .pipe(rev({ ignoredExtensions: ['.html'] }))
        .pipe(gulp.dest(DIST_PATH));
  }

  cb();
});

gulp.task('clean', function() {
  return gulp.src([
    BUILD_PATH + '/js/**',
    BUILD_PATH + '/css/**',
    BUILD_PATH + '/views/**',
    BUILD_PATH + '/images/**'
  ], { read: false  }).pipe(clean());
});

gulp.task('clean-dist', function() {
  return gulp.src([
    DIST_PATH + '/js/**',
    DIST_PATH + '/css/**',
    DIST_PATH + '/views/**',
    DIST_PATH + '/images/**'
  ], { read: false  }).pipe(clean());
});

gulp.task('dev', function(cb) {
  runSequence(
    'clean',
    ['scripts', 'testScripts', 'styles', 'views', 'images'],
    cb
  );
});

gulp.task('dist', function(cb) {
  runSequence(
    'clean',
    'clean-dist',
    'setProduction',
    ['scripts', 'styles', 'views', 'images'],
    'rev',
    cb
  );
});

gulp.task('server', function() {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: { NODE_ENV: 'development' },
    ignore: ['web/**']
  });
});

gulp.task('test', function() {
  process.env.NODE_ENV = 'testing';
  return gulp.src('spec/**/*Spec.js')
      .pipe(mocha({ reporter: 'dot', bail: false }))
      .on('error', function() {});
});

gulp.task('watchtests', function() {
  gulp.watch([
    'spec/**/*.js',
    'lib/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
  ], ['test']);
});

gulp.task('default', ['dev'], function() {
  gulp.watch('web/src/js/**/*.js', ['scripts']);
  gulp.watch('web/src/js/spec/**/*.js', ['testScripts']);
  gulp.watch('web/src/styl/**/*.styl', ['styles']);
  gulp.watch(['web/src/views/**/*.html', 'web/src/index.html'], ['views']);
  gulp.watch('web/stc/images/**/*.html', ['images']);
});
