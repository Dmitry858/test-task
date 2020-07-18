const { watch, series, parallel, src, dest } = require('gulp');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const mincss = require('gulp-clean-css');
const del = require('del');
const pug = require('gulp-pug');
const prettyHtml = require('gulp-pretty-html');

function brSync(done) {
    browserSync({
        server: {
            baseDir: './app'
        },
        notify: false
    });
    done();
}

function brSyncReload(done) {
    browserSync.reload();
    done();
}

function pugHandler() {
    return src(['app/pug/*.pug'])
        .pipe(pug({ pretty: '    ' }))
        .pipe(dest('app'));
}

function scssHandler() {
    return src('app/scss/style.scss')
        .pipe(sourcemaps.init())
        .pipe(scss({outputStyle: 'expanded'}))
        .pipe(sourcemaps.write('./map'))
        .pipe(dest('app/css'));
}

function concatJsLibs() {
    return src(['app/js_libs/*.js'])
        .pipe(concat('libs.min.js'))
        .pipe(terser())
        .pipe(dest('app/js'));
}

function concatCssLibs() {
    return src(['app/css_libs/*.css'])
        .pipe(concat('libs.css'))
        .pipe(mincss())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest('app/css'));
}

function buildCss() {
    return src(['app/css/*.css'])
        .pipe(dest('dist/css'));
}

function minStyleCss() {
    return src('dist/css/style.css')
        .pipe(mincss())
        .pipe(dest('dist/css'));
}

function buildJs() {
    return src(['app/js/*.js'])
        .pipe(dest('dist/js'));
}

function buildHtml() {
    return src(['app/*.html'])
        .pipe(prettyHtml({
            indent_size: 4,
            indent_char: ' ',
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
        }))
        .pipe(dest('dist'));
}

function buildFonts() {
    return src(['app/fonts/**/*'])
        .pipe(dest('dist/fonts'));
}

function buildImages() {
    return src(['app/img/**/*'])
        .pipe(dest('dist/img'));
}

function deleteDist() {
    return del('dist');
}

function watchFiles() {
    watch('app/scss/**/*.scss', series(scssHandler, brSyncReload));
    watch('app/pug/**/*.pug', series(pugHandler, brSyncReload));
    watch('app/**/*.js', brSyncReload);
    watch('app/*.html', brSyncReload);
}

exports.del = deleteDist;
exports.build = series(deleteDist, pugHandler, scssHandler, buildCss, parallel(buildJs, buildHtml, buildFonts, buildImages));
exports.prod = series(deleteDist, pugHandler, scssHandler, buildCss, parallel(buildJs, buildHtml, buildFonts, buildImages), minStyleCss);
exports.libs = series(brSync, concatJsLibs, concatCssLibs, watchFiles);
exports.default = series(brSync, watchFiles);