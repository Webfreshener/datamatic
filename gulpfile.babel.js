'use strict';
/* ==================
 * 
 * base requirements and config imports
 * 
 ==================== */
// gulp
import gulp from 'gulp';
// list of modules to pakcage for brwser consumotion
import browserify_manifest from './browserify.json';
// NPM package values
import config from './package.json';
/* ==================
 * 
 * gulp modules
 * 
 ==================== */
// mocha tests
import mocha from 'gulp-mocha';
// file stitching
import concat from 'gulp-concat';
// babel es6 -> es5
import babel from 'gulp-babel';
// packaging for browsers
import browserify from 'gulp-browserify';
// code validation
import jshint from 'gulp-jshint';
// build cleaning
import clean from 'gulp-clean';
// file templating
import inject from 'gulp-inject-file';
// doc generation
import docs from 'gulp-documentation';
// sourcemap generation
import sourcemaps from 'gulp-sourcemaps';
// file renaming
import rename from 'gulp-rename';
// holds name value for NPM package
let _APP_NAME_ = config.name;
// build paths
const paths = {
  src: 'src',
  dest: 'build'
};
/* ==================
 * 
 * Docs & Code Validation
 * 
 ==================== */
/**
 * generates docs with documenationjs
 */
gulp.task('docs',  () => {
	gulp.src(`./src/**/*.js`)
	.pipe(docs('html'))
	.pipe( gulp.dest('docs') );
});
/**
 * runs jshint
 */
gulp.task('jshint', () => {  
  gulp.src( './lib/*.js' )
	.pipe( jshint() )
	.pipe( jshint.reporter( 'default' ) )
//	.pipe( jshint.reporter( 'fail' ) )
	.pipe( gulp.dest( './lint.txt' ) );
});
/* ==================
 * 
 * Testing
 * 
 ==================== */
/**
 * runs mocha tests
 */
gulp.task('test', () => {
	gulp.src('./test/*.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({reporter: 'spec'}))
});
/* ==================
 * 
 * Code Building
 * 
 ==================== */
/**
 * clean JS files from lib to ensure freshness
 */
gulp.task('clean-js', function () {
	  return gulp.src(['./lib/**/*.js','./lib/**/*.js.map'], {read: false})
	    .pipe(clean());
	});
/**
 * Clean Up 
 */
gulp.task('clean-tests', function () {
//	  return gulp.src(['./test/**/*.js','./test/**/*.*.js'], {read: false})
//	    .pipe(clean());
	});
/**
 * cleans Compiled JS and Tests
 */
gulp.task('clean', ['clean-js', 'clean-tests']);
/**
 * packages npm libs with `browserify` for build injection
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
/**
 * builds js sources for distribution
 * - cleans existing js files located in `paths.dest`
 * - builds js sources located in `paths.src`
 * - uses babel to compile to es5
 */
gulp.task('build', ['clean-js'], () => {
	gulp.src(`src/index.js`)
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

gulp.task('build-tests', ['clean-tests'], () => {
	gulp.src('test/src/*.tmp')
	.pipe(inject({
		pattern: '//--\\s*inject:\\s*<filename>'
	}))
	.pipe(sourcemaps.init())
	  .pipe( babel({
		  presets: ['es2015']
	  }))
	.pipe(rename({extname: ".js"}))
	.pipe(gulp.dest('./test/src'));
});
