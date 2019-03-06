---
title: vue预渲染
date: 2018-11-23 21:24
tags: vue
---

预渲染只是用来改善少数营销页面（例如 /, /about, /contact 等）的 SEO。无需使用 web 服务器实时动态编译 HTML，而是使用预渲染方式，在构建时 (build time) 简单地生成针对特定路由的静态 HTML 文件。

<!-- more -->

1. 在vue-cli3中使用 [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin)

  `vue-cli3` 提供了一个零配置原型开发


