/**
 * Created by Administrator on 2016/4/13.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin');
gulp.task('jsmin', function () {
    gulp.src("main/js/main.js")
        .pipe(uglify({
           mangle:true,
            compress:true
        }))
        .pipe(gulp.dest('main/js'));
});

gulp.task('testImagemin', function () {
    gulp.src(['src/img/*.{png,jpg,gif,ico}'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});