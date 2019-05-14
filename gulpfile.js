const { src, watch, series } = require('gulp')
const clean = require('gulp-clean')
const browserSync = require('browser-sync').create()
const buildTask = require('./task/pages')
const styleTask = require('./task/styles')
const javascriptTask = require('./task/javascripts')

const cleanTask = () => {
  return src('dist/*', { read: false })
    .pipe(clean())
}

const build = (cb) => {
  buildTask.build()
  styleTask.styles()
  javascriptTask.javascript()
  cb()
}

const devTask = (cb) => {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  })
  watch('./src/posts/*', buildTask.build)
  watch('./src/styles/*', styleTask.styles)
  watch('./src/javascripts/*', javascriptTask.javascript)
  watch(['./dist/*', './dist/posts/*.html', './dist/styles/*.css', './dist/scripts/*.js'], { depth: 2 }).on('change', browserSync.reload)
  cb()
}

exports.build = series(cleanTask, build)

exports.dev = series(devTask)
