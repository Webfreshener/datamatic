'use strict';
/* ==================
 * 
 * base requirements and config imports
 * 
 ==================== */
// gulp
import gulp from 'gulp';
// list of modules to pakcage for brwser consumotion
/* ==================
 * 
 * gulp modules
 * 
 ==================== */
// code validation
import jshint from 'gulp-jshint';
// doc generation
import docs from 'gulp-documentation';
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
