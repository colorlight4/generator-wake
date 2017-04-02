import browserSync  from 'browser-sync';
import gulp         from 'gulp';
import sass         from 'gulp-sass';
import notify       from 'gulp-notify';
import gulpIf       from 'gulp-if';
import imagemin     from 'gulp-imagemin';
import htmlmin      from 'gulp-htmlmin';
import cleanCSS     from 'gulp-clean-css';
import uglify       from 'gulp-uglify';
import include      from 'gulp-include';
import plumber      from 'gulp-plumber';
import sftp         from 'gulp-sftp';
import postcss      from 'gulp-postcss';
import del          from 'del';
import autoprefixer from 'autoprefixer';
import minimist     from 'minimist';

//

var argv    = minimist(process.argv.slice(2));
var prod    = argv.prod || argv.p;

var reload  = browserSync.reload;
var proxy   = 'https://q4u.de';

const src   = 'src';
const dist  = 'dist';
const paths = {
  html: {
    src:  src  + '/html/*.html',
    dest: dist + '/html/'
  },
  js: {
    src:  src  + '/js/*.js',
    dest: dist + '/js/'  
  },
  styles: {
    src:  src  + '/scss/*.scss',
    dest: dist + '/css/'
  },
  images: {
    src:  src  + '/img/**/*',
    cmpr: src  + '/img/',
    orgn: src  + '/imgOriginals/',
    dest: dist + '/img/'
  },
  copy: {
    src:  src  + '/copy/**/*',
    dest: dist + '/'
  },
  upload: {
    local: dist + '/**/*',
    host: 'web33.q4u.de'
  }
};

//

// html
export function html() { 
  return gulp.src(paths.html.src)
    .pipe( plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe( include({hardFail: true}))
    .pipe( gulpIf(prod, htmlmin({collapseWhitespace: true})))
    .pipe( gulp.dest(paths.html.dest))
    .pipe( notify('html passed'))
    .pipe( reload({stream:true}));
}

// styles
export function styles() {
  return gulp.src(paths.styles.src, {sourcemaps: true})
    .pipe( plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe( sass())
    .pipe( postcss([
      autoprefixer({ browsers: ['last 2 versions'] })
    ]) )
    .pipe( gulpIf(prod, cleanCSS()))
    .pipe( gulp.dest(paths.styles.dest))
    .pipe( notify('styles passed'))
    .pipe( reload({stream:true}));
}

// js
export function js() { 
  return gulp.src(paths.js.src)
    .pipe( plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe( include({hardFail: true}))
    .pipe( gulpIf(prod, uglify()))
    .pipe( gulp.dest(paths.js.dest))
    .pipe( notify('js passed'))
    .pipe( reload({stream:true}));
}

// images
function imgCompress() {
  return gulp.src(paths.images.src, {since: gulp.lastRun('img')})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( gulp.dest(paths.images.orgn))
    .pipe( imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true, 
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe( notify('images compressed'))
    .pipe( gulp.dest(paths.images.cmpr))
};

function imgCopy () {
  return gulp.src(paths.images.src)
    .pipe( gulp.dest(paths.images.dest))
    .pipe( notify('images copied'))
    .pipe( reload({stream:true}));  
}

const img = gulp.series(imgCompress, imgCopy);
export { img }

// copy
export function copy() {
  return gulp.src(paths.copy.src)
    .pipe( gulp.dest(paths.copy.dest))
    .pipe( notify('other files copied'))
    .pipe( reload({stream:true}));
}

// clean
const clean = () => del([ 'dist' ]);
export { clean }

// server
const server = () => browserSync.init({ proxy: proxy });
export { server }

// sftp
export function upload() {
  return gulp.src(paths.upload.local, {since: gulp.lastRun('uplaod')})
    .pipe(sftp({
      host: paths.upload.host,
      authFile: '.ftppass'
    }));
}

//

export function watch() {
    gulp.watch(paths.html.src, html);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.js.src, js);
    gulp.watch(paths.images.src, img);
    gulp.watch(paths.copy.src, copy);
}

const run = gulp.series(clean, gulp.parallel(html, js, styles, copy));

export default run;