var gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    postcss      = require('gulp-postcss'),
    stylus       = require('gulp-stylus'),
    cp           = require('child_process'),
    jade         = require('gulp-jade'),
    prettify     = require('gulp-prettify'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    coffee       = require('gulp-coffee'),
    concat       = require('gulp-concat'),
    sourcemaps   = require('gulp-sourcemaps'),
    lost         = require('lost'),
    autoprefixer = require('autoprefixer')
 ;

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['stylus', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/scss/main.scss')
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});


/**
 * Compile files from _stylus into both _site/css (for live injecting) and site (for future jekyll builds)
 */

gulp.task('stylus', function() {
  var processors = [
    lost,
    autoprefixer({browsers: ['last 2 version']})
    // csswring
  ];

  return gulp.src('assets/stylus/main.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(postcss(processors))
    // .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css'));
});

/*
* Doing some fancy Gulp stuff here
*/
gulp.task('jadefiles', function(){
  return gulp.src('_jadefiles/*.jade')
  .pipe(jade())
  .pipe(prettify({indent_size: 2}))
  .pipe(gulp.dest('_includes'));
});

gulp.task('jadelayouts', function(){
  return gulp.src('_jadelayouts/*.jade')
  .pipe(jade())
  .pipe(prettify({indent_size: 2}))
  .pipe(gulp.dest('_layouts'));
});

gulp.task('jade', ['jadefiles', 'jadelayouts']);

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/stylus/**', ['stylus']);
    gulp.watch(['index.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
    gulp.watch(['_jadefiles/*.jade', '_jadelayouts/*jade'], ['jade']);
});

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
