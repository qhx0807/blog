const gulp = require('gulp')
const markdown = require('gulp-markdown')
const frontMatter = require('gulp-front-matter')
const data = require('gulp-data')
const fileinclude = require('gulp-file-include')
// const rename = require('gulp-rename')
const clean = require('gulp-clean')
const header = require('gulp-header')
const footer = require('gulp-footer')
const htmlmin = require('gulp-htmlmin')
const swig = require('gulp-swig')
const fs = require('fs')
const path = require('path')
const fm = require('front-matter')
const less = require('gulp-less')
const babel = require('gulp-babel')
const csso = require('gulp-csso')
const uglify = require('gulp-uglify')
const LessAutoprefix = require('less-plugin-autoprefix')
const browserSync = require('browser-sync')
const marked = require('marked')
const reload = browserSync.reload
const filePath = path.resolve('./src/posts')
const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] })

gulp.task('clean', function () {
  return gulp.src('dist/*', { read: false }).pipe(clean())
})

gulp.task('posts', function (done) {
  gulp.src('src/posts/*.md')
    .pipe(frontMatter({ property: 'data', remove: true }))
    .pipe(markdown({
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value
      },
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    }))
    .pipe(data(file => file.data))
    .pipe(header(fs.readFileSync('./src/views/post_head.html')))
    .pipe(footer(fs.readFileSync('./src/views/post_foot.html')))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/posts'))
  done()
})

gulp.task('home', function (done) {
  const postsArr = []
  const fileList = fs.readdirSync(filePath)
  fileList.forEach(function (name) {
    const filedir = path.join(filePath, name)
    const content = fs.readFileSync(filedir, 'utf-8')
    const fmdata = fm(content)
    const desc = fmdata.body.split('<!-- more -->')[0]
    const preview = marked(desc)
    const obj = { ...fmdata.attributes, desc: preview, href: `./posts/${name.replace('md', '')}html` }
    postsArr.push(obj)
  })
  gulp.src('./src/views/index.html')
    .pipe(data(file => { file.data = { items: postsArr } }))
    .pipe(swig())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
  done()
})

gulp.task('style', function (done) {
  gulp.src('src/styles/*.less')
    .pipe(less({ plugins: [autoprefix] }))
    .pipe(csso())
    .pipe(gulp.dest('dist/styles'))
    .pipe(reload({ stream: true }))
  done()
})

gulp.task('script', function (done) {
  gulp.src('src/scripts/*js')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
  done()
})

gulp.task('pages', function (done) {
  gulp.src('src/pages/*.md')
    .pipe(frontMatter({ property: 'data', remove: true }))
    .pipe(markdown({
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value
      },
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    }))
    .pipe(data(file => file.data))
    .pipe(header(fs.readFileSync('./src/views/pages_head.html')))
    .pipe(footer(fs.readFileSync('./src/views/post_foot.html')))
    .pipe(fileinclude('@@'))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
  done()
})

gulp.task('dev', function (done) {
  browserSync.init({
    server: './dist'
  })
  const watcher = gulp.watch('src/styles/*.less')
  watcher.on('all', function () {
    gulp.src('src/styles/*.less')
      .pipe(less({ plugins: [autoprefix] }))
      .pipe(csso())
      .pipe(gulp.dest('dist/styles'))
      .pipe(reload({ stream: true }))
  })
  done()
})

gulp.task('archive', function (done) {
  const postsArr = []
  const fileList = fs.readdirSync(filePath)
  fileList.forEach(function (name) {
    const filedir = path.join(filePath, name)
    const content = fs.readFileSync(filedir, 'utf-8')
    const fmdata = fm(content)
    const obj = { ...fmdata.attributes, href: `./posts/${name.replace('.md', '.html')}` }
    postsArr.push(obj)
  })
  const archiveArr = getArchiveData(postsArr)
  gulp.src('./src/views/archive.html')
    .pipe(data(file => { file.data = { items: archiveArr } }))
    .pipe(swig())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
  done()
})

gulp.task('default', gulp.parallel('posts', 'home', 'style', 'pages', 'script', function (done) {
  console.log('done')
  done()
}))

function getArchiveData (ora) {
  var arr = []
  var years = []
  ora.forEach(item => {
    years.push(new Date(item.date).getFullYear())
  })
  var uniyear = Array.from(new Set(years))
  for (let i = 0; i < uniyear.length; i++) {
    console.log(i)
    var obj = {
      year: uniyear[i],
      posts: []
    }
    var ff = ora.filter(item => {
      return new Date(item.date).getFullYear() === uniyear[i]
    })
    ff.map((f) => {
      let farr = new Date(f.date).toDateString().split(' ')
      f.date = farr[1] + ' ' + farr[2] + ', ' + farr[3]
    })
    obj.posts = ff
    arr.push(obj)
  }
  return arr
}
