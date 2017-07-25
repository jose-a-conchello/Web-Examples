var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'), // includes scss
    gulpif = require('gulp-if'), // Usage: gulpif(condition, function);
    minimatch = require('minimatch'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util');

var sassSources = [ 'assets/**/*.scss'];
gutil.log('sassSources: ' + sassSources);

var jsDir = 'assets/js/',
    jsSources = [jsDir + 'jquery.min.js',  // order matters
                 jsDir + 'bootstrap.min.js'];

var buildType, // either development or production
    sassStyle, 
    indexHtml, // the original including path from the cwd
    buildDir; 

// Output style file
const styleCss = 'css/style.css';
gutil.log('styleCss: ' + styleCss);
// If BUILD_TYPE is anything other than 'development' assume
//  production build
var buildDir = 'builds/production';
    sassStyle = 'compressed';
// Default can be chaged w/the environment variable BUILD_TYPE
buildType = process.env.BUILD_TYPE || 'development';

//..Change build type if necessary
if (buildType === 'development') {
    buildDir = 'builds/development';
    sassStyle = 'expanded';
    jsSources = [jsDir + 'jquery-uncompressed-3.2.0.js', 
                 jsDir + 'bootstrap.js'];
}
gutil.log('jsSources: ' + jsSources);
indexHtml = buildDir + '/index.html';

const sassDir = 'assets/sass/';
const styleFiles = [
    sassDir + 'style.scss', // must be the first one. Other files use it
    sassDir + 'AlternateFloat.scss'
];
const nStyleFiles = styleFiles.length;

// Convert compass, sass, and scss to css
const prefixerOptions = {
    browsers: ['last 3 versions'],
    cascade: true
}
gulp.task('compass', function () {
  gutil.log('In compass task');
  const compassOptions = {
    sass: 'assets/sass', // find sass & scss file here
    style: sassStyle // output style
  };
  for (f = 0; f < nStyleFiles; ++f) {
    var thisFile = styleFiles[f];
    gulp.src(thisFile)
      .pipe(compass(compassOptions)
        .on('error', gutil.log)
      )
      .pipe(autoprefixer(prefixerOptions))
      .pipe(gulp.dest(buildDir + '/css'));
  }
}); // end 'compass' task

//Tasks that create or modify files
var modifierTasks = ['compass', 'scripts']; // more to come

gulp.task('scripts' , function(){
   gutil.log('in scripts task');
   gulp.src(jsSources)
    .pipe(concat('bootstrap_jscript.js')) // concatenate into this file
    .pipe( gulpif(buildType === 'production', uglify()) ) 
    .pipe(gulp.dest('js'))
}); // end 'scripts' task
gulp.task('watch', function (){
  gutil.log('in watch task'); 
//NB: both args of watch method must be arrays
  gulp.watch(sassSources, ['compass']);
  gulp.watch([indexHtml], ['copy-finals']); 
  gulp.watch(jsSources,   ['scripts']);
  
}); // end 'watch' task
gulp.task('copy-finals', modifierTasks, function(){
  gutil.log('in copy-finals task');
  gulp.src(indexHtml)
    .pipe(concat('index.html'))
    .pipe(gulp.dest('.'));
}); // end 'copy-finals' task

//NB:
//  To concatenate arrays use the concat method
//      origArray.concat(a1, a2, ...); 
//  where origArray, a1, a2, ..., are arrays
//  origArray is not modified. A new array is returned.
//
//  To add a single element to an array, use the 'push' method
//      origArray.push(e1, e2, ...)
//  appends the elements e1, e2, ... to origArray.
//  modifies origArray
//  returns the lenght of the modified array.
var allTasks = modifierTasks.concat(['watch']);
gulp.task('default', allTasks);
