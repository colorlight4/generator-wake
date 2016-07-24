import gulp from 'gulp';
import argv from 'yargs';

var foo = argv.argv;

if (foo.boo) {
  console.log('yeah');
}

// export function styles() {
//   return gulp.src(paths.styles.src)
//     .pipe(sass())
//     .pipe(gulp.dest(paths.styles.dest));
// }

export default test;