var browserSync  = require('browser-sync'),
    reload       = browserSync.reload,
    gulp         = require('gulp'),
    kit          = require('gulp-kit'),
    sass         = require('gulp-sass'),
    uglify       = require('gulp-uglify'),
    include      = require('gulp-include'),
    sourcemaps   = require('gulp-sourcemaps'),
    notify       = require("gulp-notify"),

    postcss      = require('gulp-postcss'),
    reporter     = require('postcss-reporter'),
    hexrgba      = require('postcss-hexrgba'),
    scss         = require('postcss-scss'),
    autoprefixer = require('autoprefixer'),
    cssnano      = require('cssnano')


gulp.task('kit', function() {
    gulp.src('src/kit/*.kit')
        .pipe(kit())
        .pipe(gulp.dest('dist/'))
        .pipe(notify("kit compiled"))
        .pipe(reload({stream:true}));
});

gulp.task('scss', function() {
    gulp.src('src/scss/*.scss')
        .pipe( sourcemaps.init())
        .pipe( postcss([ 
            // stylelint(),
            hexrgba(),
            reporter({clearMessages: true, throwError: true })], 
            { parser: scss })
        )
        .pipe(sass({errLogToConsole: true}))
        .pipe( postcss([
            autoprefixer({ browsers: ['last 2 versions'] }) ,
            cssnano({autoprefixer: false}),
            reporter({clearMessages: true, throwError: true })
        ]) )
        .pipe( sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css/'))
        .pipe(notify("scss compiled"))
        .pipe(reload({stream:true}));
});

gulp.task('js', function() {
    gulp.src('src/js/main.js')
        .pipe(include())
        .on('error', console.log)
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(notify("js compiled"))
        .pipe(reload({stream:true}));
});

gulp.task('copy', function() {
    gulp.src('src/img/**/*')
        .pipe(gulp.dest('dist/img/'))
        .pipe(reload({stream:true}));

    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
        .pipe(reload({stream:true}));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'dist/'
        }
        // proxy: '',
        // reloadDelay: 2000
    });
});

gulp.task('watch', function() {
    gulp.watch('src/kit/**/*.kit', ['kit']);
    gulp.watch('src/scss/**/*.scss', ['scss']);
    gulp.watch('src/js/**/*', ['js']);
});

gulp.task('server', ['watch', 'browser-sync']);

gulp.task('default',['kit','scss','js','copy']);
