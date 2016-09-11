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
import plumber      from 'gulp-plumber';
import sftp         from 'gulp-sftp';
import argv         from 'yargs';
import del          from 'del';
import autoprefixer from 'autoprefixer';


var flag = argv.argv;
var reload = browserSync.reload;

const src = 'src';
const dist = 'dist';

const paths = {
  html: {
    src: src + '/html/*.html',
    dest: dist + '/html/'
  },
  js: {
    src: src + '/js/*.js',
    dest: dist + '/js/'  
  },
  styles: {
    src: src + '/scss/*.html',
    dest: dist + '/css/'
  },
  images: {
    src: src + '/img/**/*',
    dest: dist + '/img/'
  },
  copy: {
    src: src + '/copy/**/*',
    dest: dist + '/'
  }
};


// #########


const clean = () => del([ 'dist' ]);
export { clean };

export function inject() { // dev - nur gut solange für das js weder linter, sourcemaps oder aenliches verwendung finden soll
  return gulp.src([paths.html.src, paths.js.src], {since: gulp.lastRun('inject')})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( include({hardFail: true}))
    .pipe( gulp.dest('dist/'))
    .pipe( notify('injecet passed'))
    .pipe( reload({stream:true}));
}

export function styles() {
  return gulp.src(paths.styles.src, {sourcemaps: true})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    // .pipe( sourcemaps.init()) ? - eigentlich default von gulp4
    .pipe( sass())
    .pipe( postcss([ // plugin install
      autoprefixer({ browsers: ['last 2 versions'] }) // nur in prod?,
      // reporter({clearMessages: true, throwError: true }) - wofür noch mal?
    ]) )
    // .pipe( sourcemaps.write('.')) ?
    .pipe( gulp.dest(paths.styles.dest))
    .pipe( notify('styles passed'))
    .pipe( reload({stream:true}));
}

export function images() {
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( gulp.dest(paths.images.srcOrigin))
    .pipe( imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true, 
      svgoPlugins: [{cleanupIDs: false}]
    }))
    // .pipe( gulp.dest(paths.images.srcDist)) - ?
    .pipe( gulp.dest(paths.images.dest))
    .pipe( notify('images compressed and passed'))
    .pipe( reload({stream:true}));
}
// images.description = 'Compressing Images in src and copy them into dist';

function copy() {
  return gulp.src(paths.copy.src, {since: gulp.lastRun('copy')})
    .pipe( gulp.dest(paths.copy.dest))
    .pipe( notify('other files copyed'))
    .pipe( reload({stream:true}));
}

export function minify() {
  return gulp.src( dist + '/**/*') // dev
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( gulpIf('*.js', uglify()))
    .pipe( gulpIf('*.css', cleanCSS()))
    .pipe( gulpIf('*.html', htmlmin({collapseWhitespace: true})))
    // .pipe( rename({suffix: '.min'})) - gulp4 eigen?
    .pipe( gulp.dest( dist + '/'));
}

const server = () => browserSync({ server: { baseDir: dist +'/' } }); // entfertne Syncs?

function deploy() { // dev
  return gulp.src( dist +'/**/*')
    .pipe(sftp({
      host: 'website.com',
      auth: 'keyMain'
    }));
}

// const done = () => notify( 'all tasks are done' );
// export { done };

// export function ok() { // workaround - bug in gulp4
//   return gulp.src('dist/index.html')
//     .pipe( notify([ 'all tasks are done' ]));
// }

// gulp.task('ok', gulp.series(function(done) {    
//     // task code here
//     done();
// }));


// tasks
//
// default (auto --prod)
// watch (auto --dev)

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



const dev = gulp.parallel(inject, styles, images, copy);
// const test = gulp.series(gulp.parallel(inject, styles, images, copy));
const prod = gulp.series(clean, gulp.parallel(inject, styles, images, copy), minify);

const watch = gulp.series(gulpIf(flag.dev, gulp.watch(dev)), gulpIf(flag.prod, gulp.watch(prod)))
const run = gulp.series(clean, gulp.parallel(inject, styles, images, copy), minify);

export watch;
export default run;