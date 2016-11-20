'use strict';
import path from 'path';
import gulp from 'gulp';
import mocha from 'gulp-mocha';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import jshint from 'gulp-jshint';
import clean from 'gulp-clean';
import inject from 'gulp-inject-file';
import docs from 'gulp-documentation';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import runSequence from 'run-sequence';
import browserify_manifest from './browserify.json';
import config from './package.json';//`${__dirname}${path.seperator()}package.json`;

let _APP_NAME_ = config.name;

const paths = {
  src: 'src',
  dest: 'build'
};

/**
 * clean-js
 */
gulp.task('clean-js', function () {
	  return gulp.src(['./lib/**/*.js','./lib/**/*.js.map'], {read: false})
	    .pipe(clean());
	});
/**
 * 
 */
gulp.task('clean-tests', function () {
	  return gulp.src(['./test/**/*.js','./test/**/*.*.js'], {read: false})
	    .pipe(clean());
	});


/**
 * clean
 */
gulp.task('clean', ['clean-js', 'clean-tests']);

/**
 * jshint
 */
gulp.task('jshint', () => {  
  gulp.src( './lib/*.js' )
	.pipe( jshint()
	.pipe( jshint.reporter( 'default' ) )
//	.pipe( jshint.reporter( 'fail' ) )
	.pipe(gulp.dest( './lint.txt' ));
});

/**
 * browserify
 */
gulp.task('package', () =>{
    gulp.src( browserify_manifest )
    .pipe(browserify({
      insertGlobals : false,
      debug : !gulp.env.production
    }))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./include'));
});


gulp.task('test', () => {
	gulp.src('./test/*.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({reporter: 'spec'}))
});


gulp.task('docs',  () => {
	gulp.src(`./src/**/*.js`)
	.pipe(docs('html'))
	.pipe( gulp.dest('docs') );
});


gulp.task('build-js', ['clean-js'], () => {
	gulp.src(`src/${_APP_NAME_}.js`)
	.pipe(inject({
		pattern: '//--\\s*inject:\\s*<filename>'
	}))
	.pipe(sourcemaps.init())
	  .pipe( babel({
		  presets: ['es2015']
	  }))
	.pipe(concat(`${_APP_NAME_}.js`))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('./lib'));
});

gulp.task('build', ['package'], done=> {
	runSequence( 'build-js', done );
});
