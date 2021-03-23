const gulp = require('gulp');
const path = require('path');
const $ = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
const del = require('del');

const environment = $.util.env.type || 'development';
const isProduction = environment === 'production';
const webpackConfig = require('./webpack.config.js')[environment];

const port = $.util.env.port || 1337;
const src = 'app/web/src/';
const dist = 'app/web/dist/';

gulp.task('scripts', () => {
  return gulp.src(webpackConfig.entry)
    .pipe(webpack(webpackConfig))
    .pipe(isProduction ? $.uglifyjs() : $.util.noop())
    .pipe(gulp.dest(dist + 'js/'))
    .pipe($.size({ title : 'js' }))
    .pipe($.connect.reload());
});

gulp.task('html', () => {
  return gulp.src(src + 'index.html')
    .pipe(gulp.dest(dist))
    .pipe($.size({ title : 'html' }))
    .pipe($.connect.reload());
});

gulp.task('styles', () => {
  return gulp.src(src + 'stylus/main.styl')
    .pipe($.stylus({
      compress: isProduction,
      'include css' : true
    }))
    .pipe($.autoprefixer())
    .pipe(gulp.dest(dist + 'css/'))
    .pipe($.size({ title : 'css' }))
    .pipe($.connect.reload());
});

gulp.task('serve', () => {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35728
    }
  });
});

gulp.task('static', () => {
  return gulp.src(src + 'static/**/*')
    .pipe($.size({ title : 'static' }))
    .pipe(gulp.dest(dist + 'static/'));
});

gulp.task('watch', () => {
  gulp.watch(src + 'stylus/*.styl', ['styles']);
  gulp.watch(src + 'index.html', ['html']);
  gulp.watch(src + 'app/**/*.js', ['scripts']);
});

gulp.task('clean', (cb) => {
  del([dist], cb);
});

gulp.task('build', gulp.series(['clean', 'static', 'scripts', 'styles']));
gulp.task('default', gulp.series(['build', 'serve', 'watch']));
