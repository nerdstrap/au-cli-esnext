import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function processFonts() {
    return gulp.src(project.fontProcessor.source)
        .pipe(gulp.dest(project.fontProcessor.output));
}
