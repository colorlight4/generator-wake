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

var minimist = require('minimist');

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

var argv = minimist(process.argv.slice(2), knownOptions);


// var flag   = argv.argv;
var reload = browserSync.reload;

// var config = require('./config.json');

const src  = 'src';
const dist = 'dist';

const paths = {
  html: {
    src:  src  + '/html/*.html',
    dest: dist + '/html/'
  },
  js: {
    src:  src  + '/js.js',
    dest: dist + '/js/'  
  },
  styles: {
    src:  src  + '/scss/*.scss',
    dest: dist + '/css/'
  },
  images: {
    src:  src  + '/img/**/*',
    orgn: src  + 'img_orgn/',
    dest: dist + '/img/'
  },
  copy: {
    src:  src  + '/copy/**/*',
    dest: dist + '/'
  }
};

// #########


const clean = () => del([ 'dist' ]); // funktionierte bisher nicht
// export { clean };

export function html() { 
  return gulp.src(paths.html.src)
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( include({hardFail: true}))
    .pipe( gulp.dest('dist/'))
    .pipe( notify('html passed'))
    .pipe( reload({stream:true}));
}

export function js() { 
  return gulp.src(paths.js.src)
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( include({hardFail: true}))
    .pipe( gulp.dest('dist/'))
    .pipe( notify('js passed'))
    .pipe( reload({stream:true}));
}

export function styles() {
  return gulp.src(paths.styles.src, {sourcemaps: true}) // schreibweise richtig?
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

export function img() { // optimierte modules für unterschiedliche bild typen (jpg, png, svg, default) und back up auf lokalem system
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( gulp.dest(paths.images.orgn))
    .pipe( imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true, 
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe( gulp.dest(paths.images.src))
    .pipe( gulp.dest(paths.images.dest))
    .pipe( notify('images compressed'))
    .pipe( reload({stream:true}));
}

export function copy() {
  return gulp.src(paths.copy.src)
    .pipe( gulp.dest(paths.copy.dest))
    .pipe( notify('other files copyed'))
    .pipe( reload({stream:true}));
}

export function minify() { //  seperater task nicht nötig
  return gulp.src( dist + '/**/*') // dev
    .pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( gulpIf('*.js', uglify()))
    .pipe( gulpIf('*.css', cleanCSS()))
    .pipe( gulpIf('*.html', htmlmin({collapseWhitespace: true})))
    // .pipe( rename({suffix: '.min'})) - gulp4 eigen?
    .pipe( gulp.dest( dist + '/'));
}

const server = () => browserSync({ server: { baseDir: dist +'/' } }); // entfertne Syncs?

// function upload() { // dev
//   return gulp.src( dist +'/**/*', {since: gulp.lastRun('deploy')})
//     .pipe(sftp({
//       host: 'website.com',
//       auth: 'keyMain'
//     }));
// }

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

//
//

// tasks
//
//    dev    | development mode
//    test   | test mode 
//    prod   | test production mode

// possible flags
//
//  / deploy and server

//    --server | set virtual server - zu integrieren
//    --deploy | auto deploys - zu integrieren

//    --watch  | watches

// const dev    = gulp.parallel(inject, styles, images, copy);
// const test   = gulp.series(gulp.parallel(inject, styles, images, copy));
// const prod   = gulp.series(clean, gulp.parallel(inject, styles, images, copy), minify);
// const watch  = gulp.series(gulpIf(flag.dev, gulp.watch(dev)), gulpIf(flag.prod, gulp.watch(prod)))
// const run    = gulp.series(clean, gulp.parallel(inject, styles, images, copy), minify);

const run  = gulp.parallel(tmpl, js, styles, img, copy); // name

export function dev() {
  
  .pipe();
}

gulp.task('dev', function(done){
  if (flag.watch) {
    
    done();
  } else {
    run;
    done();
  }
});


export function prod() {
  
  .pipe();
}

// const dev   = gulp.series(gulpIf(flag.watch, gulp.watch(run), dev))

// const prod  = gulp.series(clean, run, minify);
// const prod  = gulp.series(gulpIf(flag.watch, gulp.watch(prod), prod))

// export dev;
export default { prod };