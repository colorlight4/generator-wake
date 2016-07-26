import browserSync  from 'browser-sync';
import gulp         from 'gulp';
import sass         from 'gulp-sass';
import notify       from 'gulp-notify';
import gulpIf       from 'gulp-if';
import imagemin     from 'gulp-imagemin';
import htmlmin      from 'gulp-htmlmin';
import cleanCSS     from 'gulp-clean-css';
import uglify       from 'gulp-uglify';
import rename       from 'gulp-rename';
import include      from 'gulp-include';
import sourcemaps   from 'gulp-sourcemaps';
import plumber      from 'gulp-plumber';
import sftp         from 'gulp-sftp';
import argv         from 'yargs';
import del          from 'del';
import autoprefixer from 'autoprefixer';

var flag = argv.argv;
var reload = browserSync.reload;

// possible flags
//
//  / operation options
//    --dev    | development mode
//    --test   | test mode 
//    --prod   | test production mode
//
//  / deploy and server
//    --server | set virtual server
//    --deploy | auto deploys
//    --watch  | watches

const paths = {

  // src base
  // dist base
  html: {
    src: 'src/html/*.html',
    dest: 'dist/html/'
  },
  js: {
    src: 'src/**/main.js',
    dest: 'dist/js/'
  },
  styles: {
    src: 'src/**/main.scss',
    dest: 'dist/css/'
  },
  images: {
    src: 'src/img/**/*',
    // srcOriginal: 'src/img/orginals', ?
    dest: 'dist/img/'
  }
};

const clean = () => del([ 'dist' ]);
export { clean };

export function html() { // dev
  return gulp.src(paths.html.src)
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( include({hardFail: true}))
    .pipe( gulp.dest(paths.html.dest))
    .pipe( notify('html passed'))
    .pipe( reload({stream:true}));
}

export function styles() {
  return gulp.src(paths.styles.src)
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( sass())
    .pipe( gulp.dest(paths.styles.dest))
    .pipe( notify('styles passed'))
    .pipe( reload({stream:true}));
}

// export function js() {
//   return gulp.src(paths.js.src)
//     .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
//     .pipe( include({
//       hardFail: true
//     }))
//     .pipe( gulp.dest(paths.js.dest))
//     .pipe( notify('js passed'))
//     .pipe( reload({stream:true}));
// }

function images() {
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true, 
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe( gulp.dest(paths.images.src))
    .pipe( gulp.dest(paths.images.dest))
    .pipe( notify('images compressed and passed'))
    .pipe( reload({stream:true}));
}
images.description = 'Compressing Images in src and copy them into dist';

function minify() {
  return gulp.src('dist/**/*') // dev
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( doIf('*.js', uglify()))
    .pipe( doIf('*.css', cleanCSS()))
    .pipe( doIf('*.html', htmlmin({collapseWhitespace: true})))
    .pipe( rename({suffix: '.min'}))
    .pipe( gulp.dest('dist/'));
}

const server = () => browserSync({ server: { baseDir: 'dist/' } });

function deploy() { // dev
  return gulp.src('dist/**/*')
    .pipe(sftp({
      host: 'website.com',
      auth: 'keyMain'
    }));
}

// const done = () => notify( 'all tasks are done' );
// export { done };

// export function ok() {
//   notify([ 'all tasks are done' ]);
// }

// const test = gulp.series(styles, server);

// tasks
//
// default (auto --prod)
// watch (auto --dev)

// const production = gulp.series(clean, gulp.parallel(inject, styles, images))

// export default production;