import gulp     from 'gulp';
import sass     from 'gulp-sass';
import notify   from 'gulp-notify';
import gulpIf   from 'gulp-if';
import argv     from 'yargs';

var flag = argv.argv;

const paths = {
  styles: {
    src: 'src/**/*.scss',
    dest: 'dist/css/'
  }
};

export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .pipe(gulpIf(flag.boo, notify("ok")))
    .pipe(gulp.dest(paths.styles.dest));
}

const test = styles;

export default test;