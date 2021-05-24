const { src, dest, watch, parallel, series } = require('gulp');

const sass         = require('gulp-sass');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixed = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/img/**/*')
        .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}),
          imagemin.svgo({
              plugins: [
                  {removeViewBox: true},
                  {cleanupIDs: false}
              ]
          })
        ]))
        .pipe(dest('dist/img'))
}

function styles() {
  return src('app/sass/style.sass')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixed({
          overrideBrowserslist: ['last 10 version'],
          grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery-validation/dist/jquery.validate.min.js',
    'app/js/parallax.min.js',
    'app/js/swiper-bundle.min.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function build() {
  return src([
    'app/css/**/*',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html',
    'app/*.php',
    'app/phpmailer/**/*',
    'app/*.ico'
  ], {base: 'app'})
    .pipe(dest('dist'));
}

function watching () {
  watch(['app/sass/**/*.sass'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.php']).on('change', browserSync.reload);
  watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles      = styles;
exports.watching    = watching;
exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanDist   = cleanDist;

exports.build       = series(cleanDist, images, build);
exports.default     = parallel(styles, scripts, browsersync, watching);