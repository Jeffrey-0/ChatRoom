var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// var path = require('path')

server.listen(3000, () => {
  console.log('服务器启动了')
})

// express处理静态资源
// 把public目录设置为静态资源
app.use(require('express').static('public'))

app.get('/', function (req, res) {
  // res.sendFile(path.join(__dirname, '/index.html'))
  res.redirect('/index.html')
})

io.on('connect', function (socket) {
  socket.emit('news', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})
