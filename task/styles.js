const { src, dest } = require('gulp')
const less = require('gulp-less')
const csso = require('gulp-csso')
const LessAutoprefix = require('less-plugin-autoprefix')
const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] })

const stylesTask = () => {
  return src('src/styles/*.less')
    .pipe(less({ plugins: [autoprefix] }))
    .pipe(csso())
    .pipe(dest('./dist/styles'))
}

exports.styles = stylesTask
