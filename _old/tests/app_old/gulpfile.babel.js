import gulp from 'gulp';
import sass from 'gulp-sass';
// import babel from 'gulp-babel';
// import concat from 'gulp-concat';
// import uglify from 'gulp-uglify';
// import rename from 'gulp-rename';
import notify from 'gulp-notify';
import gulpIf from 'gulp-if';

import flag from 'yargs';

var argv = flag.argv;

if (argv.boo) {
  console.log('yeah');
}

const paths = {
  styles: {
    src: 'test_src/**/*.scss',
    dest: 'assets/styles/'
  }
};

/*
 * For small tasks you can use arrow functions and export
 */
// const clean = () => del([ 'assets' ]);
// export { clean };

/*
 * You can still declare named functions and export them as tasks
 */
export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    // .pipe(cleanCSS())
    // pass in options to the stream
    // .pipe(rename({
    //   basename: 'main',
    //   suffix: '.min'
    // }))
    .pipe(gulpIf(argv.boo, notify("ok")))
    .pipe(gulp.dest(paths.styles.dest));
}

// export function scripts() {
//   return gulp.src(paths.scripts.src, { sourcemaps: true })
//     .pipe(babel())
//     .pipe(uglify())
//     .pipe(concat('main.min.js'))
//     .pipe(gulp.dest(paths.scripts.dest));
// }

// export function watch() {
//   gulp.watch(paths.scripts.src, scripts);
//   gulp.watch(paths.styles.src, styles);
// }

// const build = gulp.series(clean, gulp.parallel(styles, scripts));
// export { build };

const test = styles;

export default test;

// /*
//  * Export a default task
//  */
// export default build;