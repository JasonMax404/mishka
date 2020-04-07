const gulp = require('gulp');  //Подключение Gulp
const browserSync = require('browser-sync').create(); //Локальный сервер и обновление страницы
const watch = require('gulp-watch'); //Улучшенный пакет для слежения
const sass = require('gulp-sass'); //Препроцессор SASS
const sourcemaps = require('gulp-sourcemaps'); //Исходные карты, для записи реальных путей в CSS
const autoprefixer = require('gulp-autoprefixer'); //Добавление вендорных префиксов
const plumber = require('gulp-plumber'); //Отлов ошибок
const notify = require('gulp-notify'); //Вывод уведомлений об ошибках
const fileinclude = require('gulp-file-include'); //Конкатенация файлов

//Конкатенация целого HTML из частей
gulp.task('html', function(cb) {
  return gulp.src('./src/html/*.html')
  .pipe(plumber({
    errorHandler: notify.onError(function(err){
      return {
        title: 'HTML include',
        sound: false,
        message: err.message
      }
    })
  }))
  .pipe(fileinclude({prefix: '@@'}))
  .pipe(gulp.dest('./build/'))
  cb();
});

//Компиляция CSS
gulp.task('scss', function(cb) {
  return gulp.src('./src/scss/style.scss')
    //Отлов ошибок и вывод уведомлений
    .pipe(plumber({
      errorHandler: notify.onError(function(err){
        return {
          title: 'Styles',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(sourcemaps.init()) //Инициализация sourcemaps
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserlist: ['last 2 versions']
    }))
    .pipe(sourcemaps.write()) //Запись sourcemaps
    .pipe(gulp.dest('./build/css/'))
    cb();
});

//Копирование скриптов из src в build
gulp.task('js', function(cb) {
  return gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest('./build/js/'))
  cb();
});

//Копирование изображений из src в build
gulp.task('images', function(cb) {
  return gulp.src('./src/images/**/*.*')
    .pipe(gulp.dest('./build/images/'))
  cb();
});

//Запуск локального сервера
gulp.task('server', function() {
  browserSync.init({
      server: {
          baseDir: "./build/"
      }
  });
});

//Слежение за файлами и обновление браузера
gulp.task('watch', function() {
  //Слежение за папкой build и обновление браузера
  watch([
    './build/**/*.html',
    './build/**/*.css',
    './build/**/*.js',
    './build/images/**/*.*',], gulp.parallel(browserSync.reload));

  //Слежение за HTML и их конкатенация
  watch('./src/**/*.html', gulp.parallel('html'));

  //Слежение за SCSS и компиляция в CSS
  watch('./src/**/*.scss', gulp.parallel('scss'));

  //Слежение за скриптами и их копирование
  watch('./src/js/**/*.js', gulp.parallel('js'));

  //Слежение за изображениями и их копирование
  watch('./src/images/**/*.*', gulp.parallel('images'));
});

//task по-умолчанию
gulp.task(
  'default',
  gulp.series(
    gulp.parallel('html', 'scss', 'js', 'images'),
    gulp.parallel('server', 'watch')
  ));
