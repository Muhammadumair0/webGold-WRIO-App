var gulp = require('gulp');
var browserify = require('browserify');
var babel = require('gulp-babel');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');

function restart_nodemon () {
    if (nodemon_instance) {
        console.log("Restarting nodemon");
        nodemon_instance.emit('restart');
    } else {
        console.log("Nodemon isntance not ready yet")
    }

}

gulp.task('babel-server', function() {
    return gulp.src('src/index.js')
        .on('error', function(err) {
            console.log('Babel server:', err.toString());
        })
        .pipe(gulp.dest('app'))
        .on('end',function (){
            gulp.src('src/server/**/*.*')
                .on('error', function(err) {
                    console.log('Babel server:', err.toString());
                })
                .pipe(gulp.dest('app/server'))
                .on('end',function() {
                    restart_nodemon();
            });
        });


});

gulp.task('babel-client', function() {
    gulp.src('src/client/js/3rdparty/*.*')
        .on('error',function (err) {

        })
        .pipe(gulp.dest('app/client/3rdparty'));

    gulp.src('hub/*.*')
        .on('error',function (err) {

        })
        .pipe(gulp.dest('app/hub/'));

    browserify({
        entries: './src/client/js/client.js',
        debug: true
    })
        .transform(babelify)
        .bundle()
        .on('error', function(err) {
            console.log('Babel client:', err.toString());
        })
        .pipe(source('client.js'))
        .pipe(gulp.dest('app/client'));

    browserify({
        entries: './src/client/js/admin.js',
        debug: true
    })
        .transform(babelify)
        .bundle()
        .on('error', function(err) {
            console.log('Babel client:', err.toString());
        })
        .pipe(source('admin.js'))
        .pipe(gulp.dest('app/client'));

});

gulp.task('views', function() {
    return gulp.src('src/client/views/**/*.*')
        .pipe(gulp.dest('app/client/views'));
});


var nodemon_instance;

gulp.task('nodemon', function() {

    if (!nodemon_instance) {
        nodemon_instance = nodemon({
            script: 'server.js',
            watch: 'src/__manual_watch__',
            ext: '__manual_watch__',
            verbose: false,
        }).on('restart', function() {
            console.log('~~~ restart server ~~~');
        });
    } else {
        nodemon_instance.emit('restart');
    }

});

gulp.task('default', ['babel-server', 'babel-client', 'views']);

gulp.task('watch', ['default', 'nodemon'], function() {
    gulp.watch(['src/index.js', 'src/server/**/*.*'], ['babel-server']);
    gulp.watch('src/client/js/**/*.*', ['babel-client']);
    gulp.watch('src/client/views/**/*.*', ['views']);
});