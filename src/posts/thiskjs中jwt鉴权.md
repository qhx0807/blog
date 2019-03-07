---
title: thiskjs中的jwt鉴权
date: 2018-11-20 11:04
tags: Thinkjs
categories: 前端开发
---

鉴权是大部分 Web 服务必备的基础功能之一，JSON Web Token（即 JWT）是一个非常轻巧的规范。这个规范允许我们使用 JWT 在用户和服务器之间传递安全可靠的信息。它提供基于 JSON 格式的 Token 来做安全认证。
JWT 在 ThinkJS 中使用 [think-session-jwt](https://github.com/thinkjs/think-session-jwt "think-session-jwt") 提供了 session 扩展，可以很方便的读写 `session`。

<!-- more -->

#### jwt 组成

JWT 由三部分组成，分别是 header(头部)，payload(载荷)，signature(签证) 这三部分以小数点连接起来。

```javascript
jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MiwiYWkyNjYwLCJleHAiOjE1NDM5MzU4NjB9._9e4HlWgeUckC6gZnqQ5RP4xA1OwhbvaBYsvdXL94Mc
```

其中：

| 说明 | 值 |
| ------------ | ------------ |
| header | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 |
| payload | eyJ1c2VySW5mbyI6eyJpZCI6MiwiYWkyNjYwLCJleHAiOjE1NDM5MzU4NjB9 |
| signature | _9e4HlWgeUckC6gZnqQ5RP4xA1OwhbvaBYsvdXL94Mc |

#### header

`header` 是对类型和哈希算法进行 `base64Encode` 运算。
对上面的 header 通过 `base64Decode` 可得到

```javascript
{ "alg": "HS256","typ": "JWT" }
```

#### payload

`payload` 是对要传输的信息进行 `base64Encode`. 由上面的信息可得到：

```javascript
{
  "userInfo":{
    "id":2,
    "accesskey":"_iCkoUSbXhasdasdBr-6z47dks-s0C_r","secretkey":"c7raawasasdJMw1ICaoJuEjqXoW4-","name":"me",
    "avatar":null,
    "remark":"...",
    "last_login_time":null
    },
    "iat":1543892660,
    "exp":1543935860
}
```

#### signature

`signature` 包含了`header`和秘钥，秘钥是保存在服务端的。

```javascript
const encodedString = base64Encode(header) + '.' + base64Encode(payload)
const signature = HMACSHA256(encodedString, '服务端的密钥')
```

#### 修改 Adapter 配置文件 `src/config/adapter.js`

```javascript
const JWTSession = require('think-session-jwt')

exports.session = {
  type: 'jwt',
  common: {
    cookie: {
      name: 'thinkjs'
    }
  },
  jwt: {
    handle: JWTSession,
    secret: 'where amazing happens', // secret is reqired
    tokenType: 'header', // ['query', 'body', 'header', 'cookie'], 'cookie' is default
    tokenName: 'authorization', // 'jwt' is default
    sign: { expiresIn: 60 * 60 * 12 },
    verify: {},
    verifyCallback: any => {} // 验证失败的回调函数
  }
}
```

#### 用户登录种下 session `src/controller/login.js`

```javascript
module.exports = class extends Base {
  async indexAction() {
    const { username, password } = this.post()
    const user = this.model('user')
    const userInfo = await user.where({ name: username }).find()
    if (think.isEmpty(userInfo)) return this.fail('用户不存在')
    if (userInfo.password !== password) return this.fail('密码不正确')
    delete userInfo.password
    const token = await this.session('userInfo', userInfo)
    this.success({ token: token, ...userInfo })
  }
}
```

#### 在其他 Action 中使用

```javascript
const userInfo = await this.session('userInfo')
if (userInfo) {
  // ...
}
```
在 `Controller` 中，可在 `__before` 前置操作中先鉴权。

```javascript
async __before () {
  const userInfo = await this.session('userInfo')
  //获取用户的 session 信息，如果为空，返回 false 阻止后续的行为继续执行
  if(think.isEmpty(userInfo)){
    return false;
  }
}
indexAction () {
  //  __before 调用完成后才会调用 indexAction
}
```
