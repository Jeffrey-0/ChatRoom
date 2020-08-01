var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// var path = require('path')
// 记录所有已经登录过的用户
const users = []

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
  // 监听用户登录的功能
  socket.on('login', data => {
    console.log(data)
    // 如果用户已经登录
    const user = users.find(item => item.username === data.username)
    if (user) {
      socket.emit('loginError', { msg: '登录失败' })
      console.log('登录失败')
    } else {
      // data.id = socket.id
      users.push(data)
      socket.emit('loginSuccess', data)
      console.log('登录成功')
      // 广播所有用户有用户添加
      io.emit('addUser', data)
      // 告诉所有的用户，目前聊天室中有多少人
      io.emit('userList', users)

      // 把登录成功的用户名和头像存储起来
      socket.username = data.username
      socket.avatar = data.avatar
    }
  })

  // 用户断开连接的功能
  socket.on('disconnect', () => {
    // 把当前用户的信息从users中删除
    const idx = users.findIndex(item => item.username === socket.username)
    users.splice(idx, 1)
    // 告诉所有人，有人离开了聊天室
    io.emit('delUser', {
      username: socket.username,
      avatar: socket.avatar
    })
    // 告诉所有人，userlist发生更新
    io.emit('userList', users)
  })

  // 用户发送消息的功能
  socket.on('sendMessage', data => {
    console.log(data)
    // 广播给所有用户
    io.emit('receiveMessage', data)
  })

  // 监听图片聊天信息
  socket.on('sendImage', data => {
    // 广播给所有用户
    if (data.toName === '群聊') {
      io.emit('receiveImage', data)
    } else {
      // 广播给指定用户
      var toSocket = null
      for (const key in io.sockets.sockets) {
        if (io.sockets.sockets[key].username === data.toName) {
          toSocket = key
          break
        }
      }
      if (toSocket) {
        // 发送给指定用户
        socket.to(toSocket).emit('receiveImage', data)
        // 发送给自己
        socket.emit('receiveImage', data)
      } else {
        data.msg = 0
        socket.emit('receiveImage', data)
      }
    }
  })

  // 私聊功能的实现
  socket.on('sendMessageToOne', data => {
    // 广播给指定用户
    var toSocket = null
    // console.log(io.sockets.sockets)
    for (const key in io.sockets.sockets) {
      if (io.sockets.sockets[key].username === data.toName) {
        toSocket = key
        break
      }
    }
    if (toSocket) {
      // 发送给指定用户
      socket.to(toSocket).emit('receiveMessage', data)
      // 发送给自己
      socket.emit('receiveMessage', data)
    }
  })
})
