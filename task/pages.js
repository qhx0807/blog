const { src, dest, parallel } = require('gulp')
const markdown = require('gulp-markdown')
const frontMatter = require('gulp-front-matter')
const data = require('gulp-data')
const header = require('gulp-header')
const footer = require('gulp-footer')
const htmlmin = require('gulp-htmlmin')
const swig = require('gulp-swig')
const fm = require('front-matter')
const marked = require('marked')
const fileinclude = require('gulp-file-include')
const fs = require('fs')
const path = require('path')
const filePath = path.resolve('./src/posts')
const getArchiveData = require('./util')

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
postsArr.sort((a, b) => {
  let aTime = new Date(a.date).valueOf()
  let bTime = new Date(b.date).valueOf()
  return bTime - aTime
})

const postsTask = (cb) => {
  src('src/posts/*.md')
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
    .pipe(swig())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./dist/posts'))
  cb()
}

const indexPageTask = (cb) => {
  src('src/views/index.html')
    .pipe(data(file => { file.data = { items: postsArr } }))
    .pipe(swig())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./dist'))
  cb()
}

const archivePageTask = (cb) => {
  const archiveArr = getArchiveData(postsArr)
  src('src/views/archive.html')
    .pipe(data(file => { file.data = { items: archiveArr } }))
    .pipe(swig())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./dist'))
  cb()
}

const pagesTask = (cb) => {
  src('src/pages/*.md')
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
    .pipe(dest('./dist'))
  cb()
}

exports.build = parallel(indexPageTask, archivePageTask, postsTask, pagesTask)
