const { exec } = require('child_process');
const gulp = require('gulp');
const { join } = require('path');

gulp.task('default', function () {
  gulp.watch(join(__dirname, 'src/**/*.ts'), function (done) {
    const child = exec('cross-env NODE_ENV=development DEBUG=prerender-it* run-s build test', function () {
      done();
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
  gulp.watch(join(__dirname, 'test/src/**/*.{ts,tsx}'), function (done) {
    const child = exec('cross-env NODE_ENV=development DEBUG=prerender-it* run-s test-build', function () {
      done();
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
});
