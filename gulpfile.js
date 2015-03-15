var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');


gulp.task('clean', function(){
  gulp.src('./public/dist', {read:false})
    .pipe(clean());
});


gulp.task('less', function() {
  gulp.src('./public/src/less/styles.less')
    .pipe(less())
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('./public/dist'));
});


gulp.task('js:app', function() {
  gulp.src([
    './public/src/app/app,js',
    './public/src/app/**/*.js'
  ])
    .pipe(ngAnnotate())
    .on('error', function(err){ console.log(err.message); })
    .pipe(concat('app.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('./public/dist'));
});



gulp.task('partials:html', function() {
  gulp.src('./public/src/app/**/*.partial.html')
    .pipe(templateCache({module: 'app'}))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('./public/dist'));
});


gulp.task('partials:jade', function() {
  gulp.src('./public/src/app/**/*.partial.jade')
    .pipe(jade())
    .on('error', function(err){ console.log(err.message); })
    .pipe(templateCache({module: 'app'}))
    .on('error', function(err){ console.log(err.message); })
    .pipe(concat('partials.js'))
    .pipe(gulp.dest('./public/dist'));
});


gulp.task('js:vendor', function() {
  gulp.src([
    './public/src/vendor/jquery/*.js',
    './public/src/vendor/angular/angular.js',
    './public/src/vendor/**/*.js'
  ])  
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/dist'));
});


gulp.task('watch', function() {
  
  var cssWatcher = gulp.watch('./public/src/**/*.less', ['less']);
  var jsWatcher = gulp.watch('./public/src/app/**/*.js', ['js:app']);
  var vendorWatcher = gulp.watch('./public/src/vendor/**/*.js', ['js:vendor']);
  var jadeWatcher = gulp.watch('./public/src/app/**/*.jade', ['partials:jade']);

  function changeNotification(event) {
    console.log('File', event.path, 'was', event.type, ', running tasks...');
  }

  cssWatcher.on('change', changeNotification);
  jsWatcher.on('change', changeNotification);
  vendorWatcher.on('change', changeNotification);
  jadeWatcher.on('change', changeNotification);

});


gulp.task('default', ['clean', 'less', 'js:app', 'js:vendor', 'partials:jade', 'watch']);
