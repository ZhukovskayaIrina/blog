const syntax = 'sass'; // Syntax: sass or scss;
    gulpVersion = '4'; // Gulp version: 3 or 4
let gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

const gulp = require('gulp');
// const gutil = require('gulp-util');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const rsync = require('gulp-rsync');
// const del = require('del');

// Local Server
gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: '_site'
    },
    notify: false,
    open: false,
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  })
});

// Sass|Scss Styles
gulp.task('styles', function () {
  return gulp.src(syntax + '/**/*.' + syntax + '')
      .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
      .pipe(rename({suffix: '.min', prefix: ''}))
      .pipe(autoprefixer(['last 15 versions']))
      .pipe(cleanCss({level: {1: {specialComments: 0}}})) // Opt., comment out when debugging
      .pipe(gulp.dest('css'))
      .pipe(gulp.dest('_site/css'))
      .pipe(browserSync.reload({stream: true}));
});

// JS
gulp.task('scripts', function () {
  return gulp.src([
    'libs/jquery/dist/jquery.min.js',
    'libs/likely/likely.js',
    'libs/prognroll/prognroll.js',
    'js/common.js', // Always at the end
  ])
      .pipe(concat('scripts.min.js'))
      .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest('js'))
      .pipe(gulp.dest('_site/js'))
      .pipe(browserSync.reload({stream: true}))
});

// HTML Live Reload
gulp.task('code', function () {
  return gulp.src('_site/*.html')
      .pipe(browserSync.reload({stream: true}));
});

// Deploy
gulp.task('rsync', function () {
  return gulp.src('_site/**')
      .pipe(rsync({
        root: '_site/',
        hostname: 'username@yousite.com',
        destination: 'yousite/public_html/',
        include: ['*.htaccess'], // Includes files to deploy
        exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
        recursive: true,
        archive: true,
        silent: false,
        compress: true
      }))
});

// If Gulp Version 4
if (gulpVersion >= 4) {

  // Img Processing Task for Gulp 4
  // gulp.task('img', gulp.parallel('img1x', 'img2x'));

  gulp.task('watch', function () {
    gulp.watch(syntax + '/**/*.' + syntax + '', gulp.parallel('styles'));
    gulp.watch(['libs/**/*.js', 'js/common.js'], gulp.parallel('scripts'));
    gulp.watch(['*.html', '_site/**/*.html'], gulp.parallel('code'));
    // gmWatch && gulp.watch('_site/img/_src/**/*', gulp.parallel('img')); // GraphicsMagick watching image sources if allowed.
  });
  // gmWatch ? gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'))
  //     :
       gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));

}
