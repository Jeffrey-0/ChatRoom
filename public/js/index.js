/* global io */
/* global $ */
/* 聊天室的主要功能 */

// 1.连接socketio服务
var socket = io('http://localhost:3000')
var username, avatar
var toName = '群聊'

// 2.登录功能
$('#login_avatar li').on('click', function () {
  $(this).addClass('now').siblings().removeClass('now')
})
// 点击按钮，登录
$('#loginBtn').on('click', function () {
  // 获取用户名
  var username = $('#username').val().trim()
  if (!username) {
    window.alert('请输入用户名')
    return
  }
  if (username === '群聊') {
    window.alert('用户名已存在')
    return
  }
  // 获取选择的头像
  var avatar = $('#login_avatar li.now img').attr('src')
  console.log(username, avatar)
  // 需要告诉socket io服务，登录
  socket.emit('login', {
    username,
    avatar
  })
})
// 监听登录失败的请求
socket.on('loginError', data => {
  window.alert('用户名已存在')
})

// 监听登录成功的请求
socket.on('loginSuccess', data => {
  console.log('登录成功')
  // 登录成功
  // 隐藏登录窗口
  // $('.login_box').fadeOut()
  $('.login_box').hide()
  // 显示聊天窗口
  $('.container').fadeIn()
  // 设置个人信息
  $('.user-list .header img').attr('src', data.avatar)
  $('.user-list .header .username').text(data.username)

  username = data.username
  avatar = data.avatar
})

// 监听添加用户的消息
socket.on('addUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username} 上线了</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 监听用户离开的消息
socket.on('delUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system leave">
      <p class="message_system">
        <span class="content">${data.username} 下线了</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 监听用户列表的消息
socket.on('userList', data => {
  // 把userlist
  $('.user-list ul').html('')
  $('.user-list ul').append(`
    <li class="user">
      <div class="avatar"><img src="images/群聊.jpg" alt=""></div>
      <div class="name">群聊</div>
    </li>
  `)
  data.forEach(item => {
    $('.user-list ul').append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt=""></div>
        <div class="name">${item.username}</div>
      </li>
    `)
  })
  $('#userCount').text(data.length)
  clickUser()
})

// 聊天功能
// $('#btn-send').on('click', () => {
//   var content = $('#content').html().trim()
//   $('#content').html('')
//   if (!content) {
//     return window.alert('请输入内容')
//   }
//   // 发送消息给服务器
//   socket.emit('sendMessage', {
//     msg: content,
//     username,
//     avatar
//   })
// })

// 监听接收聊天消息
socket.on('receiveMessage', data => {
  console.log('收掉消息', data)
  if (data.toName === '群聊') {
    if (username === data.username) {
      // 自己的消息
      $('.box-bd').append(`
        <div class="message-box">
          <div class="my message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
              </div>
            </div>
          </div>
        </div>
      `)
    } else {
      // 别人的消息
      $('.box-bd').append(`
        <div class="message-box">
          <div class="other message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="nickname">${data.username}</div>
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
              </div>
            </div>
          </div>
        </div>
      `)
    }
  } else {
    if (username === data.username) {
      // 自己的消息
      $('.box-bd').append(`
        <div class="message-box">
          <div class="my message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
                <div class="bubble_toName">私聊</div>
              </div>
            </div>
          </div>
        </div>
      `)
    } else {
      // 别人的消息
      $('.box-bd').append(`
        <div class="message-box">
          <div class="other message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="nickname">${data.username}</div>
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
                <div class="bubble_toName">私聊</div>
              </div>
            </div>
          </div>
        </div>
      `)
    }
  }
  scrollIntoView()
})

// 当有消息时，将滑动到底部
function scrollIntoView () {
  // 当前元素的底部滚动到可视区
  $('.box-bd').children(':last').get(0).scrollIntoView(false)
}

// 发送图片功能
$('#file').on('change', function () {
  var file = this.files[0]
  // // 需要把这个图片发送到服务器，借助于H5新增的fileReader
  var fr = new window.FileReader()
  fr.readAsDataURL(file)
  fr.onload = function () {
    socket.emit('sendImage', {
      username,
      avatar,
      img: fr.result,
      toName
    })
  }
})

// 监听接收图片消息
socket.on('receiveImage', data => {
  if (username === data.username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="nickname">${data.username}</div>
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 等待图片加载完成
  $('.box-bd img:last').on('load', function () {
    scrollIntoView()
  })
})

// 初始化jquery-emoji插件
$('.face').on('click', function () {
  $('#content').emoji({
    button: '.face',
    showTab: false,
    animation: 'slide',
    position: 'topRight',
    icons: [{
      name: 'QQ表情',
      path: 'lib/jquery-emoji/img/qq/',
      maxNum: 91,
      excludeNums: [41, 45, 54],
      file: '.gif'
    }]
  })
})

// 扩展：私聊功能
$('#btn-send').on('click', () => {
  var content = $('#content').html().trim()
  $('#content').html('')
  if (!content) {
    return window.alert('请输入内容')
  }
  if (toName === '群聊') {
  // 发送消息给服务器
    socket.emit('sendMessage', {
      msg: content,
      username,
      avatar,
      toName
    })
  } else {
    // 发送私聊消息给服务器
    socket.emit('sendMessageToOne', {
      msg: content,
      username,
      avatar,
      toName: toName
    })
  }
})

// 点击用户事件绑定
function clickUser () {
  $('.user').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var to = $(this).children('.name').text()
    $('#chatName').text(to)
    toName = to
  })
}
