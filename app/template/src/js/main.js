function inject() {
  return gulp.src([ paths.html.src, paths.js.src ])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe( include({
      hardFail: true
    }))
    .pipe( gulp.dest('dist/'))
    .pipe( notify('inject passed'))
    .pipe( reload({stream:true}));
}