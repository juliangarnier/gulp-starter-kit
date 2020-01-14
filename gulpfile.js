const gulp = require('gulp');
const del = require('del');
const notify = require('gulp-notify');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const minify = require('rollup-plugin-babel-minify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

sass.compiler = require('node-sass');

const paths = {
  src: './src/',
  dist: './dist/'
}

// fetch command line arguments

const arg = (argList => {
  let arg = {}, a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a++) {
    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');
    if (opt === thisOpt) {
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;
    }
    else {
      curOpt = opt;
      arg[curOpt] = true;
    }
  }
  return arg;
})(process.argv);

function clean() {
  return del([
    paths.dist + 'css/**/*.css',
    paths.dist + 'js/**/*.js',
    paths.dist + 'js/**/*.map'
  ]);
}

function css() {
  const outputStyle = arg.minify ? 'compressed' : 'expanded';
  const inputPath = paths.src + 'sass/styles.scss';
  const outputPath = paths.dist + 'css/';
  return gulp.src(inputPath)
    .pipe(sass().on('error', sass.logError))
    .pipe(sass({outputStyle: outputStyle}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(outputPath))
    .pipe(notify({message: 'CSS compiled', onLast: true}));
}

function javaScript() {
  const inputPath = paths.src + 'js/scripts.js';
  const outputPath = paths.dist + 'js/';
  const rollupPugins = [];
  rollupPugins.push(babel({exclude: 'node_modules/**'}));
  if (arg.minify) {
    rollupPugins.push(minify());
  }
  return gulp.src(inputPath)
    .pipe(rollup({
      plugins: rollupPugins
    }, {
      format: 'iife',
      name: 'scripts'
    }))
    .pipe(gulp.dest(outputPath))
    .pipe(notify({message: 'JS compiled', onLast: true}));
}

function watch() {
  gulp.watch(paths.src + 'sass/**/*.scss', gulp.series(clean, css));
  gulp.watch(paths.src + 'js/**/*.js', gulp.series(clean, javaScript));
}

exports.default = gulp.series(clean, gulp.parallel(css, javaScript), watch);
