import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function processImages() {
    return gulp.src(project.imageProcessor.source)
        .pipe(gulp.dest(project.imageProcessor.output));
}
