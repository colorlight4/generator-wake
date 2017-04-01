// import [...]

var argv    = minimist(process.argv.slice(2));
var prod    = argv.prod;

var reload  = browserSync.reload;

const src   = 'src';
const dist  = 'dist';
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
    orgn: src  + '/img_orgn/',
    dest: dist + '/img/'
  },
  copy: {
    src:  src  + '/copy/**/*',
    dest: dist + '/'
  }
};


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

// copy
export function copy() {
  return gulp.src(paths.copy.src)
    .pipe( gulp.dest(paths.copy.dest))
    .pipe( notify('other files copyed'))
    .pipe( reload({stream:true}));
}

// clean
const clean = () => del([ 'dist' ]); // funktionierte bisher nicht

// server
const server = () => browserSync.init({ proxy: "https://q4u.de" });

// sftp

//


gulp.task('default', 'prod');