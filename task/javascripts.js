const { src, dest } = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

const javascriptsTask = () => {
  return src('src/scripts/*js')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(dest('./dist/scripts'))
}

exports.javascript = javascriptsTask
