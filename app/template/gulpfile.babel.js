import gulp     from 'gulp';
import sass     from 'gulp-sass';
import notify   from 'gulp-notify';
import gulpIf   from 'gulp-if';
import argv     from 'yargs';

var flag = argv.argv;

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
  styles: {
    src: 'src/**/*.scss',
    dest: 'dist/css/'
  }
  iamges: {
    src: 'src/img/**/*',
    // srcOriginal: 'src/img/orginals', ?
    dest: 'dist/img/'
  }
};

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .pipe(gulpIf(flag.boo, notify('ok')))
    .pipe(gulp.dest(paths.styles.dest));
}

function images() {
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true, 
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest(paths.images.src));
    .pipe(gulp.dest(paths.images.dest));
    .pipe(notify('images compressed and copied'))
}
images.description = 'Compressing Images in src and copy them into dist';


const test = styles;

// tasks
//
// default (auto --prod)
// watch (auto --dev)


export default styles;