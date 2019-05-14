function getArchiveData (ora) {
  var arr = []
  var years = []
  ora.forEach(item => {
    years.push(new Date(item.date).getFullYear())
  })
  var uniyear = Array.from(new Set(years))
  for (let i = 0; i < uniyear.length; i++) {
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

module.exports = getArchiveData
