import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-ruby-sass';
import autoprefixer from 'gulp-autoprefixer';
import csso from 'gulp-csso';
import csscomb from 'gulp-csscomb';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function processCSS() {
    return sass(project.cssProcessor.source, {
        loadPath: [
            './node_modules/foundation-sites/scss',
            './node_modules/font-awesome/scss',
            './node_modules/motion-ui/src',
            './node_modules/humane-js/themes'
        ],
        sourcemap: true,
        lineNumber: true
    })
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9'],
            cascade: false
        }))
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: '.'
        }))
        .pipe(gulp.dest(project.cssProcessor.output));
}
