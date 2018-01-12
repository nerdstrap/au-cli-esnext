import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-ruby-sass';
import autoprefixer from 'gulp-autoprefixer';
import csso from 'gulp-csso';
import csscomb from 'gulp-csscomb';
import project from '../aurelia.json';
import { CLIOptions, build } from 'aurelia-cli';

export default function processCSS() {
    let env = CLIOptions.getEnvironment();
    let verbose = env !== "prod";

    if (verbose) {
        return sass(project.cssProcessor.source,
            {
                loadPath: [
                ],
                sourcemap: true,
                lineNumber: true
            })
            .on('error',
            function (err) {
                console.error('Error!', err.message);
            })
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'ie >= 9'],
                cascade: false
            }))
            .pipe(sourcemaps.write('maps',
                {
                    includeContent: false,
                    sourceRoot: '.'
                }))
            .pipe(gulp.dest(project.cssProcessor.output));
    } else {
        return sass(project.cssProcessor.source,
            {
                loadPath: [
                ],
                sourcemap: false,
                lineNumber: false
            })
            .on('error',
            function (err) {
                console.error('Error!', err.message);
            })
            .pipe(csso())
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'ie >= 11'],
                cascade: false
            }))
            .pipe(gulp.dest(project.cssProcessor.output));
    }
}
