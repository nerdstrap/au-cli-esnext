import gulp from 'gulp';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import processFonts from './process-fonts';
import processImages from './process-images';
import {build} from 'aurelia-cli';
import project from '../aurelia.json';

export default gulp.series(
    readProjectConfiguration,
    gulp.parallel(
        transpile,
        processMarkup,
        processCSS,
        processFonts,
        processImages
    ),
    writeBundles
);

function readProjectConfiguration() {
    return build.src(project);
}

function writeBundles() {
    return build.dest();
}
